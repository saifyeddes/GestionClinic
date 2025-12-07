import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Appointment, AppointmentStatus, PaymentStatus } from './entities/appointment.entity';
import { PatientsService } from '../patients/patients.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly patientsService: PatientsService,
  ) {}

  // Stripe webhook to confirm appointments when payment succeeds
  // MUST be before :id routes to match first
  @Post('stripe/webhook')
  async stripeWebhook(@Request() req) {
    try {
      const StripeModule = await import('stripe')
      const StripeClass = (StripeModule as any).default || StripeModule
      const stripe = new StripeClass(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })
      const sig = req.headers['stripe-signature'] as string | undefined

      let event
      // If webhook secret configured, verify signature
      if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
        event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
      } else {
        event = req.body
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const appointmentId = session.metadata?.appointmentId
        if (appointmentId) {
          // mark appointment as paid and confirmed
          await this.appointmentsService.update(appointmentId, { paymentStatus: PaymentStatus.PAID as any, status: AppointmentStatus.CONFIRMED as any })
        }
      }

      return { ok: true }
    } catch (err) {
      console.error('Stripe webhook error:', err)
      throw new BadRequestException('Invalid webhook event')
    }
  }

  // Endpoint for patients to create appointment requests
  // MUST be before :id routes to match first
  @Post('patient-request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATIENT)
  async createPatientRequest(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    const user = req.user;
    let patient = await this.patientsService.findByUserId(user.id);
    const appointmentData: Partial<Appointment> = {};
    if (!patient) {
      // create minimal patient profile for the user if missing
      const created = await this.patientsService.create({
        dateOfBirth: new Date('1970-01-01'),
        phone: user.phone || '',
        address: '',
        isActive: true,
        user: { id: user.id } as any,
      });
      // use created patient
      patient = created;
      appointmentData.patientId = created.id;
    }
    Object.keys(createAppointmentDto).forEach((key) => {
      const value = createAppointmentDto[key as keyof CreateAppointmentDto];
      if (key === 'appointmentDate' && typeof value === 'string') {
        appointmentData[key as keyof Appointment] = new Date(value) as any;
      } else {
        appointmentData[key as keyof Appointment] = value as any;
      }
    });

    // Ensure required relations
    if (patient) appointmentData.patientId = patient.id;
    appointmentData.createdById = user.id;
    // Default price and payment status for patient requests
    if (!appointmentData.price) (appointmentData as any).price = 50;
    if (!appointmentData.paymentStatus) (appointmentData as any).paymentStatus = PaymentStatus.PENDING;

    return this.appointmentsService.create(appointmentData);
  }

  // Parameterized POST routes: :id/pay, :id/status, etc
  @Post(':id/pay')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.PATIENT)
  async payAppointment(@Param('id') id: string, @Body() body: { method?: 'online' | 'on_site' | 'usdt' }, @Request() req) {
    const method = body?.method || 'on_site'
    // On-site payment: keep appointment scheduled but mark paymentStatus as PENDING and leave confirmation to receptionist
    if (method === 'on_site' || method === 'usdt') {
      const updated = await this.appointmentsService.update(id, { paymentStatus: PaymentStatus.PENDING as any })
      return updated
    }

    // Online payment: create a Stripe Checkout session and return URL
    try {
      const StripeModule = await import('stripe')
      const StripeClass = (StripeModule as any).default || StripeModule
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new BadRequestException('Stripe secret key not configured on server')
      }
      const stripe = new StripeClass(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })

      const appointment = await this.appointmentsService.findOne(id)
      if (!appointment) {
        throw new BadRequestException('Appointment not found')
      }

      const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/success?appointmentId=${id}&session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/cancel?appointmentId=${id}`

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: process.env.STRIPE_CURRENCY || 'usd',
            product_data: { name: `Consultation - ${appointment.type || 'Consultation'}` },
            unit_amount: Math.round((appointment.price || 50) * 100) // convert to smallest currency unit
          },
          quantity: 1
        }],
        metadata: { appointmentId: id },
        success_url: successUrl,
        cancel_url: cancelUrl
      })

      // Return session url so frontend can redirect
      return { url: session.url }
    } catch (err) {
      console.error('Error creating Stripe session:', err)
      throw new BadRequestException('Failed to create checkout session: ' + (err?.message || String(err)))
    }
  }

  // Confirm a Stripe Checkout session and mark appointment paid/confirmed
  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.PATIENT)
  async confirmPayment(@Param('id') id: string, @Body() body: { sessionId?: string }) {
    if (!body?.sessionId) {
      throw new BadRequestException('Missing sessionId')
    }

    try {
      const StripeModule = await import('stripe')
      const StripeClass = (StripeModule as any).default || StripeModule
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new BadRequestException('Stripe secret key not configured on server')
      }
      const stripe = new StripeClass(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })

      const session = await stripe.checkout.sessions.retrieve(body.sessionId)
      // Check payment status
      const paid = session.payment_status === 'paid' || session.status === 'complete'
      if (!paid) {
        throw new BadRequestException('Payment not completed')
      }

      // Mark appointment as paid and confirmed
      const updated = await this.appointmentsService.update(id, { paymentStatus: PaymentStatus.PAID as any, status: AppointmentStatus.CONFIRMED as any })
      return updated
    } catch (err) {
      console.error('Error confirming Stripe session:', err)
      throw new BadRequestException('Failed to confirm payment: ' + (err?.message || String(err)))
    }
  }

  // Endpoint for authenticated patients to get their appointments
  @Get('patient')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.PATIENT)
  async getPatientAppointments(@Request() req) {
    const user = req.user;
    let patient = await this.patientsService.findByUserId(user.id);
    if (!patient) {
      // If no patient profile exists, create a minimal one linked to the user
      const created = await this.patientsService.create({
        dateOfBirth: new Date('1970-01-01'),
        phone: user.phone || '',
        address: '',
        isActive: true,
        user: { id: user.id } as any,
      });
      patient = created;
      return this.appointmentsService.findByPatient(created.id);
    }
    return this.appointmentsService.findByPatient(patient.id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR)
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    // Convert string date to Date object
    const appointmentData: Partial<Appointment> = {};
    
    // Copy all properties from DTO
    Object.keys(createAppointmentDto).forEach(key => {
      const value = createAppointmentDto[key as keyof CreateAppointmentDto];
      if (key === 'appointmentDate' && typeof value === 'string') {
        appointmentData[key] = new Date(value);
      } else {
        appointmentData[key as keyof Appointment] = value as any;
      }
    });
    
    return this.appointmentsService.create(appointmentData);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get('doctor/:doctorId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.appointmentsService.findByDoctor(doctorId);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.PATIENT)
  findByPatient(@Param('patientId') patientId: string) {
    return this.appointmentsService.findByPatient(patientId);
  }

  @Get('today')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  getTodayAppointments() {
    return this.appointmentsService.getTodayAppointments();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.PATIENT)
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR)
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    // Convert string date to Date object if present
    const updateData: Partial<Appointment> = {};
    
    // Copy all properties from DTO
    Object.keys(updateAppointmentDto).forEach(key => {
      const value = updateAppointmentDto[key as keyof UpdateAppointmentDto];
      if (value !== undefined) {
        if (key === 'appointmentDate' && typeof value === 'string') {
          updateData[key] = new Date(value);
        } else {
          updateData[key as keyof Appointment] = value as any;
        }
      }
    });
    
    return this.appointmentsService.update(id, updateData);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: AppointmentStatus,
  ) {
    return this.appointmentsService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}

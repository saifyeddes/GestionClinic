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
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { PatientsService } from '../patients/patients.service';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly patientsService: PatientsService,
  ) {}

  // Endpoint for authenticated patients to get their appointments
  @Get('patient')
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

  // Endpoint for patients to create appointment requests (patient sets themselves as patient)
  @Post('patient-request')
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

    return this.appointmentsService.create(appointmentData);
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

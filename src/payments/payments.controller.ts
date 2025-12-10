import { Controller, Post, Body, UseGuards, Request, Get, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @Body()
    createCheckoutDto: {
      appointmentId: string;
      amount: number;
      doctorName: string;
    },
    @Request() req: any,
  ) {
    const { appointmentId, amount, doctorName } = createCheckoutDto;
    const patientEmail = req.user.email;

    const result = await this.paymentsService.createCheckoutSession(
      appointmentId,
      amount,
      patientEmail,
      doctorName,
    );

    return result;
  }

  @Get('verify-payment')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(@Query('sessionId') sessionId: string, @Request() req: any) {
    const result = await this.paymentsService.verifyPayment(sessionId);
    return result;
  }
}


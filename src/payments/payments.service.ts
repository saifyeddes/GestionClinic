import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, PaymentStatus, AppointmentStatus } from '../appointments/entities/appointment.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2022-11-15' as any,
    });
  }

  async createCheckoutSession(
    appointmentId: string,
    amount: number,
    patientEmail: string,
    doctorName: string,
  ) {
    try {
      // Créer une session Stripe Checkout
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Consultation médicale - Dr. ${doctorName}`,
                description: `Rendez-vous médical - ID: ${appointmentId}`,
              },
              unit_amount: Math.round(amount * 100), // Montant en centimes
            },
            quantity: 1,
          } as any,
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient?payment=success&appointmentId=${appointmentId}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient?payment=cancelled`,
        customer_email: patientEmail,
        metadata: {
          appointmentId: appointmentId,
        } as any,
      } as any);

      return {
        success: true,
        sessionId: session.id,
        url: session.url,
      };
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la création de la session de paiement',
      };
    }
  }

  async verifyPayment(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid') {
        const appointmentId = (session.metadata as any)?.appointmentId;
        if (appointmentId) {
          // Mettre à jour le statut de la consultation
          await this.appointmentRepository.update(
            { id: appointmentId },
            {
              paymentStatus: PaymentStatus.PAID,
              status: AppointmentStatus.CONFIRMED,
            },
          );
        }

        return {
          success: true,
          status: 'paid',
          appointmentId: appointmentId,
        };
      }

      return {
        success: false,
        error: 'Le paiement n\'a pas été complété',
      };
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la vérification du paiement',
      };
    }
  }
}

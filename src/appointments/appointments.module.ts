import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { PatientsModule } from '../patients/patients.module';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), PatientsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}

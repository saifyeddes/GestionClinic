import { IsDateString, IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { AppointmentType, AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsDateString()
  appointmentDate: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsEnum(AppointmentType)
  type: AppointmentType;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  symptoms?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsString()
  doctorId: string;

  @IsString()
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  createdById?: string;
}

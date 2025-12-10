import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreatePrescriptionDto {
  @IsString()
  patientId: string;

  @IsArray()
  medications: string[];

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;
}

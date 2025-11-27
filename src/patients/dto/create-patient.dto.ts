import { IsDateString, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreatePatientDto {
  @IsDateString()
  dateOfBirth: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  chronicDiseases?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

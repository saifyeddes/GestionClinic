import { IsDateString, IsOptional, IsString, IsBoolean, IsEmail } from 'class-validator';

export class RegisterPatientDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

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

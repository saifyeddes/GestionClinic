import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Patient } from './entities/patient.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  create(@Body() createPatientDto: CreatePatientDto) {
    // Convert string date to Date object
    const patientData: Partial<Patient> = {};
    
    // Copy all properties from DTO
    Object.keys(createPatientDto).forEach(key => {
      const value = createPatientDto[key as keyof CreatePatientDto];
      if (key === 'dateOfBirth' && typeof value === 'string') {
        patientData[key] = new Date(value);
      } else {
        patientData[key as keyof Patient] = value as any;
      }
    });
    
    return this.patientsService.create(patientData);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  findAll() {
    return this.patientsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.PATIENT)
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.PATIENT)
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    // Convert string date to Date object if present
    const updateData: Partial<Patient> = {};
    
    // Copy all properties from DTO
    Object.keys(updatePatientDto).forEach(key => {
      const value = updatePatientDto[key as keyof UpdatePatientDto];
      if (value !== undefined) {
        if (key === 'dateOfBirth' && typeof value === 'string') {
          updateData[key] = new Date(value);
        } else {
          updateData[key as keyof Patient] = value as any;
        }
      }
    });
    
    return this.patientsService.update(id, updateData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}

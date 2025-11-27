import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { MedicalRecord } from './entities/medical-record.entity';

@Controller('medical-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  async create(
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
  ): Promise<MedicalRecord> {
    return await this.medicalRecordsService.create(createMedicalRecordDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  findAll() {
    return this.medicalRecordsService.findAll();
  }

  @Get('doctor/:doctorId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async findByDoctor(
    @Param('doctorId') doctorId: string,
  ): Promise<MedicalRecord[]> {
    return await this.medicalRecordsService.findByDoctor(doctorId);
  }

  @Get('patient/:patientId')
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.RECEPTIONIST,
    UserRole.PATIENT,
  )
  async findByPatient(
    @Param('patientId') patientId: string,
  ): Promise<MedicalRecord[]> {
    return await this.medicalRecordsService.findByPatient(patientId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  async findOne(@Param('id') id: string): Promise<MedicalRecord | null> {
    return await this.medicalRecordsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
  ): Promise<MedicalRecord> {
    return await this.medicalRecordsService.update(id, updateMedicalRecordDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.medicalRecordsService.remove(id);
  }
}

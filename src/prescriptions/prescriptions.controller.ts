import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  async create(@Body() createPrescriptionDto: CreatePrescriptionDto, @Request() req) {
    return await this.prescriptionsService.create(
      createPrescriptionDto,
      req.user.id,
    );
  }

  @Get()
  async findAll() {
    return await this.prescriptionsService.findAll();
  }

  @Get('patient/:patientId')
  async findByPatient(@Param('patientId') patientId: string) {
    return await this.prescriptionsService.findByPatientId(patientId);
  }

  @Get('doctor/:doctorId')
  async findByDoctor(@Param('doctorId') doctorId: string) {
    return await this.prescriptionsService.findByDoctorId(doctorId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.prescriptionsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    return await this.prescriptionsService.update(id, updatePrescriptionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.prescriptionsService.remove(id);
    return { message: 'Prescription deleted successfully' };
  }
}

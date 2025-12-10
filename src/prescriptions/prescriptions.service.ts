import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto, doctorId: string) {
    const prescription = this.prescriptionsRepository.create({
      ...createPrescriptionDto,
      doctorId,
    });
    return await this.prescriptionsRepository.save(prescription);
  }

  async findAll() {
    return await this.prescriptionsRepository.find({
      relations: ['patient', 'doctor'],
    });
  }

  async findByPatientId(patientId: string) {
    return await this.prescriptionsRepository.find({
      where: { patientId },
      relations: ['doctor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDoctorId(doctorId: string) {
    return await this.prescriptionsRepository.find({
      where: { doctorId },
      relations: ['patient'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return await this.prescriptionsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });
  }

  async update(id: string, updatePrescriptionDto: UpdatePrescriptionDto) {
    await this.prescriptionsRepository.update(id, updatePrescriptionDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.prescriptionsRepository.delete(id);
  }
}

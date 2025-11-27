import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
  ) {}

  async create(recordData: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const record = this.medicalRecordRepository.create(recordData);
    return this.medicalRecordRepository.save(record);
  }

  async findAll(): Promise<MedicalRecord[]> {
    return this.medicalRecordRepository.find({
      relations: ['patient', 'doctor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDoctor(doctorId: string): Promise<MedicalRecord[]> {
    return this.medicalRecordRepository.find({
      where: { doctorId },
      relations: ['patient'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPatient(patientId: string): Promise<MedicalRecord[]> {
    return this.medicalRecordRepository.find({
      where: { patientId },
      relations: ['doctor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MedicalRecord | null> {
    return this.medicalRecordRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });
  }

  async update(
    id: string,
    updateData: UpdateMedicalRecordDto,
  ): Promise<MedicalRecord> {
    await this.medicalRecordRepository.update(id, updateData);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Medical record not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.medicalRecordRepository.delete(id);
  }
}

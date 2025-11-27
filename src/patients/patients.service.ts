import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(patientData: Partial<Patient>): Promise<Patient> {
    const patient = this.patientRepository.create(patientData);
    return this.patientRepository.save(patient);
  }

  async findByUserId(userId: string): Promise<Patient | null> {
    return this.patientRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findAll(): Promise<Patient[]> {
    return this.patientRepository.find({
      relations: ['user'],
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<Patient | null> {
    return this.patientRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async update(id: string, updateData: Partial<Patient>): Promise<Patient> {
    await this.patientRepository.update(id, updateData);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Patient not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.patientRepository.update(id, { isActive: false });
  }
}

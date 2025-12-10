import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly usersService: UsersService,
  ) {}

  async create(patientData: Partial<Patient>): Promise<Patient> {
    const patient = this.patientRepository.create(patientData);
    return this.patientRepository.save(patient);
  }

  async registerWithUser(registerData: any): Promise<Patient> {
    // Check if user already exists
    const existing = await this.usersService.findByEmail(registerData.email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    // Create a default password for the patient
    const defaultPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Create the User
    const user = await this.usersService.create({
      fullName: registerData.fullName,
      email: registerData.email,
      passwordHash,
      role: UserRole.PATIENT,
    });

    // Create the Patient
    const patientData: Partial<Patient> = {
      dateOfBirth: new Date(registerData.dateOfBirth),
      phone: registerData.phone,
      address: registerData.address,
      bloodType: registerData.bloodType || null,
      allergies: registerData.allergies || null,
      chronicDiseases: registerData.chronicDiseases || null,
      isActive: registerData.isActive !== false,
      user,
    };

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
    try {
      await this.patientRepository.update(id, updateData);
    } catch (err) {
      // Could be a DB error (invalid value, constraint, etc.)
      throw new BadRequestException('Failed to update patient', err?.message);
    }

    const updated = await this.findOne(id);
    if (!updated) {
      throw new NotFoundException('Patient not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.patientRepository.update(id, { isActive: false });
  }
}

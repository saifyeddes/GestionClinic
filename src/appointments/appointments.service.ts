import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Appointment, AppointmentStatus, AppointmentType } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async create(appointmentData: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointmentRepository.create(appointmentData);
    return this.appointmentRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: ['doctor', 'patient', 'patient.user', 'createdBy'],
      order: { appointmentDate: 'ASC' },
    });
  }

  async findByDoctor(doctorId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { doctorId },
      relations: ['patient', 'patient.user', 'createdBy'],
      order: { appointmentDate: 'ASC' },
    });
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { patientId },
      relations: ['doctor', 'patient', 'patient.user', 'createdBy'],
      order: { appointmentDate: 'ASC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: {
        appointmentDate: Between(startDate, endDate),
      },
      relations: ['doctor', 'patient', 'patient.user'],
      order: { appointmentDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Appointment | null> {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient', 'patient.user', 'createdBy'],
    });
  }

  async update(id: string, updateData: Partial<Appointment>): Promise<Appointment> {
    await this.appointmentRepository.update(id, updateData);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Appointment not found');
    }
    return updated;
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    await this.appointmentRepository.update(id, { status });
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Appointment not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.appointmentRepository.delete(id);
  }

  async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    return this.appointmentRepository.find({
      where: {
        appointmentDate: Between(startOfDay, endOfDay),
      },
      relations: ['doctor', 'patient', 'patient.user'],
      order: { appointmentDate: 'ASC' },
    });
  }
}

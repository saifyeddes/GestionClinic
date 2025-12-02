import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
export declare class AppointmentsService {
    private readonly appointmentRepository;
    constructor(appointmentRepository: Repository<Appointment>);
    create(appointmentData: Partial<Appointment>): Promise<Appointment>;
    findAll(): Promise<Appointment[]>;
    findByDoctor(doctorId: string): Promise<Appointment[]>;
    findByPatient(patientId: string): Promise<Appointment[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]>;
    findOne(id: string): Promise<Appointment | null>;
    update(id: string, updateData: Partial<Appointment>): Promise<Appointment>;
    updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
    remove(id: string): Promise<void>;
    getTodayAppointments(): Promise<Appointment[]>;
}

import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { UsersService } from '../users/users.service';
export declare class AppointmentsService {
    private readonly appointmentRepository;
    private readonly usersService;
    constructor(appointmentRepository: Repository<Appointment>, usersService: UsersService);
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
    getDoctors(): Promise<import("../users/entities/user.entity").User[]>;
}

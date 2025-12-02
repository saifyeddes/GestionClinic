import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment>;
    findAll(): Promise<Appointment[]>;
    findByDoctor(doctorId: string): Promise<Appointment[]>;
    findByPatient(patientId: string): Promise<Appointment[]>;
    getTodayAppointments(): Promise<Appointment[]>;
    findOne(id: string): Promise<Appointment | null>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment>;
    updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
    remove(id: string): Promise<void>;
}

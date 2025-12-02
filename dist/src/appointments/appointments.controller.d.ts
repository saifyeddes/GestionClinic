import { AppointmentsService } from './appointments.service';
import { PatientsService } from '../patients/patients.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { Appointment, AppointmentStatus, AppointmentType } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';
interface PatientRequestData {
    doctorId: string;
    appointmentDate: string;
    type: AppointmentType;
    reason?: string;
    symptoms?: string;
    duration?: number;
}
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        role: UserRole;
        fullName: string;
        phone?: string;
    };
}
export declare class AppointmentsController {
    private readonly appointmentsService;
    private readonly patientsService;
    constructor(appointmentsService: AppointmentsService, patientsService: PatientsService);
    create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment>;
    createPatientRequest(appointmentData: PatientRequestData, req: AuthenticatedRequest): Promise<Appointment>;
    findAll(): Promise<Appointment[]>;
    getPatientAppointments(req: AuthenticatedRequest): Promise<Appointment[]>;
    getDoctors(): Promise<User[]>;
    findByPatient(patientId: string): Promise<Appointment[]>;
    getTodayAppointments(): Promise<Appointment[]>;
    findOne(id: string): Promise<Appointment | null>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment>;
    updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
    remove(id: string): Promise<void>;
}
export {};

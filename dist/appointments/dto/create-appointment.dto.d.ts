import { AppointmentType, AppointmentStatus } from '../entities/appointment.entity';
export declare class CreateAppointmentDto {
    appointmentDate: string;
    status?: AppointmentStatus;
    type: AppointmentType;
    reason?: string;
    notes?: string;
    symptoms?: string;
    duration?: number;
    doctorId: string;
    patientId: string;
    createdById: string;
}

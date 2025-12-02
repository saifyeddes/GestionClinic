import { User } from '../../users/entities/user.entity';
import { Patient } from '../../patients/entities/patient.entity';
export declare enum AppointmentStatus {
    SCHEDULED = "SCHEDULED",
    CONFIRMED = "CONFIRMED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}
export declare enum AppointmentType {
    CONSULTATION = "CONSULTATION",
    FOLLOW_UP = "FOLLOW_UP",
    EMERGENCY = "EMERGENCY",
    SURGERY = "SURGERY",
    VACCINATION = "VACCINATION",
    CHECK_UP = "CHECK_UP"
}
export declare class Appointment {
    id: string;
    appointmentDate: Date;
    status: AppointmentStatus;
    type: AppointmentType;
    reason: string;
    notes: string;
    symptoms: string;
    duration: number;
    doctor: User;
    doctorId: string;
    patient: Patient;
    patientId: string;
    createdBy: User;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
}

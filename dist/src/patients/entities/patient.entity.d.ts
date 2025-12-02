import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity';
export declare class Patient {
    id: string;
    dateOfBirth: Date;
    phone: string;
    address: string;
    emergencyContact: string;
    emergencyPhone: string;
    bloodType: string;
    allergies: string;
    chronicDiseases: string;
    isActive: boolean;
    user: User;
    appointments: Appointment[];
    medicalRecords: MedicalRecord[];
    createdAt: Date;
    updatedAt: Date;
}

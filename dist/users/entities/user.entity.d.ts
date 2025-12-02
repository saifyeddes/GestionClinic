import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { Patient } from '../../patients/entities/patient.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    role: UserRole;
    status: UserStatus;
    phone: string;
    specialization: string;
    licenseNumber: string;
    isActive: boolean;
    patient: Patient;
    appointments: Appointment[];
    createdAppointments: Appointment[];
    medicalRecords: MedicalRecord[];
    createdAt: Date;
    updatedAt: Date;
}

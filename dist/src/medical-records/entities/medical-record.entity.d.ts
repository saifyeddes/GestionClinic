import { User } from '../../users/entities/user.entity';
import { Patient } from '../../patients/entities/patient.entity';
export declare class MedicalRecord {
    id: string;
    diagnosis: string;
    treatment: string;
    prescription: string;
    observations: string;
    recommendations: string;
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
    patient: Patient;
    patientId: string;
    doctor: User;
    doctorId: string;
    createdAt: Date;
    updatedAt: Date;
}

export declare class CreateMedicalRecordDto {
    diagnosis: string;
    treatment?: string;
    prescription?: string;
    observations?: string;
    recommendations?: string;
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    patientId: string;
    doctorId: string;
}

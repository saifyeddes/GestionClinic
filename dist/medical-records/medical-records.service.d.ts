import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
export declare class MedicalRecordsService {
    private readonly medicalRecordRepository;
    constructor(medicalRecordRepository: Repository<MedicalRecord>);
    create(recordData: Partial<MedicalRecord>): Promise<MedicalRecord>;
    findAll(): Promise<MedicalRecord[]>;
    findByDoctor(doctorId: string): Promise<MedicalRecord[]>;
    findByPatient(patientId: string): Promise<MedicalRecord[]>;
    findOne(id: string): Promise<MedicalRecord | null>;
    update(id: string, updateData: UpdateMedicalRecordDto): Promise<MedicalRecord>;
    remove(id: string): Promise<void>;
}

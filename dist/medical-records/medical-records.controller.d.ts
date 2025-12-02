import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecord } from './entities/medical-record.entity';
export declare class MedicalRecordsController {
    private readonly medicalRecordsService;
    constructor(medicalRecordsService: MedicalRecordsService);
    create(createMedicalRecordDto: CreateMedicalRecordDto): Promise<MedicalRecord>;
    findAll(): Promise<MedicalRecord[]>;
    findByDoctor(doctorId: string): Promise<MedicalRecord[]>;
    findByPatient(patientId: string): Promise<MedicalRecord[]>;
    findOne(id: string): Promise<MedicalRecord | null>;
    update(id: string, updateMedicalRecordDto: UpdateMedicalRecordDto): Promise<MedicalRecord>;
    remove(id: string): Promise<void>;
}

import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
export declare class PatientsService {
    private readonly patientRepository;
    constructor(patientRepository: Repository<Patient>);
    create(patientData: Partial<Patient>): Promise<Patient>;
    findByUserId(userId: string): Promise<Patient | null>;
    findAll(): Promise<Patient[]>;
    findOne(id: string): Promise<Patient | null>;
    update(id: string, updateData: Partial<Patient>): Promise<Patient>;
    remove(id: string): Promise<void>;
}

import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: UserRole;
            status: import("../common/enums/user-status.enum").UserStatus;
            phone: string;
            specialization: string;
            licenseNumber: string;
            isActive: boolean;
            patient: import("../patients/entities/patient.entity").Patient;
            appointments: import("../appointments/entities/appointment.entity").Appointment[];
            createdAppointments: import("../appointments/entities/appointment.entity").Appointment[];
            medicalRecords: import("../medical-records/entities/medical-record.entity").MedicalRecord[];
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: UserRole;
            status: import("../common/enums/user-status.enum").UserStatus;
            phone: string;
            specialization: string;
            licenseNumber: string;
            isActive: boolean;
            patient: import("../patients/entities/patient.entity").Patient;
            appointments: import("../appointments/entities/appointment.entity").Appointment[];
            createdAppointments: import("../appointments/entities/appointment.entity").Appointment[];
            medicalRecords: import("../medical-records/entities/medical-record.entity").MedicalRecord[];
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    validateUserById(id: string): Promise<User | null>;
    getProfile(id: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: UserRole;
        status: import("../common/enums/user-status.enum").UserStatus;
        phone: string;
        specialization: string;
        licenseNumber: string;
        isActive: boolean;
        patient: import("../patients/entities/patient.entity").Patient;
        appointments: import("../appointments/entities/appointment.entity").Appointment[];
        createdAppointments: import("../appointments/entities/appointment.entity").Appointment[];
        medicalRecords: import("../medical-records/entities/medical-record.entity").MedicalRecord[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    private signToken;
    private toSafeUser;
}

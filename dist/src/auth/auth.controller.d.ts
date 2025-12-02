import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: import("../common/enums/user-role.enum").UserRole;
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
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: import("../common/enums/user-role.enum").UserRole;
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
    getProfile(req: any): Promise<any>;
    me(req: any): any;
}

import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
export type JwtPayload = {
    sub: string;
    email: string;
    role: string;
};
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(payload: JwtPayload): Promise<{
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
    } | null>;
}
export {};

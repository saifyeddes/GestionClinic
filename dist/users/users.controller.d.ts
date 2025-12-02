import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(search?: string, role?: UserRole): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: UserRole;
        status: UserStatus;
        phone: string;
        specialization: string;
        licenseNumber: string;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    update(id: string, updateData: Partial<User>): Promise<any>;
    updateStatus(id: string, status: UserStatus): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: UserRole;
        status: UserStatus;
        phone: string;
        specialization: string;
        licenseNumber: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    updateRole(id: string, role: UserRole): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: UserRole;
        status: UserStatus;
        phone: string;
        specialization: string;
        licenseNumber: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}

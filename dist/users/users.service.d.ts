import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserStatus } from '../common/enums/user-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: Repository<User>);
    create(createUserDto: Partial<User>): Promise<User>;
    findAll(options?: {
        search?: string;
        role?: UserRole;
    }): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateData: Partial<User>): Promise<User>;
    updateStatus(id: string, status: UserStatus): Promise<User>;
    updateRole(id: string, role: UserRole): Promise<User>;
    remove(id: string): Promise<void>;
}

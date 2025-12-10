import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  ParseEnumPipe,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from './entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('doctors')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.PATIENT)
  async getDoctors() {
    const users = await this.usersService.findAll({ role: UserRole.DOCTOR });
    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      specialization: u.specialization,
      phone: u.phone,
    }));
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createUserData: { fullName: string; email: string; password: string; role: UserRole; status?: UserStatus },
  ) {
    // prevent duplicate email insertion with a friendly error
    const existing = await this.usersService.findByEmail(createUserData.email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    if (!createUserData.password || createUserData.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const passwordHash = await bcrypt.hash(createUserData.password, 10);

    const user = await this.usersService.create({
      fullName: createUserData.fullName,
      email: createUserData.email,
      passwordHash,
      role: createUserData.role,
      status: createUserData.status || UserStatus.ACTIVE,
    });
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      specialization: user.specialization,
      licenseNumber: user.licenseNumber,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('search') search?: string,
    @Query('role', new ParseEnumPipe(UserRole, { optional: true }))
    role?: UserRole,
  ) {
    const users = await this.usersService.findAll({ search, role });
    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      status: u.status,
      phone: u.phone,
      specialization: u.specialization,
      licenseNumber: u.licenseNumber,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ): Promise<any> {
    const user = await this.usersService.update(id, updateData);
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      specialization: user.specialization,
      licenseNumber: user.licenseNumber,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body('status', new ParseEnumPipe(UserStatus)) status: UserStatus,
  ) {
    const user = await this.usersService.updateStatus(id, status);
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      specialization: user.specialization,
      licenseNumber: user.licenseNumber,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  async updateRole(
    @Param('id') id: string,
    @Body('role', new ParseEnumPipe(UserRole)) role: UserRole,
  ) {
    const user = await this.usersService.updateRole(id, role);
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      specialization: user.specialization,
      licenseNumber: user.licenseNumber,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { success: true };
  }
}

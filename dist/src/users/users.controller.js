"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const user_status_enum_1 = require("../common/enums/user-status.enum");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAll(search, role) {
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
    async update(id, updateData) {
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
    async updateStatus(id, status) {
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
    async updateRole(id, role) {
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
    async remove(id) {
        await this.usersService.remove(id);
        return { success: true };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('role', new common_1.ParseEnumPipe(user_role_enum_1.UserRole, { optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.RECEPTIONIST),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status', new common_1.ParseEnumPipe(user_status_enum_1.UserStatus))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/role'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('role', new common_1.ParseEnumPipe(user_role_enum_1.UserRole))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map
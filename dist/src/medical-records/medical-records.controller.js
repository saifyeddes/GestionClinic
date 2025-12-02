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
exports.MedicalRecordsController = void 0;
const common_1 = require("@nestjs/common");
const medical_records_service_1 = require("./medical-records.service");
const create_medical_record_dto_1 = require("./dto/create-medical-record.dto");
const update_medical_record_dto_1 = require("./dto/update-medical-record.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let MedicalRecordsController = class MedicalRecordsController {
    medicalRecordsService;
    constructor(medicalRecordsService) {
        this.medicalRecordsService = medicalRecordsService;
    }
    async create(createMedicalRecordDto) {
        return await this.medicalRecordsService.create(createMedicalRecordDto);
    }
    findAll() {
        return this.medicalRecordsService.findAll();
    }
    async findByDoctor(doctorId) {
        return await this.medicalRecordsService.findByDoctor(doctorId);
    }
    async findByPatient(patientId) {
        return await this.medicalRecordsService.findByPatient(patientId);
    }
    async findOne(id) {
        return await this.medicalRecordsService.findOne(id);
    }
    async update(id, updateMedicalRecordDto) {
        return await this.medicalRecordsService.update(id, updateMedicalRecordDto);
    }
    remove(id) {
        return this.medicalRecordsService.remove(id);
    }
};
exports.MedicalRecordsController = MedicalRecordsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_medical_record_dto_1.CreateMedicalRecordDto]),
    __metadata("design:returntype", Promise)
], MedicalRecordsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.DOCTOR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MedicalRecordsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('doctor/:doctorId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Param)('doctorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedicalRecordsController.prototype, "findByDoctor", null);
__decorate([
    (0, common_1.Get)('patient/:patientId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.RECEPTIONIST, user_role_enum_1.UserRole.PATIENT),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedicalRecordsController.prototype, "findByPatient", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.PATIENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedicalRecordsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_medical_record_dto_1.UpdateMedicalRecordDto]),
    __metadata("design:returntype", Promise)
], MedicalRecordsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MedicalRecordsController.prototype, "remove", null);
exports.MedicalRecordsController = MedicalRecordsController = __decorate([
    (0, common_1.Controller)('medical-records'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [medical_records_service_1.MedicalRecordsService])
], MedicalRecordsController);
//# sourceMappingURL=medical-records.controller.js.map
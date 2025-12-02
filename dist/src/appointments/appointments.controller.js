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
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const appointments_service_1 = require("./appointments.service");
const patients_service_1 = require("../patients/patients.service");
const create_appointment_dto_1 = require("./dto/create-appointment.dto");
const update_appointment_dto_1 = require("./dto/update-appointment.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const appointment_entity_1 = require("./entities/appointment.entity");
let AppointmentsController = class AppointmentsController {
    appointmentsService;
    patientsService;
    constructor(appointmentsService, patientsService) {
        this.appointmentsService = appointmentsService;
        this.patientsService = patientsService;
    }
    create(createAppointmentDto) {
        const appointmentData = {};
        Object.keys(createAppointmentDto).forEach((key) => {
            const value = createAppointmentDto[key];
            if (key === 'appointmentDate' && typeof value === 'string') {
                appointmentData[key] = new Date(value);
            }
            else {
                const appointmentDataAny = appointmentData;
                appointmentDataAny[key] = value;
            }
        });
        return this.appointmentsService.create(appointmentData);
    }
    async createPatientRequest(appointmentData, req) {
        const patientUser = req.user;
        let patient = await this.patientsService.findByUserId(patientUser.id);
        if (!patient) {
            console.log('⚠️  Patient non trouvé - Création automatique du profil patient...');
            patient = await this.patientsService.create({
                user: { id: patientUser.id },
                dateOfBirth: new Date('1990-01-01'),
                phone: patientUser.phone || '0000000000',
                address: 'Adresse par défaut',
                isActive: true,
            });
            console.log('✅ Profil patient créé automatiquement pour:', patientUser.fullName);
        }
        const formattedAppointment = {
            doctorId: appointmentData.doctorId,
            patientId: patient.id,
            createdById: patientUser.id,
            appointmentDate: new Date(appointmentData.appointmentDate),
            type: appointmentData.type,
            reason: appointmentData.reason || 'Consultation générale',
            status: appointment_entity_1.AppointmentStatus.SCHEDULED,
            symptoms: appointmentData.symptoms || '',
            duration: appointmentData.duration || 30,
        };
        return this.appointmentsService.create(formattedAppointment);
    }
    findAll() {
        return this.appointmentsService.findAll();
    }
    async getPatientAppointments(req) {
        const patientUser = req.user;
        const patient = await this.patientsService.findByUserId(patientUser.id);
        if (!patient) {
            throw new Error('Patient profile not found');
        }
        return this.appointmentsService.findByPatient(patient.id);
    }
    getDoctors() {
        return this.appointmentsService.getDoctors();
    }
    findByPatient(patientId) {
        return this.appointmentsService.findByPatient(patientId);
    }
    getTodayAppointments() {
        return this.appointmentsService.getTodayAppointments();
    }
    findOne(id) {
        return this.appointmentsService.findOne(id);
    }
    update(id, updateAppointmentDto) {
        const updateData = {};
        Object.keys(updateAppointmentDto).forEach((key) => {
            const value = updateAppointmentDto[key];
            if (value !== undefined) {
                if (key === 'appointmentDate' && typeof value === 'string') {
                    updateData[key] = new Date(value);
                }
                else {
                    const updateDataAny = updateData;
                    updateDataAny[key] = value;
                }
            }
        });
        return this.appointmentsService.update(id, updateData);
    }
    updateStatus(id, status) {
        return this.appointmentsService.updateStatus(id, status);
    }
    remove(id) {
        return this.appointmentsService.remove(id);
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.RECEPTIONIST, user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.PATIENT),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_appointment_dto_1.CreateAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('patient-request'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PATIENT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "createPatientRequest", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.RECEPTIONIST),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('patient'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PATIENT),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getPatientAppointments", null);
__decorate([
    (0, common_1.Get)('doctors'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.RECEPTIONIST, user_role_enum_1.UserRole.PATIENT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "getDoctors", null);
__decorate([
    (0, common_1.Get)('patient/:patientId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.RECEPTIONIST, user_role_enum_1.UserRole.PATIENT),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "findByPatient", null);
__decorate([
    (0, common_1.Get)('today'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.RECEPTIONIST),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "getTodayAppointments", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.RECEPTIONIST, user_role_enum_1.UserRole.PATIENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.RECEPTIONIST, user_role_enum_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_appointment_dto_1.UpdateAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.RECEPTIONIST),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "remove", null);
exports.AppointmentsController = AppointmentsController = __decorate([
    (0, common_1.Controller)('appointments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [appointments_service_1.AppointmentsService,
        patients_service_1.PatientsService])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map
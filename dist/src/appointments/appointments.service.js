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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("./entities/appointment.entity");
const users_service_1 = require("../users/users.service");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let AppointmentsService = class AppointmentsService {
    appointmentRepository;
    usersService;
    constructor(appointmentRepository, usersService) {
        this.appointmentRepository = appointmentRepository;
        this.usersService = usersService;
    }
    async create(appointmentData) {
        const appointment = this.appointmentRepository.create(appointmentData);
        return this.appointmentRepository.save(appointment);
    }
    async findAll() {
        return this.appointmentRepository.find({
            relations: ['doctor', 'patient', 'createdBy'],
            order: { appointmentDate: 'ASC' },
        });
    }
    async findByDoctor(doctorId) {
        return this.appointmentRepository.find({
            where: { doctorId },
            relations: ['patient', 'createdBy'],
            order: { appointmentDate: 'ASC' },
        });
    }
    async findByPatient(patientId) {
        return this.appointmentRepository.find({
            where: { patientId },
            relations: ['doctor', 'createdBy'],
            order: { appointmentDate: 'ASC' },
        });
    }
    async findByDateRange(startDate, endDate) {
        return this.appointmentRepository.find({
            where: {
                appointmentDate: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['doctor', 'patient'],
            order: { appointmentDate: 'ASC' },
        });
    }
    async findOne(id) {
        return this.appointmentRepository.findOne({
            where: { id },
            relations: ['doctor', 'patient', 'createdBy'],
        });
    }
    async update(id, updateData) {
        await this.appointmentRepository.update(id, updateData);
        const updated = await this.findOne(id);
        if (!updated) {
            throw new Error('Appointment not found');
        }
        return updated;
    }
    async updateStatus(id, status) {
        await this.appointmentRepository.update(id, { status });
        const updated = await this.findOne(id);
        if (!updated) {
            throw new Error('Appointment not found');
        }
        return updated;
    }
    async remove(id) {
        await this.appointmentRepository.delete(id);
    }
    async getTodayAppointments() {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        return this.appointmentRepository.find({
            where: {
                appointmentDate: (0, typeorm_2.Between)(startOfDay, endOfDay),
            },
            relations: ['doctor', 'patient'],
            order: { appointmentDate: 'ASC' },
        });
    }
    async getDoctors() {
        return this.usersService.findAll({ role: user_role_enum_1.UserRole.DOCTOR });
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map
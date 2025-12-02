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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecord = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const patient_entity_1 = require("../../patients/entities/patient.entity");
let MedicalRecord = class MedicalRecord {
    id;
    diagnosis;
    treatment;
    prescription;
    observations;
    recommendations;
    bloodPressure;
    heartRate;
    temperature;
    weight;
    height;
    patient;
    patientId;
    doctor;
    doctorId;
    createdAt;
    updatedAt;
};
exports.MedicalRecord = MedicalRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MedicalRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "diagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "treatment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "prescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "recommendations", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "bloodPressure", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], MedicalRecord.prototype, "heartRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], MedicalRecord.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], MedicalRecord.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], MedicalRecord.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, patient => patient.medicalRecords),
    (0, typeorm_1.JoinColumn)({ name: 'patientId' }),
    __metadata("design:type", patient_entity_1.Patient)
], MedicalRecord.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MedicalRecord.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, doctor => doctor.medicalRecords),
    (0, typeorm_1.JoinColumn)({ name: 'doctorId' }),
    __metadata("design:type", user_entity_1.User)
], MedicalRecord.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MedicalRecord.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MedicalRecord.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MedicalRecord.prototype, "updatedAt", void 0);
exports.MedicalRecord = MedicalRecord = __decorate([
    (0, typeorm_1.Entity)()
], MedicalRecord);
//# sourceMappingURL=medical-record.entity.js.map
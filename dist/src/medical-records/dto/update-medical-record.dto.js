"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMedicalRecordDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_medical_record_dto_1 = require("./create-medical-record.dto");
class UpdateMedicalRecordDto extends (0, mapped_types_1.PartialType)(create_medical_record_dto_1.CreateMedicalRecordDto) {
}
exports.UpdateMedicalRecordDto = UpdateMedicalRecordDto;
//# sourceMappingURL=update-medical-record.dto.js.map
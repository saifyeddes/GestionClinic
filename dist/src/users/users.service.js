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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async create(createUserDto) {
        const user = this.usersRepository.create(createUserDto);
        return this.usersRepository.save(user);
    }
    async findAll(options = {}) {
        const { search, role } = options;
        const queryBuilder = this.usersRepository.createQueryBuilder('user');
        if (search) {
            queryBuilder.where('user.fullName ILIKE :search OR user.email ILIKE :search', { search: `%${search}%` });
        }
        if (role) {
            queryBuilder.andWhere('user.role = :role', { role });
        }
        return queryBuilder.getMany();
    }
    async findById(id) {
        return this.usersRepository.findOne({ where: { id } });
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({ where: { email } });
    }
    async update(id, updateData) {
        await this.usersRepository.update(id, updateData);
        const user = await this.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async updateStatus(id, status) {
        await this.usersRepository.update(id, { status });
        const user = await this.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async updateRole(id, role) {
        await this.usersRepository.update(id, { role });
        const user = await this.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async remove(id) {
        await this.usersRepository.delete(id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map
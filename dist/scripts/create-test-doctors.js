"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const user_role_enum_1 = require("../src/common/enums/user-role.enum");
async function createTestDoctors() {
    console.log('👨‍⚕️ Création de médecins de test...');
    let app = null;
    try {
        app = (await core_1.NestFactory.create(app_module_1.AppModule));
        const usersService = app.get('UsersService');
        console.log('✅ Service utilisateurs obtenu');
        const existingDoctors = await usersService.findAll({ role: user_role_enum_1.UserRole.DOCTOR });
        console.log(`📋 Médecins existants: ${existingDoctors.length}`);
        if (existingDoctors.length === 0) {
            console.log('⚠️  Aucun médecin trouvé - Création de médecins de test...');
            const testDoctors = [
                {
                    email: 'dr.martin@clinique.com',
                    passwordHash: 'password123',
                    fullName: 'Dr. Sophie Martin',
                    role: user_role_enum_1.UserRole.DOCTOR,
                    specialization: 'Médecin généraliste',
                    licenseNumber: 'DOC-001',
                },
                {
                    email: 'dr.bernard@clinique.com',
                    passwordHash: 'password123',
                    fullName: 'Dr. Pierre Bernard',
                    role: user_role_enum_1.UserRole.DOCTOR,
                    specialization: 'Cardiologue',
                    licenseNumber: 'DOC-002',
                },
                {
                    email: 'dr.dubois@clinique.com',
                    passwordHash: 'password123',
                    fullName: 'Dr. Marie Dubois',
                    role: user_role_enum_1.UserRole.DOCTOR,
                    specialization: 'Pédiatre',
                    licenseNumber: 'DOC-003',
                },
                {
                    email: 'dr.leroy@clinique.com',
                    passwordHash: 'password123',
                    fullName: 'Dr. Jean Leroy',
                    role: user_role_enum_1.UserRole.DOCTOR,
                    specialization: 'Dermatologue',
                    licenseNumber: 'DOC-004',
                },
            ];
            for (const doctorData of testDoctors) {
                const doctor = await usersService.create(doctorData);
                console.log(`✅ Médecin créé: ${doctor.fullName} (${doctor.specialization})`);
            }
            console.log('🎉 Tous les médecins de test ont été créés !');
        }
        else {
            console.log('✅ Des médecins existent déjà:');
            existingDoctors.forEach((doctor) => {
                console.log(`   - ${doctor.fullName} (${doctor.specialization || 'Non spécifiée'})`);
            });
        }
        const finalDoctors = await usersService.findAll({ role: user_role_enum_1.UserRole.DOCTOR });
        console.log(`📊 Total médecins disponibles: ${finalDoctors.length}`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Erreur lors de la création des médecins:', errorMessage);
        process.exit(1);
    }
    finally {
        if (app) {
            try {
                await app.close();
            }
            catch (closeError) {
                console.log('⚠️  Erreur lors de la fermeture de l\'application:', closeError);
            }
        }
    }
}
void createTestDoctors();
//# sourceMappingURL=create-test-doctors.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const user_role_enum_1 = require("../src/common/enums/user-role.enum");
async function createTestPatients() {
    console.log('👥 Création de patients de test...');
    let app = null;
    try {
        app = (await core_1.NestFactory.create(app_module_1.AppModule));
        const usersService = app.get('UsersService');
        const patientsService = app.get('PatientsService');
        console.log('✅ Services obtenus avec succès');
        const existingPatients = await patientsService.findAll();
        console.log(`📋 Patients existants: ${existingPatients.length}`);
        if (existingPatients.length === 0) {
            console.log('⚠️  Aucun patient trouvé - Création de patients de test...');
            const testPatients = [
                {
                    email: 'patient1@clinique.com',
                    passwordHash: 'password123',
                    fullName: 'Alice Martin',
                    role: user_role_enum_1.UserRole.PATIENT,
                    phone: '0123456789',
                },
                {
                    email: 'patient2@clinique.com',
                    passwordHash: 'password123',
                    fullName: 'Bob Bernard',
                    role: user_role_enum_1.UserRole.PATIENT,
                    phone: '0234567890',
                },
                {
                    email: 'patient3@clinique.com',
                    passwordHash: 'password123',
                    fullName: 'Claire Dubois',
                    role: user_role_enum_1.UserRole.PATIENT,
                    phone: '0345678901',
                },
            ];
            for (const patientData of testPatients) {
                const user = await usersService.create(patientData);
                const patient = await patientsService.create({
                    user: user,
                    dateOfBirth: new Date('1985-05-15'),
                    phone: patientData.phone,
                    address: '123 Rue Test, Ville',
                    isActive: true,
                });
                console.log(`✅ Patient créé: ${patient.user.fullName} (${patient.user.email})`);
            }
            console.log('🎉 Tous les patients de test ont été créés !');
        }
        else {
            console.log('✅ Des patients existent déjà:');
            existingPatients.forEach((patient) => {
                console.log(`   - ${patient.user?.fullName} (${patient.user?.email})`);
            });
        }
        const finalPatients = await patientsService.findAll();
        console.log(`📊 Total patients disponibles: ${finalPatients.length}`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Erreur lors de la création des patients:', errorMessage);
        process.exit(1);
    }
    finally {
        if (app) {
            try {
                await app.close();
            }
            catch (closeError) {
                console.log("⚠️  Erreur lors de la fermeture de l'application:", closeError);
            }
        }
    }
}
void createTestPatients();
//# sourceMappingURL=create-test-patients.js.map
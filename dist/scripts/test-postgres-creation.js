"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const user_role_enum_1 = require("../src/common/enums/user-role.enum");
const appointment_entity_1 = require("../src/appointments/entities/appointment.entity");
async function testPostgresCreation() {
    console.log('🧪 Test de création de rendez-vous dans PostgreSQL...');
    let app = null;
    try {
        app = (await core_1.NestFactory.create(app_module_1.AppModule));
        const appointmentsService = app.get('AppointmentsService');
        const usersService = app.get('UsersService');
        const patientsService = app.get('PatientsService');
        console.log('✅ Services obtenus avec succès');
        console.log('🔍 Vérification de la connexion PostgreSQL...');
        const doctors = await usersService.findAll({ role: user_role_enum_1.UserRole.DOCTOR });
        if (doctors.length === 0) {
            console.log("⚠️  Aucun médecin trouvé - Création d'un médecin de test...");
            const testDoctor = await usersService.create({
                email: 'test.doctor@clinique.com',
                passwordHash: 'password123',
                fullName: 'Dr. Test Médicin',
                role: user_role_enum_1.UserRole.DOCTOR,
                specialization: 'Généraliste',
                licenseNumber: 'TEST-123',
            });
            console.log('✅ Médecin de test créé:', testDoctor.fullName);
        }
        const patients = await patientsService.findAll();
        if (patients.length === 0) {
            console.log("⚠️  Aucun patient trouvé - Création d'un patient de test...");
            const testUser = await usersService.create({
                email: 'test.patient@clinique.com',
                passwordHash: 'password123',
                fullName: 'Test Patient',
                role: user_role_enum_1.UserRole.PATIENT,
            });
            const testPatient = await patientsService.create({
                user: testUser,
                dateOfBirth: new Date('1990-01-01'),
                phone: '0123456789',
                address: '123 Rue Test, Ville',
            });
            console.log('✅ Patient de test créé:', testPatient.user.fullName);
        }
        console.log("📅 Création d'un rendez-vous de test...");
        const doctorList = await usersService.findAll({ role: user_role_enum_1.UserRole.DOCTOR });
        const patientList = await patientsService.findAll();
        if (doctorList.length > 0 && patientList.length > 0) {
            const testAppointment = await appointmentsService.create({
                doctorId: doctorList[0].id,
                patientId: patientList[0].id,
                createdById: patientList[0].user.id,
                appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                type: appointment_entity_1.AppointmentType.CONSULTATION,
                reason: 'Test de création PostgreSQL',
                status: appointment_entity_1.AppointmentStatus.SCHEDULED,
                symptoms: 'Symptômes de test',
                duration: 30,
            });
            console.log('✅ Rendez-vous créé avec succès dans PostgreSQL!');
            console.log('   ID:', testAppointment.id);
            console.log('   Date:', testAppointment.appointmentDate);
            console.log('   Médecin:', testAppointment.doctor?.fullName);
            console.log('   Patient:', testAppointment.patient?.user?.fullName);
            const foundAppointment = await appointmentsService.findOne(testAppointment.id);
            if (foundAppointment) {
                console.log('✅ Rendez-vous trouvé dans la base de données!');
            }
            else {
                console.log('❌ Rendez-vous non trouvé dans la base de données');
            }
        }
        else {
            console.log('❌ Impossible de créer un rendez-vous - médecin ou patient manquant');
        }
        console.log('\n🎉 Test PostgreSQL terminé avec succès!');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Erreur lors du test PostgreSQL:', errorMessage);
        if (errorMessage.includes('database')) {
            console.log('💡 Solution: Vérifiez que la base de données "clinic_db" existe');
        }
        else if (errorMessage.includes('connection')) {
            console.log("💡 Solution: Vérifiez que PostgreSQL est en cours d'exécution");
        }
        else if (errorMessage.includes('password')) {
            console.log('💡 Solution: Vérifiez le mot de passe dans le fichier .env');
        }
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
void testPostgresCreation();
//# sourceMappingURL=test-postgres-creation.js.map
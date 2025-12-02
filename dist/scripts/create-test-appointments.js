"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const user_role_enum_1 = require("../src/common/enums/user-role.enum");
const appointment_entity_1 = require("../src/appointments/entities/appointment.entity");
async function createTestAppointments() {
    console.log('📅 Création de rendez-vous de test...');
    let app = null;
    try {
        app = (await core_1.NestFactory.create(app_module_1.AppModule));
        const usersService = app.get('UsersService');
        const patientsService = app.get('PatientsService');
        const appointmentsService = app.get('AppointmentsService');
        console.log('✅ Services obtenus avec succès');
        const existingAppointments = await appointmentsService.findAll();
        console.log(`📋 Rendez-vous existants: ${existingAppointments.length}`);
        if (existingAppointments.length === 0) {
            console.log('⚠️  Aucun rendez-vous trouvé - Création de rendez-vous de test...');
            const doctors = await usersService.findAll({ role: user_role_enum_1.UserRole.DOCTOR });
            const patients = await patientsService.findAll();
            console.log(`👨‍⚕️ Médecins disponibles: ${doctors.length}`);
            console.log(`👥 Patients disponibles: ${patients.length}`);
            if (doctors.length === 0 || patients.length === 0) {
                console.log("❌ Créez d'abord des médecins et des patients:");
                console.log('   npm run create:doctors');
                console.log('   npm run create:patients');
                return;
            }
            const testAppointments = [
                {
                    doctorId: doctors[0].id,
                    patientId: patients[0].id,
                    createdById: patients[0].user.id,
                    appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    type: appointment_entity_1.AppointmentType.CONSULTATION,
                    reason: 'Consultation générale',
                    symptoms: 'Fatigue et maux de tête',
                    status: appointment_entity_1.AppointmentStatus.SCHEDULED,
                    duration: 30,
                },
                {
                    doctorId: doctors[1]?.id || doctors[0].id,
                    patientId: patients[1]?.id || patients[0].id,
                    createdById: patients[1]?.user?.id || patients[0].user.id,
                    appointmentDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
                    type: appointment_entity_1.AppointmentType.FOLLOW_UP,
                    reason: 'Suivi post-opératoire',
                    symptoms: 'Douleur légère',
                    status: appointment_entity_1.AppointmentStatus.CONFIRMED,
                    duration: 45,
                },
                {
                    doctorId: doctors[2]?.id || doctors[0].id,
                    patientId: patients[2]?.id || patients[0].id,
                    createdById: patients[2]?.user?.id || patients[0].user.id,
                    appointmentDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    type: appointment_entity_1.AppointmentType.CHECK_UP,
                    reason: 'Contrôle annuel',
                    symptoms: 'Aucun symptôme',
                    status: appointment_entity_1.AppointmentStatus.COMPLETED,
                    duration: 30,
                },
            ];
            for (const appointmentData of testAppointments) {
                const appointment = await appointmentsService.create(appointmentData);
                console.log(`✅ Rendez-vous créé: ${appointment.type} - ${appointment.reason}`);
            }
            console.log('🎉 Tous les rendez-vous de test ont été créés !');
        }
        else {
            console.log('✅ Des rendez-vous existent déjà:');
            existingAppointments.forEach((appointment) => {
                console.log(`   - ${appointment.type} - ${appointment.reason} (${appointment.status})`);
            });
        }
        const finalAppointments = await appointmentsService.findAll();
        console.log(`📊 Total rendez-vous disponibles: ${finalAppointments.length}`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Erreur lors de la création des rendez-vous:', errorMessage);
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
void createTestAppointments();
//# sourceMappingURL=create-test-appointments.js.map
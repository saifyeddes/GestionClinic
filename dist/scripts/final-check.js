"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
function finalCheck() {
    console.log('🎯 VÉRIFICATION FINALE - Configuration PostgreSQL');
    console.log('='.repeat(60));
    const envPath = (0, path_1.join)(process.cwd(), '.env');
    try {
        const envContent = (0, fs_1.readFileSync)(envPath, 'utf8');
        const config = {};
        const lines = envContent.split('\n');
        lines.forEach((line) => {
            const match = line.match(/^([^=]+)=(.+)$/);
            if (match && !line.startsWith('#')) {
                config[match[1]] = match[2];
            }
        });
        console.log('\n📋 Configuration actuelle:');
        console.log(`   Host: ${config.DB_HOST || '❌ MANQUANT'}`);
        console.log(`   Port: ${config.DB_PORT || '❌ MANQUANT'}`);
        console.log(`   Username: ${config.DB_USERNAME || '❌ MANQUANT'}`);
        console.log(`   Password: ${config.DB_PASSWORD ? '✅ CONFIGURÉ' : '❌ MANQUANT'}`);
        console.log(`   Database: ${config.DB_DATABASE || '❌ MANQUANT'}`);
        console.log(`   Synchronize: ${config.DB_SYNCHRONIZE || '❌ MANQUANT'}`);
        console.log(`   Logging: ${config.DB_LOGGING || '❌ MANQUANT'}`);
        const criticalChecks = [
            { name: 'Host', value: config.DB_HOST, expected: 'localhost' },
            { name: 'Port', value: config.DB_PORT, expected: '5432' },
            { name: 'Username', value: config.DB_USERNAME, expected: 'postgres' },
            { name: 'Password', value: config.DB_PASSWORD, expected: '12345' },
            { name: 'Database', value: config.DB_DATABASE, expected: 'clinic_db' },
            { name: 'Synchronize', value: config.DB_SYNCHRONIZE, expected: 'true' },
        ];
        console.log('\n🔍 Vérifications critiques:');
        let allGood = true;
        criticalChecks.forEach((check) => {
            const status = check.value === check.expected ? '✅' : '❌';
            const actual = check.value || 'MANQUANT';
            console.log(`   ${status} ${check.name}: ${actual} (attendu: ${check.expected})`);
            if (check.value !== check.expected) {
                allGood = false;
            }
        });
        console.log('\n' + '='.repeat(60));
        if (allGood) {
            console.log('🎉 CONFIGURATION PARFAITE !');
            console.log('\n✅ Toutes les variables sont correctement configurées');
            console.log('✅ La base de données "clinic_db" sera utilisée');
            console.log('✅ Les tables seront créées automatiquement (synchronize=true)');
            console.log('\n🚀 PROCÉDER AU DÉMARRAGE:');
            console.log("1. Assurez-vous que PostgreSQL est en cours d'exécution");
            console.log('2. Assurez-vous que la base de données "clinic_db" existe dans pgAdmin');
            console.log('3. Lancez: npm run start:dev');
            console.log('\n📊 Tables qui seront créées automatiquement:');
            console.log('   • users - Utilisateurs du système');
            console.log('   • patients - Informations des patients');
            console.log('   • appointments - Rendez-vous');
            console.log('   • medical_records - Dossiers médicaux');
        }
        else {
            console.log('❌ CONFIGURATION INCOMPLÈTE');
            console.log('\n💡 Pour corriger:');
            console.log('   npm run fix:env      # Corriger les préfixes');
            console.log('   npm run set:database # Définir clinic_db');
            console.log('   npm run update:password # Mettre le mot de passe 12345');
        }
        console.log('\n' + '='.repeat(60));
    }
    catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
    }
}
finalCheck();
//# sourceMappingURL=final-check.js.map
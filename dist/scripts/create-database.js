"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function createDatabase() {
    console.log('🔧 Création de la base de données PostgreSQL...');
    try {
        const command = 'set PGPASSWORD=12345 && psql -U postgres -h localhost -c "CREATE DATABASE clinic_db;"';
        console.log('📝 Exécution de la commande:', command);
        const { stdout, stderr } = (await execAsync(command));
        if (stderr && !stderr.includes('already exists')) {
            console.log('⚠️  Avertissement:', stderr);
        }
        console.log('✅ Base de données "clinic_db" créée avec succès!');
        console.log('📊 Résultat:', stdout);
        console.log("\n🚀 Vous pouvez maintenant démarrer l'application:");
        console.log('   npm run start:dev');
    }
    catch (error) {
        if (error.stderr && error.stderr.includes('already exists')) {
            console.log('✅ La base de données "clinic_db" existe déjà');
        }
        else {
            console.error('❌ Erreur lors de la création de la base de données:', error.message);
            console.log('\n💡 Solutions alternatives:');
            console.log("1. Vérifiez que PostgreSQL est en cours d'exécution");
            console.log('2. Vérifiez que le mot de passe est bien "12345"');
            console.log('3. Créez manuellement la base de données dans pgAdmin:');
            console.log('   - Ouvrez pgAdmin');
            console.log('   - Connectez-vous avec postgres/12345');
            console.log('   - Clic droit sur Databases > Create > Database');
            console.log('   - Nom: clinic_db');
            console.log('   - Cliquez sur Save');
        }
    }
}
void createDatabase();
//# sourceMappingURL=create-database.js.map
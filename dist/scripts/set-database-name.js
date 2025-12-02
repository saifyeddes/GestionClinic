"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
function setDatabaseName() {
    const envPath = (0, path_1.join)(process.cwd(), '.env');
    try {
        const currentEnv = (0, fs_1.readFileSync)(envPath, 'utf8');
        const updatedEnv = currentEnv.replace(/DB_DATABASE=clinique/g, 'DB_DATABASE=clinic_db');
        (0, fs_1.writeFileSync)(envPath, updatedEnv);
        console.log('✅ Nom de la base de données mis à jour: clinic_db');
        console.log('📋 Configuration appliquée:');
        console.log('   - DB_DATABASE=clinic_db');
        console.log('\n🎯 Prochaines étapes:');
        console.log('1. Assurez-vous que la base de données "clinic_db" existe dans pgAdmin');
        console.log("2. Si elle n'existe pas, créez-la:");
        console.log('   - Ouvrez pgAdmin');
        console.log('   - Connectez-vous avec postgres/12345');
        console.log('   - Clic droit sur Databases > Create > Database');
        console.log('   - Nom: clinic_db');
        console.log('   - Cliquez sur Save');
        console.log("3. Démarrez l'application: npm run start:dev");
    }
    catch (error) {
        console.error('❌ Erreur lors de la mise à jour du nom de la base de données:', error);
    }
}
setDatabaseName();
//# sourceMappingURL=set-database-name.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
function updatePassword() {
    const envPath = (0, path_1.join)(process.cwd(), '.env');
    try {
        const currentEnv = (0, fs_1.readFileSync)(envPath, 'utf8');
        const updatedEnv = currentEnv
            .replace(/DB_PASSWORD=.*/g, 'DB_PASSWORD=12345')
            .replace(/DB_SYNCHRONIZE=.*/g, 'DB_SYNCHRONIZE=true')
            .replace(/DB_LOGGING=.*/g, 'DB_LOGGING=true');
        (0, fs_1.writeFileSync)(envPath, updatedEnv);
        console.log('✅ Mot de passe PostgreSQL mis à jour: 12345');
        console.log('📋 Configuration appliquée:');
        console.log('   - DB_PASSWORD=12345');
        console.log('   - DB_SYNCHRONIZE=true');
        console.log('   - DB_LOGGING=true');
        console.log("\n🚀 Vous pouvez maintenant redémarrer l'application:");
        console.log('   npm run start:dev');
    }
    catch (error) {
        console.error('❌ Erreur lors de la mise à jour du mot de passe:', error);
        console.log('\n💡 Solution manuelle:');
        console.log('1. Ouvrez le fichier .env');
        console.log('2. Remplacez DB_PASSWORD=votre_mot_de_passe_ici par DB_PASSWORD=12345');
        console.log('3. Assurez-vous que DB_SYNCHRONIZE=true');
        console.log('4. Redémarrez: npm run start:dev');
    }
}
updatePassword();
//# sourceMappingURL=update-password.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
function fixEnvPrefix() {
    const envPath = (0, path_1.join)(process.cwd(), '.env');
    try {
        const currentEnv = (0, fs_1.readFileSync)(envPath, 'utf8');
        const newEnv = `# Configuration PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=12345
DB_DATABASE=clinic_db

# Options de développement
DB_SYNCHRONIZE=true
DB_LOGGING=true

# Configuration JWT
JWT_SECRET=supersecret
JWT_EXPIRES_IN=1d

# Port du serveur
PORT=4000

# Autres configurations
NODE_ENV=development
`;
        (0, fs_1.writeFileSync)(envPath + '.backup', currentEnv);
        (0, fs_1.writeFileSync)(envPath, newEnv);
        console.log('✅ Fichier .env corrigé avec les bons préfixes!');
        console.log('📋 Modifications apportées:');
        console.log('   - POSTGRES_HOST → DB_HOST');
        console.log('   - POSTGRES_PORT → DB_PORT');
        console.log('   - POSTGRES_USER → DB_USERNAME');
        console.log('   - POSTGRES_PASSWORD → DB_PASSWORD');
        console.log('   - POSTGRES_DB → DB_DATABASE');
        console.log('   - Ajout de DB_SYNCHRONIZE=true');
        console.log('   - Ajout de DB_LOGGING=true');
        console.log("\n🚀 Vous pouvez maintenant redémarrer l'application:");
        console.log('   npm run start:dev');
    }
    catch (error) {
        console.error('❌ Erreur lors de la correction du fichier .env:', error);
    }
}
fixEnvPrefix();
//# sourceMappingURL=fix-env-prefix.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const postgresConfig = `# Configuration PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=12345
DB_DATABASE=clinic_db

# Options de développement
DB_SYNCHRONIZE=true
DB_LOGGING=true

# Configuration JWT
JWT_SECRET=votre_jwt_secret_ici
JWT_EXPIRES_IN=1d

# Port du serveur
PORT=3000

# Autres configurations
NODE_ENV=development
`;
function fixPostgresConfig() {
    const envPath = (0, path_1.join)(process.cwd(), '.env');
    console.log('🔧 Configuration PostgreSQL pour pgAdmin...');
    if ((0, fs_1.existsSync)(envPath)) {
        const currentEnv = (0, fs_1.readFileSync)(envPath, 'utf8');
        if (currentEnv.includes('type: \'sqlite\'') || currentEnv.includes('database: \'clinic.db\'')) {
            console.log('❌ Le fichier .env contient encore la configuration SQLite');
            console.log('🔄 Mise à jour vers PostgreSQL...');
            (0, fs_1.writeFileSync)(envPath + '.backup', currentEnv);
            (0, fs_1.writeFileSync)(envPath, postgresConfig);
            console.log('✅ Configuration PostgreSQL appliquée');
            console.log('📝 Veuillez modifier les valeurs suivantes dans .env:');
            console.log('   - DB_PASSWORD: votre mot de passe PostgreSQL');
            console.log('   - JWT_SECRET: une clé secrète pour JWT');
            console.log('   - DB_USERNAME: votre utilisateur PostgreSQL (si différent de postgres)');
            console.log('   - DB_DATABASE: nom de votre base de données (si différent de clinic_db)');
        }
        else if (currentEnv.includes('DB_HOST')) {
            console.log('✅ Le fichier .env semble déjà configuré pour PostgreSQL');
            if (!currentEnv.includes('DB_PASSWORD') || currentEnv.includes('votre_mot_de_passe_ici')) {
                console.log('⚠️  Attention: Veuillez configurer votre mot de passe PostgreSQL');
            }
        }
        else {
            console.log('❓ Configuration non reconnue, application de la configuration PostgreSQL par défaut');
            (0, fs_1.writeFileSync)(envPath, postgresConfig);
            console.log('✅ Configuration PostgreSQL appliquée');
        }
    }
    else {
        (0, fs_1.writeFileSync)(envPath, postgresConfig);
        console.log('✅ Fichier .env créé avec configuration PostgreSQL');
    }
    console.log('\n🎯 Étapes suivantes:');
    console.log('1. Modifiez votre fichier .env avec vos vraies informations PostgreSQL');
    console.log('2. Assurez-vous que PostgreSQL est en cours d\'exécution');
    console.log('3. Créez la base de données: CREATE DATABASE clinic_db;');
    console.log('4. Démarrez l\'application: npm run start:dev');
    console.log('5. Vérifiez les tables dans pgAdmin');
    console.log('\n📊 Pour vérifier la connexion:');
    console.log('   npm run check:postgres');
}
fixPostgresConfig();
//# sourceMappingURL=fix-postgres-config.js.map
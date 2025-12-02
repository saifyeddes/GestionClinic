"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
function checkEnvFile() {
    const envPath = (0, path_1.join)(process.cwd(), '.env');
    console.log('🔍 Vérification du fichier .env...');
    if (!(0, fs_1.existsSync)(envPath)) {
        console.log("❌ Le fichier .env n'existe pas");
        console.log('💡 Solution: npm run setup:postgres');
        return;
    }
    try {
        const envContent = (0, fs_1.readFileSync)(envPath, 'utf8');
        console.log('📄 Contenu actuel du fichier .env:');
        console.log('─'.repeat(50));
        console.log(envContent);
        console.log('─'.repeat(50));
        const dbPassword = envContent.match(/DB_PASSWORD=(.+)/);
        const dbHost = envContent.match(/DB_HOST=(.+)/);
        const dbPort = envContent.match(/DB_PORT=(.+)/);
        const dbUsername = envContent.match(/DB_USERNAME=(.+)/);
        const dbDatabase = envContent.match(/DB_DATABASE=(.+)/);
        console.log('\n📊 Variables PostgreSQL détectées:');
        console.log(`   DB_HOST: ${dbHost ? dbHost[1] : 'NON DÉFINI'}`);
        console.log(`   DB_PORT: ${dbPort ? dbPort[1] : 'NON DÉFINI'}`);
        console.log(`   DB_USERNAME: ${dbUsername ? dbUsername[1] : 'NON DÉFINI'}`);
        console.log(`   DB_PASSWORD: ${dbPassword
            ? dbPassword[1].includes('votre_mot_de_passe_ici')
                ? '⚠️  NON CONFIGURÉ'
                : '✅ CONFIGURÉ'
            : 'NON DÉFINI'}`);
        console.log(`   DB_DATABASE: ${dbDatabase ? dbDatabase[1] : 'NON DÉFINI'}`);
        if (dbPassword && dbPassword[1].includes('votre_mot_de_passe_ici')) {
            console.log("\n❌ Problème détecté: Le mot de passe n'est pas configuré!");
            console.log('💡 Solution: npm run update:password');
        }
        else if (dbPassword && dbPassword[1] === '12345') {
            console.log('\n✅ Le mot de passe semble correct (12345)');
            console.log('🔍 Vérification supplémentaire nécessaire...');
        }
        else {
            console.log('\n❓ Le mot de passe est configuré mais différent de 12345');
            console.log('💡 Si le mot de passe PostgreSQL est 12345, exécutez: npm run update:password');
        }
    }
    catch (error) {
        console.error('❌ Erreur lors de la lecture du fichier .env:', error);
    }
}
checkEnvFile();
//# sourceMappingURL=check-env.js.map
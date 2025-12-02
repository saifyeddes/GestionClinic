"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const typeorm_1 = require("typeorm");
async function checkPostgresConnection() {
    let app = null;
    try {
        console.log('🔍 Vérification de la connexion PostgreSQL...');
        const createdApp = await core_1.NestFactory.create(app_module_1.AppModule, { logger: false });
        app = createdApp;
        const dataSource = app.get(typeorm_1.DataSource);
        if (dataSource.isInitialized) {
            console.log('✅ Connexion à PostgreSQL réussie!');
            console.log('📊 Informations de connexion:');
            const options = dataSource.options;
            console.log(`   - Type: ${options.type}`);
            console.log(`   - Host: ${options.host}`);
            console.log(`   - Port: ${options.port}`);
            console.log(`   - Database: ${options.database}`);
            const tables = await dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
            if (tables.length > 0) {
                console.log('📋 Tables trouvées:');
                tables.forEach((table, index) => {
                    console.log(`   ${index + 1}. ${table.table_name}`);
                });
            }
            else {
                console.log('📋 Aucune table trouvée (elles seront créées automatiquement)');
            }
        }
        else {
            console.log("❌ La connexion n'est pas initialisée");
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Erreur de connexion à PostgreSQL:', errorMessage);
        if (errorMessage.includes('ECONNREFUSED')) {
            console.log("💡 Solution: Vérifiez que PostgreSQL est en cours d'exécution");
        }
        else if (errorMessage.includes('password authentication failed')) {
            console.log('💡 Solution: Vérifiez le mot de passe dans votre fichier .env');
        }
        else if (errorMessage.includes('database does not exist')) {
            console.log('💡 Solution: Créez la base de données avec "CREATE DATABASE clinic_db;"');
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
void checkPostgresConnection();
//# sourceMappingURL=check-postgres.js.map
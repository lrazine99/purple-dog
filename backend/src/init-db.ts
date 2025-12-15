import * as path from 'path';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('🔧 Initializing database schema...');

  // Créer une connexion TypeORM directe sans NestJS
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'purple_dog_db',
    entities: [path.join(__dirname, '**', '*.entity.js')],
    dropSchema: true, // Supprimer le schéma existant
    synchronize: true, // Recréer les tables
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');
    
    // Synchroniser le schéma (créer les tables si elles n'existent pas)
    await dataSource.synchronize();
    console.log('✅ Database schema synchronized successfully');
    
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error synchronizing database schema:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

bootstrap();


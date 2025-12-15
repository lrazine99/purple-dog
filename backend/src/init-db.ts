import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🔧 Initializing database schema...');

  try {
    // Synchroniser le schéma (créer les tables si elles n'existent pas)
    await dataSource.synchronize();
    console.log('✅ Database schema synchronized successfully');
  } catch (error) {
    console.error('❌ Error synchronizing database schema:', error);
    throw error;
  } finally {
    await app.close();
  }
}

bootstrap();


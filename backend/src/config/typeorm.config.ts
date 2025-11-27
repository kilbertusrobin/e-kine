import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Session } from '../sessions/entities/session.entity';
import { Profile } from '../profiles/entities/profile.entity';

/**
 * Configuration TypeORM pour PostgreSQL
 * Utilise les variables d'environnement définies dans .env
 */
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'kine_user',
  password: process.env.DATABASE_PASSWORD || 'kine_password',
  database: process.env.DATABASE_NAME || 'kine_booking',
  entities: [User, Session, Profile],
  synchronize: process.env.NODE_ENV !== 'production', // ⚠️ Ne pas utiliser en production
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

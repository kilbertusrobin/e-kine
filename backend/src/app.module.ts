import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './routes/users/users.module';
import { AuthModule } from './routes/auth/auth.module';
import { SessionsModule } from './routes/sessions/sessions.module';
import { ProfilesModule } from './routes/profiles/profiles.module';

/**
 * Module principal de l'application
 * Configure TypeORM, les variables d'environnement et importe tous les modules métier
 */
@Module({
  imports: [
    // Configuration des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true, // Rend les variables d'environnement disponibles partout
      envFilePath: '.env',
    }),

    // Configuration de TypeORM pour PostgreSQL
    TypeOrmModule.forRoot(typeOrmConfig),

    // Modules métier
    UsersModule,
    SessionsModule,
    AuthModule,
    ProfilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

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
import { PrescriptionsModule } from './routes/prescriptions/prescriptions.module';
import { CareTypesModule } from './routes/care-types/care-types.module';
import { AppointmentsModule } from './routes/appointments/appointments.module';
import { SchedulerModule } from './routes/scheduler/scheduler.module';
import { FixturesModule } from './fixtures/fixtures.module';

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
    PrescriptionsModule,
    CareTypesModule,
    AppointmentsModule,
    SchedulerModule,

    // Fixtures (seed automatique au démarrage)
    FixturesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy, JwtStrategy } from './strategies';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { SessionsModule } from '../sessions/sessions.module';

/**
 * Module d'authentification
 * Configure Google OAuth et JWT pour l'authentification
 */
@Module({
  imports: [
    // Passport pour les stratégies d'authentification
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT avec configuration dynamique
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '1h';
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
    }),

    // TypeORM pour accéder aux entités User et Profile
    TypeOrmModule.forFeature([User, Profile]),

    // Module Sessions pour gérer les refresh tokens
    SessionsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy,
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}

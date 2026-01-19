import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { SessionsService } from '../sessions/sessions.service';
import { AuthResponseDto } from './dtos';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../users/dtos';
import { isPractitionerEmail } from '../../config/practitioner-whitelist.config';

/**
 * Service d'authentification
 * Gère l'inscription, la connexion, et les tokens JWT
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Gère le callback Google OAuth (inscription + connexion)
   * Le rôle est déterminé automatiquement selon la whitelist d'emails
   * @param googleProfile Profil Google de l'utilisateur
   * @param deviceInfo Informations sur le device
   * @param ipAddress Adresse IP
   */
  async handleGoogleAuth(
    googleProfile: {
      sub: string;
      email: string;
      picture?: string;
    },
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    // Cherche l'utilisateur par Google ID avec son profil
    let user = await this.userRepository.findOne({
      where: { googleId: googleProfile.sub },
      relations: ['profile'],
    });

    if (!user) {
      // Vérifie si l'email existe déjà avec un autre compte
      const existingEmail = await this.userRepository.findOne({
        where: { email: googleProfile.email },
      });

      if (existingEmail) {
        throw new BadRequestException(
          `L'email ${googleProfile.email} est déjà utilisé par un autre compte.`,
        );
      }

      // Crée un nouvel utilisateur avec le rôle déterminé par la whitelist
      user = await this.register(googleProfile);
    }

    // Vérifie que l'utilisateur peut se connecter
    if (!user.canLogin()) {
      throw new ForbiddenException('Votre compte a été désactivé.');
    }

    // Met à jour la dernière connexion
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // Génère les tokens
    return this.generateTokens(user, deviceInfo, ipAddress);
  }

  /**
   * Inscrit un nouvel utilisateur
   * Le rôle est déterminé automatiquement selon la whitelist
   * Crée également un profil vide lié à l'utilisateur
   */
  private async register(
    googleProfile: {
      sub: string;
      email: string;
      picture?: string;
    },
  ): Promise<User> {
    // Détermine le rôle selon la whitelist
    const role = isPractitionerEmail(googleProfile.email)
      ? UserRole.PRACTITIONER
      : UserRole.PATIENT;

    const user = this.userRepository.create({
      email: googleProfile.email,
      googleId: googleProfile.sub,
      googlePicture: googleProfile.picture,
      role,
      isActive: true,
      emailVerified: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Crée un profil lié à l'utilisateur
    // Pour les praticiens, pré-remplit address, city et pc avec "-"
    const profileData: any = {
      userId: savedUser.id,
    };

    if (role === UserRole.PRACTITIONER) {
      profileData.address = '-';
      profileData.city = '-';
      profileData.pc = '-';
    }

    const profile = this.profileRepository.create(profileData);
    await this.profileRepository.save(profile);

    return savedUser;
  }

  /**
   * Génère les tokens JWT et refresh token
   */
  private async generateTokens(
    user: User,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Génère access token JWT
    const accessToken = this.jwtService.sign(payload);

    // Crée une session avec refresh token
    const session = await this.sessionsService.create(
      user.id,
      deviceInfo,
      ipAddress,
    );

    // Transforme l'utilisateur en DTO
    const userDto = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      accessToken,
      refreshToken: session.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1h en secondes
      user: userDto,
    };
  }

  /**
   * Rafraîchit l'access token avec un refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthResponseDto> {
    const session = await this.sessionsService.findByRefreshToken(refreshToken);

    if (!session) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    if (session.isExpired()) {
      await this.sessionsService.delete(refreshToken);
      throw new UnauthorizedException('Refresh token expiré');
    }

    const user = await this.userRepository.findOne({
      where: { id: session.userId },
      relations: ['profile'],
    });

    if (!user || !user.canLogin()) {
      throw new UnauthorizedException('Utilisateur non autorisé');
    }

    // Génère un nouveau refresh token
    const newSession = await this.sessionsService.refresh(refreshToken);

    if (!newSession) {
      throw new UnauthorizedException('Impossible de renouveler la session');
    }

    // Génère un nouveau access token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const userDto = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      accessToken,
      refreshToken: newSession.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: userDto,
    };
  }

  /**
   * Déconnecte l'utilisateur (supprime la session)
   */
  async logout(refreshToken: string): Promise<void> {
    await this.sessionsService.delete(refreshToken);
  }

  /**
   * Déconnecte l'utilisateur de toutes ses sessions
   */
  async logoutAll(userId: string): Promise<void> {
    await this.sessionsService.deleteAllByUserId(userId);
  }
}

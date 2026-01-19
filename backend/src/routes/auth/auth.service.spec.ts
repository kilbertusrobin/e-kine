import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import {
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { SessionsService } from '../sessions/sessions.service';

/**
 * Tests unitaires pour AuthService
 *
 * Types de tests :
 * - OUTPUT BASED : génération de tokens, transformation DTO
 * - STATE BASED : création d'utilisateur, mise à jour lastLoginAt
 * - COMMUNICATION BASED : appels au SessionsService, JwtService
 */
describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let profileRepository: jest.Mocked<Repository<Profile>>;
  let jwtService: jest.Mocked<JwtService>;
  let sessionsService: jest.Mocked<SessionsService>;

  // Mock data
  const mockUser: Partial<User> = {
    id: 'user-uuid',
    email: 'patient@test.com',
    googleId: 'google-123',
    role: UserRole.PATIENT,
    isActive: true,
    emailVerified: true,
    canLogin: jest.fn().mockReturnValue(true),
  };

  const mockPractitioner: Partial<User> = {
    id: 'practitioner-uuid',
    email: 'practitioner@e-kine.fr',
    googleId: 'google-456',
    role: UserRole.PRACTITIONER,
    isActive: true,
    emailVerified: true,
    canLogin: jest.fn().mockReturnValue(true),
  };

  const mockDisabledUser: Partial<User> = {
    ...mockUser,
    id: 'disabled-uuid',
    isActive: false,
    canLogin: jest.fn().mockReturnValue(false),
  };

  const mockSession = {
    id: 'session-uuid',
    userId: 'user-uuid',
    refreshToken: 'refresh-token-123',
    isExpired: jest.fn().mockReturnValue(false),
  };

  const mockGoogleProfile = {
    sub: 'google-123',
    email: 'patient@test.com',
    picture: 'https://example.com/photo.jpg',
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const mockProfileRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('access-token-123'),
    };

    const mockSessionsService = {
      create: jest.fn(),
      findByRefreshToken: jest.fn(),
      refresh: jest.fn(),
      delete: jest.fn(),
      deleteAllByUserId: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Profile), useValue: mockProfileRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: SessionsService, useValue: mockSessionsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    profileRepository = module.get(getRepositoryToken(Profile));
    jwtService = module.get(JwtService);
    sessionsService = module.get(SessionsService);
  });

  // ============================================================
  // COMMUNICATION BASED TESTS - Authentification Google
  // ============================================================
  describe('Authentification Google (Communication Based)', () => {
    describe('handleGoogleAuth', () => {
      it('devrait connecter un utilisateur existant', async () => {
        // Arrange
        userRepository.findOne.mockResolvedValue(mockUser as User);
        sessionsService.create.mockResolvedValue(mockSession as any);

        // Act
        const result = await service.handleGoogleAuth(mockGoogleProfile);

        // Assert
        expect(result.accessToken).toBe('access-token-123');
        expect(result.refreshToken).toBe('refresh-token-123');
        expect(userRepository.update).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({ lastLoginAt: expect.any(Date) }),
        );
      });

      it('devrait créer un nouvel utilisateur si non existant', async () => {
        // Arrange
        userRepository.findOne
          .mockResolvedValueOnce(null) // Pas de user avec ce googleId
          .mockResolvedValueOnce(null); // Pas de user avec cet email
        userRepository.create.mockReturnValue(mockUser as User);
        userRepository.save.mockResolvedValue(mockUser as User);
        profileRepository.create.mockReturnValue({} as Profile);
        profileRepository.save.mockResolvedValue({} as Profile);
        sessionsService.create.mockResolvedValue(mockSession as any);

        // Act
        const result = await service.handleGoogleAuth(mockGoogleProfile);

        // Assert
        expect(userRepository.create).toHaveBeenCalled();
        expect(profileRepository.create).toHaveBeenCalled();
        expect(result.accessToken).toBeDefined();
      });

      it('devrait rejeter si l\'email est déjà utilisé par un autre compte', async () => {
        // Arrange
        userRepository.findOne
          .mockResolvedValueOnce(null) // Pas de user avec ce googleId
          .mockResolvedValueOnce(mockUser as User); // Email déjà utilisé

        // Act & Assert
        await expect(
          service.handleGoogleAuth(mockGoogleProfile),
        ).rejects.toThrow(BadRequestException);
      });

      it('devrait rejeter si le compte est désactivé', async () => {
        // Arrange
        userRepository.findOne.mockResolvedValue(mockDisabledUser as User);

        // Act & Assert
        await expect(
          service.handleGoogleAuth(mockGoogleProfile),
        ).rejects.toThrow(ForbiddenException);
      });

      it('devrait appeler sessionsService.create avec les infos du device', async () => {
        // Arrange
        const deviceInfo = 'Mozilla/5.0';
        const ipAddress = '192.168.1.1';
        userRepository.findOne.mockResolvedValue(mockUser as User);
        sessionsService.create.mockResolvedValue(mockSession as any);

        // Act
        await service.handleGoogleAuth(mockGoogleProfile, deviceInfo, ipAddress);

        // Assert
        expect(sessionsService.create).toHaveBeenCalledWith(
          mockUser.id,
          deviceInfo,
          ipAddress,
        );
      });
    });
  });

  // ============================================================
  // OUTPUT BASED TESTS - Tokens JWT
  // ============================================================
  describe('Génération de tokens (Output Based)', () => {
    describe('handleGoogleAuth', () => {
      it('devrait retourner un AuthResponseDto complet', async () => {
        // Arrange
        userRepository.findOne.mockResolvedValue(mockUser as User);
        sessionsService.create.mockResolvedValue(mockSession as any);

        // Act
        const result = await service.handleGoogleAuth(mockGoogleProfile);

        // Assert
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
        expect(result).toHaveProperty('tokenType', 'Bearer');
        expect(result).toHaveProperty('expiresIn', 3600);
        expect(result).toHaveProperty('user');
      });

      it('devrait appeler jwtService.sign avec le bon payload', async () => {
        // Arrange
        userRepository.findOne.mockResolvedValue(mockUser as User);
        sessionsService.create.mockResolvedValue(mockSession as any);

        // Act
        await service.handleGoogleAuth(mockGoogleProfile);

        // Assert
        expect(jwtService.sign).toHaveBeenCalledWith({
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        });
      });
    });
  });

  // ============================================================
  // COMMUNICATION BASED TESTS - Refresh Token
  // ============================================================
  describe('Rafraîchissement de token (Communication Based)', () => {
    describe('refreshAccessToken', () => {
      it('devrait rafraîchir le token avec un refresh token valide', async () => {
        // Arrange
        sessionsService.findByRefreshToken.mockResolvedValue(mockSession as any);
        userRepository.findOne.mockResolvedValue(mockUser as User);
        sessionsService.refresh.mockResolvedValue({
          ...mockSession,
          refreshToken: 'new-refresh-token',
        } as any);

        // Act
        const result = await service.refreshAccessToken('refresh-token-123');

        // Assert
        expect(result.accessToken).toBe('access-token-123');
        expect(result.refreshToken).toBe('new-refresh-token');
      });

      it('devrait rejeter si le refresh token est invalide', async () => {
        // Arrange
        sessionsService.findByRefreshToken.mockResolvedValue(null);

        // Act & Assert
        await expect(
          service.refreshAccessToken('invalid-token'),
        ).rejects.toThrow(UnauthorizedException);
      });

      it('devrait rejeter et supprimer si le refresh token est expiré', async () => {
        // Arrange
        const expiredSession = {
          ...mockSession,
          isExpired: jest.fn().mockReturnValue(true),
        };
        sessionsService.findByRefreshToken.mockResolvedValue(expiredSession as any);

        // Act & Assert
        await expect(
          service.refreshAccessToken('expired-token'),
        ).rejects.toThrow(UnauthorizedException);
        expect(sessionsService.delete).toHaveBeenCalledWith('expired-token');
      });

      it('devrait rejeter si l\'utilisateur ne peut plus se connecter', async () => {
        // Arrange
        sessionsService.findByRefreshToken.mockResolvedValue(mockSession as any);
        userRepository.findOne.mockResolvedValue(mockDisabledUser as User);

        // Act & Assert
        await expect(
          service.refreshAccessToken('refresh-token-123'),
        ).rejects.toThrow(UnauthorizedException);
      });

      it('devrait rejeter si le renouvellement de session échoue', async () => {
        // Arrange
        sessionsService.findByRefreshToken.mockResolvedValue(mockSession as any);
        userRepository.findOne.mockResolvedValue(mockUser as User);
        sessionsService.refresh.mockResolvedValue(null);

        // Act & Assert
        await expect(
          service.refreshAccessToken('refresh-token-123'),
        ).rejects.toThrow(UnauthorizedException);
      });
    });
  });

  // ============================================================
  // COMMUNICATION BASED TESTS - Déconnexion
  // ============================================================
  describe('Déconnexion (Communication Based)', () => {
    describe('logout', () => {
      it('devrait appeler sessionsService.delete', async () => {
        // Arrange
        sessionsService.delete.mockResolvedValue(undefined);

        // Act
        await service.logout('refresh-token-123');

        // Assert
        expect(sessionsService.delete).toHaveBeenCalledWith('refresh-token-123');
      });
    });

    describe('logoutAll', () => {
      it('devrait appeler sessionsService.deleteAllByUserId', async () => {
        // Arrange
        sessionsService.deleteAllByUserId.mockResolvedValue(undefined);

        // Act
        await service.logoutAll('user-uuid');

        // Assert
        expect(sessionsService.deleteAllByUserId).toHaveBeenCalledWith('user-uuid');
      });
    });
  });
});

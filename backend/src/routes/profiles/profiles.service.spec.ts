import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { Profile } from './entities/profile.entity';

/**
 * Tests unitaires pour ProfilesService
 *
 * Types de tests :
 * - OUTPUT BASED : récupération de profils
 * - STATE BASED : création, modification, suppression de profils
 * - COMMUNICATION BASED : N/A (pas d'effets de bord externes)
 */
describe('ProfilesService', () => {
  let service: ProfilesService;
  let profileRepository: jest.Mocked<Repository<Profile>>;

  // Mock data
  const mockProfile: Partial<Profile> = {
    id: 'profile-uuid',
    userId: 'user-uuid',
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: '0612345678',
    address: '123 Rue de Paris',
    city: 'Paris',
    pc: '75001',
  };

  const mockCreateDto = {
    userId: 'user-uuid',
    firstName: 'Jean',
    lastName: 'Dupont',
  };

  const mockUpdateDto = {
    firstName: 'Pierre',
    lastName: 'Martin',
    phone: '0698765432',
  };

  beforeEach(async () => {
    const mockProfileRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        { provide: getRepositoryToken(Profile), useValue: mockProfileRepository },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    profileRepository = module.get(getRepositoryToken(Profile));
  });

  // ============================================================
  // STATE BASED TESTS - Création de profils
  // ============================================================
  describe('Création de profils (State Based)', () => {
    describe('create', () => {
      it('devrait créer un nouveau profil', async () => {
        // Arrange
        profileRepository.create.mockReturnValue(mockProfile as Profile);
        profileRepository.save.mockResolvedValue(mockProfile as Profile);

        // Act
        const result = await service.create(mockCreateDto as any);

        // Assert
        expect(result).toEqual(mockProfile);
        expect(profileRepository.create).toHaveBeenCalledWith(mockCreateDto);
        expect(profileRepository.save).toHaveBeenCalled();
      });
    });
  });

  // ============================================================
  // OUTPUT BASED TESTS - Récupération de profils
  // ============================================================
  describe('Récupération de profils (Output Based)', () => {
    describe('findById', () => {
      it('devrait retourner le profil correspondant à l\'ID', async () => {
        // Arrange
        profileRepository.findOne.mockResolvedValue(mockProfile as Profile);

        // Act
        const result = await service.findById('profile-uuid');

        // Assert
        expect(result).toEqual(mockProfile);
        expect(profileRepository.findOne).toHaveBeenCalledWith({
          where: { id: 'profile-uuid' },
          relations: ['user'],
        });
      });

      it('devrait retourner null si le profil n\'existe pas', async () => {
        // Arrange
        profileRepository.findOne.mockResolvedValue(null);

        // Act
        const result = await service.findById('unknown-uuid');

        // Assert
        expect(result).toBeNull();
      });
    });

    describe('findByUserId', () => {
      it('devrait retourner le profil de l\'utilisateur', async () => {
        // Arrange
        profileRepository.findOne.mockResolvedValue(mockProfile as Profile);

        // Act
        const result = await service.findByUserId('user-uuid');

        // Assert
        expect(result).toEqual(mockProfile);
        expect(profileRepository.findOne).toHaveBeenCalledWith({
          where: { userId: 'user-uuid' },
          relations: ['user'],
        });
      });

      it('devrait retourner null si l\'utilisateur n\'a pas de profil', async () => {
        // Arrange
        profileRepository.findOne.mockResolvedValue(null);

        // Act
        const result = await service.findByUserId('unknown-user');

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  // ============================================================
  // STATE BASED TESTS - Modification de profils
  // ============================================================
  describe('Modification de profils (State Based)', () => {
    describe('update', () => {
      it('devrait mettre à jour le profil', async () => {
        // Arrange
        const updatedProfile = { ...mockProfile, ...mockUpdateDto };
        profileRepository.findOne
          .mockResolvedValueOnce(mockProfile as Profile) // Premier appel: findById initial
          .mockResolvedValueOnce(updatedProfile as Profile); // Deuxième appel: findById après update
        profileRepository.update.mockResolvedValue({ affected: 1 } as any);

        // Act
        const result = await service.update('profile-uuid', mockUpdateDto as any);

        // Assert
        expect(result.firstName).toBe('Pierre');
        expect(profileRepository.update).toHaveBeenCalledWith(
          'profile-uuid',
          mockUpdateDto,
        );
      });

      it('devrait lever une erreur si le profil n\'existe pas', async () => {
        // Arrange
        profileRepository.findOne.mockResolvedValue(null);

        // Act & Assert
        await expect(
          service.update('unknown-uuid', mockUpdateDto as any),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('updateByUserId', () => {
      it('devrait mettre à jour le profil par userId', async () => {
        // Arrange
        const updatedProfile = { ...mockProfile, ...mockUpdateDto };
        profileRepository.findOne
          .mockResolvedValueOnce(mockProfile as Profile) // findByUserId
          .mockResolvedValueOnce(updatedProfile as Profile); // findById après update
        profileRepository.update.mockResolvedValue({ affected: 1 } as any);

        // Act
        const result = await service.updateByUserId('user-uuid', mockUpdateDto as any);

        // Assert
        expect(result.firstName).toBe('Pierre');
      });

      it('devrait lever une erreur si le profil de l\'utilisateur n\'existe pas', async () => {
        // Arrange
        profileRepository.findOne.mockResolvedValue(null);

        // Act & Assert
        await expect(
          service.updateByUserId('unknown-user', mockUpdateDto as any),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  // ============================================================
  // STATE BASED TESTS - Suppression de profils
  // ============================================================
  describe('Suppression de profils (State Based)', () => {
    describe('delete', () => {
      it('devrait supprimer le profil', async () => {
        // Arrange
        profileRepository.delete.mockResolvedValue({ affected: 1 } as any);

        // Act
        await service.delete('profile-uuid');

        // Assert
        expect(profileRepository.delete).toHaveBeenCalledWith('profile-uuid');
      });
    });

    describe('deleteByUserId', () => {
      it('devrait supprimer le profil par userId si existant', async () => {
        // Arrange
        profileRepository.findOne.mockResolvedValue(mockProfile as Profile);
        profileRepository.delete.mockResolvedValue({ affected: 1 } as any);

        // Act
        await service.deleteByUserId('user-uuid');

        // Assert
        expect(profileRepository.delete).toHaveBeenCalledWith('profile-uuid');
      });

      it('ne devrait rien faire si le profil n\'existe pas', async () => {
        // Arrange
        profileRepository.findOne.mockResolvedValue(null);

        // Act
        await service.deleteByUserId('unknown-user');

        // Assert
        expect(profileRepository.delete).not.toHaveBeenCalled();
      });
    });
  });
});

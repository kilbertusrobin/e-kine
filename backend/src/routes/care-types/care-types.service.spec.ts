import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CareTypesService } from './care-types.service';
import { CareType } from './entities/care-type.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';

/**
 * Tests unitaires pour CareTypesService
 *
 * Types de tests :
 * - OUTPUT BASED : récupération des types de soins
 * - STATE BASED : association user <-> care types
 * - COMMUNICATION BASED : N/A (pas d'effets de bord externes)
 */
describe('CareTypesService', () => {
  let service: CareTypesService;
  let careTypeRepository: jest.Mocked<Repository<CareType>>;
  let userRepository: jest.Mocked<Repository<User>>;

  // Mock data
  const mockCareTypes: Partial<CareType>[] = [
    { id: 'care-type-1', label: 'Kinésithérapie' },
    { id: 'care-type-2', label: 'Massage' },
    { id: 'care-type-3', label: 'Ostéopathie' },
  ];

  const mockPractitioner: Partial<User> = {
    id: 'practitioner-uuid',
    email: 'practitioner@test.com',
    role: UserRole.PRACTITIONER,
    careTypes: [],
  };

  const mockPatient: Partial<User> = {
    id: 'patient-uuid',
    email: 'patient@test.com',
    role: UserRole.PATIENT,
    careTypes: [],
  };

  beforeEach(async () => {
    // Arrange : Configuration des mocks
    const mockCareTypeRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CareTypesService,
        { provide: getRepositoryToken(CareType), useValue: mockCareTypeRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<CareTypesService>(CareTypesService);
    careTypeRepository = module.get(getRepositoryToken(CareType));
    userRepository = module.get(getRepositoryToken(User));
  });

  // ============================================================
  // OUTPUT BASED TESTS - Récupération des données
  // ============================================================
  describe('Récupération des types de soins (Output Based)', () => {
    describe('findAll', () => {
      it('devrait retourner tous les types de soins triés par label', async () => {
        // Arrange
        careTypeRepository.find.mockResolvedValue(mockCareTypes as CareType[]);

        // Act
        const result = await service.findAll();

        // Assert
        expect(result).toEqual(mockCareTypes);
        expect(careTypeRepository.find).toHaveBeenCalledWith({
          order: { label: 'ASC' },
        });
      });

      it('devrait retourner un tableau vide si aucun type de soin', async () => {
        // Arrange
        careTypeRepository.find.mockResolvedValue([]);

        // Act
        const result = await service.findAll();

        // Assert
        expect(result).toEqual([]);
      });
    });

    describe('findById', () => {
      it('devrait retourner le type de soin correspondant à l\'ID', async () => {
        // Arrange
        careTypeRepository.findOne.mockResolvedValue(mockCareTypes[0] as CareType);

        // Act
        const result = await service.findById('care-type-1');

        // Assert
        expect(result).toEqual(mockCareTypes[0]);
      });

      it('devrait retourner null si le type de soin n\'existe pas', async () => {
        // Arrange
        careTypeRepository.findOne.mockResolvedValue(null);

        // Act
        const result = await service.findById('unknown-id');

        // Assert
        expect(result).toBeNull();
      });
    });

    describe('findByUserId', () => {
      it('devrait retourner les types de soins du praticien', async () => {
        // Arrange
        const practitionerWithCareTypes = {
          ...mockPractitioner,
          careTypes: mockCareTypes,
        };
        userRepository.findOne.mockResolvedValue(practitionerWithCareTypes as User);

        // Act
        const result = await service.findByUserId('practitioner-uuid');

        // Assert
        expect(result).toEqual(mockCareTypes);
      });

      it('devrait retourner un tableau vide si le praticien n\'a pas de types de soins', async () => {
        // Arrange
        userRepository.findOne.mockResolvedValue(mockPractitioner as User);

        // Act
        const result = await service.findByUserId('practitioner-uuid');

        // Assert
        expect(result).toEqual([]);
      });

      it('devrait lever une erreur si l\'utilisateur n\'existe pas', async () => {
        // Arrange
        userRepository.findOne.mockResolvedValue(null);

        // Act & Assert
        await expect(service.findByUserId('unknown-uuid')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  // ============================================================
  // STATE BASED TESTS - Modification des associations
  // ============================================================
  describe('Association des types de soins (State Based)', () => {
    describe('updateUserCareTypes', () => {
      it('devrait associer les types de soins au praticien', async () => {
        // Arrange
        const careTypeIds = ['care-type-1', 'care-type-2'];
        userRepository.findOne.mockResolvedValue({
          ...mockPractitioner,
          careTypes: [],
        } as User);
        careTypeRepository.find.mockResolvedValue([
          mockCareTypes[0],
          mockCareTypes[1],
        ] as CareType[]);
        userRepository.save.mockResolvedValue({
          ...mockPractitioner,
          careTypes: [mockCareTypes[0], mockCareTypes[1]],
        } as User);

        // Act
        const result = await service.updateUserCareTypes('practitioner-uuid', careTypeIds);

        // Assert
        expect(result).toHaveLength(2);
        expect(userRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            careTypes: expect.arrayContaining([
              expect.objectContaining({ id: 'care-type-1' }),
              expect.objectContaining({ id: 'care-type-2' }),
            ]),
          }),
        );
      });

      it('devrait supprimer tous les types de soins si tableau vide', async () => {
        // Arrange
        userRepository.findOne.mockResolvedValue({
          ...mockPractitioner,
          careTypes: mockCareTypes,
        } as User);
        userRepository.save.mockResolvedValue({
          ...mockPractitioner,
          careTypes: [],
        } as User);

        // Act
        const result = await service.updateUserCareTypes('practitioner-uuid', []);

        // Assert
        expect(result).toEqual([]);
        expect(userRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            careTypes: [],
          }),
        );
      });

      it('devrait rejeter si l\'utilisateur n\'est pas un praticien', async () => {
        // Arrange
        userRepository.findOne.mockResolvedValue(mockPatient as User);

        // Act & Assert
        await expect(
          service.updateUserCareTypes('patient-uuid', ['care-type-1']),
        ).rejects.toThrow(ForbiddenException);
      });

      it('devrait rejeter si un type de soin n\'existe pas', async () => {
        // Arrange
        userRepository.findOne.mockResolvedValue(mockPractitioner as User);
        careTypeRepository.find.mockResolvedValue([mockCareTypes[0]] as CareType[]); // Seulement 1 sur 2

        // Act & Assert
        await expect(
          service.updateUserCareTypes('practitioner-uuid', ['care-type-1', 'unknown-id']),
        ).rejects.toThrow(NotFoundException);
      });

      it('devrait rejeter si l\'utilisateur n\'existe pas', async () => {
        // Arrange
        userRepository.findOne.mockResolvedValue(null);

        // Act & Assert
        await expect(
          service.updateUserCareTypes('unknown-uuid', ['care-type-1']),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  // ============================================================
  // TESTS DE REMPLACEMENT COMPLET
  // ============================================================
  describe('Remplacement des types de soins (State Based)', () => {
    it('devrait remplacer entièrement les types de soins existants', async () => {
      // Arrange
      const existingCareTypes = [mockCareTypes[0], mockCareTypes[1]];
      const newCareTypeIds = ['care-type-3'];

      userRepository.findOne.mockResolvedValue({
        ...mockPractitioner,
        careTypes: existingCareTypes,
      } as User);
      careTypeRepository.find.mockResolvedValue([mockCareTypes[2]] as CareType[]);
      userRepository.save.mockResolvedValue({
        ...mockPractitioner,
        careTypes: [mockCareTypes[2]],
      } as User);

      // Act
      const result = await service.updateUserCareTypes('practitioner-uuid', newCareTypeIds);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCareTypes[2]);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { MailService } from '../mail/mail.service';
import { UserRole } from '../users/enums/user-role.enum';

/**
 * Tests unitaires pour AppointmentsService
 *
 * Types de tests :
 * - OUTPUT BASED : validation des créneaux, génération des slots
 * - STATE BASED : création, modification, annulation de RDV
 * - COMMUNICATION BASED : envoi d'emails
 */
describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let appointmentRepository: jest.Mocked<Repository<Appointment>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let profileRepository: jest.Mocked<Repository<Profile>>;
  let mailService: jest.Mocked<MailService>;

  // Mock data
  const mockPractitioner: Partial<User> = {
    id: 'practitioner-uuid',
    email: 'practitioner@test.com',
    role: UserRole.PRACTITIONER,
    isActive: true,
  };

  const mockPatient: Partial<User> = {
    id: 'patient-uuid',
    email: 'patient@test.com',
    role: UserRole.PATIENT,
    isActive: true,
  };

  // Dates futures pour les tests (Décembre 2026)
  // 2026-12-14 = Lundi, 2026-12-12 = Samedi
  const futureMonday = '2026-12-14';
  const futureSaturday = '2026-12-12';

  const mockAppointment: Partial<Appointment> = {
    id: 'appointment-uuid',
    practitionerId: 'practitioner-uuid',
    patientId: 'patient-uuid',
    dateTime: new Date(`${futureMonday}T09:00:00.000Z`),
    status: AppointmentStatus.CONFIRMED,
    careTypeId: null,
    notes: null,
  };

  beforeEach(async () => {
    // Arrange : Configuration des mocks
    const mockAppointmentRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
      })),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const mockProfileRepository = {
      findOne: jest.fn(),
    };

    const mockMailService = {
      sendAppointmentCreated: jest.fn(),
      sendNewAppointmentToPractitioner: jest.fn(),
      sendAppointmentCancelled: jest.fn(),
      sendAppointmentReminder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockAppointmentRepository,
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    appointmentRepository = module.get(getRepositoryToken(Appointment));
    userRepository = module.get(getRepositoryToken(User));
    profileRepository = module.get(getRepositoryToken(Profile));
    mailService = module.get(MailService);
  });

  // ============================================================
  // OUTPUT BASED TESTS - Validation des créneaux
  // ============================================================
  describe('Validation des créneaux (Output Based)', () => {
    describe('getAvailableSlots', () => {
      it('devrait retourner une liste vide pour un weekend', async () => {
        // Arrange
        userRepository.findOne.mockResolvedValue(mockPractitioner as User);

        // Act
        const result = await service.getAvailableSlots(
          'practitioner-uuid',
          futureSaturday,
        );

        // Assert
        expect(result.availableSlots).toEqual([]);
        expect(result.allSlots).toEqual([]);
      });

      it('devrait retourner 14 créneaux pour un jour ouvré sans RDV', async () => {
        // Arrange
        userRepository.findOne.mockResolvedValue(mockPractitioner as User);

        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([]),
        };
        appointmentRepository.createQueryBuilder.mockReturnValue(
          mockQueryBuilder as any,
        );

        // Act
        const result = await service.getAvailableSlots(
          'practitioner-uuid',
          futureMonday,
        );

        // Assert
        // 9h-13h = 8 créneaux (9h, 9h30, 10h, 10h30, 11h, 11h30, 12h, 12h30)
        // 14h-17h = 6 créneaux (14h, 14h30, 15h, 15h30, 16h, 16h30)
        expect(result.allSlots.length).toBe(14);
      });

      it("devrait lever une erreur si le praticien n'existe pas", async () => {
        // Arrange
        userRepository.findOne.mockResolvedValue(null);

        // Act & Assert
        await expect(
          service.getAvailableSlots('unknown-uuid', futureMonday),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  // ============================================================
  // STATE BASED TESTS - Création et modification de RDV
  // ============================================================
  describe('Création de rendez-vous (State Based)', () => {
    describe('create', () => {
      it('devrait créer un RDV avec le statut CONFIRMED', async () => {
        // Arrange
        const createDto = {
          practitionerId: 'practitioner-uuid',
          dateTime: `${futureMonday}T09:00:00.000Z`,
        };

        userRepository.findOne
          .mockResolvedValueOnce(mockPractitioner as User) // Praticien
          .mockResolvedValueOnce(mockPatient as User); // Patient

        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null), // Pas de conflit
        };
        appointmentRepository.createQueryBuilder.mockReturnValue(
          mockQueryBuilder as any,
        );

        appointmentRepository.create.mockReturnValue(
          mockAppointment as Appointment,
        );
        appointmentRepository.save.mockResolvedValue(
          mockAppointment as Appointment,
        );
        appointmentRepository.findOne.mockResolvedValue({
          ...mockAppointment,
          practitioner: mockPractitioner,
          patient: mockPatient,
        } as Appointment);

        profileRepository.findOne.mockResolvedValue({
          firstName: 'John',
          lastName: 'Doe',
        } as Profile);

        // Act
        const result = await service.create(createDto, 'patient-uuid');

        // Assert
        expect(result.status).toBe(AppointmentStatus.CONFIRMED);
        expect(appointmentRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            status: AppointmentStatus.CONFIRMED,
          }),
        );
      });

      it('devrait rejeter un créneau le weekend', async () => {
        // Arrange
        const createDto = {
          practitionerId: 'practitioner-uuid',
          dateTime: `${futureSaturday}T09:00:00.000Z`, // Samedi
        };

        // Act & Assert
        await expect(service.create(createDto, 'patient-uuid')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('devrait rejeter un créneau à 9h45 (pas multiple de 30 min)', async () => {
        // Arrange
        const createDto = {
          practitionerId: 'practitioner-uuid',
          dateTime: `${futureMonday}T09:45:00.000Z`,
        };

        // Act & Assert
        await expect(service.create(createDto, 'patient-uuid')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('devrait rejeter un créneau en dehors des horaires (avant 9h)', async () => {
        // Arrange - 07:00 UTC est toujours avant 9h dans les fuseaux horaires européens
        const createDto = {
          practitionerId: 'practitioner-uuid',
          dateTime: `${futureMonday}T07:00:00.000Z`,
        };

        // Act & Assert
        await expect(service.create(createDto, 'patient-uuid')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('devrait rejeter un créneau déjà réservé', async () => {
        // Arrange
        const createDto = {
          practitionerId: 'practitioner-uuid',
          dateTime: `${futureMonday}T09:00:00.000Z`,
        };

        userRepository.findOne
          .mockResolvedValueOnce(mockPractitioner as User)
          .mockResolvedValueOnce(mockPatient as User);

        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(mockAppointment), // Conflit !
        };
        appointmentRepository.createQueryBuilder.mockReturnValue(
          mockQueryBuilder as any,
        );

        // Act & Assert
        await expect(service.create(createDto, 'patient-uuid')).rejects.toThrow(
          ConflictException,
        );
      });
    });
  });

  describe('Annulation de rendez-vous (State Based)', () => {
    describe('cancel', () => {
      it('devrait changer le statut à CANCELLED', async () => {
        // Arrange
        const appointmentToCancel = {
          ...mockAppointment,
          status: AppointmentStatus.CONFIRMED,
          isCancellable: () => true,
          practitioner: mockPractitioner,
          patient: mockPatient,
        } as Appointment;

        appointmentRepository.findOne.mockResolvedValue(appointmentToCancel);
        appointmentRepository.save.mockResolvedValue({
          ...appointmentToCancel,
          status: AppointmentStatus.CANCELLED,
        } as Appointment);

        profileRepository.findOne.mockResolvedValue({
          firstName: 'John',
          lastName: 'Doe',
        } as Profile);

        // Act
        const result = await service.cancel('appointment-uuid', 'patient-uuid');

        // Assert
        expect(result.status).toBe(AppointmentStatus.CANCELLED);
      });

      it("devrait rejeter l'annulation par un utilisateur non autorisé", async () => {
        // Arrange
        appointmentRepository.findOne.mockResolvedValue({
          ...mockAppointment,
          practitioner: mockPractitioner,
          patient: mockPatient,
        } as Appointment);

        // Act & Assert
        await expect(
          service.cancel('appointment-uuid', 'other-user-uuid'),
        ).rejects.toThrow(ForbiddenException);
      });

      it("devrait rejeter l'annulation d'un RDV déjà annulé", async () => {
        // Arrange
        appointmentRepository.findOne.mockResolvedValue({
          ...mockAppointment,
          status: AppointmentStatus.CANCELLED,
          isCancellable: () => false,
          practitioner: mockPractitioner,
          patient: mockPatient,
        } as Appointment);

        // Act & Assert
        await expect(
          service.cancel('appointment-uuid', 'patient-uuid'),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  // ============================================================
  // COMMUNICATION BASED TESTS - Envoi d'emails
  // ============================================================
  describe("Envoi d'emails (Communication Based)", () => {
    describe('create', () => {
      it('devrait envoyer un email au patient lors de la création', async () => {
        // Arrange
        const createDto = {
          practitionerId: 'practitioner-uuid',
          dateTime: `${futureMonday}T09:00:00.000Z`,
        };

        userRepository.findOne
          .mockResolvedValueOnce(mockPractitioner as User)
          .mockResolvedValueOnce(mockPatient as User);

        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        };
        appointmentRepository.createQueryBuilder.mockReturnValue(
          mockQueryBuilder as any,
        );

        appointmentRepository.create.mockReturnValue(
          mockAppointment as Appointment,
        );
        appointmentRepository.save.mockResolvedValue(
          mockAppointment as Appointment,
        );
        appointmentRepository.findOne.mockResolvedValue({
          ...mockAppointment,
          practitioner: mockPractitioner,
          patient: mockPatient,
        } as Appointment);

        profileRepository.findOne.mockResolvedValue({
          firstName: 'John',
          lastName: 'Doe',
        } as Profile);

        // Act
        await service.create(createDto, 'patient-uuid');

        // Assert
        expect(mailService.sendAppointmentCreated).toHaveBeenCalledWith(
          expect.any(Object),
          'patient@test.com',
          expect.any(String),
        );
      });

      it('devrait envoyer un email au praticien lors de la création', async () => {
        // Arrange
        const createDto = {
          practitionerId: 'practitioner-uuid',
          dateTime: `${futureMonday}T09:00:00.000Z`,
        };

        userRepository.findOne
          .mockResolvedValueOnce(mockPractitioner as User)
          .mockResolvedValueOnce(mockPatient as User);

        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        };
        appointmentRepository.createQueryBuilder.mockReturnValue(
          mockQueryBuilder as any,
        );

        appointmentRepository.create.mockReturnValue(
          mockAppointment as Appointment,
        );
        appointmentRepository.save.mockResolvedValue(
          mockAppointment as Appointment,
        );
        appointmentRepository.findOne.mockResolvedValue({
          ...mockAppointment,
          practitioner: mockPractitioner,
          patient: mockPatient,
        } as Appointment);

        profileRepository.findOne.mockResolvedValue({
          firstName: 'John',
          lastName: 'Doe',
        } as Profile);

        // Act
        await service.create(createDto, 'patient-uuid');

        // Assert
        expect(
          mailService.sendNewAppointmentToPractitioner,
        ).toHaveBeenCalledWith(
          expect.any(Object),
          'practitioner@test.com',
          expect.any(String),
        );
      });
    });

    describe('cancel', () => {
      it("devrait envoyer un email à l'autre partie lors de l'annulation", async () => {
        // Arrange
        const appointmentToCancel = {
          ...mockAppointment,
          status: AppointmentStatus.CONFIRMED,
          isCancellable: () => true,
          practitioner: mockPractitioner,
          patient: mockPatient,
        } as Appointment;

        appointmentRepository.findOne.mockResolvedValue(appointmentToCancel);
        appointmentRepository.save.mockResolvedValue({
          ...appointmentToCancel,
          status: AppointmentStatus.CANCELLED,
        } as Appointment);

        profileRepository.findOne.mockResolvedValue({
          firstName: 'John',
          lastName: 'Doe',
        } as Profile);

        // Act
        await service.cancel('appointment-uuid', 'patient-uuid');

        // Assert
        expect(mailService.sendAppointmentCancelled).toHaveBeenCalledWith(
          expect.any(Object),
          'practitioner@test.com', // L'autre partie
          expect.any(String),
          true, // Annulé par le patient
        );
      });
    });
  });

  // ============================================================
  // TESTS DES RAPPELS J-1
  // ============================================================
  describe('Rappels J-1 (Communication Based)', () => {
    describe('sendTomorrowReminders', () => {
      it('devrait envoyer des rappels pour tous les RDV de demain', async () => {
        // Arrange
        const tomorrowAppointments = [
          {
            ...mockAppointment,
            practitioner: mockPractitioner,
            patient: mockPatient,
          },
          {
            ...mockAppointment,
            id: 'appointment-2-uuid',
            practitioner: mockPractitioner,
            patient: {
              ...mockPatient,
              id: 'patient-2-uuid',
              email: 'patient2@test.com',
            },
          },
        ] as Appointment[];

        appointmentRepository.find.mockResolvedValue(tomorrowAppointments);
        profileRepository.findOne.mockResolvedValue({
          firstName: 'Dr',
          lastName: 'Smith',
        } as Profile);

        // Act
        const count = await service.sendTomorrowReminders();

        // Assert
        expect(count).toBe(2);
        expect(mailService.sendAppointmentReminder).toHaveBeenCalledTimes(2);
      });

      it('devrait retourner 0 si aucun RDV demain', async () => {
        // Arrange
        appointmentRepository.find.mockResolvedValue([]);

        // Act
        const count = await service.sendTomorrowReminders();

        // Assert
        expect(count).toBe(0);
        expect(mailService.sendAppointmentReminder).not.toHaveBeenCalled();
      });
    });
  });
});

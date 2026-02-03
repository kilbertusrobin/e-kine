import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentStatus } from '../appointments/enums/appointment-status.enum';

// Mock nodemailer
const mockSendMail = jest.fn();
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

/**
 * Tests unitaires pour MailService
 *
 * Types de tests :
 * - OUTPUT BASED : formatage des dates et heures
 * - COMMUNICATION BASED : envoi d'emails via le transporter
 * - STATE BASED : N/A (service stateless)
 */
describe('MailService', () => {
  let service: MailService;

  // Mock data
  const mockAppointment: Partial<Appointment> = {
    id: 'appointment-uuid',
    practitionerId: 'practitioner-uuid',
    patientId: 'patient-uuid',
    dateTime: new Date('2025-01-20T09:00:00.000Z'),
    status: AppointmentStatus.CONFIRMED,
    careType: { id: 'care-type-1', label: 'Kinésithérapie', practitioners: [] },
    notes: 'Première consultation',
  };

  const mockAppointmentWithoutCareType: Partial<Appointment> = {
    ...mockAppointment,
    careType: null,
  };

  beforeEach(async () => {
    // Arrange : Reset des mocks
    mockSendMail.mockReset();
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          MAIL_HOST: 'localhost',
          MAIL_PORT: 1025,
          MAIL_FROM: 'noreply@e-kine.fr',
          MAIL_USER: undefined,
          MAIL_PASSWORD: undefined,
        };
        return config[key] ?? defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  // ============================================================
  // COMMUNICATION BASED TESTS - Envoi d'emails
  // ============================================================
  describe("Envoi d'emails (Communication Based)", () => {
    describe('sendAppointmentCreated', () => {
      it('devrait envoyer un email de confirmation au patient', async () => {
        // Arrange
        const patientEmail = 'patient@test.com';
        const practitionerName = 'Dr. Martin';

        // Act
        await service.sendAppointmentCreated(
          mockAppointment as Appointment,
          patientEmail,
          practitionerName,
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: patientEmail,
            subject: expect.stringContaining('Confirmation'),
            html: expect.stringContaining('Rendez-vous confirmé'),
          }),
        );
      });

      it("devrait inclure les informations du praticien dans l'email", async () => {
        // Arrange
        const practitionerName = 'Dr. Dupont';

        // Act
        await service.sendAppointmentCreated(
          mockAppointment as Appointment,
          'patient@test.com',
          practitionerName,
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.stringContaining(practitionerName),
          }),
        );
      });

      it("devrait inclure le type de soin dans l'email", async () => {
        // Arrange & Act
        await service.sendAppointmentCreated(
          mockAppointment as Appointment,
          'patient@test.com',
          'Dr. Martin',
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.stringContaining('Kinésithérapie'),
          }),
        );
      });

      it('devrait utiliser "Consultation" si pas de type de soin', async () => {
        // Arrange & Act
        await service.sendAppointmentCreated(
          mockAppointmentWithoutCareType as Appointment,
          'patient@test.com',
          'Dr. Martin',
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.stringContaining('Consultation'),
          }),
        );
      });

      it("ne devrait pas lever d'erreur en cas d'échec d'envoi", async () => {
        // Arrange
        mockSendMail.mockRejectedValue(new Error('SMTP error'));

        // Act & Assert - Ne doit pas throw
        await expect(
          service.sendAppointmentCreated(
            mockAppointment as Appointment,
            'patient@test.com',
            'Dr. Martin',
          ),
        ).resolves.not.toThrow();
      });
    });

    describe('sendNewAppointmentToPractitioner', () => {
      it("devrait envoyer un email au praticien lors d'un nouveau RDV", async () => {
        // Arrange
        const practitionerEmail = 'practitioner@test.com';
        const patientName = 'Jean Dupont';

        // Act
        await service.sendNewAppointmentToPractitioner(
          mockAppointment as Appointment,
          practitionerEmail,
          patientName,
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: practitionerEmail,
            subject: expect.stringContaining('Nouveau RDV'),
            html: expect.stringContaining('Nouveau rendez-vous'),
          }),
        );
      });

      it("devrait inclure le nom du patient dans l'email", async () => {
        // Arrange
        const patientName = 'Marie Curie';

        // Act
        await service.sendNewAppointmentToPractitioner(
          mockAppointment as Appointment,
          'practitioner@test.com',
          patientName,
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.stringContaining(patientName),
            subject: expect.stringContaining(patientName),
          }),
        );
      });

      it('devrait inclure les notes si présentes', async () => {
        // Arrange & Act
        await service.sendNewAppointmentToPractitioner(
          mockAppointment as Appointment,
          'practitioner@test.com',
          'Jean Dupont',
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.stringContaining('Première consultation'),
          }),
        );
      });

      it('ne devrait pas inclure la section notes si absentes', async () => {
        // Arrange
        const appointmentWithoutNotes = { ...mockAppointment, notes: null };

        // Act
        await service.sendNewAppointmentToPractitioner(
          appointmentWithoutNotes as Appointment,
          'practitioner@test.com',
          'Jean Dupont',
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.not.stringContaining('<strong>Notes</strong>'),
          }),
        );
      });
    });

    describe('sendAppointmentCancelled', () => {
      it("devrait envoyer un email d'annulation", async () => {
        // Arrange
        const recipientEmail = 'recipient@test.com';
        const cancelledByName = 'Jean Dupont';

        // Act
        await service.sendAppointmentCancelled(
          mockAppointment as Appointment,
          recipientEmail,
          cancelledByName,
          true,
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: recipientEmail,
            subject: expect.stringContaining('Annulation'),
            html: expect.stringContaining('Rendez-vous annulé'),
          }),
        );
      });

      it('devrait indiquer "Le patient" si annulé par un patient', async () => {
        // Arrange & Act
        await service.sendAppointmentCancelled(
          mockAppointment as Appointment,
          'practitioner@test.com',
          'Jean Dupont',
          true, // isPatient = true
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.stringContaining('Le patient'),
          }),
        );
      });

      it('devrait indiquer "Le praticien" si annulé par un praticien', async () => {
        // Arrange & Act
        await service.sendAppointmentCancelled(
          mockAppointment as Appointment,
          'patient@test.com',
          'Dr. Martin',
          false, // isPatient = false
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.stringContaining('Le praticien'),
          }),
        );
      });
    });

    describe('sendAppointmentReminder', () => {
      it('devrait envoyer un rappel J-1 au patient', async () => {
        // Arrange
        const patientEmail = 'patient@test.com';
        const practitionerName = 'Dr. Martin';

        // Act
        await service.sendAppointmentReminder(
          mockAppointment as Appointment,
          patientEmail,
          practitionerName,
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: patientEmail,
            subject: expect.stringContaining('Rappel'),
            html: expect.stringContaining('demain'),
          }),
        );
      });

      it('devrait inclure les informations du praticien dans le rappel', async () => {
        // Arrange
        const practitionerName = 'Dr. Leblanc';

        // Act
        await service.sendAppointmentReminder(
          mockAppointment as Appointment,
          'patient@test.com',
          practitionerName,
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.stringContaining(practitionerName),
          }),
        );
      });
    });
  });

  // ============================================================
  // OUTPUT BASED TESTS - Configuration des emails
  // ============================================================
  describe('Configuration des emails (Output Based)', () => {
    describe('sendMail (via sendAppointmentCreated)', () => {
      it("devrait utiliser l'adresse from configurée", async () => {
        // Arrange & Act
        await service.sendAppointmentCreated(
          mockAppointment as Appointment,
          'patient@test.com',
          'Dr. Martin',
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            from: expect.stringContaining('noreply@e-kine.fr'),
          }),
        );
      });

      it('devrait inclure le nom E-Kine dans le from', async () => {
        // Arrange & Act
        await service.sendAppointmentCreated(
          mockAppointment as Appointment,
          'patient@test.com',
          'Dr. Martin',
        );

        // Assert
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            from: expect.stringContaining('"E-Kine"'),
          }),
        );
      });
    });
  });

  // ============================================================
  // TESTS DE RÉSILIENCE
  // ============================================================
  describe('Résilience aux erreurs (Communication Based)', () => {
    it("devrait continuer même si l'envoi échoue pour sendNewAppointmentToPractitioner", async () => {
      // Arrange
      mockSendMail.mockRejectedValue(new Error('Connection refused'));

      // Act & Assert
      await expect(
        service.sendNewAppointmentToPractitioner(
          mockAppointment as Appointment,
          'practitioner@test.com',
          'Jean Dupont',
        ),
      ).resolves.not.toThrow();
    });

    it("devrait continuer même si l'envoi échoue pour sendAppointmentCancelled", async () => {
      // Arrange
      mockSendMail.mockRejectedValue(new Error('Timeout'));

      // Act & Assert
      await expect(
        service.sendAppointmentCancelled(
          mockAppointment as Appointment,
          'recipient@test.com',
          'Jean Dupont',
          true,
        ),
      ).resolves.not.toThrow();
    });

    it("devrait continuer même si l'envoi échoue pour sendAppointmentReminder", async () => {
      // Arrange
      mockSendMail.mockRejectedValue(new Error('Invalid recipient'));

      // Act & Assert
      await expect(
        service.sendAppointmentReminder(
          mockAppointment as Appointment,
          'invalid-email',
          'Dr. Martin',
        ),
      ).resolves.not.toThrow();
    });
  });
});

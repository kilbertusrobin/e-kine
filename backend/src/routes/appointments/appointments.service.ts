import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { Profile } from '../profiles/entities/profile.entity';
import { MailService } from '../mail/mail.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AvailableSlotsResponseDto,
} from './dtos';

/**
 * Constantes pour les règles métier des créneaux
 */
const MORNING_START_HOUR = 9;
const MORNING_END_HOUR = 13;
const AFTERNOON_START_HOUR = 14;
const AFTERNOON_END_HOUR = 17;

/**
 * Service de gestion des rendez-vous
 * Gère les validations métier (créneaux, horaires, conflits)
 */
@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly mailService: MailService,
  ) {}

  /**
   * Récupère le nom complet d'un utilisateur via son profil
   */
  private async getUserDisplayName(
    userId: string,
    email: string,
  ): Promise<string> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }

    return email;
  }

  /**
   * Génère tous les créneaux possibles pour une journée
   */
  private generateDaySlots(date: Date): Date[] {
    const slots: Date[] = [];
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Créneaux du matin (9h - 13h)
    for (let hour = MORNING_START_HOUR; hour < MORNING_END_HOUR; hour++) {
      slots.push(new Date(year, month, day, hour, 0, 0, 0));
      slots.push(new Date(year, month, day, hour, 30, 0, 0));
    }

    // Créneaux de l'après-midi (14h - 17h)
    for (let hour = AFTERNOON_START_HOUR; hour < AFTERNOON_END_HOUR; hour++) {
      slots.push(new Date(year, month, day, hour, 0, 0, 0));
      slots.push(new Date(year, month, day, hour, 30, 0, 0));
    }

    return slots;
  }

  /**
   * Vérifie si une date est un jour de weekend
   */
  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Dimanche = 0, Samedi = 6
  }

  /**
   * Vérifie si un créneau est valide (horaires autorisés)
   */
  private isValidSlot(date: Date): boolean {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Les minutes doivent être 0 ou 30
    if (minutes !== 0 && minutes !== 30) {
      return false;
    }

    // Créneau du matin (9h - 12h30 inclus)
    if (hours >= MORNING_START_HOUR && hours < MORNING_END_HOUR) {
      return true;
    }

    // Créneau de l'après-midi (14h - 16h30 inclus)
    if (hours >= AFTERNOON_START_HOUR && hours < AFTERNOON_END_HOUR) {
      return true;
    }

    return false;
  }

  /**
   * Valide les contraintes métier pour un créneau
   */
  private validateSlotConstraints(dateTime: Date): void {
    // Vérifier si c'est un weekend
    if (this.isWeekend(dateTime)) {
      throw new BadRequestException(
        'Les rendez-vous ne sont pas disponibles le weekend',
      );
    }

    // Vérifier si le créneau est valide
    if (!this.isValidSlot(dateTime)) {
      throw new BadRequestException(
        'Créneau invalide. Les rendez-vous doivent être sur des créneaux de 30 minutes entre 9h-13h ou 14h-17h',
      );
    }

    // Vérifier si le créneau n'est pas dans le passé
    if (dateTime < new Date()) {
      throw new BadRequestException(
        'Impossible de réserver un créneau dans le passé',
      );
    }
  }

  /**
   * Vérifie si un créneau est disponible pour un praticien
   */
  private async isSlotAvailable(
    practitionerId: string,
    dateTime: Date,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.practitioner_id = :practitionerId', {
        practitionerId,
      })
      .andWhere('appointment.date_time = :dateTime', { dateTime })
      .andWhere('appointment.status != :cancelledStatus', {
        cancelledStatus: AppointmentStatus.CANCELLED,
      });

    // Exclure un RDV spécifique (pour les mises à jour)
    if (excludeAppointmentId) {
      query.andWhere('appointment.id != :excludeId', {
        excludeId: excludeAppointmentId,
      });
    }

    const existingAppointment = await query.getOne();
    return !existingAppointment;
  }

  /**
   * Récupère les créneaux disponibles pour un praticien à une date donnée
   */
  async getAvailableSlots(
    practitionerId: string,
    date: string,
  ): Promise<AvailableSlotsResponseDto> {
    // Vérifier que le praticien existe
    const practitioner = await this.userRepository.findOne({
      where: { id: practitionerId, role: UserRole.PRACTITIONER },
    });

    if (!practitioner) {
      throw new NotFoundException('Praticien non trouvé');
    }

    const targetDate = new Date(date);

    // Vérifier si c'est un weekend
    if (this.isWeekend(targetDate)) {
      return {
        date,
        practitionerId,
        availableSlots: [],
        allSlots: [],
      };
    }

    // Générer tous les créneaux de la journée
    const allSlots = this.generateDaySlots(targetDate);

    // Récupérer les RDV existants pour ce praticien ce jour-là
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.practitioner_id = :practitionerId', {
        practitionerId,
      })
      .andWhere('appointment.date_time >= :startOfDay', { startOfDay })
      .andWhere('appointment.date_time <= :endOfDay', { endOfDay })
      .andWhere('appointment.status != :cancelledStatus', {
        cancelledStatus: AppointmentStatus.CANCELLED,
      })
      .getMany();

    const bookedTimes = new Set(
      existingAppointments.map((a) => a.dateTime.getTime()),
    );

    const now = new Date();
    const availableSlots: string[] = [];
    const allSlotsWithStatus = allSlots.map((slot) => {
      const isBooked = bookedTimes.has(slot.getTime());
      const isPast = slot < now;
      const available = !isBooked && !isPast;

      if (available) {
        availableSlots.push(slot.toISOString());
      }

      return {
        dateTime: slot.toISOString(),
        available,
      };
    });

    return {
      date,
      practitionerId,
      availableSlots,
      allSlots: allSlotsWithStatus,
    };
  }

  /**
   * Crée un nouveau rendez-vous
   */
  async create(
    createAppointmentDto: CreateAppointmentDto,
    patientId: string,
  ): Promise<Appointment> {
    const { practitionerId, dateTime, careTypeId, notes } =
      createAppointmentDto;
    const appointmentDate = new Date(dateTime);

    // Valider les contraintes du créneau
    this.validateSlotConstraints(appointmentDate);

    // Vérifier que le praticien existe et est bien un praticien
    const practitioner = await this.userRepository.findOne({
      where: {
        id: practitionerId,
        role: UserRole.PRACTITIONER,
        isActive: true,
      },
    });

    if (!practitioner) {
      throw new NotFoundException('Praticien non trouvé ou inactif');
    }

    // Vérifier que le patient existe
    const patient = await this.userRepository.findOne({
      where: { id: patientId, isActive: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient non trouvé ou inactif');
    }

    // Vérifier que le créneau est disponible
    const isAvailable = await this.isSlotAvailable(
      practitionerId,
      appointmentDate,
    );

    if (!isAvailable) {
      throw new ConflictException('Ce créneau est déjà réservé');
    }

    // Créer le rendez-vous (directement confirmé)
    const appointment = this.appointmentRepository.create({
      practitionerId,
      patientId,
      careTypeId: careTypeId || null,
      dateTime: appointmentDate,
      notes: notes || null,
      status: AppointmentStatus.CONFIRMED,
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);

    // Charger les relations pour les emails
    const fullAppointment = await this.findById(savedAppointment.id);

    if (fullAppointment) {
      // Récupérer les noms pour les emails
      const practitionerName = await this.getUserDisplayName(
        practitioner.id,
        practitioner.email,
      );
      const patientName = await this.getUserDisplayName(
        patient.id,
        patient.email,
      );

      // Email de confirmation au patient
      void this.mailService.sendAppointmentCreated(
        fullAppointment,
        patient.email,
        practitionerName,
      );

      // Email de notification au praticien
      void this.mailService.sendNewAppointmentToPractitioner(
        fullAppointment,
        practitioner.email,
        patientName,
      );
    }

    return savedAppointment;
  }

  /**
   * Récupère tous les rendez-vous (avec filtres optionnels)
   */
  async findAll(filters?: {
    practitionerId?: string;
    patientId?: string;
    status?: AppointmentStatus;
    fromDate?: string;
    toDate?: string;
  }): Promise<Appointment[]> {
    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.practitioner', 'practitioner')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.careType', 'careType')
      .orderBy('appointment.date_time', 'ASC');

    if (filters?.practitionerId) {
      query.andWhere('appointment.practitioner_id = :practitionerId', {
        practitionerId: filters.practitionerId,
      });
    }

    if (filters?.patientId) {
      query.andWhere('appointment.patient_id = :patientId', {
        patientId: filters.patientId,
      });
    }

    if (filters?.status) {
      query.andWhere('appointment.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.fromDate) {
      query.andWhere('appointment.date_time >= :fromDate', {
        fromDate: new Date(filters.fromDate),
      });
    }

    if (filters?.toDate) {
      query.andWhere('appointment.date_time <= :toDate', {
        toDate: new Date(filters.toDate),
      });
    }

    return query.getMany();
  }

  /**
   * Récupère les rendez-vous d'un utilisateur (patient ou praticien)
   */
  async findByUser(userId: string, role: UserRole): Promise<Appointment[]> {
    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.practitioner', 'practitioner')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.careType', 'careType')
      .orderBy('appointment.date_time', 'ASC');

    if (role === UserRole.PRACTITIONER) {
      query.where('appointment.practitioner_id = :userId', { userId });
    } else {
      query.where('appointment.patient_id = :userId', { userId });
    }

    return query.getMany();
  }

  /**
   * Récupère un rendez-vous par son ID
   */
  async findById(id: string): Promise<Appointment | null> {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: ['practitioner', 'patient', 'careType'],
    });
  }

  /**
   * Met à jour un rendez-vous
   */
  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    userId: string,
  ): Promise<Appointment> {
    const appointment = await this.findById(id);

    if (!appointment) {
      throw new NotFoundException('Rendez-vous non trouvé');
    }

    // Vérifier que l'utilisateur est autorisé (patient ou praticien du RDV)
    if (
      appointment.patientId !== userId &&
      appointment.practitionerId !== userId
    ) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier ce rendez-vous",
      );
    }

    // Si on change la date/heure
    if (updateAppointmentDto.dateTime) {
      const newDateTime = new Date(updateAppointmentDto.dateTime);

      // Valider les contraintes
      this.validateSlotConstraints(newDateTime);

      // Vérifier la disponibilité (en excluant ce RDV)
      const isAvailable = await this.isSlotAvailable(
        appointment.practitionerId,
        newDateTime,
        id,
      );

      if (!isAvailable) {
        throw new ConflictException('Ce créneau est déjà réservé');
      }

      appointment.dateTime = newDateTime;
    }

    // Mettre à jour les autres champs
    if (updateAppointmentDto.careTypeId !== undefined) {
      appointment.careTypeId = updateAppointmentDto.careTypeId || null;
    }

    if (updateAppointmentDto.status !== undefined) {
      appointment.status = updateAppointmentDto.status;
    }

    if (updateAppointmentDto.notes !== undefined) {
      appointment.notes = updateAppointmentDto.notes || null;
    }

    return this.appointmentRepository.save(appointment);
  }

  /**
   * Annule un rendez-vous
   */
  async cancel(id: string, userId: string): Promise<Appointment> {
    const appointment = await this.findById(id);

    if (!appointment) {
      throw new NotFoundException('Rendez-vous non trouvé');
    }

    // Vérifier que l'utilisateur est autorisé
    if (
      appointment.patientId !== userId &&
      appointment.practitionerId !== userId
    ) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à annuler ce rendez-vous",
      );
    }

    // Vérifier que le RDV est annulable
    if (!appointment.isCancellable()) {
      throw new BadRequestException('Ce rendez-vous ne peut plus être annulé');
    }

    appointment.status = AppointmentStatus.CANCELLED;
    const savedAppointment = await this.appointmentRepository.save(appointment);

    // Envoyer un email à l'autre partie
    if (appointment.patient && appointment.practitioner) {
      const isCancelledByPatient = userId === appointment.patientId;
      const cancelledByName = await this.getUserDisplayName(
        userId,
        isCancelledByPatient
          ? appointment.patient.email
          : appointment.practitioner.email,
      );

      // Notifier l'autre partie
      const recipientEmail = isCancelledByPatient
        ? appointment.practitioner.email
        : appointment.patient.email;

      void this.mailService.sendAppointmentCancelled(
        appointment,
        recipientEmail,
        cancelledByName,
        isCancelledByPatient,
      );
    }

    return savedAppointment;
  }

  /**
   * Supprime un rendez-vous (soft delete via statut cancelled)
   */
  async delete(id: string, userId: string): Promise<void> {
    await this.cancel(id, userId);
  }

  /**
   * Récupère les RDV de demain (pour les rappels J-1)
   * Utilisé par le cron job
   */
  async findTomorrowAppointments(): Promise<Appointment[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    return this.appointmentRepository.find({
      where: {
        dateTime: Between(tomorrow, dayAfterTomorrow),
        status: AppointmentStatus.CONFIRMED,
      },
      relations: ['practitioner', 'patient', 'careType'],
    });
  }

  /**
   * Envoie les rappels J-1 pour tous les RDV de demain
   * Appelé par le cron job
   */
  async sendTomorrowReminders(): Promise<number> {
    const appointments = await this.findTomorrowAppointments();
    let sentCount = 0;

    for (const appointment of appointments) {
      if (appointment.patient && appointment.practitioner) {
        const practitionerName = await this.getUserDisplayName(
          appointment.practitioner.id,
          appointment.practitioner.email,
        );

        await this.mailService.sendAppointmentReminder(
          appointment,
          appointment.patient.email,
          practitionerName,
        );

        sentCount++;
      }
    }

    return sentCount;
  }
}

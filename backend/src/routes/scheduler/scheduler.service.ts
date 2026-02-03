import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppointmentsService } from '../appointments/appointments.service';

/**
 * Service de tâches planifiées (cron jobs)
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly appointmentsService: AppointmentsService) {}

  /**
   * Envoie les rappels J-1 tous les jours à 18h
   * Les patients reçoivent un email de rappel pour leur RDV du lendemain
   */
  @Cron('0 18 * * *', {
    name: 'appointment-reminders',
    timeZone: 'Europe/Paris',
  })
  async handleAppointmentReminders(): Promise<void> {
    this.logger.log('Démarrage du cron: envoi des rappels J-1');

    try {
      const sentCount = await this.appointmentsService.sendTomorrowReminders();
      this.logger.log(`Rappels J-1 envoyés: ${sentCount} emails`);
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'envoi des rappels: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

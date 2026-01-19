import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { Appointment } from '../appointments/entities/appointment.entity';

/**
 * Service d'envoi d'emails
 * Utilise Nodemailer avec SMTP (Mailpit en dev, service externe en prod)
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST', 'localhost'),
      port: this.configService.get<number>('MAIL_PORT', 1025),
      secure: false, // true pour 465, false pour les autres ports
      auth: this.configService.get<string>('MAIL_USER')
        ? {
            user: this.configService.get<string>('MAIL_USER'),
            pass: this.configService.get<string>('MAIL_PASSWORD'),
          }
        : undefined,
    });
  }

  /**
   * Envoie un email
   */
  private async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      const from = this.configService.get<string>(
        'MAIL_FROM',
        'noreply@e-kine.fr',
      );

      await this.transporter.sendMail({
        from: `"E-Kine" <${from}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email envoyé à ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email à ${to}: ${error.message}`);
      // Ne pas throw pour ne pas bloquer le flux principal
    }
  }

  /**
   * Formate une date en français
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  /**
   * Formate une heure
   */
  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  /**
   * Email de confirmation de RDV (envoyé au patient)
   */
  async sendAppointmentCreated(
    appointment: Appointment,
    patientEmail: string,
    practitionerName: string,
  ): Promise<void> {
    const date = this.formatDate(appointment.dateTime);
    const time = this.formatTime(appointment.dateTime);
    const careType = appointment.careType?.label || 'Consultation';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4F46E5; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rendez-vous confirmé</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Votre rendez-vous a bien été enregistré.</p>

            <div class="info-box">
              <p><strong>Date :</strong> ${date}</p>
              <p><strong>Heure :</strong> ${time}</p>
              <p><strong>Praticien :</strong> ${practitionerName}</p>
              <p><strong>Type de soin :</strong> ${careType}</p>
            </div>

            <p>Vous recevrez un rappel la veille de votre rendez-vous.</p>
            <p>En cas d'empêchement, merci d'annuler votre rendez-vous au plus tôt.</p>
          </div>
          <div class="footer">
            <p>E-Kine - Votre plateforme de prise de rendez-vous</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail(
      patientEmail,
      `Confirmation de votre RDV du ${date} à ${time}`,
      html,
    );
  }

  /**
   * Email de notification au praticien (nouveau RDV)
   */
  async sendNewAppointmentToPractitioner(
    appointment: Appointment,
    practitionerEmail: string,
    patientName: string,
  ): Promise<void> {
    const date = this.formatDate(appointment.dateTime);
    const time = this.formatTime(appointment.dateTime);
    const careType = appointment.careType?.label || 'Consultation';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10B981; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nouveau rendez-vous</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Un nouveau rendez-vous a été pris.</p>

            <div class="info-box">
              <p><strong>Date :</strong> ${date}</p>
              <p><strong>Heure :</strong> ${time}</p>
              <p><strong>Patient :</strong> ${patientName}</p>
              <p><strong>Type de soin :</strong> ${careType}</p>
              ${appointment.notes ? `<p><strong>Notes :</strong> ${appointment.notes}</p>` : ''}
            </div>
          </div>
          <div class="footer">
            <p>E-Kine - Votre plateforme de prise de rendez-vous</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail(
      practitionerEmail,
      `Nouveau RDV: ${patientName} - ${date} à ${time}`,
      html,
    );
  }

  /**
   * Email d'annulation de RDV
   */
  async sendAppointmentCancelled(
    appointment: Appointment,
    recipientEmail: string,
    cancelledByName: string,
    isPatient: boolean,
  ): Promise<void> {
    const date = this.formatDate(appointment.dateTime);
    const time = this.formatTime(appointment.dateTime);
    const role = isPatient ? 'Le patient' : 'Le praticien';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #EF4444; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rendez-vous annulé</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>${role} <strong>${cancelledByName}</strong> a annulé le rendez-vous suivant :</p>

            <div class="info-box">
              <p><strong>Date :</strong> ${date}</p>
              <p><strong>Heure :</strong> ${time}</p>
            </div>

            <p>Nous vous invitons à prendre un nouveau rendez-vous si nécessaire.</p>
          </div>
          <div class="footer">
            <p>E-Kine - Votre plateforme de prise de rendez-vous</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail(
      recipientEmail,
      `Annulation du RDV du ${date} à ${time}`,
      html,
    );
  }

  /**
   * Email de rappel J-1
   */
  async sendAppointmentReminder(
    appointment: Appointment,
    patientEmail: string,
    practitionerName: string,
  ): Promise<void> {
    const date = this.formatDate(appointment.dateTime);
    const time = this.formatTime(appointment.dateTime);
    const careType = appointment.careType?.label || 'Consultation';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #F59E0B; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .reminder { font-size: 18px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rappel : RDV demain</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p class="reminder">N'oubliez pas votre rendez-vous <strong>demain</strong> !</p>

            <div class="info-box">
              <p><strong>Date :</strong> ${date}</p>
              <p><strong>Heure :</strong> ${time}</p>
              <p><strong>Praticien :</strong> ${practitionerName}</p>
              <p><strong>Type de soin :</strong> ${careType}</p>
            </div>

            <p>En cas d'empêchement, merci d'annuler votre rendez-vous au plus tôt.</p>
          </div>
          <div class="footer">
            <p>E-Kine - Votre plateforme de prise de rendez-vous</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail(
      patientEmail,
      `Rappel : RDV demain ${date} à ${time}`,
      html,
    );
  }
}

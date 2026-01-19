import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';

/**
 * DTO de réponse pour un rendez-vous
 */
export class AppointmentResponseDto {
  id: string;
  practitionerId: string;
  patientId: string;
  careTypeId: string | null;
  dateTime: Date;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations (optionnelles, incluses si chargées)
  practitioner?: {
    id: string;
    email: string;
    googlePicture: string | null;
  };
  patient?: {
    id: string;
    email: string;
    googlePicture: string | null;
  };
  careType?: {
    id: string;
    label: string;
  } | null;

  /**
   * Crée un DTO à partir d'une entité Appointment
   */
  static fromEntity(appointment: Appointment): AppointmentResponseDto {
    const dto = new AppointmentResponseDto();
    dto.id = appointment.id;
    dto.practitionerId = appointment.practitionerId;
    dto.patientId = appointment.patientId;
    dto.careTypeId = appointment.careTypeId;
    dto.dateTime = appointment.dateTime;
    dto.status = appointment.status;
    dto.notes = appointment.notes;
    dto.createdAt = appointment.createdAt;
    dto.updatedAt = appointment.updatedAt;

    // Inclure les relations si elles sont chargées
    if (appointment.practitioner) {
      dto.practitioner = {
        id: appointment.practitioner.id,
        email: appointment.practitioner.email,
        googlePicture: appointment.practitioner.googlePicture,
      };
    }

    if (appointment.patient) {
      dto.patient = {
        id: appointment.patient.id,
        email: appointment.patient.email,
        googlePicture: appointment.patient.googlePicture,
      };
    }

    if (appointment.careType) {
      dto.careType = {
        id: appointment.careType.id,
        label: appointment.careType.label,
      };
    } else {
      dto.careType = null;
    }

    return dto;
  }

  /**
   * Crée un tableau de DTOs à partir d'entités
   */
  static fromEntities(appointments: Appointment[]): AppointmentResponseDto[] {
    return appointments.map((a) => AppointmentResponseDto.fromEntity(a));
  }
}

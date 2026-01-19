import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { AppointmentStatus } from '../enums/appointment-status.enum';

/**
 * DTO pour la mise à jour d'un rendez-vous
 * Tous les champs sont optionnels
 */
export class UpdateAppointmentDto {
  /**
   * Nouvelle date et heure du rendez-vous (ISO 8601)
   */
  @IsOptional()
  @IsDateString()
  dateTime?: string;

  /**
   * Nouveau type de soin
   */
  @IsOptional()
  @IsUUID()
  careTypeId?: string;

  /**
   * Nouveau statut du rendez-vous
   */
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  /**
   * Notes ou commentaires
   */
  @IsOptional()
  @IsString()
  notes?: string;
}

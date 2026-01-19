import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * DTO pour la création d'un rendez-vous
 */
export class CreateAppointmentDto {
  /**
   * ID du praticien
   */
  @IsUUID()
  practitionerId: string;

  /**
   * Date et heure du rendez-vous (ISO 8601)
   * Doit être sur un créneau valide (9h, 9h30, etc.)
   * Exemple: "2024-01-15T09:00:00.000Z"
   */
  @IsDateString()
  dateTime: string;

  /**
   * ID du type de soin (optionnel)
   */
  @IsOptional()
  @IsUUID()
  careTypeId?: string;

  /**
   * Notes ou commentaires (optionnel)
   */
  @IsOptional()
  @IsString()
  notes?: string;
}

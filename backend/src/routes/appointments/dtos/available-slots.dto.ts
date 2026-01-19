import { IsUUID, IsDateString } from 'class-validator';

/**
 * DTO pour la requête des créneaux disponibles
 */
export class GetAvailableSlotsDto {
  /**
   * ID du praticien
   */
  @IsUUID()
  practitionerId: string;

  /**
   * Date pour laquelle chercher les créneaux (YYYY-MM-DD)
   */
  @IsDateString()
  date: string;
}

/**
 * DTO de réponse pour les créneaux disponibles
 */
export class AvailableSlotsResponseDto {
  /**
   * Date concernée
   */
  date: string;

  /**
   * ID du praticien
   */
  practitionerId: string;

  /**
   * Liste des créneaux disponibles (ISO 8601)
   */
  availableSlots: string[];

  /**
   * Liste de tous les créneaux de la journée avec leur statut
   */
  allSlots: {
    dateTime: string;
    available: boolean;
  }[];
}

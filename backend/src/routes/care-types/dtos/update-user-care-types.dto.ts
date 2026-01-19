import { IsArray, IsUUID } from 'class-validator';

/**
 * DTO pour mettre à jour les types de soins d'un praticien
 */
export class UpdateUserCareTypesDto {
  /**
   * Tableau des IDs des types de soins à associer au praticien
   * Remplace entièrement les types de soins actuels
   */
  @IsArray()
  @IsUUID('4', { each: true, message: 'Chaque ID doit être un UUID valide' })
  careTypeIds: string[];
}

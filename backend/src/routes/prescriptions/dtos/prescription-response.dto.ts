import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dtos';

/**
 * DTO pour les réponses API contenant une ordonnance
 * Exclut les données sensibles et structure la réponse
 */
@Exclude()
export class PrescriptionResponseDto {
  /**
   * Identifiant unique de l'ordonnance
   */
  @Expose()
  id: string;

  /**
   * Données du PDF en base64
   */
  @Expose()
  pdfData: string;

  /**
   * Nom du fichier PDF original
   */
  @Expose()
  filename: string;

  /**
   * ID de l'utilisateur propriétaire
   */
  @Expose()
  userId: string;

  /**
   * Utilisateur propriétaire de l'ordonnance
   * Optionnel selon le besoin de charger la relation
   */
  @Expose()
  @Type(() => UserResponseDto)
  user?: UserResponseDto;

  /**
   * Date de création
   */
  @Expose()
  createdAt: Date;

  /**
   * Date de dernière modification
   */
  @Expose()
  updatedAt: Date;
}

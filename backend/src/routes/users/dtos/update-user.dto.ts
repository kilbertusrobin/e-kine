import { IsBoolean, IsDate, IsOptional, IsUrl } from 'class-validator';

/**
 * DTO pour la mise à jour d'un utilisateur
 * Tous les champs sont optionnels
 */
export class UpdateUserDto {
  /**
   * URL de la photo de profil Google
   */
  @IsUrl({}, { message: 'L\'URL de la photo de profil doit être valide' })
  @IsOptional()
  googlePicture?: string;

  /**
   * Statut d'activation du compte
   */
  @IsBoolean({ message: 'isActive doit être un booléen' })
  @IsOptional()
  isActive?: boolean;

  /**
   * Date de dernière connexion
   */
  @IsDate({ message: 'lastLoginAt doit être une date valide' })
  @IsOptional()
  lastLoginAt?: Date;
}

import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO pour la mise à jour d'un profil
 * Tous les champs sont optionnels
 */
export class UpdateProfileDto {
  /**
   * Nom de famille
   */
  @IsString({ message: 'lastName doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'lastName ne doit pas dépasser 100 caractères' })
  @IsOptional()
  lastName?: string;

  /**
   * Prénom
   */
  @IsString({ message: 'firstName doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'firstName ne doit pas dépasser 100 caractères' })
  @IsOptional()
  firstName?: string;

  /**
   * Adresse
   */
  @IsString({ message: 'address doit être une chaîne de caractères' })
  @IsOptional()
  address?: string;

  /**
   * Ville
   */
  @IsString({ message: 'city doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'city ne doit pas dépasser 100 caractères' })
  @IsOptional()
  city?: string;

  /**
   * Code postal
   */
  @IsString({ message: 'pc doit être une chaîne de caractères' })
  @MaxLength(10, { message: 'pc ne doit pas dépasser 10 caractères' })
  @IsOptional()
  pc?: string;

  /**
   * Numéro de téléphone
   */
  @IsString({ message: 'phone doit être une chaîne de caractères' })
  @MaxLength(20, { message: 'phone ne doit pas dépasser 20 caractères' })
  @IsOptional()
  phone?: string;
}

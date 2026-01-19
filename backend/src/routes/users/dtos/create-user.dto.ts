import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUrl, IsOptional } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

/**
 * DTO pour la création d'un utilisateur
 * Utilisé lors de l'inscription via Google OAuth
 */
export class CreateUserDto {
  /**
   * Email de l'utilisateur (provenant de Google)
   */
  @IsEmail({}, { message: 'L\'email doit être valide' })
  @IsNotEmpty({ message: 'L\'email est obligatoire' })
  email: string;

  /**
   * Identifiant Google (sub) de l'utilisateur
   */
  @IsString({ message: 'Le Google ID doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le Google ID est obligatoire' })
  googleId: string;

  /**
   * URL de la photo de profil Google (optionnel)
   */
  @IsUrl({}, { message: 'L\'URL de la photo de profil doit être valide' })
  @IsOptional()
  googlePicture?: string;

  /**
   * Rôle de l'utilisateur (patient ou practitioner)
   */
  @IsEnum(UserRole, { message: 'Le rôle doit être "patient" ou "practitioner"' })
  @IsNotEmpty({ message: 'Le rôle est obligatoire' })
  role: UserRole;
}

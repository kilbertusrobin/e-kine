import { Exclude, Expose, Type } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';
import { ProfileResponseDto } from '../../profiles/dtos';

/**
 * DTO pour les réponses API contenant un utilisateur
 * Exclut les données sensibles et n'expose que les données nécessaires
 */
@Exclude()
export class UserResponseDto {
  /**
   * Identifiant unique de l'utilisateur
   */
  @Expose()
  id: string;

  /**
   * Email de l'utilisateur
   */
  @Expose()
  email: string;

  /**
   * URL de la photo de profil Google
   */
  @Expose()
  googlePicture: string | null;

  /**
   * Rôle de l'utilisateur
   */
  @Expose()
  role: UserRole;

  /**
   * Indique si le compte est actif
   */
  @Expose()
  isActive: boolean;

  /**
   * Indique si l'email est vérifié
   */
  @Expose()
  emailVerified: boolean;

  /**
   * Date de dernière connexion
   */
  @Expose()
  lastLoginAt: Date | null;

  /**
   * Date de création du compte
   */
  @Expose()
  createdAt: Date;

  /**
   * Date de dernière modification
   */
  @Expose()
  updatedAt: Date;

  /**
   * Profil de l'utilisateur
   */
  @Expose()
  @Type(() => ProfileResponseDto)
  profile?: ProfileResponseDto;

  /**
   * Méthode helper pour vérifier si l'utilisateur est un patient
   */
  @Expose()
  get isPatient(): boolean {
    return this.role === UserRole.PATIENT;
  }

  /**
   * Méthode helper pour vérifier si l'utilisateur est un praticien
   */
  @Expose()
  get isPractitioner(): boolean {
    return this.role === UserRole.PRACTITIONER;
  }

  /**
   * Méthode helper pour vérifier si le compte peut se connecter
   */
  @Expose()
  get canLogin(): boolean {
    return this.isActive;
  }
}

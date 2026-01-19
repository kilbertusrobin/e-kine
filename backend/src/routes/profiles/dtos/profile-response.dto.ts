import { Exclude, Expose } from 'class-transformer';

/**
 * DTO pour les réponses API contenant un profil
 * Expose tous les champs du profil
 */
@Exclude()
export class ProfileResponseDto {
  /**
   * Identifiant unique du profil
   */
  @Expose()
  id: string;

  /**
   * Nom de famille
   */
  @Expose()
  lastName: string | null;

  /**
   * Prénom
   */
  @Expose()
  firstName: string | null;

  /**
   * Adresse
   */
  @Expose()
  address: string | null;

  /**
   * Ville
   */
  @Expose()
  city: string | null;

  /**
   * Code postal
   */
  @Expose()
  pc: string | null;

  /**
   * Numéro de téléphone
   */
  @Expose()
  phone: string | null;

  /**
   * ID de l'utilisateur
   */
  @Expose()
  userId: string;

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

  /**
   * Méthode helper pour vérifier si le profil est complet
   */
  @Expose()
  get isComplete(): boolean {
    return !!(
      this.lastName &&
      this.firstName &&
      this.address &&
      this.city &&
      this.pc &&
      this.phone
    );
  }
}

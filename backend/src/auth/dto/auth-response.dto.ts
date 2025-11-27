import { UserResponseDto } from '../../users/dto';

/**
 * DTO pour la réponse d'authentification
 * Contient les tokens JWT et les informations utilisateur
 */
export class AuthResponseDto {
  /**
   * Access token JWT (courte durée : 1h)
   */
  accessToken: string;

  /**
   * Refresh token (longue durée : 30 jours)
   */
  refreshToken: string;

  /**
   * Type de token (toujours "Bearer")
   */
  tokenType: string = 'Bearer';

  /**
   * Durée de validité du token en secondes
   */
  expiresIn: number;

  /**
   * Informations de l'utilisateur
   */
  user: UserResponseDto;
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

/**
 * Interface pour le profil Google OAuth
 */
export interface GoogleProfile {
  sub: string; // Google ID
  email: string;
  email_verified: boolean;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

/**
 * Stratégie Google OAuth 2.0
 * Gère l'authentification via Google
 * Le rôle (patient/praticien) est déterminé automatiquement via whitelist d'emails
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  /**
   * Méthode appelée après authentification Google réussie
   * @param accessToken - Access token Google
   * @param refreshToken - Refresh token Google (peut être undefined)
   * @param profile - Profil utilisateur Google
   * @param done - Callback Passport
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, photos, name } = profile;

    // Extraction des données Google
    const googleProfile: GoogleProfile = {
      sub: id,
      email: emails[0].value,
      email_verified: emails[0].verified,
      picture: photos?.[0]?.value,
      given_name: name?.givenName,
      family_name: name?.familyName,
    };

    done(null, googleProfile);
  }
}

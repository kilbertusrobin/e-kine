import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard, JwtAuthGuard } from './guards';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from './decorators';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

/**
 * Controller d'authentification
 * Gère toutes les routes liées à l'authentification OAuth Google
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * GET /auth/google
   * Déclenche l'authentification Google OAuth
   * Le rôle est déterminé automatiquement selon l'email (whitelist)
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Le guard GoogleAuthGuard redirige vers Google
    // Cette méthode ne sera jamais appelée
  }

  /**
   * GET /auth/google/callback
   * Callback Google OAuth
   * Gère l'inscription et la connexion
   * Le rôle est déterminé automatiquement selon l'email
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const googleUser = req.user as any;

    // Récupère device info et IP
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip;

    try {
      // Authentifie/inscrit l'utilisateur (le rôle est déterminé automatiquement)
      const authResponse = await this.authService.handleGoogleAuth(
        {
          sub: googleUser.sub,
          email: googleUser.email,
          picture: googleUser.picture,
        },
        deviceInfo,
        ipAddress,
      );

      // Redirige vers le frontend avec les tokens
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const redirectUrl = `${frontendUrl}/auth/callback?` +
        `accessToken=${authResponse.accessToken}&` +
        `refreshToken=${authResponse.refreshToken}&` +
        `role=${authResponse.user.role}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      // En cas d'erreur, redirige vers le frontend avec le message d'erreur
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const errorMessage = encodeURIComponent(error.message);
      return res.redirect(`${frontendUrl}/auth/error?message=${errorMessage}`);
    }
  }

  /**
   * POST /auth/refresh
   * Rafraîchit l'access token avec le refresh token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  /**
   * POST /auth/logout
   * Déconnecte l'utilisateur (supprime la session)
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken);
  }

  /**
   * POST /auth/logout-all
   * Déconnecte l'utilisateur de toutes ses sessions
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(@CurrentUser() user: User) {
    await this.authService.logoutAll(user.id);
  }

  /**
   * GET /auth/me
   * Récupère les informations de l'utilisateur authentifié
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return user;
  }

  /**
   * GET /auth/status
   * Vérifie le statut d'authentification
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@CurrentUser() user: User) {
    return {
      authenticated: true,
      role: user.role,
      canLogin: user.canLogin(),
    };
  }
}

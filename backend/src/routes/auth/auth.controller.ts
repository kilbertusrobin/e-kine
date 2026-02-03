import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { AuthService } from './auth.service';
import { GoogleAuthGuard, JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';
import { User } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dtos';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Login Google', description: 'Redirige vers Google OAuth' })
  @ApiResponse({ status: 302, description: 'Redirection vers Google' })
  async googleAuth() {
    // Le guard redirige vers Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiExcludeEndpoint()
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const googleUser = req.user as any;
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip;

    try {
      const authResponse = await this.authService.handleGoogleAuth(
        {
          sub: googleUser.sub,
          email: googleUser.email,
          picture: googleUser.picture,
        },
        deviceInfo,
        ipAddress,
      );

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const redirectUrl = `${frontendUrl}/auth/callback?` +
        `accessToken=${authResponse.accessToken}&` +
        `refreshToken=${authResponse.refreshToken}&` +
        `role=${authResponse.user.role}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const errorMessage = encodeURIComponent(error.message);
      return res.redirect(`${frontendUrl}/auth/error?message=${errorMessage}`);
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir le token' })
  @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Nouveau access token' })
  @ApiResponse({ status: 401, description: 'Refresh token invalide' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Déconnexion' })
  @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } } } })
  @ApiResponse({ status: 204, description: 'Déconnecté' })
  async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Déconnexion de tous les appareils' })
  @ApiResponse({ status: 204, description: 'Toutes les sessions supprimées' })
  async logoutAll(@CurrentUser() user: User) {
    await this.authService.logoutAll(user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Informations utilisateur' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getProfile(@CurrentUser() user: User) {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Statut d\'authentification' })
  @ApiResponse({ status: 200, description: 'Statut' })
  async getStatus(@CurrentUser() user: User) {
    return {
      authenticated: true,
      role: user.role,
      canLogin: user.canLogin(),
    };
  }
}

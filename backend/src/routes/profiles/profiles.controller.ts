import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto, UpdateProfileDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { User } from '../users/entities/user.entity';

/**
 * Controller de gestion des profils
 */
@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  /**
   * GET /profiles/me
   * Récupère le profil de l'utilisateur authentifié
   */
  @Get('me')
  async getMyProfile(@CurrentUser() user: User) {
    return this.profilesService.findByUserId(user.id);
  }

  /**
   * PUT /profiles/me
   * Met à jour le profil de l'utilisateur authentifié
   */
  @Put('me')
  async updateMyProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.updateByUserId(user.id, updateProfileDto);
  }

  /**
   * GET /profiles/:id
   * Récupère un profil par son ID
   */
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.profilesService.findById(id);
  }

  /**
   * PUT /profiles/:id
   * Met à jour un profil par son ID
   */
  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(id, updateProfileDto);
  }

  /**
   * DELETE /profiles/:id
   * Supprime un profil par son ID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Param('id') id: string) {
    await this.profilesService.delete(id);
  }
}

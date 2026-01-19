import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('Profiles')
@ApiBearerAuth('JWT-auth')
@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Mon profil', description: 'Récupère le profil de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil trouvé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getMyProfile(@CurrentUser() user: User) {
    return this.profilesService.findByUserId(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Modifier mon profil' })
  @ApiResponse({ status: 200, description: 'Profil modifié' })
  async updateMyProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.updateByUserId(user.id, updateProfileDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Profil par ID' })
  @ApiParam({ name: 'id', description: 'UUID du profil' })
  @ApiResponse({ status: 200, description: 'Profil trouvé' })
  @ApiResponse({ status: 404, description: 'Profil non trouvé' })
  async getProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.profilesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un profil par ID' })
  @ApiParam({ name: 'id', description: 'UUID du profil' })
  @ApiResponse({ status: 200, description: 'Profil modifié' })
  async updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un profil' })
  @ApiParam({ name: 'id', description: 'UUID du profil' })
  @ApiResponse({ status: 204, description: 'Profil supprimé' })
  async deleteProfile(@Param('id', ParseUUIDPipe) id: string) {
    await this.profilesService.delete(id);
  }
}

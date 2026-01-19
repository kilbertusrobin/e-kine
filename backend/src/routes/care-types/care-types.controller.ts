import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CareTypesService } from './care-types.service';
import { UpdateUserCareTypesDto, CareTypeResponseDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { User } from '../users/entities/user.entity';

/**
 * Controller de gestion des types de soins
 */
@Controller('care-types')
export class CareTypesController {
  constructor(private readonly careTypesService: CareTypesService) {}

  /**
   * GET /care-types
   * Récupère tous les types de soins disponibles
   * Route publique (pas besoin d'être authentifié)
   */
  @Get()
  async findAll(): Promise<CareTypeResponseDto[]> {
    const careTypes = await this.careTypesService.findAll();
    return CareTypeResponseDto.fromEntities(careTypes);
  }

  /**
   * GET /care-types/me
   * Récupère les types de soins du praticien authentifié
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyCareTypes(
    @CurrentUser() user: User,
  ): Promise<CareTypeResponseDto[]> {
    const careTypes = await this.careTypesService.findByUserId(user.id);
    return CareTypeResponseDto.fromEntities(careTypes);
  }

  /**
   * PUT /care-types/me
   * Met à jour les types de soins du praticien authentifié
   * Remplace entièrement les types de soins existants
   */
  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateMyCareTypes(
    @CurrentUser() user: User,
    @Body() updateUserCareTypesDto: UpdateUserCareTypesDto,
  ): Promise<CareTypeResponseDto[]> {
    const careTypes = await this.careTypesService.updateUserCareTypes(
      user.id,
      updateUserCareTypesDto.careTypeIds,
    );
    return CareTypeResponseDto.fromEntities(careTypes);
  }
}

import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CareTypesService } from './care-types.service';
import { UpdateUserCareTypesDto, CareTypeResponseDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('Care Types')
@Controller('care-types')
export class CareTypesController {
  constructor(private readonly careTypesService: CareTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des types de soins', description: 'Route publique' })
  @ApiResponse({ status: 200, description: 'Liste des types de soins disponibles' })
  async findAll(): Promise<CareTypeResponseDto[]> {
    const careTypes = await this.careTypesService.findAll();
    return plainToInstance(CareTypeResponseDto, careTypes, { excludeExtraneousValues: true });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mes types de soins', description: 'Types de soins du praticien connecté' })
  @ApiResponse({ status: 200, description: 'Liste des types de soins' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getMyCareTypes(
    @CurrentUser() user: User,
  ): Promise<CareTypeResponseDto[]> {
    const careTypes = await this.careTypesService.findByUserId(user.id);
    return plainToInstance(CareTypeResponseDto, careTypes, { excludeExtraneousValues: true });
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Modifier mes types de soins', description: 'Remplace entièrement les types de soins (praticien uniquement)' })
  @ApiResponse({ status: 200, description: 'Types de soins mis à jour' })
  @ApiResponse({ status: 403, description: 'Réservé aux praticiens' })
  async updateMyCareTypes(
    @CurrentUser() user: User,
    @Body() updateUserCareTypesDto: UpdateUserCareTypesDto,
  ): Promise<CareTypeResponseDto[]> {
    const careTypes = await this.careTypesService.updateUserCareTypes(
      user.id,
      updateUserCareTypesDto.careTypeIds,
    );
    return plainToInstance(CareTypeResponseDto, careTypes, { excludeExtraneousValues: true });
  }
}

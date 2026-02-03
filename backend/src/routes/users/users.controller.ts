import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards';
import { plainToInstance } from 'class-transformer';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('practitioners')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Liste des praticiens',
    description: 'Retourne la liste de tous les praticiens actifs avec leur profil',
  })
  @ApiResponse({ status: 200, description: 'Liste des praticiens', type: [UserResponseDto] })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getPractitioners(): Promise<UserResponseDto[]> {
    const practitioners = await this.usersService.findAllPractitioners();
    return practitioners.map((p) =>
      plainToInstance(UserResponseDto, p, {
        excludeExtraneousValues: true,
      }),
    );
  }
}

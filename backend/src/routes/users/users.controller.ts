import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './dtos';
import { plainToInstance } from 'class-transformer';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('practitioners')
  @ApiOperation({
    summary: 'Liste des praticiens',
    description: 'Retourne la liste de tous les praticiens actifs avec leur profil et leurs types de soins',
  })
  @ApiResponse({ status: 200, description: 'Liste des praticiens', type: [UserResponseDto] })
  async getPractitioners(): Promise<UserResponseDto[]> {
    const practitioners = await this.usersService.findAllPractitioners();
    return practitioners.map((p) =>
      plainToInstance(UserResponseDto, p, {
        excludeExtraneousValues: true,
      }),
    );
  }
}

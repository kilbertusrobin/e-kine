import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'UUID du praticien',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  practitionerId: string;

  @ApiProperty({
    description:
      'Date et heure du RDV (ISO 8601). Créneaux: 9h-13h, 14h-17h, toutes les 30min',
    example: '2024-01-15T09:00:00.000Z',
  })
  @IsDateString()
  dateTime: string;

  @ApiPropertyOptional({
    description: 'UUID du type de soin',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  careTypeId?: string;

  @ApiPropertyOptional({
    description: 'Notes ou commentaires',
    example: 'Douleur au genou gauche',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

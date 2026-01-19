import { plainToInstance } from 'class-transformer';
import { Prescription } from '../entities/prescription.entity';
import { PrescriptionResponseDto } from '../dtos';

/**
 * Mapper pour convertir une entité Prescription en DTO de réponse
 */
export class PrescriptionMapper {
  /**
   * Convertit une entité Prescription en PrescriptionResponseDto
   */
  static toDto(prescription: Prescription): PrescriptionResponseDto {
    return plainToInstance(PrescriptionResponseDto, prescription, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Convertit un tableau d'entités Prescription en tableau de DTOs
   */
  static toDtoArray(prescriptions: Prescription[]): PrescriptionResponseDto[] {
    return prescriptions.map((prescription) => this.toDto(prescription));
  }
}

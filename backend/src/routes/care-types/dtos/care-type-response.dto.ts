import { CareType } from '../entities/care-type.entity';

/**
 * DTO de réponse pour un type de soin
 */
export class CareTypeResponseDto {
  id: string;
  label: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(careType: CareType) {
    this.id = careType.id;
    this.label = careType.label;
    this.createdAt = careType.createdAt;
    this.updatedAt = careType.updatedAt;
  }

  /**
   * Convertit une entité CareType en DTO de réponse
   */
  static fromEntity(careType: CareType): CareTypeResponseDto {
    return new CareTypeResponseDto(careType);
  }

  /**
   * Convertit un tableau d'entités CareType en tableau de DTOs
   */
  static fromEntities(careTypes: CareType[]): CareTypeResponseDto[] {
    return careTypes.map((careType) => CareTypeResponseDto.fromEntity(careType));
  }
}

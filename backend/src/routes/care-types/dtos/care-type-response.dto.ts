import { Exclude, Expose } from 'class-transformer';

/**
 * DTO de réponse pour un type de soin
 */
@Exclude()
export class CareTypeResponseDto {
  @Expose()
  id: string;

  @Expose()
  label: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

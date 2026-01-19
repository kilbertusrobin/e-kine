import { IsOptional, IsString } from 'class-validator';

/**
 * DTO pour mettre à jour une ordonnance
 * Tous les champs sont optionnels
 */
export class UpdatePrescriptionDto {
  /**
   * Nouvelles données du PDF en base64
   * Optionnel
   */
  @IsOptional()
  @IsString({ message: 'Le PDF doit être une chaîne base64' })
  pdfData?: string;

  /**
   * Nouveau nom du fichier PDF
   * Optionnel
   */
  @IsOptional()
  @IsString({ message: 'Le nom du fichier doit être une chaîne' })
  filename?: string;
}

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

/**
 * DTO pour créer une nouvelle ordonnance
 */
export class CreatePrescriptionDto {
  /**
   * Données du PDF en base64
   * Requis et non vide
   */
  @IsNotEmpty({ message: 'Le PDF est requis' })
  @IsString({ message: 'Le PDF doit être une chaîne base64' })
  pdfData: string;

  /**
   * Nom du fichier PDF original
   * Requis et non vide
   */
  @IsNotEmpty({ message: 'Le nom du fichier est requis' })
  @IsString({ message: 'Le nom du fichier doit être une chaîne' })
  filename: string;

  /**
   * ID de l'utilisateur propriétaire
   * Requis pour associer l'ordonnance à un utilisateur
   */
  @IsNotEmpty({ message: "L'ID utilisateur est requis" })
  @IsUUID('4', { message: "L'ID utilisateur doit être un UUID valide" })
  userId: string;
}

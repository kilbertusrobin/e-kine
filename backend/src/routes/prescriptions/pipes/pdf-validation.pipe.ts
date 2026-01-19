import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Pipe de validation pour les fichiers PDF
 * Valide que le fichier uploadé est bien un PDF
 */
@Injectable()
export class PdfValidationPipe implements PipeTransform {
  /**
   * Taille maximale du fichier en octets (10 MB)
   */
  private readonly maxSize = 10 * 1024 * 1024; // 10 MB

  /**
   * Types MIME acceptés pour les PDF
   */
  private readonly acceptedMimeTypes = ['application/pdf'];

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Validation du type MIME
    if (!this.acceptedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Type de fichier non valide. Seuls les fichiers PDF sont acceptés. Type reçu: ${file.mimetype}`,
      );
    }

    // Validation de la taille
    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `Le fichier est trop volumineux. Taille maximale: ${this.maxSize / 1024 / 1024} MB`,
      );
    }

    // Validation de l'extension
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'pdf') {
      throw new BadRequestException(
        `Extension de fichier non valide. Seuls les fichiers .pdf sont acceptés`,
      );
    }

    return file;
  }
}

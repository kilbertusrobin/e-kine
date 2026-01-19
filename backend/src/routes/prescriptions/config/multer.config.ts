import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

/**
 * Configuration Multer pour l'upload de fichiers
 * Utilise le stockage en mémoire pour pouvoir accéder au buffer
 */
export const multerConfig: MulterOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
};

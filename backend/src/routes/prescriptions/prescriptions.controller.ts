import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto, PrescriptionResponseDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { User } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { PdfValidationPipe } from './pipes';
import { multerConfig } from './config/multer.config';
import { normalizeFilename } from './utils';

/**
 * Controller de gestion des ordonnances
 */
@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  /**
   * POST /prescriptions
   * Crée une nouvelle ordonnance à partir d'un fichier PDF uploadé
   * Le fichier est automatiquement converti en base64 avant stockage
   *
   * @example
   * Content-Type: multipart/form-data
   * file: [fichier PDF]
   */
  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async create(
    @UploadedFile(new PdfValidationPipe()) file: Express.Multer.File,
    @CurrentUser() user: User,
  ): Promise<PrescriptionResponseDto> {
    // Convertir le buffer du fichier en base64
    const pdfBase64 = file.buffer.toString('base64');

    // Normaliser le nom du fichier pour éviter les problèmes d'encodage
    const normalizedFilename = normalizeFilename(file.originalname);

    // Créer l'ordonnance avec le PDF en base64, le nom du fichier et l'ID de l'utilisateur authentifié
    const createPrescriptionDto: CreatePrescriptionDto = {
      pdfData: pdfBase64,
      filename: normalizedFilename,
      userId: user.id,
    };

    const prescription = await this.prescriptionsService.create(createPrescriptionDto);
    return plainToInstance(PrescriptionResponseDto, prescription, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * GET /prescriptions
   * Récupère toutes les ordonnances
   */
  @Get()
  async findAll(): Promise<PrescriptionResponseDto[]> {
    const prescriptions = await this.prescriptionsService.findAll();
    return plainToInstance(PrescriptionResponseDto, prescriptions, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * GET /prescriptions/me
   * Récupère les ordonnances de l'utilisateur authentifié
   */
  @Get('me')
  async getMyPrescriptions(@CurrentUser() user: User): Promise<PrescriptionResponseDto[]> {
    const prescriptions = await this.prescriptionsService.findByUserId(user.id);
    return plainToInstance(PrescriptionResponseDto, prescriptions, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * GET /prescriptions/:id
   * Récupère une ordonnance par son ID
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<PrescriptionResponseDto> {
    const prescription = await this.prescriptionsService.findById(id);
    return plainToInstance(PrescriptionResponseDto, prescription, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * PUT /prescriptions/:id
   * Met à jour une ordonnance avec un nouveau fichier PDF
   *
   * @example
   * Content-Type: multipart/form-data
   * file: [fichier PDF]
   */
  @Put(':id')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async update(
    @Param('id') id: string,
    @UploadedFile(new PdfValidationPipe()) file: Express.Multer.File,
  ): Promise<PrescriptionResponseDto> {
    // Convertir le buffer du fichier en base64
    const pdfBase64 = file.buffer.toString('base64');

    // Normaliser le nom du fichier pour éviter les problèmes d'encodage
    const normalizedFilename = normalizeFilename(file.originalname);

    // Mettre à jour l'ordonnance avec le nouveau PDF et son nom
    const updatePrescriptionDto: UpdatePrescriptionDto = {
      pdfData: pdfBase64,
      filename: normalizedFilename,
    };

    const prescription = await this.prescriptionsService.update(id, updatePrescriptionDto);
    return plainToInstance(PrescriptionResponseDto, prescription, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * DELETE /prescriptions/:id
   * Supprime une ordonnance
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.prescriptionsService.delete(id);
  }
}

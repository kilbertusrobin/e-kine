import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dtos';

/**
 * Service de gestion des ordonnances
 */
@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
  ) {}

  /**
   * Crée une nouvelle ordonnance
   */
  async create(
    createPrescriptionDto: CreatePrescriptionDto,
  ): Promise<Prescription> {
    const prescription = this.prescriptionRepository.create(
      createPrescriptionDto,
    );
    return this.prescriptionRepository.save(prescription);
  }

  /**
   * Trouve toutes les ordonnances
   */
  async findAll(): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Trouve une ordonnance par son ID
   */
  async findById(id: string): Promise<Prescription | null> {
    return this.prescriptionRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  /**
   * Trouve toutes les ordonnances d'un utilisateur
   */
  async findByUserId(userId: string): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Met à jour une ordonnance
   */
  async update(
    id: string,
    updatePrescriptionDto: UpdatePrescriptionDto,
  ): Promise<Prescription> {
    const prescription = await this.findById(id);

    if (!prescription) {
      throw new NotFoundException('Ordonnance non trouvée');
    }

    await this.prescriptionRepository.update(id, updatePrescriptionDto);
    const updatedPrescription = await this.findById(id);

    if (!updatedPrescription) {
      throw new NotFoundException('Ordonnance non trouvée après mise à jour');
    }

    return updatedPrescription;
  }

  /**
   * Supprime une ordonnance
   */
  async delete(id: string): Promise<void> {
    const prescription = await this.findById(id);

    if (!prescription) {
      throw new NotFoundException('Ordonnance non trouvée');
    }

    await this.prescriptionRepository.delete(id);
  }

  /**
   * Supprime toutes les ordonnances d'un utilisateur
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.prescriptionRepository.delete({ userId });
  }
}

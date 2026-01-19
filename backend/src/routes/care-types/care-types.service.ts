import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CareType } from './entities/care-type.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';

/**
 * Service de gestion des types de soins
 */
@Injectable()
export class CareTypesService {
  constructor(
    @InjectRepository(CareType)
    private readonly careTypeRepository: Repository<CareType>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Récupère tous les types de soins disponibles
   */
  async findAll(): Promise<CareType[]> {
    return this.careTypeRepository.find({
      order: { label: 'ASC' },
    });
  }

  /**
   * Récupère un type de soin par son ID
   */
  async findById(id: string): Promise<CareType | null> {
    return this.careTypeRepository.findOne({
      where: { id },
    });
  }

  /**
   * Récupère les types de soins d'un praticien
   */
  async findByUserId(userId: string): Promise<CareType[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['careTypes'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user.careTypes || [];
  }

  /**
   * Met à jour les types de soins d'un praticien
   * Remplace entièrement les types de soins existants
   */
  async updateUserCareTypes(
    userId: string,
    careTypeIds: string[],
  ): Promise<CareType[]> {
    // Récupérer l'utilisateur avec ses types de soins actuels
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['careTypes'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier que l'utilisateur est bien un praticien
    if (user.role !== UserRole.PRACTITIONER) {
      throw new ForbiddenException(
        'Seuls les praticiens peuvent définir leurs types de soins',
      );
    }

    // Si le tableau est vide, supprimer tous les types de soins
    if (careTypeIds.length === 0) {
      user.careTypes = [];
      await this.userRepository.save(user);
      return [];
    }

    // Récupérer les types de soins correspondants aux IDs fournis
    const careTypes = await this.careTypeRepository.find({
      where: { id: In(careTypeIds) },
    });

    // Vérifier que tous les IDs fournis correspondent à des types de soins existants
    if (careTypes.length !== careTypeIds.length) {
      const foundIds = careTypes.map((ct) => ct.id);
      const notFoundIds = careTypeIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Types de soins non trouvés: ${notFoundIds.join(', ')}`,
      );
    }

    // Mettre à jour la relation
    user.careTypes = careTypes;
    await this.userRepository.save(user);

    return careTypes;
  }
}

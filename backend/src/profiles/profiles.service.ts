import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { CreateProfileDto, UpdateProfileDto } from './dto';

/**
 * Service de gestion des profils utilisateurs
 */
@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  /**
   * Crée un nouveau profil
   */
  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    const profile = this.profileRepository.create(createProfileDto);
    return this.profileRepository.save(profile);
  }

  /**
   * Trouve un profil par son ID
   */
  async findById(id: string): Promise<Profile | null> {
    return this.profileRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  /**
   * Trouve un profil par l'ID de l'utilisateur
   */
  async findByUserId(userId: string): Promise<Profile | null> {
    return this.profileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  /**
   * Met à jour un profil
   */
  async update(id: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.findById(id);

    if (!profile) {
      throw new NotFoundException('Profil non trouvé');
    }

    await this.profileRepository.update(id, updateProfileDto);
    const updatedProfile = await this.findById(id);

    if (!updatedProfile) {
      throw new NotFoundException('Profil non trouvé après mise à jour');
    }

    return updatedProfile;
  }

  /**
   * Met à jour un profil par userId
   */
  async updateByUserId(userId: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Profil non trouvé');
    }

    await this.profileRepository.update(profile.id, updateProfileDto);
    const updatedProfile = await this.findById(profile.id);

    if (!updatedProfile) {
      throw new NotFoundException('Profil non trouvé après mise à jour');
    }

    return updatedProfile;
  }

  /**
   * Supprime un profil
   */
  async delete(id: string): Promise<void> {
    await this.profileRepository.delete(id);
  }

  /**
   * Supprime un profil par userId
   */
  async deleteByUserId(userId: string): Promise<void> {
    const profile = await this.findByUserId(userId);
    if (profile) {
      await this.profileRepository.delete(profile.id);
    }
  }
}

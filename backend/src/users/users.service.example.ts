import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserRole } from './enums/user-role.enum';

/**
 * EXEMPLE de service Users
 * À implémenter selon vos besoins
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Crée un nouvel utilisateur (appelé lors de l'inscription Google OAuth)
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  /**
   * Trouve un utilisateur par son email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  /**
   * Trouve un utilisateur par son Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { googleId },
    });
  }

  /**
   * Trouve un utilisateur par son ID
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  /**
   * Met à jour un utilisateur
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    const user = await this.findById(id);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user;
  }

  /**
   * Met à jour la date de dernière connexion
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }


  /**
   * Désactive un compte utilisateur
   */
  async deactivate(id: string): Promise<User> {
    return this.update(id, { isActive: false });
  }

  /**
   * Réactive un compte utilisateur
   */
  async activate(id: string): Promise<User> {
    return this.update(id, { isActive: true });
  }

  /**
   * Vérifie si un utilisateur peut se connecter
   */
  async canLogin(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user ? user.canLogin() : false;
  }
}

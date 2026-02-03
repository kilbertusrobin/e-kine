import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { googleId },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findAllPractitioners(): Promise<User[]> {
    return this.userRepository.find({
      where: {
        role: UserRole.PRACTITIONER,
        isActive: true,
      },
      relations: ['profile', 'careTypes'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    const user = await this.findById(id);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async deactivate(id: string): Promise<User> {
    return this.update(id, { isActive: false });
  }

  async activate(id: string): Promise<User> {
    return this.update(id, { isActive: true });
  }

  async canLogin(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user ? user.canLogin() : false;
  }
}

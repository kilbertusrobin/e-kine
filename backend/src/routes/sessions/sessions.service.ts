import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Session } from './entities/session.entity';
import { randomBytes } from 'crypto';

/**
 * Service de gestion des sessions utilisateur
 */
@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  /**
   * Crée une nouvelle session avec refresh token
   */
  async create(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<Session> {
    const refreshToken = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 jours

    const session = this.sessionRepository.create({
      userId,
      refreshToken,
      deviceInfo,
      ipAddress,
      expiresAt,
    });

    return this.sessionRepository.save(session);
  }

  /**
   * Trouve une session par son refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.sessionRepository.findOne({
      where: { refreshToken },
      relations: ['user'],
    });
  }

  /**
   * Trouve toutes les sessions d'un utilisateur
   */
  async findByUserId(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Supprime une session (logout)
   */
  async delete(refreshToken: string): Promise<void> {
    await this.sessionRepository.delete({ refreshToken });
  }

  /**
   * Supprime toutes les sessions d'un utilisateur
   */
  async deleteAllByUserId(userId: string): Promise<void> {
    await this.sessionRepository.delete({ userId });
  }

  /**
   * Supprime les sessions expirées (à exécuter périodiquement)
   */
  async deleteExpiredSessions(): Promise<void> {
    await this.sessionRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  /**
   * Renouvelle une session (nouveau refresh token)
   */
  async refresh(oldRefreshToken: string): Promise<Session | null> {
    const session = await this.findByRefreshToken(oldRefreshToken);

    if (!session || session.isExpired()) {
      return null;
    }

    // Génère un nouveau refresh token
    const newRefreshToken = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.sessionRepository.update(session.id, {
      refreshToken: newRefreshToken,
      expiresAt,
    });

    return this.findByRefreshToken(newRefreshToken);
  }
}

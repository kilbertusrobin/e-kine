import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Entité Session - Gère les refresh tokens pour JWT
 * Permet de révoquer les sessions et gérer les tokens expirés
 */
@Entity('sessions')
export class Session {
  /**
   * Identifiant unique de la session
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Utilisateur propriétaire de la session
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * ID de l'utilisateur (pour les requêtes)
   */
  @Column({ type: 'uuid', name: 'user_id' })
  @Index()
  userId: string;

  /**
   * Refresh token (UUID unique)
   */
  @Column({ type: 'text', unique: true, name: 'refresh_token' })
  @Index()
  refreshToken: string;

  /**
   * Informations sur le device/navigateur
   */
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'device_info' })
  deviceInfo: string | null;

  /**
   * Adresse IP de connexion
   */
  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string | null;

  /**
   * Date d'expiration du refresh token
   */
  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  /**
   * Date de création de la session
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Date de dernière mise à jour
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Vérifie si la session est expirée
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Vérifie si la session est valide (non expirée)
   */
  isValid(): boolean {
    return !this.isExpired();
  }
}

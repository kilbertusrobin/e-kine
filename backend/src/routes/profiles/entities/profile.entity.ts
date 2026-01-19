import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Entité Profile
 * Stocke les informations de profil d'un utilisateur
 * Relation one-to-one avec User
 */
@Entity('profiles')
export class Profile {
  /**
   * Identifiant unique du profil
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Nom de famille
   */
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'last_name' })
  lastName: string | null;

  /**
   * Prénom
   */
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'first_name' })
  firstName: string | null;

  /**
   * Adresse
   */
  @Column({ type: 'text', nullable: true })
  address: string | null;

  /**
   * Ville
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  /**
   * Code postal
   */
  @Column({ type: 'varchar', length: 10, nullable: true })
  pc: string | null;

  /**
   * Numéro de téléphone
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  /**
   * ID de l'utilisateur (relation one-to-one)
   */
  @Column({ type: 'uuid', unique: true, name: 'user_id' })
  userId: string;

  /**
   * Relation one-to-one avec User
   */
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Date de création
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Date de dernière modification
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

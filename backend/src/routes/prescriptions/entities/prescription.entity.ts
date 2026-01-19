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
 * Entité Prescription
 * Stocke les ordonnances au format PDF (base64)
 * Relation many-to-one avec User
 */
@Entity('prescriptions')
export class Prescription {
  /**
   * Identifiant unique de l'ordonnance
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Données du PDF en base64
   * Stocké en TEXT pour supporter les fichiers volumineux
   */
  @Column({ type: 'text', name: 'pdf_data' })
  pdfData: string;

  /**
   * Nom du fichier PDF original
   */
  @Column({ type: 'varchar', length: 255 })
  filename: string;

  /**
   * ID de l'utilisateur propriétaire de l'ordonnance
   */
  @Column({ type: 'uuid', name: 'user_id' })
  @Index()
  userId: string;

  /**
   * Relation many-to-one avec User
   * Une ordonnance appartient à un utilisateur
   * Un utilisateur peut avoir plusieurs ordonnances
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Date de création de l'ordonnance
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Date de dernière modification
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

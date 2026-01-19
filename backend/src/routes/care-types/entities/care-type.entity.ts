import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Entité CareType - Représente un type de soin disponible
 * Ex: Kinésithérapie, Massage, Ostéopathie, etc.
 */
@Entity('care_types')
export class CareType {
  /**
   * Identifiant unique du type de soin (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Libellé du type de soin
   * Ex: "Kinésithérapie", "Massage", "Ostéopathie"
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  label: string;

  /**
   * Date de création
   * Généré automatiquement par TypeORM
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Date de dernière modification
   * Mis à jour automatiquement par TypeORM
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Relation ManyToMany avec User (praticiens qui pratiquent ce type de soin)
   * Côté inverse de la relation (la table de jointure est définie dans User)
   */
  @ManyToMany(() => User, (user) => user.careTypes)
  practitioners: User[];
}

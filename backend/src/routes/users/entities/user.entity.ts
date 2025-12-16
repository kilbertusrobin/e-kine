import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { Profile } from '../../profiles/entities/profile.entity';

/**
 * Entité User - Représente un utilisateur du système (Patient ou Praticien)
 * Authentification uniquement via Google OAuth
 */
@Entity('users')
export class User {
  /**
   * Identifiant unique de l'utilisateur (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Email de l'utilisateur (provenant de Google)
   * Unique et indexé pour les recherches rapides
   */
  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  /**
   * Identifiant Google de l'utilisateur (Google sub)
   * Unique et obligatoire pour l'authentification OAuth
   */
  @Column({ type: 'varchar', length: 255, unique: true, name: 'google_id' })
  @Index()
  googleId: string;

  /**
   * URL de la photo de profil Google
   * Peut être null si l'utilisateur n'a pas de photo
   */
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'google_picture' })
  googlePicture: string | null;

  /**
   * Rôle de l'utilisateur (patient ou practitioner)
   * Défini lors de l'inscription et non modifiable
   */
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  /**
   * Indique si le compte est actif
   * false = compte désactivé/suspendu par un admin
   */
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  /**
   * Indique si l'email est vérifié (toujours true pour Google OAuth)
   */
  @Column({ type: 'boolean', default: true, name: 'email_verified' })
  emailVerified: boolean;

  /**
   * Date et heure de la dernière connexion
   * Mis à jour à chaque login
   */
  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date | null;

  /**
   * Date de création du compte
   * Généré automatiquement par TypeORM
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Date de dernière modification du compte
   * Mis à jour automatiquement par TypeORM
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Relation one-to-one avec Profile
   */
  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
    eager: false,
  })
  profile: Profile;

  /**
   * Vérifie si l'utilisateur est un patient
   */
  isPatient(): boolean {
    return this.role === UserRole.PATIENT;
  }

  /**
   * Vérifie si l'utilisateur est un praticien
   */
  isPractitioner(): boolean {
    return this.role === UserRole.PRACTITIONER;
  }

  /**
   * Vérifie si l'utilisateur peut se connecter
   * Un utilisateur doit simplement être actif
   */
  canLogin(): boolean {
    return this.isActive;
  }
}

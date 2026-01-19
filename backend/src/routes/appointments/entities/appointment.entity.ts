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
import { CareType } from '../../care-types/entities/care-type.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';

/**
 * Entité Appointment - Représente un rendez-vous entre un patient et un praticien
 *
 * Contraintes métier (validées dans le service) :
 * - Créneaux de 30 minutes fixes (9h, 9h30, 10h, etc.)
 * - Horaires : 9h-13h et 14h-17h
 * - Pas de weekend (samedi/dimanche)
 * - Un praticien ne peut pas avoir 2 RDV au même créneau
 */
@Entity('appointments')
@Index(['practitionerId', 'dateTime'], { unique: true }) // Empêche les doublons praticien + créneau
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID du praticien (kinésithérapeute)
   */
  @Column({ name: 'practitioner_id' })
  @Index()
  practitionerId: string;

  /**
   * Relation avec le praticien
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: User;

  /**
   * ID du patient
   */
  @Column({ name: 'patient_id' })
  @Index()
  patientId: string;

  /**
   * Relation avec le patient
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  /**
   * ID du type de soin (optionnel)
   */
  @Column({ name: 'care_type_id', nullable: true })
  careTypeId: string | null;

  /**
   * Relation avec le type de soin
   */
  @ManyToOne(() => CareType, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'care_type_id' })
  careType: CareType | null;

  /**
   * Date et heure du rendez-vous (début du créneau)
   * Toujours sur des créneaux de 30 minutes (9h00, 9h30, 10h00, etc.)
   */
  @Column({ name: 'date_time', type: 'timestamp with time zone' })
  @Index()
  dateTime: Date;

  /**
   * Statut du rendez-vous
   */
  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.CONFIRMED,
  })
  status: AppointmentStatus;

  /**
   * Notes ou commentaires sur le rendez-vous (optionnel)
   */
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Vérifie si le RDV est annulable (pas déjà annulé ou terminé)
   */
  isCancellable(): boolean {
    return (
      this.status !== AppointmentStatus.CANCELLED &&
      this.status !== AppointmentStatus.COMPLETED
    );
  }

  /**
   * Vérifie si le RDV est dans le passé
   */
  isPast(): boolean {
    return new Date() > this.dateTime;
  }
}

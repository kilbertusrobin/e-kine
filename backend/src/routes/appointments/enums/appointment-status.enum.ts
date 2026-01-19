/**
 * Statuts possibles d'un rendez-vous
 */
export enum AppointmentStatus {
  /** RDV confirmé (statut par défaut à la création) */
  CONFIRMED = 'confirmed',
  /** RDV annulé */
  CANCELLED = 'cancelled',
  /** RDV terminé */
  COMPLETED = 'completed',
}

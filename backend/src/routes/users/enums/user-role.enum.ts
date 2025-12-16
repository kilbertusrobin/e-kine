/**
 * Enum définissant les rôles utilisateurs dans l'application
 */
export enum UserRole {
  /**
   * Patient - Utilisateur cherchant à prendre rendez-vous
   */
  PATIENT = 'patient',

  /**
   * Praticien - Kinésithérapeute gérant son planning et ses patients
   */
  PRACTITIONER = 'practitioner',
}

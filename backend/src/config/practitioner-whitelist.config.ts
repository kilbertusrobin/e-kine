/**
 * Whitelist des emails autorisés à avoir le rôle PRACTITIONER (kinésithérapeute)
 * Tous les autres emails auront automatiquement le rôle PATIENT
 */
export const PRACTITIONER_EMAIL_WHITELIST: string[] = [
  'rbx.fay@gmail.com',
];

/**
 * Vérifie si un email est dans la whitelist des praticiens
 * @param email - Email à vérifier
 * @returns true si l'email est un praticien, false sinon
 */
export function isPractitionerEmail(email: string): boolean {
  return PRACTITIONER_EMAIL_WHITELIST.includes(email.toLowerCase());
}

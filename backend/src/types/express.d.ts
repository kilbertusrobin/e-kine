/**
 * Extension des types Express pour ajouter la propriété user
 * Utilisé par Passport pour attacher l'utilisateur à la requête
 */
declare namespace Express {
  export interface Request {
    user?: any;
  }
}

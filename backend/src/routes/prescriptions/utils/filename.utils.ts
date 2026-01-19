/**
 * Normalise le nom d'un fichier en remplaçant les caractères spéciaux
 * par leurs équivalents ASCII standard
 */
export function normalizeFilename(filename: string): string {
  return filename
    // Normalise les caractères Unicode (décompose les accents, etc.)
    .normalize('NFD')
    // Supprime les diacritiques (accents)
    .replace(/[\u0300-\u036f]/g, '')
    // Remplace les tirets spéciaux par des tirets standards
    .replace(/[\u2010-\u2015\u2212]/g, '-') // Différents types de tirets
    // Remplace les espaces insécables par des espaces normaux
    .replace(/\u00A0/g, ' ')
    // Remplace les guillemets spéciaux par des guillemets standards
    .replace(/[\u2018\u2019]/g, "'") // Apostrophes typographiques
    .replace(/[\u201C\u201D]/g, '"') // Guillemets typographiques
    // Normalise à nouveau en forme composée (recompose si possible)
    .normalize('NFC')
    // Trim les espaces
    .trim();
}

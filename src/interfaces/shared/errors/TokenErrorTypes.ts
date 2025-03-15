/**
 * Errores relacionados con tokens de autenticación
 */
export enum TokenErrorTypes {
  TOKEN_MISSING = "TOKEN_MISSING", // No se proporcionó token
  TOKEN_INVALID_FORMAT = "TOKEN_INVALID_FORMAT", // Formato Bearer inválido
  TOKEN_EXPIRED = "TOKEN_EXPIRED", // Token expirado
  TOKEN_MALFORMED = "TOKEN_MALFORMED", // Token mal formado (no decodificable)
  TOKEN_INVALID_SIGNATURE = "TOKEN_INVALID_SIGNATURE", // Firma inválida
  TOKEN_WRONG_ROLE = "TOKEN_WRONG_ROLE", // Token tiene rol equivocado
}

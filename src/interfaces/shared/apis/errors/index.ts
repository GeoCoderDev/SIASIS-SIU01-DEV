/**
 * Errores relacionados con parámetros de solicitudes HTTP
 */
export enum RequestErrorTypes {
  INVALID_PARAMETERS = "INVALID_PARAMETERS",
  MISSING_PARAMETERS = "MISSING_PARAMETERS",
}

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

/**
 * Errores relacionados con usuarios
 */
export enum UserErrorTypes {
  USER_NOT_FOUND = "USER_NOT_FOUND", // Usuario no encontrado
  USER_INACTIVE = "USER_INACTIVE", // El usuario está inactivo
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
}

/**
 * Errores relacionados con roles y permisos
 */
export enum PermissionErrorTypes {
  ROLE_BLOCKED = "ROLE_BLOCKED", // El rol está temporalmente bloqueado
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS", // Sin permisos suficientes
}

/**
 * Errores técnicos del sistema
 */
export enum SystemErrorTypes {
  DATABASE_ERROR = "DATABASE_ERROR", // Error al conectar con la base de datos
  UNKNOWN_ERROR = "UNKNOWN_ERROR", // Error desconocido
}

// Errores relacionados a validaciones de datos

export enum ValidationErrorTypes {
  INVALID_DNI = "INVALID_DNI",
  INVALID_GENDER = "INVALID_GENDER",
  INVALID_PHONE = "INVALID_PHONE",
  INVALID_EMAIL = "INVALID_EMAIL",
  INVALID_USERNAME = "INVALID_USERNAME",
  INVALID_NAME = "INVALID_NAME",
  INVALID_LASTNAME = "INVALID_LASTNAME",
  STRING_TOO_LONG = "STRING_TOO_LONG",
  FIELD_REQUIRED = "FIELD_REQUIRED",
  INVALID_FORMAT = "INVALID_FORMAT",
}

export enum DataConflictErrorTypes {
  VALUE_ALREADY_IN_USE = "CONFLICTO_VALOR_YA_EN_USO",
  RECORD_NOT_FOUND = "CONFLICTO_REGISTRO_NO_ENCONTRADO",
  RELATED_DATA_EXISTS = "CONFLICTO_DATOS_RELACIONADOS_EXISTEN",
  DATABASE_CONSTRAINT = "CONFLICTO_RESTRICCIÓN_BASE_DATOS",
}

type AllErrorTypes =
  | RequestErrorTypes
  | TokenErrorTypes
  | UserErrorTypes
  | PermissionErrorTypes
  | SystemErrorTypes
  | ValidationErrorTypes
  | DataConflictErrorTypes;

export default AllErrorTypes;

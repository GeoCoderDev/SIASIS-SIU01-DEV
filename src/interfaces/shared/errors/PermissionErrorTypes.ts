/**
 * Errores relacionados con roles y permisos
 */
export enum PermissionErrorTypes {
    ROLE_BLOCKED = "ROLE_BLOCKED",            // El rol está temporalmente bloqueado
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS", // Sin permisos suficientes
  }
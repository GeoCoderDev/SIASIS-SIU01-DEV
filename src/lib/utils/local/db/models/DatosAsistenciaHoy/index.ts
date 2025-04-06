import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import datosAsistenciaHoyDirectivoIDB from "./DatosAsistenciaHoyDirectivoIDB";
import datosAsistenciaHoyProfesorPrimariaIDB from "./DatosAsistenciaHoyProfesorPrimariaIDB";
import datosAsistenciaHoyAuxiliarIDB from "./DatosAsistenciaHoyAuxiliarIDB";
import datosAsistenciaHoyProfesorSecundariaIDB from "./DatosAsistenciaHoyProfesorSecundariaIDB";
import datosAsistenciaHoyTutorSecundariaIDB from "./DatosAsistenciaHoyTutorSecundariaIDB";
import datosAsistenciaHoyResponsableIDB from "./DatosAsistenciaHoyResponsableIDB";
import datosAsistenciaHoyPersonalAdministrativoIDB from "./DatosAsistenciaHoyPersonalAdministrativoIDB";


/**
 * Obtiene el almacén de datos de asistencia según el rol
 * @param rol Rol del usuario
 * @returns Instancia de BaseAsistenciaStorage correspondiente al rol
 */
export function obtenerAsistenciaStoragePorRol(
  rol: RolesSistema
) {
  switch (rol) {
    case RolesSistema.Directivo:
      return datosAsistenciaHoyDirectivoIDB;
    case RolesSistema.ProfesorPrimaria:
      return datosAsistenciaHoyProfesorPrimariaIDB;
    case RolesSistema.Auxiliar:
      return datosAsistenciaHoyAuxiliarIDB;
    case RolesSistema.ProfesorSecundaria:
      return datosAsistenciaHoyProfesorSecundariaIDB;
    case RolesSistema.Tutor:
      return datosAsistenciaHoyTutorSecundariaIDB;
    case RolesSistema.Responsable:
      return datosAsistenciaHoyResponsableIDB;
    case RolesSistema.PersonalAdministrativo:
      return datosAsistenciaHoyPersonalAdministrativoIDB;
    default:
      throw new Error(`Rol no soportado: ${rol}`);
  }
}

/**
 * Limpia todos los datos de asistencia de la caché local
 * Útil al cerrar sesión
 */
export async function limpiarDatosAsistenciaCache(): Promise<void> {
  try {
    // Usamos cualquier almacén, ya que el método está en la clase base
    await datosAsistenciaHoyDirectivoIDB.limpiarDatosAsistencia();
    console.log(
      "Datos de asistencia eliminados correctamente de la caché local"
    );
  } catch (error) {
    console.error("Error al limpiar datos de asistencia:", error);
  }
}

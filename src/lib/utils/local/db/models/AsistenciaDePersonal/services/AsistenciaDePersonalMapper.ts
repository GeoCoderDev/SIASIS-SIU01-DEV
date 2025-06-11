/* eslint-disable @typescript-eslint/no-explicit-any */
import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import { ActoresSistema } from "@/interfaces/shared/ActoresSistema";
import { ModoRegistro } from "@/interfaces/shared/ModoRegistroPersonal";
import { EstadosAsistenciaPersonal } from "@/interfaces/shared/EstadosAsistenciaPersonal";
import {
  MINUTOS_TOLERANCIA_ENTRADA_PERSONAL,
  MINUTOS_TOLERANCIA_SALIDA_PERSONAL,
} from "@/constants/MINUTOS_TOLERANCIA_ASISTENCIA_PERSONAL";

// Enumeración para los diferentes tipos de personal
export enum TipoPersonal {
  PROFESOR_PRIMARIA = "profesor_primaria",
  PROFESOR_SECUNDARIA = "profesor_secundaria",
  AUXILIAR = "auxiliar",
  PERSONAL_ADMINISTRATIVO = "personal_administrativo",
}

// Interfaces para los registros de entrada/salida
export interface RegistroEntradaSalida {
  timestamp: number;
  desfaseSegundos: number;
  estado: EstadosAsistenciaPersonal;
}

/**
 * 🎯 RESPONSABILIDAD: Conversiones y mapeo entre diferentes tipos de datos
 * - Mapeo de roles a tipos de personal
 * - Mapeo de datos entre diferentes formatos
 * - Determinación de estados de asistencia
 * - Generación de nombres de campos y stores
 */
export class AsistenciaDePersonalMapper {
  /**
   * Convierte un rol del sistema al tipo de personal correspondiente
   */
  public obtenerTipoPersonalDesdeRolOActor(
    rol: RolesSistema | ActoresSistema
  ): TipoPersonal {
    switch (rol) {
      case RolesSistema.ProfesorPrimaria:
      case ActoresSistema.ProfesorPrimaria:
        return TipoPersonal.PROFESOR_PRIMARIA;
      case RolesSistema.ProfesorSecundaria:
      case RolesSistema.Tutor:
      case ActoresSistema.ProfesorSecundaria:
        return TipoPersonal.PROFESOR_SECUNDARIA;
      case RolesSistema.Auxiliar:
      case ActoresSistema.Auxiliar:
        return TipoPersonal.AUXILIAR;
      case RolesSistema.PersonalAdministrativo:
      case ActoresSistema.PersonalAdministrativo:
        return TipoPersonal.PERSONAL_ADMINISTRATIVO;
      default:
        throw new Error(`Rol no válido o no soportado: ${rol}`);
    }
  }

  /**
   * Mapea rol del sistema a actor
   */
  public obtenerActorDesdeRol(rol: RolesSistema): ActoresSistema {
    switch (rol) {
      case RolesSistema.ProfesorPrimaria:
        return ActoresSistema.ProfesorPrimaria;
      case RolesSistema.ProfesorSecundaria:
      case RolesSistema.Tutor:
        return ActoresSistema.ProfesorSecundaria;
      case RolesSistema.Auxiliar:
        return ActoresSistema.Auxiliar;
      case RolesSistema.PersonalAdministrativo:
        return ActoresSistema.PersonalAdministrativo;
      default:
        throw new Error(`Rol no válido para asistencia personal: ${rol}`);
    }
  }

  /**
   * Obtiene el nombre del almacén según el tipo de personal y el modo de registro
   */
  public getStoreName(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro
  ): string {
    const storeMapping = {
      [TipoPersonal.PROFESOR_PRIMARIA]: {
        [ModoRegistro.Entrada]: "control_entrada_profesores_primaria",
        [ModoRegistro.Salida]: "control_salida_profesores_primaria",
      },
      [TipoPersonal.PROFESOR_SECUNDARIA]: {
        [ModoRegistro.Entrada]: "control_entrada_profesores_secundaria",
        [ModoRegistro.Salida]: "control_salida_profesores_secundaria",
      },
      [TipoPersonal.AUXILIAR]: {
        [ModoRegistro.Entrada]: "control_entrada_auxiliar",
        [ModoRegistro.Salida]: "control_salida_auxiliar",
      },
      [TipoPersonal.PERSONAL_ADMINISTRATIVO]: {
        [ModoRegistro.Entrada]: "control_entrada_personal_administrativo",
        [ModoRegistro.Salida]: "control_salida_personal_administrativo",
      },
    };

    return storeMapping[tipoPersonal][modoRegistro];
  }

  /**
   * Obtiene el nombre del campo de identificación según el tipo de personal
   */
  public getIdFieldName(tipoPersonal: TipoPersonal): string {
    const fieldMapping = {
      [TipoPersonal.PROFESOR_PRIMARIA]: "DNI_Profesor_Primaria",
      [TipoPersonal.PROFESOR_SECUNDARIA]: "DNI_Profesor_Secundaria",
      [TipoPersonal.AUXILIAR]: "DNI_Auxiliar",
      [TipoPersonal.PERSONAL_ADMINISTRATIVO]: "DNI_Personal_Administrativo",
    };

    return fieldMapping[tipoPersonal];
  }

  /**
   * Obtiene el nombre del campo ID según el tipo de personal y modo de registro
   */
  public getIdFieldForStore(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro
  ): string {
    const prefijo =
      modoRegistro === ModoRegistro.Entrada ? "Id_C_E_M_P_" : "Id_C_S_M_P_";

    switch (tipoPersonal) {
      case TipoPersonal.PROFESOR_PRIMARIA:
        return `${prefijo}Profesores_Primaria`;
      case TipoPersonal.PROFESOR_SECUNDARIA:
        return `${prefijo}Profesores_Secundaria`;
      case TipoPersonal.AUXILIAR:
        return `${prefijo}Auxiliar`;
      case TipoPersonal.PERSONAL_ADMINISTRATIVO:
        return `${prefijo}Administrativo`;
      default:
        throw new Error(`Tipo de personal no soportado: ${tipoPersonal}`);
    }
  }

  /**
   * Obtiene el nombre del índice para la búsqueda por personal y mes
   */
  public getIndexNameForPersonalMes(tipoPersonal: TipoPersonal): string {
    const indexMapping = {
      [TipoPersonal.PROFESOR_PRIMARIA]: "por_profesor_mes",
      [TipoPersonal.PROFESOR_SECUNDARIA]: "por_profesor_mes",
      [TipoPersonal.AUXILIAR]: "por_auxiliar_mes",
      [TipoPersonal.PERSONAL_ADMINISTRATIVO]: "por_administrativo_mes",
    };

    return indexMapping[tipoPersonal] || "por_profesor_mes";
  }

  /**
   * Determina el estado de asistencia basado en el desfase de tiempo
   */
  public determinarEstadoAsistencia(
    desfaseSegundos: number,
    modoRegistro: ModoRegistro
  ): EstadosAsistenciaPersonal {
    const TOLERANCIA_TARDANZA = MINUTOS_TOLERANCIA_ENTRADA_PERSONAL * 60;
    const TOLERANCIA_TEMPRANO = MINUTOS_TOLERANCIA_SALIDA_PERSONAL * 60;

    if (modoRegistro === ModoRegistro.Entrada) {
      if (desfaseSegundos <= 0) {
        return EstadosAsistenciaPersonal.En_Tiempo;
      } else if (desfaseSegundos <= TOLERANCIA_TARDANZA) {
        return EstadosAsistenciaPersonal.En_Tiempo; // Tolerancia de 5 minutos
      } else {
        return EstadosAsistenciaPersonal.Tarde;
      }
    } else {
      if (desfaseSegundos >= 0) {
        return EstadosAsistenciaPersonal.Cumplido;
      } else if (desfaseSegundos >= -TOLERANCIA_TEMPRANO) {
        return EstadosAsistenciaPersonal.Cumplido; // Tolerancia de 15 minutos
      } else {
        return EstadosAsistenciaPersonal.Salida_Anticipada;
      }
    }
  }

  /**
   * Procesa los registros JSON de la API
   */
  public procesarRegistrosJSON(
    registrosJSON: any,
    modoRegistro: ModoRegistro
  ): Record<string, RegistroEntradaSalida> {
    const registrosProcesados: Record<string, RegistroEntradaSalida> = {};

    Object.entries(registrosJSON).forEach(
      ([dia, registroRaw]: [string, any]) => {
        if (registroRaw === null) {
          registrosProcesados[dia] = {
            timestamp: 0,
            desfaseSegundos: 0,
            estado: EstadosAsistenciaPersonal.Inactivo,
          };
          return;
        }

        if (registroRaw && typeof registroRaw === "object") {
          const timestamp = registroRaw.Timestamp;
          const desfaseSegundos = registroRaw.DesfaseSegundos;

          if (timestamp === null && desfaseSegundos === null) {
            registrosProcesados[dia] = {
              timestamp: 0,
              desfaseSegundos: 0,
              estado: EstadosAsistenciaPersonal.Falta,
            };
            return;
          }

          if (timestamp === null) {
            registrosProcesados[dia] = {
              timestamp: 0,
              desfaseSegundos: 0,
              estado: EstadosAsistenciaPersonal.Inactivo,
            };
            return;
          }

          if (desfaseSegundos === null) {
            registrosProcesados[dia] = {
              timestamp: timestamp || 0,
              desfaseSegundos: 0,
              estado: EstadosAsistenciaPersonal.Sin_Registro,
            };
            return;
          }

          const estado = this.determinarEstadoAsistencia(
            desfaseSegundos,
            modoRegistro
          );

          registrosProcesados[dia] = {
            timestamp: timestamp || 0,
            desfaseSegundos: desfaseSegundos || 0,
            estado,
          };
        }
      }
    );

    return registrosProcesados;
  }

  /**
   * Genera clave para cache (formato compatible con Redis)
   */
  public generarClaveCache(
    actor: ActoresSistema,
    modoRegistro: ModoRegistro,
    dni: string,
    fecha: string
  ): string {
    return `${fecha}:${modoRegistro}:${actor}:${dni}`;
  }
}

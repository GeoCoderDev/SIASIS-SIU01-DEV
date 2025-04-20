import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import {
  AuxiliarAsistenciaResponse,
  BaseAsistenciaResponse,
  DirectivoAsistenciaResponse,
  PersonalAdministrativoAsistenciaResponse,
  ProfesorPrimariaAsistenciaResponse,
  ProfesorTutorSecundariaAsistenciaResponse,
  ResponsableAsistenciaResponse,
} from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";
import IndexedDBConnection from "../../IndexedDBConnection";
import { LogoutTypes, ErrorDetailsForLogout } from "@/interfaces/LogoutTypes";
import { logout } from "@/lib/helpers/logout";
import store from "@/global/store";
import { HandlerDirectivoAsistenciaResponse } from "./handlers/HandlerDirectivoAsistenciaResponse";
import { HandlerProfesorPrimariaAsistenciaResponse } from "./handlers/HandlerProfesorPrimariaAsistenciaResponse";
import { HandlerAuxiliarAsistenciaResponse } from "./handlers/HandlerAuxiliarAsistenciaResponse";
import { HandlerProfesorTutorSecundariaAsistenciaResponse } from "./handlers/HandlerProfesorTutorSecundariaAsistenciaResponse";
import { HandlerResponsableAsistenciaResponse } from "./handlers/HandlerResponsableAsistenciaResponse";
import { HandlerPersonalAdministrativoAsistenciaResponse } from "./handlers/HandlerPersonalAdministrativoAsistenciaResponse";
import userStorage from "../UserStorage";

// Interfaz para el objeto guardado en IndexedDB
export interface DatosAsistenciaAlmacenados {
  id: string; // 'datos_actuales'
  rol: RolesSistema;
  datos: BaseAsistenciaResponse;
  fechaGuardado: string;
}

export class DatosAsistenciaHoyIDB {
  protected storeName: string = "datos_asistencia_hoy";
  protected static STORAGE_KEY = "datos_asistencia_actuales";

  /**
   * Maneja los errores según su tipo y realiza logout si es necesario
   */
  private handleError(
    error: unknown,
    operacion: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    detalles?: Record<string, any>
  ): void {
    console.error(
      `Error en DatosAsistenciaHoyAlmacenamiento (${operacion}):`,
      error
    );

    const errorDetails: ErrorDetailsForLogout = {
      origen: `DatosAsistenciaHoyAlmacenamiento.${operacion}`,
      mensaje: error instanceof Error ? error.message : String(error),
      timestamp: Date.now(),
      contexto: JSON.stringify(detalles || {}),
      siasisComponent: "CLN02", // Considera externalizar o configurar esto
    };

    let logoutType: LogoutTypes;

    if (error instanceof Error) {
      if (error.name === "QuotaExceededError" || error.name === "AbortError") {
        logoutType = LogoutTypes.ERROR_BASE_DATOS;
      } else if (
        error.message.includes("fetch") ||
        error.message.includes("network")
      ) {
        logoutType = LogoutTypes.ERROR_RED;
      } else if (
        error.message.includes("JSON") ||
        error.message.includes("parse")
      ) {
        logoutType = LogoutTypes.ERROR_DATOS_CORRUPTOS;
      } else {
        logoutType = LogoutTypes.ERROR_SISTEMA;
      }
    } else {
      logoutType = LogoutTypes.ERROR_SISTEMA;
    }

    logout(logoutType, errorDetails);
  }

  /**
   * Obtiene la fecha actual desde el estado de Redux
   * @returns Objeto Date con la fecha actual según el estado global o null si no se puede obtener.
   */
  private obtenerFechaActualDesdeRedux(): Date | null {
    try {
      // Obtenemos el estado actual de Redux
      const state = store.getState();

      // Accedemos a la fecha del estado global
      const fechaHoraRedux = state.others.fechaHoraActualReal.fechaHora;

      // Si tenemos fecha en Redux, la usamos
      if (fechaHoraRedux) {
        return new Date(fechaHoraRedux);
      }

      // Si no se puede obtener la fecha de Redux, retornamos null
      return null;
    } catch (error) {
      console.error(
        "Error al obtener fecha desde Redux en DatosAsistenciaHoyAlmacenamiento:",
        error
      );
      return null;
    }
  }

  /**
   * Formatea una fecha en formato ISO sin la parte de tiempo
   */
  private formatearFechaSoloDia(fecha: Date): string {
    return fecha.toISOString().split("T")[0];
  }

  /**
   * Compara si dos fechas ISO (solo día) son el mismo día
   */
  private esMismoDia(fecha1ISO: string, fecha2ISO: string): boolean {
    return fecha1ISO === fecha2ISO;
  }

  /**
   * Verifica si la fecha proporcionada corresponde a un sábado o domingo (Perú time).
   */
  private esFinDeSemana(fecha: Date | null): boolean {
    if (!fecha) {
      return false; // Si no hay fecha, no es fin de semana para esta lógica
    }
    const dayOfWeek = fecha.getUTCDay(); // 0 (Domingo) - 6 (Sábado)
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  /**
   * Obtiene los datos del servidor y los almacena en IndexedDB
   */
  private async fetchDatosFromServer(): Promise<BaseAsistenciaResponse> {
    try {
      const response = await fetch("/api/datos-asistencia-hoy");
      if (!response.ok) {
        throw new Error(
          `Error en la respuesta del servidor: ${response.status} ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      this.handleError(error, "fetchDatosFromServer");
      throw error;
    }
  }

  /**
   * Guarda los datos de asistencia en IndexedDB
   */
  private async guardarDatosInterno(
    datos: BaseAsistenciaResponse
  ): Promise<void> {
    const fechaActual = this.obtenerFechaActualDesdeRedux();
    if (!fechaActual) {
      console.warn(
        "No se pudo guardar datos porque no se obtuvo la fecha de Redux."
      );
      return;
    }
    const rol = await userStorage.getRol();

    try {
      const store = await IndexedDBConnection.getStore(
        this.storeName,
        "readwrite"
      );

      const datosAlmacenados: DatosAsistenciaAlmacenados = {
        id: DatosAsistenciaHoyIDB.STORAGE_KEY,
        rol,
        datos,
        fechaGuardado: this.formatearFechaSoloDia(fechaActual),
      };

      return new Promise((resolve, reject) => {
        const request = store.put(
          datosAlmacenados,
          DatosAsistenciaHoyIDB.STORAGE_KEY
        );

        request.onsuccess = () => {
          resolve();
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        request.onerror = (event: any) => {
          reject(
            new Error(
              `Error al guardar datos en IndexedDB: ${
                (event.target as IDBRequest).error
              }`
            )
          );
        };
      });
    } catch (error) {
      this.handleError(error, "guardarDatosInterno");
      throw error;
    }
  }

  /**
   * Guarda los datos de asistencia en IndexedDB
   */
  // protected async guardarDatosAsistencia(
  //   datos: BaseAsistenciaResponse
  // ): Promise<void> {
  //   const rol = await userStorage.getRol();
  //   try {
  //     const store = await IndexedDBConnection.getStore(
  //       this.storeName,
  //       "readwrite"
  //     );

  //     const datosAlmacenados: DatosAsistenciaAlmacenados = {
  //       id: DatosAsistenciaHoyIDB.STORAGE_KEY,
  //       rol,
  //       datos,
  //       fechaGuardado: new Date().toISOString(),
  //     };

  //     return new Promise((resolve, reject) => {
  //       const request = store.put(
  //         datosAlmacenados,
  //         DatosAsistenciaHoyIDB.STORAGE_KEY
  //       );

  //       request.onsuccess = () => {
  //         resolve();
  //       };

  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //       request.onerror = (event: any) => {
  //         reject(
  //           new Error(
  //             `Error al guardar datos de asistencia: ${
  //               (event.target as IDBRequest).error
  //             }`
  //           )
  //         );
  //       };
  //     });
  //   } catch (error) {
  //     this.handleError(error, "guardarDatosAsistencia", {
  //       rol,
  //       timestamp: Date.now(),
  //     });
  //     throw error;
  //   }
  // }

  /**
   * Obtiene los datos almacenados en IndexedDB
   */
  private async obtenerDatosAlmacenados(): Promise<DatosAsistenciaAlmacenados | null> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.get(DatosAsistenciaHoyIDB.STORAGE_KEY);
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      this.handleError(error, "obtenerDatosAlmacenados");
      return null;
    }
  }

  /**
   * Sincroniza los datos desde el servidor si es necesario y los devuelve.
   */
  public async obtenerDatos<
    T extends BaseAsistenciaResponse
  >(): Promise<T | null> {
    const fechaHoyRedux = this.obtenerFechaActualDesdeRedux();

    // Si no se pudo obtener la fecha de Redux, no hacer nada y retornar null
    if (!fechaHoyRedux) {
      return null;
    }

    try {
      const storedData = await this.obtenerDatosAlmacenados();

      const fechaHoyISO = this.formatearFechaSoloDia(fechaHoyRedux);

      // No sincronizar si es fin de semana
      if (this.esFinDeSemana(fechaHoyRedux) && storedData) {
        if (storedData && storedData.rol) {
          return storedData.datos as T;
        }
        return null; // No hay datos válidos para hoy (fin de semana)
      }

      if (
        !storedData ||
        !this.esMismoDia(String(storedData.datos.FechaLocalPeru), fechaHoyISO)
      ) {
        const freshData = await this.fetchDatosFromServer();
        await this.guardarDatosInterno(freshData);
        return freshData as T;
      }

      return storedData.datos as T;
    } catch (error) {
      console.error("Error al obtener o sincronizar datos:", error);
      return null;
    }
  }

  /**
   * Limpia los datos almacenados
   */
  public async limpiarDatos(): Promise<void> {
    try {
      const store = await IndexedDBConnection.getStore(
        this.storeName,
        "readwrite"
      );
      return new Promise((resolve, reject) => {
        const request = store.delete(DatosAsistenciaHoyIDB.STORAGE_KEY);
        request.onsuccess = () => {
          resolve();
        };
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error al limpiar datos:", error);
    }
  }

  /**
   * Guarda los datos directamente sin verificar la fecha.
   */
  public async guardarDatosDirecto(
    datos: BaseAsistenciaResponse
  ): Promise<void> {
    await this.guardarDatosInterno(datos);
  }

  /**
   * Obtiene el handler correspondiente según el rol almacenado en IndexedDB.
   */
  public async getHandler() {
    const storedData = await this.obtenerDatosAlmacenados();
    if (!storedData) {
      return null;
    }

    switch (storedData.rol) {
      case RolesSistema.Directivo:
        return new HandlerDirectivoAsistenciaResponse(
          storedData.datos as DirectivoAsistenciaResponse // Ajusta el tipo según sea necesario
        );
      case RolesSistema.ProfesorPrimaria:
        return new HandlerProfesorPrimariaAsistenciaResponse(
          storedData.datos as ProfesorPrimariaAsistenciaResponse
        );
      case RolesSistema.Auxiliar:
        return new HandlerAuxiliarAsistenciaResponse(
          storedData.datos as AuxiliarAsistenciaResponse
        );
      case RolesSistema.ProfesorSecundaria:
      case RolesSistema.Tutor:
        return new HandlerProfesorTutorSecundariaAsistenciaResponse(
          storedData.datos as ProfesorTutorSecundariaAsistenciaResponse
        );
      case RolesSistema.Responsable:
        return new HandlerResponsableAsistenciaResponse(
          storedData.datos as ResponsableAsistenciaResponse
        );
      case RolesSistema.PersonalAdministrativo:
        return new HandlerPersonalAdministrativoAsistenciaResponse(
          storedData.datos as PersonalAdministrativoAsistenciaResponse
        );
      default:
        return null;
    }
  }
}

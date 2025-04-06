import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import { logout } from "@/lib/helpers/logout";
import { LogoutTypes, ErrorDetailsForLogout } from "@/interfaces/LogoutTypes";
import { BaseAsistenciaResponse } from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";
import IndexedDBConnection from "../../IndexedDBConnection";

// Interfaz para el objeto guardado en IndexedDB
export interface DatosAsistenciaAlmacenados {
  id: string; // 'datos_actuales'
  rol: RolesSistema;
  datos: BaseAsistenciaResponse;
}

export abstract class DatosBaseAsistenciaHoyIDB<
  T extends BaseAsistenciaResponse
> {
  protected storeName: string = "datos_asistencia_hoy";
  protected static STORAGE_KEY = "datos_asistencia_actuales";
  protected abstract rolPrincipal: RolesSistema;

  /**
   * Maneja los errores según su tipo y realiza logout si es necesario
   */
  protected handleError(
    error: unknown,
    operacion: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    detalles?: Record<string, any>
  ): void {
    console.error(`Error en AsistenciaStorage (${operacion}):`, error);

    const errorDetails: ErrorDetailsForLogout = {
      origen: `AsistenciaStorage.${operacion}`,
      mensaje: error instanceof Error ? error.message : String(error),
      timestamp: Date.now(),
      contexto: JSON.stringify(detalles || {}),
      siasisComponent: "CLN02",
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
   * Verifica si es un día no laborable (sábado o domingo)
   */
  protected esDiaNoLaborable(): boolean {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0: domingo, 6: sábado

    return diaSemana === 0 || diaSemana === 6;
  }

  /**
   * Formatea una fecha en formato ISO sin la parte de tiempo
   */
  protected formatearFechaSoloDia(fecha: Date): string {
    return fecha.toISOString().split("T")[0];
  }

  /**
   * Compara si dos fechas ISO son el mismo día
   */
  protected esMismoDia(fecha1: string, fecha2: string): boolean {
    return (
      this.formatearFechaSoloDia(new Date(fecha1)) ===
      this.formatearFechaSoloDia(new Date(fecha2))
    );
  }

  /**
   * Sincroniza los datos desde el servidor si es necesario
   */
  protected async sync(
    forzarSincronizacion: boolean = false
  ): Promise<boolean> {
    try {
      // Si se fuerza la sincronización, ignoramos la verificación del día no laborable
      if (!forzarSincronizacion && this.esDiaNoLaborable()) {
        console.log("Día no laborable. No se realizará sincronización.");
        return false;
      }

      // Obtener datos actuales de IndexedDB
      const datosAlmacenados = await this.obtenerDatosAsistenciaAlmacenados();
      const fechaHoyPeru = new Date().toISOString();

      // Si no hay datos almacenados, forzamos sincronización
      if (!datosAlmacenados) {
        console.log(
          "No hay datos almacenados, realizando sincronización inicial"
        );
        await this.fetchYActualizarDatosAsistencia();
        return true;
      }

      // Verificar si necesitamos sincronizar
      let necesitaSincronizacion = forzarSincronizacion;
      if (!datosAlmacenados) {
        necesitaSincronizacion = true;
      } else if (datosAlmacenados.rol !== this.rolPrincipal) {
        // Si el rol cambió, necesitamos sincronizar
        necesitaSincronizacion = true;
      } else if (
        !this.esMismoDia(
          datosAlmacenados.datos.FechaLocalPeru.toString(),
          fechaHoyPeru
        )
      ) {
        // Si la fecha almacenada no es hoy, necesitamos sincronizar
        necesitaSincronizacion = true;
      }

      if (necesitaSincronizacion) {
        await this.fetchYActualizarDatosAsistencia();
        return true;
      }

      return false;
    } catch (error) {
      // Si hay algún error durante la sincronización, intentamos obtener datos frescos
      console.warn(
        "Error durante la sincronización, intentando obtener datos frescos",
        error
      );
      try {
        await this.fetchYActualizarDatosAsistencia();
        return true;
      } catch (fetchError) {
        this.handleError(fetchError, "sync_recovery", {
          rol: this.rolPrincipal,
          forzarSincronizacion,
        });
        return false;
      }
    }
  }

  /**
   * Obtiene los datos del servidor y los almacena en IndexedDB
   */
  /**
   * Obtiene los datos del servidor y los almacena en IndexedDB
   */
  protected async fetchYActualizarDatosAsistencia(): Promise<void> {
    try {
      // Realizar petición al endpoint
      const response = await fetch("/api/datos-asistencia-hoy");

      if (!response.ok) {
        throw new Error(
          `Error en la respuesta del servidor: ${response.status} ${response.statusText}`
        );
      }

      // Obtener los datos de la respuesta
      const datosRespuesta = await response.json();

      // Asegurarnos de que no hay duplicación en propiedades específicas
      const datosFiltrados = { ...datosRespuesta };

      // Eliminar solo las propiedades que no deberían estar duplicadas
      if ("timestamp" in datosFiltrados) delete datosFiltrados.timestamp;
      // Mantenemos fechaLocalPeru en los datos porque es parte de la API
      // pero eliminamos cualquier duplicado en el nivel superior

      // Guardar en IndexedDB con la clave explícita
      await this.guardarDatosAsistencia(datosFiltrados);

      console.log("Datos de asistencia actualizados correctamente");
    } catch (error) {
      this.handleError(error, "fetchYActualizarDatosAsistencia", {
        rol: this.rolPrincipal,
      });
      throw error;
    }
  }

  /**
   * Guarda los datos de asistencia en IndexedDB
   */
  protected async guardarDatosAsistencia(
    datos: BaseAsistenciaResponse
  ): Promise<void> {
    try {
      const store = await IndexedDBConnection.getStore(
        this.storeName,
        "readwrite"
      );

      const datosAlmacenados: DatosAsistenciaAlmacenados = {
        id: DatosBaseAsistenciaHoyIDB.STORAGE_KEY,
        rol: this.rolPrincipal,
        datos,
      };

      return new Promise((resolve, reject) => {
        const request = store.put(
          datosAlmacenados,
          DatosBaseAsistenciaHoyIDB.STORAGE_KEY
        );

        request.onsuccess = () => {
          resolve();
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        request.onerror = (event: any) => {
          reject(
            new Error(
              `Error al guardar datos de asistencia: ${
                (event.target as IDBRequest).error
              }`
            )
          );
        };
      });
    } catch (error) {
      this.handleError(error, "guardarDatosAsistencia", {
        rol: this.rolPrincipal,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  /**
   * Obtiene los datos crudos almacenados en IndexedDB
   */
  protected async obtenerDatosAsistenciaAlmacenados(): Promise<DatosAsistenciaAlmacenados | null> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(DatosBaseAsistenciaHoyIDB.STORAGE_KEY);

        request.onsuccess = () => {
          // Si no hay resultados, simplemente devolvemos null sin error
          resolve(request.result || null);
        };

        request.onerror = () => {
          // Solo rechazamos la promesa si hay un error real
          reject(request.error);
        };
      });
    } catch (error) {
      this.handleError(error, "obtenerDatosAsistenciaAlmacenados");
      return null;
    }
  }

  /**
   * Obtiene los datos de asistencia según el rol
   */
  public async obtenerDatos(
    forzarSincronizacion: boolean = false
  ): Promise<T | null> {
    try {
      // Sincronizar datos si es necesario
      await this.sync(forzarSincronizacion);

      // Si es fin de semana y no se forzó la sincronización, retornar null
      if (this.esDiaNoLaborable() && !forzarSincronizacion) {
        return null;
      }

      // Obtener datos actuales
      const datosAlmacenados = await this.obtenerDatosAsistenciaAlmacenados();

      if (!datosAlmacenados) return null;

      // Verificar que los datos correspondan al rol solicitado
      if (datosAlmacenados.rol !== this.rolPrincipal) {
        // Si los datos almacenados son de otro rol, intentar sincronizar forzadamente
        if (!forzarSincronizacion) {
          return this.obtenerDatos(true);
        }
        return null;
      }

      // Devolver los datos tipados según el rol
      return datosAlmacenados.datos as T;
    } catch (error) {
      this.handleError(error, "obtenerDatos", {
        rol: this.rolPrincipal,
        forzarSincronizacion,
      });
      return null;
    }
  }

  /**
   * Verifica si hay un evento especial hoy
   */
  public async hayEventoHoy(): Promise<boolean> {
    try {
      const datos = await this.obtenerDatos();
      return datos?.DiaEvento !== false;
    } catch (error) {
      this.handleError(error, "hayEventoHoy");
      return false;
    }
  }

  /**
   * Obtiene los detalles del evento de hoy si existe
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async obtenerEventoHoy(): Promise<any | null> {
    try {
      const datos = await this.obtenerDatos();
      return datos?.DiaEvento !== false ? datos?.DiaEvento : null;
    } catch (error) {
      this.handleError(error, "obtenerEventoHoy");
      return null;
    }
  }

  /**
   * Verifica si estamos dentro del año escolar
   */
  public async estaDentroAñoEscolar(): Promise<boolean> {
    try {
      const datos = await this.obtenerDatos();
      return datos?.DentroAñoEscolar || false;
    } catch (error) {
      this.handleError(error, "estaDentroAñoEscolar");
      return false;
    }
  }

  /**
   * Obtiene todos los comunicados para mostrar hoy
   */
  public async obtenerComunicadosHoy(): Promise<
    BaseAsistenciaResponse["ComunicadosParaMostrarHoy"] | null
  > {
    try {
      const datos = await this.obtenerDatos();
      return datos?.ComunicadosParaMostrarHoy || null;
    } catch (error) {
      this.handleError(error, "obtenerComunicadosHoy");
      return null;
    }
  }

  /**
   * Obtiene la fecha local de Perú actual registrada en el sistema
   */
  public async obtenerFechaLocalPeru(): Promise<Date | null> {
    try {
      const datos = await this.obtenerDatos();
      return datos?.FechaLocalPeru ? new Date(datos.FechaLocalPeru) : null;
    } catch (error) {
      this.handleError(error, "obtenerFechaLocalPeru");
      return null;
    }
  }

  /**
   * Limpia los datos almacenados (útil para cierre de sesión)
   */
  public async limpiarDatosAsistencia(): Promise<void> {
    try {
      const store = await IndexedDBConnection.getStore(
        this.storeName,
        "readwrite"
      );

      return new Promise((resolve, reject) => {
        const request = store.delete(DatosBaseAsistenciaHoyIDB.STORAGE_KEY);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error al limpiar datos de asistencia:", error);
      // No hacemos logout aquí, ya que podría ser parte de un proceso de cierre de sesión
    }
  }
}

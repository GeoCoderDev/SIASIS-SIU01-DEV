import IndexedDBConnection from "../IndexedDBConnection";
import { TablasSistema } from "../../../../../interfaces/shared/TablasSistema";

// Interfaz para el registro de última modificación
export interface IUltimaModificacionTabla {
  Nombre_Tabla: string;
  Operacion: "INSERT" | "UPDATE" | "DELETE";
  Fecha_Modificacion: number; // timestamp
  Usuario_Modificacion?: string;
  Cantidad_Filas?: number;
  Sync_Status?: "pending" | "synced" | "error";
}

export class UltimaModificacionTablasIDB {
  private storeName: string = "ultima_modificacion_tablas";

  /**
   * Obtiene todos los registros de modificación
   * @returns Lista de registros de última modificación
   */
  public async getAll(): Promise<IUltimaModificacionTabla[]> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(
        "Error al obtener registros de última modificación:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene el registro de última modificación para una tabla específica
   * @param nombreTabla Nombre de la tabla
   * @returns Registro de última modificación o null si no existe
   */
  public async getByNombreTabla(
    nombreTabla: TablasSistema
  ): Promise<IUltimaModificacionTabla | null> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(nombreTabla);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(
        `Error al obtener última modificación para la tabla ${nombreTabla}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene los registros de modificación por tipo de operación
   * @param operacion Tipo de operación (INSERT, UPDATE, DELETE)
   * @returns Lista de registros filtrados por operación
   */
  public async getByOperacion(
    operacion: "INSERT" | "UPDATE" | "DELETE"
  ): Promise<IUltimaModificacionTabla[]> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);
      const index = store.index("por_operacion");

      return new Promise((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.only(operacion));

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(
        `Error al obtener modificaciones con operación ${operacion}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene los registros de modificación dentro de un rango de fechas
   * @param fechaInicio Fecha de inicio (timestamp)
   * @param fechaFin Fecha de fin (timestamp)
   * @returns Lista de registros dentro del rango de fechas
   */
  public async getByRangoFechas(
    fechaInicio: number,
    fechaFin: number
  ): Promise<IUltimaModificacionTabla[]> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);
      const index = store.index("por_fecha");

      return new Promise((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.bound(fechaInicio, fechaFin));

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(
        `Error al obtener modificaciones en rango de fechas:`,
        error
      );
      throw error;
    }
  }

  /**
   * Registra una nueva modificación de tabla
   * @param modificacion Datos de la modificación
   */
  public async add(modificacion: IUltimaModificacionTabla): Promise<void> {
    try {
      // Asegurar que tengamos un timestamp para la fecha
      if (!modificacion.Fecha_Modificacion) {
        modificacion.Fecha_Modificacion = Date.now();
      }

      // Estado de sincronización inicial
      if (!modificacion.Sync_Status) {
        modificacion.Sync_Status = "pending";
      }

      const store = await IndexedDBConnection.getStore(
        this.storeName,
        "readwrite"
      );

      return new Promise((resolve, reject) => {
        const request = store.put(modificacion); // Usamos put en lugar de add para sobrescribir si ya existe

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error al registrar modificación de tabla:", error);
      throw error;
    }
  }

  /**
   * Elimina un registro de modificación de tabla
   * @param nombreTabla Nombre de la tabla
   */
  public async delete(nombreTabla: string): Promise<void> {
    try {
      const store = await IndexedDBConnection.getStore(
        this.storeName,
        "readwrite"
      );

      return new Promise((resolve, reject) => {
        const request = store.delete(nombreTabla);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(
        `Error al eliminar registro de modificación para la tabla ${nombreTabla}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Marca un registro como sincronizado
   * @param nombreTabla Nombre de la tabla
   */
  public async markAsSynced(nombreTabla: TablasSistema): Promise<void> {
    try {
      const modificacion = await this.getByNombreTabla(nombreTabla);
      if (!modificacion) {
        throw new Error(
          `No existe registro de modificación para la tabla ${nombreTabla}`
        );
      }

      modificacion.Sync_Status = "synced";

      const store = await IndexedDBConnection.getStore(
        this.storeName,
        "readwrite"
      );

      return new Promise((resolve, reject) => {
        const request = store.put(modificacion);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(
        `Error al marcar como sincronizado el registro de tabla ${nombreTabla}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene todos los registros pendientes de sincronizar
   * @returns Lista de registros pendientes
   */
  public async getPendingSync(): Promise<IUltimaModificacionTabla[]> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);
      const index = store.index("por_sync_status");

      return new Promise((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.only("pending"));

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(
        "Error al obtener registros pendientes de sincronizar:",
        error
      );
      throw error;
    }
  }
}

// Singleton instance
const ultimaModificacionTablasLocal = new UltimaModificacionTablasIDB();
export default ultimaModificacionTablasLocal;

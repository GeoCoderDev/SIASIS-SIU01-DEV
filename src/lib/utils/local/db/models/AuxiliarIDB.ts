import { AuxiliarSinContraseña } from "@/interfaces/shared/apis/shared/others/types";
import IndexedDBConnection from "../IndexedDBConnection";

// Tipo para la entidad local (sin contraseña)
export interface IAuxiliarLocal extends AuxiliarSinContraseña {
  Fecha_Registro?: number; // timestamp para seguimiento local
  Ultima_Actualizacion?: number; // timestamp para seguimiento local
  Sync_Status?: "pending" | "synced" | "error"; // Estado de sincronización
}

export interface IAuxiliarFilter {
  DNI_Auxiliar?: string;
  Nombres?: string;
  Apellidos?: string;
  Estado?: boolean;
}

export class AuxiliarIDB {
  private storeName: string = "auxiliares";

  /**
   * Obtiene todos los auxiliares
   * @param includeInactive Si es true, incluye auxiliares inactivos
   * @returns Lista de auxiliares
   */
  public async getAll(
    includeInactive: boolean = true
  ): Promise<IAuxiliarLocal[]> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          let result = request.result as IAuxiliarLocal[];
          if (!includeInactive) {
            result = result.filter((auxiliar) => auxiliar.Estado === true);
          }
          resolve(result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error al obtener auxiliares:", error);
      throw error;
    }
  }

  /**
   * Obtiene un auxiliar por su DNI
   * @param dni DNI del auxiliar que funciona como ID principal
   * @returns Auxiliar encontrado o null
   */
  public async getByDNI(dni: string): Promise<IAuxiliarLocal | null> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(dni); // El DNI es la clave primaria

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`Error al obtener auxiliar con DNI ${dni}:`, error);
      throw error;
    }
  }

  /**
   * Encuentra un auxiliar por su nombre de usuario
   * @param nombreUsuario Nombre de usuario del auxiliar
   * @returns Auxiliar encontrado o null
   */
  public async getByNombreUsuario(
    nombreUsuario: string
  ): Promise<IAuxiliarLocal | null> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);
      const index = store.index("por_nombre_usuario");

      return new Promise((resolve, reject) => {
        const request = index.get(nombreUsuario);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(
        `Error al obtener auxiliar con nombre de usuario ${nombreUsuario}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene auxiliares por estado (activo/inactivo)
   * @param estado Estado de los auxiliares a buscar
   * @returns Lista de auxiliares con el estado especificado
   */
  public async getByEstado(estado: boolean): Promise<IAuxiliarLocal[]> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);
      const index = store.index("por_estado");

      return new Promise((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.only(estado));

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`Error al obtener auxiliares con estado ${estado}:`, error);
      throw error;
    }
  }

  /**
   * Añade un nuevo auxiliar
   * @param auxiliar Datos del auxiliar
   * @returns DNI del auxiliar añadido
   */
  public async add(auxiliar: IAuxiliarLocal): Promise<string> {
    try {
      // Verificar que el DNI no exista ya
      const existingByDNI = await this.getByDNI(auxiliar.DNI_Auxiliar);
      if (existingByDNI) {
        throw new Error(
          `Ya existe un auxiliar con el DNI ${auxiliar.DNI_Auxiliar}`
        );
      }

      // Verificar que el nombre de usuario no exista
      const existingByUsername = await this.getByNombreUsuario(
        auxiliar.Nombre_Usuario
      );
      if (existingByUsername) {
        throw new Error(
          `Ya existe un auxiliar con el nombre de usuario ${auxiliar.Nombre_Usuario}`
        );
      }

      // Añadir metadatos
      if (!auxiliar.Fecha_Registro) {
        auxiliar.Fecha_Registro = Date.now();
      }
      auxiliar.Ultima_Actualizacion = Date.now();
      auxiliar.Sync_Status = "pending";

      const store = await IndexedDBConnection.getStore(
        this.storeName,
        "readwrite"
      );

      return new Promise((resolve, reject) => {
        const request = store.add(auxiliar);

        request.onsuccess = () => {
          resolve(auxiliar.DNI_Auxiliar);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error al añadir auxiliar:", error);
      throw error;
    }
  }

  /**
   * Actualiza la información de un auxiliar existente
   * @param auxiliar Datos actualizados del auxiliar (con DNI_Auxiliar)
   */
  public async update(auxiliar: IAuxiliarLocal): Promise<void> {
    try {
      // Verificar que el auxiliar exista
      const existing = await this.getByDNI(auxiliar.DNI_Auxiliar);
      if (!existing) {
        throw new Error(
          `No existe un auxiliar con el DNI ${auxiliar.DNI_Auxiliar}`
        );
      }

      // Verificar nombre de usuario único si ha cambiado
      if (auxiliar.Nombre_Usuario !== existing.Nombre_Usuario) {
        const existingByUsername = await this.getByNombreUsuario(
          auxiliar.Nombre_Usuario
        );
        if (
          existingByUsername &&
          existingByUsername.DNI_Auxiliar !== auxiliar.DNI_Auxiliar
        ) {
          throw new Error(
            `Ya existe otro auxiliar con el nombre de usuario ${auxiliar.Nombre_Usuario}`
          );
        }
      }

      // Preservar metadatos internos
      auxiliar.Fecha_Registro = existing.Fecha_Registro;
      auxiliar.Ultima_Actualizacion = Date.now();
      auxiliar.Sync_Status = "pending";

      const store = await IndexedDBConnection.getStore(
        this.storeName,
        "readwrite"
      );

      return new Promise((resolve, reject) => {
        const request = store.put(auxiliar);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(
        `Error al actualizar auxiliar con DNI ${auxiliar.DNI_Auxiliar}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Actualiza parcialmente un auxiliar
   * @param dni DNI del auxiliar
   * @param partialData Datos parciales a actualizar
   */
  public async partialUpdate(
    dni: string,
    partialData: Partial<IAuxiliarLocal>
  ): Promise<void> {
    try {
      const auxiliar = await this.getByDNI(dni);
      if (!auxiliar) {
        throw new Error(`No existe un auxiliar con el DNI ${dni}`);
      }

      // Si se intenta cambiar el nombre de usuario, verificar que sea único
      if (
        partialData.Nombre_Usuario &&
        partialData.Nombre_Usuario !== auxiliar.Nombre_Usuario
      ) {
        const existingByUsername = await this.getByNombreUsuario(
          partialData.Nombre_Usuario
        );
        if (existingByUsername && existingByUsername.DNI_Auxiliar !== dni) {
          throw new Error(
            `Ya existe otro auxiliar con el nombre de usuario ${partialData.Nombre_Usuario}`
          );
        }
      }

      // Actualizar campos
      const updatedAuxiliar = { ...auxiliar, ...partialData };
      updatedAuxiliar.Ultima_Actualizacion = Date.now();
      updatedAuxiliar.Sync_Status = "pending";

      await this.update(updatedAuxiliar);
    } catch (error) {
      console.error(
        `Error al actualizar parcialmente el auxiliar ${dni}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Cambia el estado de un auxiliar a inactivo (false)
   * @param dni DNI del auxiliar
   */
  public async deactivate(dni: string): Promise<void> {
    try {
      const auxiliar = await this.getByDNI(dni);
      if (!auxiliar) {
        throw new Error(`No existe un auxiliar con el DNI ${dni}`);
      }

      auxiliar.Estado = false;
      auxiliar.Ultima_Actualizacion = Date.now();
      auxiliar.Sync_Status = "pending";

      await this.update(auxiliar);
    } catch (error) {
      console.error(`Error al desactivar auxiliar con DNI ${dni}:`, error);
      throw error;
    }
  }

  /**
   * Cambia el estado de un auxiliar a activo (true)
   * @param dni DNI del auxiliar
   */
  public async activate(dni: string): Promise<void> {
    try {
      const auxiliar = await this.getByDNI(dni);
      if (!auxiliar) {
        throw new Error(`No existe un auxiliar con el DNI ${dni}`);
      }

      auxiliar.Estado = true;
      auxiliar.Ultima_Actualizacion = Date.now();
      auxiliar.Sync_Status = "pending";

      await this.update(auxiliar);
    } catch (error) {
      console.error(`Error al activar auxiliar con DNI ${dni}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza la foto de perfil del auxiliar
   * @param dniAuxiliar DNI del auxiliar
   * @param googleDriveFotoID ID de la foto en Google Drive
   */
  public async actualizarFoto(
    dniAuxiliar: string,
    googleDriveFotoID: string
  ): Promise<void> {
    try {
      const auxiliar = await this.getByDNI(dniAuxiliar);
      if (!auxiliar) {
        throw new Error(`No existe un auxiliar con el DNI ${dniAuxiliar}`);
      }

      auxiliar.Google_Drive_Foto_ID = googleDriveFotoID;
      auxiliar.Ultima_Actualizacion = Date.now();
      auxiliar.Sync_Status = "pending";

      await this.update(auxiliar);
    } catch (error) {
      console.error(
        `Error al actualizar foto del auxiliar ${dniAuxiliar}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Elimina un auxiliar (físicamente de la base de datos)
   * @param dni DNI del auxiliar
   */
  public async delete(dni: string): Promise<void> {
    try {
      // Verificar que el auxiliar exista
      const auxiliar = await this.getByDNI(dni);
      if (!auxiliar) {
        throw new Error(`No existe un auxiliar con el DNI ${dni}`);
      }

      const store = await IndexedDBConnection.getStore(
        this.storeName,
        "readwrite"
      );

      return new Promise((resolve, reject) => {
        const deleteRequest = store.delete(dni);

        deleteRequest.onsuccess = () => {
          resolve();
        };

        deleteRequest.onerror = () => {
          reject(deleteRequest.error);
        };
      });
    } catch (error) {
      console.error(`Error al eliminar auxiliar con DNI ${dni}:`, error);
      throw error;
    }
  }

  /**
   * Marca un auxiliar como sincronizado
   * @param dni DNI del auxiliar
   */
  public async markAsSynced(dni: string): Promise<void> {
    try {
      const auxiliar = await this.getByDNI(dni);
      if (!auxiliar) {
        throw new Error(`No existe un auxiliar con el DNI ${dni}`);
      }

      auxiliar.Sync_Status = "synced";

      const store = await IndexedDBConnection.getStore(
        this.storeName,
        "readwrite"
      );

      return new Promise((resolve, reject) => {
        const request = store.put(auxiliar);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(
        `Error al marcar auxiliar como sincronizado: ${dni}`,
        error
      );
      throw error;
    }
  }

  /**
   * Marca un auxiliar con error de sincronización
   * @param dni DNI del auxiliar
   */
  public async markSyncError(dni: string): Promise<void> {
    try {
      const auxiliar = await this.getByDNI(dni);
      if (!auxiliar) {
        throw new Error(`No existe un auxiliar con el DNI ${dni}`);
      }

      auxiliar.Sync_Status = "error";

      const store = await IndexedDBConnection.getStore(
        this.storeName,
        "readwrite"
      );

      return new Promise((resolve, reject) => {
        const request = store.put(auxiliar);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(
        `Error al marcar error de sincronización en auxiliar: ${dni}`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene auxiliares pendientes de sincronizar
   * @returns Lista de auxiliares pendientes de sincronizar
   */
  public async getPendingSync(): Promise<IAuxiliarLocal[]> {
    try {
      const store = await IndexedDBConnection.getStore(this.storeName);

      return new Promise((resolve, reject) => {
        const index = store.index("por_sync_status");
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
        "Error al obtener auxiliares pendientes de sincronizar:",
        error
      );
      throw error;
    }
  }

  /**
   * Importa múltiples auxiliares desde un array (útil para CSV)
   * @param auxiliares Array de auxiliares a importar
   * @returns Número de auxiliares importados con éxito
   */
  public async importBulk(auxiliares: IAuxiliarLocal[]): Promise<number> {
    let importados = 0;
    const errores: { auxiliar: IAuxiliarLocal; error: string }[] = [];

    for (const auxiliar of auxiliares) {
      try {
        // Añadir metadatos
        auxiliar.Fecha_Registro = Date.now();
        auxiliar.Ultima_Actualizacion = Date.now();
        auxiliar.Sync_Status = "synced"; // Asumimos que los datos importados ya están sincronizados

        await this.add(auxiliar);
        importados++;
      } catch (error) {
        let mensaje = "Error desconocido";
        if (error instanceof Error) {
          mensaje = error.message;
        }
        errores.push({ auxiliar, error: mensaje });
      }
    }

    if (errores.length > 0) {
      console.warn("Algunos auxiliares no pudieron ser importados:", errores);
    }

    return importados;
  }

  /**
   * Obtiene el total de auxiliares activos
   * @returns Número total de auxiliares activos
   */
  public async getTotalActivos(): Promise<number> {
    try {
      const activos = await this.getByEstado(true);
      return activos.length;
    } catch (error) {
      console.error("Error al obtener total de auxiliares activos:", error);
      throw error;
    }
  }

  /**
   * Obtiene el total de auxiliares inactivos
   * @returns Número total de auxiliares inactivos
   */
  public async getTotalInactivos(): Promise<number> {
    try {
      const inactivos = await this.getByEstado(false);
      return inactivos.length;
    } catch (error) {
      console.error("Error al obtener total de auxiliares inactivos:", error);
      throw error;
    }
  }

  /**
   * Actualiza o crea auxiliares en lote desde el servidor
   * @param auxiliaresServidor Auxiliares provenientes del servidor
   * @returns Conteo de operaciones: creados, actualizados, errores
   */
  public async upsertFromServer(
    auxiliaresServidor: AuxiliarSinContraseña[]
  ): Promise<{ created: number; updated: number; errors: number }> {
    const result = { created: 0, updated: 0, errors: 0 };

    for (const auxiliarServidor of auxiliaresServidor) {
      try {
        const localAuxiliar = await this.getByDNI(
          auxiliarServidor.DNI_Auxiliar
        );

        if (localAuxiliar) {
          // Actualizar auxiliar existente, preservando metadatos locales
          const updatedAuxiliar: IAuxiliarLocal = {
            ...auxiliarServidor,
            Fecha_Registro: localAuxiliar.Fecha_Registro,
            Ultima_Actualizacion: Date.now(),
            Sync_Status: "synced",
          };

          await this.update(updatedAuxiliar);
          result.updated++;
        } else {
          // Crear nuevo auxiliar
          const newAuxiliar: IAuxiliarLocal = {
            ...auxiliarServidor,
            Fecha_Registro: Date.now(),
            Ultima_Actualizacion: Date.now(),
            Sync_Status: "synced",
          };

          await this.add(newAuxiliar);
          result.created++;
        }
      } catch (error) {
        console.error(
          `Error al procesar auxiliar ${auxiliarServidor.DNI_Auxiliar}:`,
          error
        );
        result.errors++;
      }
    }

    return result;
  }

  /**
   * Obtiene los auxiliares modificados localmente para sincronizar
   * @returns Lista de auxiliares que deben sincronizarse con el servidor
   */
  public async getChangesToSync(): Promise<IAuxiliarLocal[]> {
    try {
      return await this.getPendingSync();
    } catch (error) {
      console.error("Error al obtener cambios para sincronizar:", error);
      throw error;
    }
  }

  /**
   * Sincroniza los datos locales con el servidor
   * Este método es un ejemplo de cómo podría implementarse
   * @param onProgress Callback para reportar progreso
   */
  public async sincronizarConServidor(
    onProgress?: (mensaje: string, progreso: number) => void
  ): Promise<{ enviados: number; recibidos: number; errores: number }> {
    try {
      const resultado = { enviados: 0, recibidos: 0, errores: 0 };

      // 1. Obtener cambios locales pendientes
      const cambiosPendientes = await this.getChangesToSync();
      let contador = 0;

      // 2. Enviar cambios al servidor
      for (const auxiliar of cambiosPendientes) {
        try {
          if (onProgress) {
            contador++;
            onProgress(
              `Enviando auxiliar ${auxiliar.Nombres} ${auxiliar.Apellidos}...`,
              (contador / (cambiosPendientes.length * 2)) * 100
            );
          }

          // Aquí iría la lógica real de envío al servidor
          // Por ejemplo: await api.actualizarAuxiliar(auxiliar)

          // Simular éxito
          await this.markAsSynced(auxiliar.DNI_Auxiliar);
          resultado.enviados++;
        } catch (error) {
          console.error(
            `Error al sincronizar auxiliar ${auxiliar.DNI_Auxiliar}:`,
            error
          );
          await this.markSyncError(auxiliar.DNI_Auxiliar);
          resultado.errores++;
        }
      }

      // 3. Obtener datos actualizados del servidor
      if (onProgress) {
        onProgress("Obteniendo datos del servidor...", 50);
      }

      // Aquí iría la lógica real de obtención de datos del servidor
      // Por ejemplo: const datosServidor = await api.obtenerAuxiliares()

      // Simular datos del servidor
      const datosServidor: AuxiliarSinContraseña[] = [];

      // 4. Actualizar datos locales con datos del servidor
      if (datosServidor.length > 0) {
        const resultadoUpsert = await this.upsertFromServer(datosServidor);
        resultado.recibidos = resultadoUpsert.created + resultadoUpsert.updated;
        resultado.errores += resultadoUpsert.errors;
      }

      if (onProgress) {
        onProgress("Sincronización completada", 100);
      }

      return resultado;
    } catch (error) {
      console.error("Error durante la sincronización:", error);
      throw error;
    }
  }
}

// Singleton instance
const auxiliarLocal = new AuxiliarIDB();
export default auxiliarLocal;

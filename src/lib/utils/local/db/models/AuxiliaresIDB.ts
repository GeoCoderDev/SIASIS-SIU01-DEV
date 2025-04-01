import { AuxiliarSinContraseña } from "@/interfaces/shared/apis/shared/others/types";
import IndexedDBConnection from "../IndexedDBConnection";
import {
  TablasSistema,
  ITablaInfo,
  TablasLocal,
} from "../../../../../interfaces/shared/TablasSistema";
import {
  ApiResponseBase,
  ErrorResponseAPIBase,
  MessageProperty,
} from "@/interfaces/shared/apis/types";
import AllErrorTypes, {
  DataConflictErrorTypes,
  SystemErrorTypes,
  UserErrorTypes,
} from "../../../../../interfaces/shared/apis/errors";
import { SiasisAPIS } from "@/interfaces/shared/SiasisComponents";
import comprobarSincronizacionDeTabla from "@/lib/helpers/validations/comprobarSincronizacionDeTabla";
import fetchSiasisApiGenerator from "@/lib/helpers/generators/fetchSiasisApisGenerator";
import ultimaActualizacionTablasLocalesIDB from "./UltimaActualizacionTablasLocalesIDB";
import { DatabaseModificationOperations } from "@/interfaces/shared/DatabaseModificatioOperations";
import { GetAuxiliaresSuccessResponse } from "@/interfaces/shared/apis/api01/auxiliares/types";

// Tipo para la entidad (sin atributos de fechas)
export type IAuxiliarLocal = AuxiliarSinContraseña;

export interface IAuxiliarFilter {
  DNI_Auxiliar?: string;
  Nombres?: string;
  Apellidos?: string;
  Estado?: boolean;
}

export class AuxiliaresIDB {
  private tablaInfo: ITablaInfo = TablasSistema.AUXILIARES;
  private nombreTablaLocal: string = this.tablaInfo.nombreLocal || "auxiliares";

  constructor(
    private siasisAPI: SiasisAPIS,
    private setIsSomethingLoading: (isLoading: boolean) => void,
    private setError: (error: ErrorResponseAPIBase | null) => void,
    private setSuccessMessage?: (message: MessageProperty | null) => void
  ) {}

  /**
   * Método de sincronización que se ejecutará al inicio de cada operación
   * Este método será implementado por ti después
   */
  private async sync(): Promise<void> {
    try {
      const debeSincronizar = await comprobarSincronizacionDeTabla(
        this.tablaInfo,
        "API01"
      );

      if (!debeSincronizar) {
        // No es necesario sincronizar
        return;
      }

      // Si llegamos aquí, debemos sincronizar
      await this.fetchYActualizarAuxiliares();
    } catch (error) {
      console.error("Error durante la sincronización de auxiliares:", error);
      this.handleIndexedDBError(error, "sincronizar auxiliares");
    }
  }
  /**
   * Obtiene los auxiliares desde la API y los actualiza localmente
   * @returns Promise que se resuelve cuando los auxiliares han sido actualizados
   */
  private async fetchYActualizarAuxiliares(): Promise<void> {
    try {
      // Usar el generador para API01 (o la que corresponda)
      const { fetchSiasisAPI } = fetchSiasisApiGenerator(this.siasisAPI);

      // Realizar la petición al endpoint
      const fetchCancelable = await fetchSiasisAPI({
        endpoint: "/api/auxiliares",
        method: "GET",
      });

      if (!fetchCancelable) {
        throw new Error("No se pudo crear la petición de auxiliares");
      }

      // Ejecutar la petición
      const response = await fetchCancelable.fetch();

      if (!response.ok) {
        throw new Error(`Error al obtener auxiliares: ${response.statusText}`);
      }

      const objectResponse = (await response.json()) as ApiResponseBase;

      if (!objectResponse.success) {
        throw new Error(
          `Error en respuesta de auxiliares: ${objectResponse.message}`
        );
      }

      // Extraer los auxiliares del cuerpo de la respuesta
      const { data: auxiliares } =
        objectResponse as GetAuxiliaresSuccessResponse;

      // Actualizar auxiliares en la base de datos local
      await this.upsertFromServer(auxiliares);

      // Registrar la actualización en UltimaActualizacionTablasLocalesIDB
      await ultimaActualizacionTablasLocalesIDB.registrarActualizacion(
        this.tablaInfo.nombreLocal as TablasLocal,
        DatabaseModificationOperations.UPDATE
      );

      console.log(`Actualizados ${auxiliares.length} auxiliares desde la API`);
    } catch (error) {
      console.error("Error al obtener y actualizar auxiliares:", error);

      // Determinar el tipo de error
      let errorType: AllErrorTypes = SystemErrorTypes.UNKNOWN_ERROR;
      let message = "Error al sincronizar auxiliares";

      if (error instanceof Error) {
        // Si es un error de red o problemas de conexión
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorType = SystemErrorTypes.EXTERNAL_SERVICE_ERROR;
          message = "Error de red al sincronizar auxiliares";
        }
        // Si es un error relacionado con la respuesta del servidor
        else if (error.message.includes("obtener auxiliares")) {
          errorType = SystemErrorTypes.EXTERNAL_SERVICE_ERROR;
          message = error.message;
        }
        // Si es un error de IndexedDB
        else if (
          error.name === "TransactionInactiveError" ||
          error.name === "QuotaExceededError"
        ) {
          errorType = SystemErrorTypes.DATABASE_ERROR;
          message = "Error de base de datos al sincronizar auxiliares";
        } else {
          message = error.message;
        }
      }

      // Establecer el error en el estado global
      this.setError({
        success: false,
        message: message,
        errorType: errorType,
        details: {
          origen: "AuxiliarIDB.fetchYActualizarAuxiliares",
          timestamp: Date.now(),
        },
      });

      throw error;
    }
  }

  /**
   * Obtiene todos los auxiliares
   * @param includeInactive Si es true, incluye auxiliares inactivos
   * @returns Promesa con el array de auxiliares
   */
  public async getAll(
    includeInactive: boolean = true
  ): Promise<IAuxiliarLocal[]> {
    this.setIsSomethingLoading(true);
    this.setError(null); // Limpiar errores anteriores
    this.setSuccessMessage?.(null); // Limpiar mensajes anteriores

    try {
      // Ejecutar sincronización antes de la operación
      await this.sync();

      // Obtener el store
      const store = await IndexedDBConnection.getStore(this.nombreTablaLocal);

      // Convertir la API de callbacks de IndexedDB a promesas
      const result = await new Promise<IAuxiliarLocal[]>((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result as IAuxiliarLocal[]);
        request.onerror = () => reject(request.error);
      });

      // Filtrar inactivos si es necesario
      const auxiliares = includeInactive
        ? result
        : result.filter((aux) => aux.Estado === true);

      // Mostrar mensaje de éxito con información relevante
      if (auxiliares.length > 0) {
        this.handleSuccess(`Se encontraron ${auxiliares.length} auxiliares`);
      } else {
        this.handleSuccess("No se encontraron auxiliares");
      }

      this.setIsSomethingLoading(false);
      return auxiliares;
    } catch (error) {
      this.handleIndexedDBError(error, "obtener lista de auxiliares");
      this.setIsSomethingLoading(false);
      return []; // Devolvemos array vacío en caso de error
    }
  }

  /**
   * Actualiza o crea auxiliares en lote desde el servidor
   * @param auxiliaresServidor Auxiliares provenientes del servidor
   * @returns Conteo de operaciones: creados, actualizados, errores
   */
  private async upsertFromServer(
    auxiliaresServidor: AuxiliarSinContraseña[]
  ): Promise<{ created: number; updated: number; errors: number }> {
    const result = { created: 0, updated: 0, errors: 0 };

    // Procesar en lotes para evitar transacciones demasiado largas
    const BATCH_SIZE = 20;

    for (let i = 0; i < auxiliaresServidor.length; i += BATCH_SIZE) {
      const lote = auxiliaresServidor.slice(i, i + BATCH_SIZE);

      // Para cada auxiliar en el lote
      for (const auxiliarServidor of lote) {
        try {
          // Verificar si el auxiliar ya existe
          const existeAuxiliar = await this.getByDNI(
            auxiliarServidor.DNI_Auxiliar
          );

          // Obtener un store fresco para cada operación
          const store = await IndexedDBConnection.getStore(
            this.nombreTablaLocal,
            "readwrite"
          );

          // Ejecutar la operación put
          await new Promise<void>((resolve, reject) => {
            const request = store.put(auxiliarServidor);

            request.onsuccess = () => {
              if (existeAuxiliar) {
                result.updated++;
              } else {
                result.created++;
              }
              resolve();
            };

            request.onerror = () => {
              result.errors++;
              console.error(
                `Error al guardar auxiliar ${auxiliarServidor.DNI_Auxiliar}:`,
                request.error
              );
              reject(request.error);
            };
          });
        } catch (error) {
          result.errors++;
          console.error(
            `Error al procesar auxiliar ${auxiliarServidor.DNI_Auxiliar}:`,
            error
          );
        }
      }

      // Dar un pequeño respiro al bucle de eventos entre lotes
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return result;
  }

  /**
   * Obtiene un auxiliar por su DNI
   * @param dni DNI del auxiliar
   * @returns Auxiliar encontrado o null
   */
  public async getByDNI(dni: string): Promise<IAuxiliarLocal | null> {
    try {
      const store = await IndexedDBConnection.getStore(this.nombreTablaLocal);

      return new Promise<IAuxiliarLocal | null>((resolve, reject) => {
        const request = store.get(dni);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`Error al obtener auxiliar con DNI ${dni}:`, error);
      this.handleIndexedDBError(error, `obtener auxiliar con DNI ${dni}`);
      return null;
    }
  }

  /**
   * Establece un mensaje de éxito
   * @param message Mensaje de éxito
   * @param data Datos adicionales opcionales
   */
  private handleSuccess(message: string): void {
    const successResponse: MessageProperty = { message };

    this.setSuccessMessage?.(successResponse);
  }

  /**
   * Maneja los errores de operaciones con IndexedDB
   * @param error El error capturado
   * @param operacion Nombre de la operación que falló
   */
  private handleIndexedDBError(error: unknown, operacion: string): void {
    console.error(`Error en operación IndexedDB (${operacion}):`, error);

    let errorType: AllErrorTypes = SystemErrorTypes.UNKNOWN_ERROR;
    let message = `Error al ${operacion}`;

    if (error instanceof Error) {
      // Intentar categorizar el error según su mensaje o nombre
      if (error.name === "ConstraintError") {
        errorType = DataConflictErrorTypes.VALUE_ALREADY_IN_USE;
        message = `Error de restricción al ${operacion}: valor duplicado`;
      } else if (error.name === "NotFoundError") {
        errorType = UserErrorTypes.USER_NOT_FOUND;
        message = `No se encontró el recurso al ${operacion}`;
      } else if (error.name === "QuotaExceededError") {
        errorType = SystemErrorTypes.DATABASE_ERROR;
        message = `Almacenamiento excedido al ${operacion}`;
      } else if (error.name === "TransactionInactiveError") {
        errorType = SystemErrorTypes.DATABASE_ERROR;
        message = `Transacción inactiva al ${operacion}`;
      } else {
        // Si no podemos categorizar específicamente, usamos el mensaje del error
        message = error.message || message;
      }
    }

    this.setError({
      success: false,
      message: message,
      errorType: errorType,
    });
  }
}


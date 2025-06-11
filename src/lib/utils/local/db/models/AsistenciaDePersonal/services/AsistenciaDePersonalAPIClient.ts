/* eslint-disable @typescript-eslint/no-explicit-any */
import { SiasisAPIS } from "@/interfaces/shared/SiasisComponents";
import fetchSiasisApiGenerator from "@/lib/helpers/generators/fetchSiasisApisGenerator";
import {
  ApiResponseBase,
  ErrorResponseAPIBase,
} from "@/interfaces/shared/apis/types";
import { DataErrorTypes } from "@/interfaces/shared/errors";
import {
  AsistenciaCompletaMensualDePersonal,
  GetAsistenciaMensualDePersonalSuccessResponse,
} from "@/interfaces/shared/apis/api01/personal/types";

import {
  RolesSistema,
  ActoresSistema,
  ModoRegistro,
  OperationResult,
} from "../AsistenciaDePersonalTypes";
import { AsistenciaDePersonalMapper } from "./AsistenciaDePersonalMapper";
import {
  EliminarAsistenciaRequestBody,
  TipoAsistencia,
} from "@/interfaces/shared/AsistenciaRequests";

/**
 * 🎯 RESPONSABILIDAD: Llamadas a APIs externas
 * - Consultar APIs de asistencia
 * - Eliminar asistencias via API
 * - Manejar respuestas de API
 * - Transformar datos entre formatos
 */
export class AsistenciaDePersonalAPIClient {
  private siasisAPI: SiasisAPIS;
  private mapper: AsistenciaDePersonalMapper;

  constructor(siasisAPI: SiasisAPIS, mapper: AsistenciaDePersonalMapper) {
    this.siasisAPI = siasisAPI;
    this.mapper = mapper;
  }

  /**
   * Consulta la API para obtener asistencias mensuales
   */
  public async consultarAsistenciasMensuales(
    rol: RolesSistema | ActoresSistema,
    dni: string,
    mes: number
  ): Promise<AsistenciaCompletaMensualDePersonal | null> {
    try {
      const { fetchSiasisAPI } = fetchSiasisApiGenerator(this.siasisAPI);

      const fetchCancelable = await fetchSiasisAPI({
        endpoint: `/api/personal/asistencias-mensuales?Rol=${rol}&DNI=${dni}&Mes=${mes}`,
        method: "GET",
      });

      if (!fetchCancelable) {
        throw new Error(
          "No se pudo crear la petición de asistencias mensuales"
        );
      }

      const response = await fetchCancelable.fetch();

      if (!response.ok) {
        if (response.status === 404) {
          console.log(
            `📡 API devuelve 404 para ${dni} - mes ${mes} (sin datos)`
          );
          return null;
        }
        throw new Error(`Error al obtener asistencias: ${response.statusText}`);
      }

      const objectResponse = (await response.json()) as ApiResponseBase;

      if (!objectResponse.success) {
        if (
          (objectResponse as ErrorResponseAPIBase).errorType ===
          DataErrorTypes.NO_DATA_AVAILABLE
        ) {
          console.log(
            `📡 API devuelve NO_DATA_AVAILABLE para ${dni} - mes ${mes}`
          );
          return null;
        }
        throw new Error(`Error en respuesta: ${objectResponse.message}`);
      }

      const { data } =
        objectResponse as GetAsistenciaMensualDePersonalSuccessResponse;

      console.log(
        `📡 API devuelve datos exitosamente para ${dni} - mes ${mes}`
      );
      return data;
    } catch (error) {
      console.error(
        "Error al consultar asistencias mensuales desde API:",
        error
      );
      return null;
    }
  }

  /**
   * Elimina asistencia de Redis mediante API
   */
  public async eliminarAsistenciaRedis(
    dni: string,
    rol: RolesSistema,
    modoRegistro: ModoRegistro
  ): Promise<OperationResult> {
    try {
      // Mapear RolesSistema a ActoresSistema
      let actor: ActoresSistema;
      try {
        actor = this.mapper.obtenerActorDesdeRol(rol);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return {
          exitoso: false,
          mensaje: `Rol no soportado para eliminación: ${rol}`,
        };
      }

      // Crear el request body para la API de eliminación
      const requestBody: EliminarAsistenciaRequestBody = {
        DNI: dni,
        Actor: actor,
        ModoRegistro: modoRegistro,
        TipoAsistencia: TipoAsistencia.ParaPersonal,
      };

      console.log(`☁️ Enviando solicitud de eliminación a Redis:`, requestBody);

      // Hacer la petición a la API de eliminación
      const response = await fetch("/api/asistencia-hoy/descartar", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`☁️ Asistencia no encontrada en Redis (404)`);
          return {
            exitoso: false,
            mensaje: "Asistencia no encontrada en Redis",
          };
        }

        const errorData = await response.json().catch(() => ({}));
        return {
          exitoso: false,
          mensaje: `Error ${response.status}: ${
            errorData.message || response.statusText
          }`,
        };
      }

      const responseData = await response.json();

      if (responseData.success) {
        console.log(`✅ Eliminación Redis exitosa:`, responseData.data);
        return {
          exitoso: responseData.data.asistenciaEliminada || false,
          mensaje: responseData.message || "Eliminación exitosa de Redis",
          datos: responseData.data,
        };
      } else {
        console.log(`❌ Eliminación Redis falló:`, responseData.message);
        return {
          exitoso: false,
          mensaje: responseData.message || "Error al eliminar de Redis",
        };
      }
    } catch (error) {
      console.error("Error al eliminar de Redis:", error);
      return {
        exitoso: false,
        mensaje: `Error de conexión al eliminar de Redis: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }

  /**
   * Verifica la disponibilidad de la API
   */
  public async verificarDisponibilidadAPI(): Promise<OperationResult> {
    try {
      const { fetchSiasisAPI } = fetchSiasisApiGenerator(this.siasisAPI);

      const fetchCancelable = await fetchSiasisAPI({
        endpoint: "/api/health",
        method: "GET",
      });

      if (!fetchCancelable) {
        return {
          exitoso: false,
          mensaje: "No se pudo crear la petición de verificación",
        };
      }

      const response = await fetchCancelable.fetch();

      if (!response.ok) {
        return {
          exitoso: false,
          mensaje: `API no disponible: ${response.status} ${response.statusText}`,
        };
      }

      return {
        exitoso: true,
        mensaje: "API disponible",
      };
    } catch (error) {
      console.error("Error al verificar disponibilidad de API:", error);
      return {
        exitoso: false,
        mensaje: `Error de conexión: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }

  /**
   * Obtiene información del estado del servidor
   */
  public async obtenerEstadoServidor(): Promise<{
    disponible: boolean;
    latencia?: number;
    version?: string;
    timestamp?: number;
  }> {
    const tiempoInicio = Date.now();

    try {
      const resultado = await this.verificarDisponibilidadAPI();
      const latencia = Date.now() - tiempoInicio;

      return {
        disponible: resultado.exitoso,
        latencia,
        timestamp: Date.now(),
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return {
        disponible: false,
        latencia: Date.now() - tiempoInicio,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Reintenta una operación con backoff exponencial
   */
  public async reintentar<T>(
    operacion: () => Promise<T>,
    maxIntentos: number = 3,
    delayInicial: number = 1000
  ): Promise<T> {
    let ultimoError: any;

    for (let intento = 1; intento <= maxIntentos; intento++) {
      try {
        console.log(`🔄 Intento ${intento}/${maxIntentos}...`);
        return await operacion();
      } catch (error) {
        ultimoError = error;
        console.log(`❌ Intento ${intento} falló:`, error);

        if (intento < maxIntentos) {
          const delay = delayInicial * Math.pow(2, intento - 1);
          console.log(`⏱️ Esperando ${delay}ms antes del siguiente intento...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw ultimoError;
  }

  /**
   * Obtiene asistencias con reintentos automáticos
   */
  public async consultarAsistenciasConReintentos(
    rol: RolesSistema | ActoresSistema,
    dni: string,
    mes: number,
    maxIntentos: number = 2
  ): Promise<AsistenciaCompletaMensualDePersonal | null> {
    try {
      return await this.reintentar(
        () => this.consultarAsistenciasMensuales(rol, dni, mes),
        maxIntentos
      );
    } catch (error) {
      console.error(
        `❌ Falló después de ${maxIntentos} intentos al consultar asistencias:`,
        error
      );
      return null;
    }
  }

  /**
   * Elimina asistencia con reintentos automáticos
   */
  public async eliminarAsistenciaConReintentos(
    dni: string,
    rol: RolesSistema,
    modoRegistro: ModoRegistro,
    maxIntentos: number = 2
  ): Promise<OperationResult> {
    try {
      return await this.reintentar(
        () => this.eliminarAsistenciaRedis(dni, rol, modoRegistro),
        maxIntentos
      );
    } catch (error) {
      console.error(
        `❌ Falló después de ${maxIntentos} intentos al eliminar asistencia:`,
        error
      );
      return {
        exitoso: false,
        mensaje: `Error después de ${maxIntentos} intentos: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }

  /**
   * Valida respuesta de la API
   */
  public validarRespuestaAPI(response: any): {
    valida: boolean;
    errores: string[];
  } {
    const errores: string[] = [];

    if (!response) {
      errores.push("La respuesta es nula o undefined");
      return { valida: false, errores };
    }

    if (typeof response.success !== "boolean") {
      errores.push("El campo 'success' debe ser un boolean");
    }

    if (typeof response.message !== "string") {
      errores.push("El campo 'message' debe ser un string");
    }

    if (response.success && !response.data) {
      errores.push("Respuesta exitosa debe incluir datos");
    }

    if (!response.success && !response.errorType) {
      errores.push("Respuesta de error debe incluir 'errorType'");
    }

    return {
      valida: errores.length === 0,
      errores,
    };
  }

  /**
   * Transforma datos de API al formato interno
   */
  public transformarDatosAPI(datosAPI: AsistenciaCompletaMensualDePersonal): {
    entrada: Record<string, any>;
    salida: Record<string, any>;
  } {
    const entrada = this.mapper.procesarRegistrosJSON(
      datosAPI.Entradas,
      ModoRegistro.Entrada
    );

    const salida = this.mapper.procesarRegistrosJSON(
      datosAPI.Salidas,
      ModoRegistro.Salida
    );

    return { entrada, salida };
  }

  /**
   * Maneja errores específicos de API
   */
  public manejarErrorAPI(error: any): OperationResult {
    if (error?.response?.status === 404) {
      return {
        exitoso: false,
        mensaje: "Recurso no encontrado en el servidor",
      };
    }

    if (error?.response?.status === 401) {
      return {
        exitoso: false,
        mensaje: "No autorizado - token inválido o expirado",
      };
    }

    if (error?.response?.status === 500) {
      return {
        exitoso: false,
        mensaje: "Error interno del servidor",
      };
    }

    if (error?.code === "NETWORK_ERROR") {
      return {
        exitoso: false,
        mensaje: "Error de conexión a la red",
      };
    }

    if (error?.code === "TIMEOUT") {
      return {
        exitoso: false,
        mensaje: "Tiempo de espera agotado",
      };
    }

    return {
      exitoso: false,
      mensaje: `Error desconocido: ${
        error instanceof Error ? error.message : "Error sin descripción"
      }`,
    };
  }
}

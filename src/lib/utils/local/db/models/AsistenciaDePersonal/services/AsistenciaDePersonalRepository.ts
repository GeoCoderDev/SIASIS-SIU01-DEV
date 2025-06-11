/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AsistenciaMensualPersonal,
  TipoPersonal,
  ModoRegistro,
  RegistroEntradaSalida,
  OperationResult,
  ValidacionResult,
} from "../AsistenciaDePersonalTypes";
import { Meses } from "@/interfaces/shared/Meses";
import IndexedDBConnection from "../../../IndexedDBConnection";
import { AsistenciaDePersonalMapper } from "./AsistenciaDePersonalMapper";

/**
 * 🎯 RESPONSABILIDAD: Operaciones CRUD con IndexedDB
 * - Guardar registros mensuales
 * - Obtener registros mensuales
 * - Eliminar registros
 * - Verificar existencia
 * - Operaciones de consulta y filtrado
 */
export class AsistenciaDePersonalRepository {
  private mapper: AsistenciaDePersonalMapper;

  constructor(mapper: AsistenciaDePersonalMapper) {
    this.mapper = mapper;
  }

  /**
   * Guarda un registro mensual de asistencia usando el ID real de la API
   */
  public async guardarRegistroMensual(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    datos: AsistenciaMensualPersonal
  ): Promise<OperationResult> {
    try {
      await IndexedDBConnection.init();
      const storeName = this.mapper.getStoreName(tipoPersonal, modoRegistro);
      const store = await IndexedDBConnection.getStore(storeName, "readwrite");
      const idFieldName = this.mapper.getIdFieldName(tipoPersonal);
      const idField = this.mapper.getIdFieldForStore(
        tipoPersonal,
        modoRegistro
      );

      return new Promise((resolve, reject) => {
        try {
          const registroToSave: any = {
            [idField]: datos.Id_Registro_Mensual,
            Mes: datos.mes,
            [idFieldName]: datos.Dni_Personal,
          };

          if (modoRegistro === ModoRegistro.Entrada) {
            registroToSave.Entradas = datos.registros;
          } else {
            registroToSave.Salidas = datos.registros;
          }

          const putRequest = store.put(registroToSave);

          putRequest.onsuccess = () => {
            resolve({
              exitoso: true,
              mensaje: "Registro mensual guardado exitosamente",
              datos: datos.Id_Registro_Mensual,
            });
          };

          putRequest.onerror = (event) => {
            reject(
              new Error(
                `Error al guardar registro mensual: ${
                  (event.target as IDBRequest).error
                }`
              )
            );
          };
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error("Error en guardarRegistroMensual:", error);
      return {
        exitoso: false,
        mensaje: `Error al guardar registro mensual: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }

  /**
   * Obtiene el registro mensual de asistencia para un personal específico
   */
  public async obtenerRegistroMensual(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    Dni_Personal: string,
    mes: number,
    id_registro_mensual?: number
  ): Promise<AsistenciaMensualPersonal | null> {
    try {
      await IndexedDBConnection.init();
      const storeName = this.mapper.getStoreName(tipoPersonal, modoRegistro);
      const store = await IndexedDBConnection.getStore(storeName, "readonly");

      if (id_registro_mensual) {
        return new Promise((resolve, reject) => {
          try {
            const request = store.get(id_registro_mensual);

            request.onsuccess = () => {
              if (request.result) {
                const registroMensual: AsistenciaMensualPersonal =
                  this.mapearRegistroMensualDesdeStore(
                    request.result,
                    tipoPersonal,
                    modoRegistro
                  );
                resolve(registroMensual);
              } else {
                resolve(null);
              }
            };

            request.onerror = (event) => {
              reject(
                new Error(
                  `Error al obtener registro mensual por ID: ${
                    (event.target as IDBRequest).error
                  }`
                )
              );
            };
          } catch (error) {
            reject(error);
          }
        });
      }

      const indexName = this.mapper.getIndexNameForPersonalMes(tipoPersonal);

      return new Promise((resolve, reject) => {
        try {
          const index = store.index(indexName);
          const keyValue = [Dni_Personal, mes];
          const request = index.get(keyValue);

          request.onsuccess = () => {
            if (request.result) {
              const registroMensual: AsistenciaMensualPersonal =
                this.mapearRegistroMensualDesdeStore(
                  request.result,
                  tipoPersonal,
                  modoRegistro
                );
              resolve(registroMensual);
            } else {
              resolve(null);
            }
          };

          request.onerror = (event) => {
            reject(
              new Error(
                `Error al obtener registro mensual por índice: ${
                  (event.target as IDBRequest).error
                }`
              )
            );
          };
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error("Error en obtenerRegistroMensual:", error);
      return null;
    }
  }

  /**
   * Elimina registros mensuales locales
   */
  public async eliminarRegistroMensual(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    dni: string,
    mes: number
  ): Promise<OperationResult> {
    try {
      await IndexedDBConnection.init();
      const storeName = this.mapper.getStoreName(tipoPersonal, modoRegistro);
      const store = await IndexedDBConnection.getStore(storeName, "readwrite");
      const indexName = this.mapper.getIndexNameForPersonalMes(tipoPersonal);

      return new Promise((resolve, reject) => {
        try {
          const index = store.index(indexName);
          const keyValue = [dni, mes];
          const request = index.get(keyValue);

          request.onsuccess = () => {
            if (request.result) {
              const idField = this.mapper.getIdFieldForStore(
                tipoPersonal,
                modoRegistro
              );
              const id = request.result[idField];

              const deleteRequest = store.delete(id);
              deleteRequest.onsuccess = () => {
                console.log(
                  `🗑️ Registro eliminado: ${storeName} - ${dni} - mes ${mes}`
                );
                resolve({
                  exitoso: true,
                  mensaje: "Registro mensual eliminado exitosamente",
                });
              };
              deleteRequest.onerror = (event) => {
                reject(
                  new Error(
                    `Error al eliminar registro: ${
                      (event.target as IDBRequest).error
                    }`
                  )
                );
              };
            } else {
              resolve({
                exitoso: true,
                mensaje: "No había registro que eliminar",
              });
            }
          };

          request.onerror = (event) => {
            reject(
              new Error(
                `Error al buscar registro para eliminar: ${
                  (event.target as IDBRequest).error
                }`
              )
            );
          };
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error("Error al eliminar registro mensual:", error);
      return {
        exitoso: false,
        mensaje: `Error al eliminar registro: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }

  /**
   * Verifica si existe un registro mensual para un personal específico
   */
  public async verificarExistenciaRegistroMensual(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    dni: string,
    mes: number
  ): Promise<number | null> {
    try {
      await IndexedDBConnection.init();
      const storeName = this.mapper.getStoreName(tipoPersonal, modoRegistro);
      const store = await IndexedDBConnection.getStore(storeName, "readonly");
      const indexName = this.mapper.getIndexNameForPersonalMes(tipoPersonal);
      const idField = this.mapper.getIdFieldForStore(
        tipoPersonal,
        modoRegistro
      );

      return new Promise((resolve, reject) => {
        try {
          const index = store.index(indexName);
          const keyValue = [dni, mes];
          const request = index.get(keyValue);

          request.onsuccess = () => {
            if (request.result) {
              resolve(request.result[idField]);
            } else {
              resolve(null);
            }
          };

          request.onerror = (event) => {
            reject(
              new Error(
                `Error al verificar existencia: ${
                  (event.target as IDBRequest).error
                }`
              )
            );
          };
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error(
        "Error al verificar existencia de registro mensual:",
        error
      );
      return null;
    }
  }

  /**
   * Verifica si ya existe un registro diario para un personal específico
   */
  public async verificarSiExisteRegistroDiario(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    dni: string,
    mes: number,
    dia: number
  ): Promise<boolean> {
    try {
      await IndexedDBConnection.init();
      const storeName = this.mapper.getStoreName(tipoPersonal, modoRegistro);
      const store = await IndexedDBConnection.getStore(storeName, "readonly");
      const indexName = this.mapper.getIndexNameForPersonalMes(tipoPersonal);

      return new Promise((resolve, reject) => {
        try {
          const index = store.index(indexName);
          const keyValue = [dni, mes];
          const request = index.get(keyValue);

          request.onsuccess = () => {
            if (request.result) {
              const registrosDias =
                modoRegistro === ModoRegistro.Entrada
                  ? request.result.Entradas
                  : request.result.Salidas;

              if (registrosDias && registrosDias[dia.toString()]) {
                resolve(true);
                return;
              }
            }
            resolve(false);
          };

          request.onerror = (event) => {
            reject(
              new Error(
                `Error al verificar existencia de registro diario: ${
                  (event.target as IDBRequest).error
                }`
              )
            );
          };
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error("Error al verificar existencia de registro diario:", error);
      return false;
    }
  }

  /**
   * Obtiene todos los registros mensuales para un tipo de personal y un mes específico
   */
  public async obtenerTodosRegistrosMensuales(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    mes: Meses
  ): Promise<AsistenciaMensualPersonal[]> {
    try {
      await IndexedDBConnection.init();
      const storeName = this.mapper.getStoreName(tipoPersonal, modoRegistro);
      const store = await IndexedDBConnection.getStore(storeName, "readonly");
      const idFieldName = this.mapper.getIdFieldName(tipoPersonal);
      const idField = this.mapper.getIdFieldForStore(
        tipoPersonal,
        modoRegistro
      );

      return new Promise((resolve, reject) => {
        try {
          const index = store.index("por_mes");
          const request = index.getAll(mes);

          request.onsuccess = () => {
            if (request.result && request.result.length > 0) {
              const registrosMensuales: AsistenciaMensualPersonal[] =
                request.result.map((item) => ({
                  Id_Registro_Mensual: item[idField],
                  mes: item.Mes,
                  Dni_Personal: item[idFieldName],
                  registros:
                    modoRegistro === ModoRegistro.Entrada
                      ? item.Entradas
                      : item.Salidas,
                }));

              resolve(registrosMensuales);
            } else {
              resolve([]);
            }
          };

          request.onerror = (event) => {
            reject(
              new Error(
                `Error al obtener registros mensuales: ${
                  (event.target as IDBRequest).error
                }`
              )
            );
          };
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error("Error en obtenerTodosRegistrosMensuales:", error);
      return [];
    }
  }

  /**
   * Actualiza un registro existente agregando un nuevo día
   */
  public async actualizarRegistroExistente(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    dni: string,
    mes: number,
    dia: number,
    registro: RegistroEntradaSalida,
    idRegistroExistente: number
  ): Promise<OperationResult> {
    try {
      const registroActual = await this.obtenerRegistroMensual(
        tipoPersonal,
        modoRegistro,
        dni,
        mes,
        idRegistroExistente
      );

      if (registroActual) {
        registroActual.registros[dia.toString()] = registro;
        return await this.guardarRegistroMensual(
          tipoPersonal,
          modoRegistro,
          registroActual
        );
      }

      return {
        exitoso: false,
        mensaje: "No se encontró el registro a actualizar",
      };
    } catch (error) {
      console.error("Error en actualizarRegistroExistente:", error);
      return {
        exitoso: false,
        mensaje: `Error al actualizar registro: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }

  /**
   * Mapea un registro obtenido del store a la interfaz AsistenciaMensualPersonal
   */
  private mapearRegistroMensualDesdeStore(
    registroStore: any,
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro
  ): AsistenciaMensualPersonal {
    const idField = this.mapper.getIdFieldForStore(tipoPersonal, modoRegistro);
    const idPersonalField = this.mapper.getIdFieldName(tipoPersonal);

    return {
      Id_Registro_Mensual: registroStore[idField],
      mes: registroStore.Mes,
      Dni_Personal: registroStore[idPersonalField],
      registros:
        modoRegistro === ModoRegistro.Entrada
          ? registroStore.Entradas
          : registroStore.Salidas,
    };
  }

  /**
   * Elimina un día específico de un registro mensual
   */
  public async eliminarDiaDeRegistroMensual(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    dni: string,
    mes: number,
    dia: number
  ): Promise<OperationResult> {
    try {
      // Obtener el registro mensual actual
      const registroMensual = await this.obtenerRegistroMensual(
        tipoPersonal,
        modoRegistro,
        dni,
        mes
      );

      if (!registroMensual) {
        return {
          exitoso: false,
          mensaje: `No se encontró registro mensual para DNI: ${dni}, mes: ${mes}`,
        };
      }

      // Verificar si existe el día específico
      const claveDay = dia.toString();
      if (!registroMensual.registros[claveDay]) {
        return {
          exitoso: false,
          mensaje: `No se encontró registro para el día ${dia} en el mes ${mes}`,
        };
      }

      // Eliminar el día específico
      delete registroMensual.registros[claveDay];
      console.log(`🗑️ Día ${dia} eliminado del registro mensual`);

      // Decidir si mantener o eliminar todo el registro mensual
      if (Object.keys(registroMensual.registros).length === 0) {
        // Si no quedan más días, eliminar todo el registro mensual
        console.log(`📱 Eliminando registro mensual completo (sin más días)`);
        return await this.eliminarRegistroMensual(
          tipoPersonal,
          modoRegistro,
          dni,
          mes
        );
      } else {
        // Si quedan más días, actualizar el registro
        console.log(
          `📱 Actualizando registro mensual (quedan ${
            Object.keys(registroMensual.registros).length
          } días)`
        );
        return await this.guardarRegistroMensual(
          tipoPersonal,
          modoRegistro,
          registroMensual
        );
      }
    } catch (error) {
      console.error("Error al eliminar día del registro mensual:", error);
      return {
        exitoso: false,
        mensaje: `Error al eliminar día: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }

  /**
   * Valida la estructura de un registro antes de guardarlo
   */
  public validarEstructuraAntesSalvar(
    datos: AsistenciaMensualPersonal
  ): ValidacionResult {
    const errores: string[] = [];

    if (typeof datos.Id_Registro_Mensual !== "number") {
      errores.push("Id_Registro_Mensual debe ser un número");
    }

    if (typeof datos.mes !== "number" || datos.mes < 1 || datos.mes > 12) {
      errores.push("El mes debe ser un número entre 1 y 12");
    }

    if (
      typeof datos.Dni_Personal !== "string" ||
      datos.Dni_Personal.length !== 8
    ) {
      errores.push("Dni_Personal debe ser un string de 8 caracteres");
    }

    if (!datos.registros || typeof datos.registros !== "object") {
      errores.push("registros debe ser un objeto");
    } else {
      // Validar cada registro individual
      for (const [dia, registro] of Object.entries(datos.registros)) {
        if (isNaN(parseInt(dia))) {
          errores.push(`El día '${dia}' debe ser un número`);
        }

        if (!registro || typeof registro !== "object") {
          errores.push(`El registro del día ${dia} debe ser un objeto`);
          continue;
        }

        if (typeof registro.timestamp !== "number") {
          errores.push(`El timestamp del día ${dia} debe ser un número`);
        }

        if (typeof registro.desfaseSegundos !== "number") {
          errores.push(`El desfaseSegundos del día ${dia} debe ser un número`);
        }

        if (typeof registro.estado !== "string") {
          errores.push(`El estado del día ${dia} debe ser un string`);
        }
      }
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }
}

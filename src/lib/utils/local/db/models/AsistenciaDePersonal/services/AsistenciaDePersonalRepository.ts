/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AsistenciaMensualPersonalLocal,
  TipoPersonal,
  ModoRegistro,
  RegistroEntradaSalida,
  OperationResult,
  ValidacionResult,
} from "../AsistenciaDePersonalTypes";
import { Meses } from "@/interfaces/shared/Meses";
import IndexedDBConnection from "../../../IndexedDBConnection";
import { AsistenciaDePersonalMapper } from "./AsistenciaDePersonalMapper";
import { AsistenciaDePersonalDateHelper } from "./AsistenciaDePersonalDateHelper";

/**
 * 🎯 RESPONSABILIDAD: Operaciones CRUD con IndexedDB
 * - Guardar registros mensuales
 * - Obtener registros mensuales
 * - Eliminar registros
 * - Verificar existencia
 * - Operaciones de consulta y filtrado
 *
 * ✅ ACTUALIZADO: Soporta tanto IDs (directivos) como DNIs (otros roles)
 */
export class AsistenciaDePersonalRepository {
  private mapper: AsistenciaDePersonalMapper;
  private dateHelper: AsistenciaDePersonalDateHelper;

  constructor(
    mapper: AsistenciaDePersonalMapper,
    dateHelper: AsistenciaDePersonalDateHelper
  ) {
    this.mapper = mapper;
    this.dateHelper = dateHelper;
  }

  /**
   * Guarda un registro mensual de asistencia usando el ID real de la API
   * ✅ ACTUALIZADO: Soporta ID_o_DNI_Personal
   */
  public async guardarRegistroMensual(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    datos: AsistenciaMensualPersonalLocal
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
            [idFieldName]: datos.ID_o_DNI_Personal,
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
   * ✅ ACTUALIZADO: Usa ID_o_DNI_Personal
   */
  public async obtenerRegistroMensual(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    ID_o_DNI_Personal: string,
    mes: number,
    id_registro_mensual?: number
  ): Promise<AsistenciaMensualPersonalLocal | null> {
    try {
      await IndexedDBConnection.init();
      const storeName = this.mapper.getStoreName(tipoPersonal, modoRegistro);
      const store = await IndexedDBConnection.getStore(storeName, "readonly");

      // Si se proporciona ID del registro, buscar directamente
      if (id_registro_mensual) {
        return new Promise((resolve, reject) => {
          try {
            const request = store.get(id_registro_mensual);

            request.onsuccess = () => {
              if (request.result) {
                const registroMensual: AsistenciaMensualPersonalLocal =
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

      // ✅ VALIDAR valores antes de usar en índice
      this.validarValoresParaIndice(ID_o_DNI_Personal, mes, tipoPersonal);

      const indexName = this.mapper.getIndexNameForPersonalMes(tipoPersonal);

      return new Promise((resolve, reject) => {
        try {
          const index = store.index(indexName);

          // ✅ CONVERTIR identificador al tipo correcto
          const identificadorConvertido = this.convertirIdentificadorParaDB(
            tipoPersonal,
            ID_o_DNI_Personal
          );
          const keyValue = [identificadorConvertido, mes];

          console.log(`🔍 Buscando en índice: ${indexName}`, {
            tipoPersonal,
            identificadorOriginal: ID_o_DNI_Personal,
            identificadorConvertido,
            mes,
            keyValue,
          });

          const request = index.get(keyValue);

          request.onsuccess = () => {
            if (request.result) {
              const registroMensual: AsistenciaMensualPersonalLocal =
                this.mapearRegistroMensualDesdeStore(
                  request.result,
                  tipoPersonal,
                  modoRegistro
                );
              resolve(registroMensual);
            } else {
              console.log(
                `📊 No se encontró registro para: ${tipoPersonal} - ${ID_o_DNI_Personal} - mes ${mes}`
              );
              resolve(null);
            }
          };

          request.onerror = (event) => {
            const error = (event.target as IDBRequest).error;
            console.error(`❌ Error en índice ${indexName}:`, error);
            reject(
              new Error(
                `Error al obtener registro mensual por índice: ${error}`
              )
            );
          };
        } catch (error) {
          console.error(`❌ Error al preparar consulta:`, error);
          reject(error);
        }
      });
    } catch (error) {
      console.error("Error en obtenerRegistroMensual:", error);
      return null;
    }
  }

  /**
   * ✅ NUEVO: Convierte el identificador al tipo correcto según el personal
   */
  private convertirIdentificadorParaDB(
    tipoPersonal: TipoPersonal,
    idODni: string
  ): string | number {
    if (tipoPersonal === TipoPersonal.DIRECTIVO) {
      // Para directivos: convertir a número (Id_Directivo es INT en la BD)
      const id = parseInt(idODni, 10);
      if (isNaN(id)) {
        throw new Error(`ID de directivo inválido: ${idODni}`);
      }
      return id;
    } else {
      // Para otros roles: mantener como string (DNI)
      return idODni;
    }
  }

  /**
   * ✅ CORREGIDO: Validar valores antes de usar en índices
   */
  private validarValoresParaIndice(
    idODni: string,
    mes: number,
    tipoPersonal: TipoPersonal
  ): void {
    if (!idODni || idODni.trim() === "") {
      throw new Error(`ID/DNI no puede estar vacío para ${tipoPersonal}`);
    }

    if (!mes || mes < 1 || mes > 12) {
      throw new Error(`Mes inválido: ${mes}. Debe estar entre 1 y 12`);
    }

    // Validar formato específico
    if (!this.mapper.validarFormatoIdentificador(tipoPersonal, idODni)) {
      const tipoEsperado =
        this.mapper.getTipoIdentificadorLegible(tipoPersonal);
      throw new Error(
        `Formato de ${tipoEsperado} inválido para ${tipoPersonal}: ${idODni}`
      );
    }
  }

  /**
   * Elimina registros mensuales locales
   * ✅ ACTUALIZADO: Usa idODni
   */
  public async eliminarRegistroMensual(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    idODni: string, // ✅ ACTUALIZADO: Era dni
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
          const keyValue = [idODni, mes]; // ✅ ACTUALIZADO
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
                  `🗑️ Registro eliminado: ${storeName} - ${idODni} - mes ${mes}` // ✅ ACTUALIZADO
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
   * ✅ ACTUALIZADO: Usa idODni
   */
  public async verificarExistenciaRegistroMensual(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    idODni: string, // ✅ ACTUALIZADO: Era dni
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
          const keyValue = [idODni, mes]; // ✅ ACTUALIZADO
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
   * ✅ ACTUALIZADO: Usa idODni
   */
  /**
   * Verifica si ya existe un registro diario para un personal específico
   * ✅ CORREGIDO: Aplica validaciones y conversiones
   */
  public async verificarSiExisteRegistroDiario(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    idODni: string,
    mes: number,
    dia: number
  ): Promise<boolean> {
    try {
      await IndexedDBConnection.init();
      const storeName = this.mapper.getStoreName(tipoPersonal, modoRegistro);
      const store = await IndexedDBConnection.getStore(storeName, "readonly");

      // ✅ AGREGAR: Validar valores antes de usar en índice
      this.validarValoresParaIndice(idODni, mes, tipoPersonal);

      const indexName = this.mapper.getIndexNameForPersonalMes(tipoPersonal);

      return new Promise((resolve, reject) => {
        try {
          const index = store.index(indexName);

          // ✅ AGREGAR: Convertir identificador al tipo correcto
          const identificadorConvertido = this.convertirIdentificadorParaDB(
            tipoPersonal,
            idODni
          );
          const keyValue = [identificadorConvertido, mes];

          console.log(
            `🔍 verificarSiExisteRegistroDiario - Índice: ${indexName}`,
            {
              tipoPersonal,
              identificadorOriginal: idODni,
              identificadorConvertido,
              mes,
              dia,
              keyValue,
            }
          );

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
            const error = (event.target as IDBRequest).error;
            console.error(
              `❌ Error en verificarSiExisteRegistroDiario:`,
              error
            );
            reject(
              new Error(
                `Error al verificar existencia de registro diario: ${error}`
              )
            );
          };
        } catch (error) {
          console.error(
            `❌ Error al preparar consulta en verificarSiExisteRegistroDiario:`,
            error
          );
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
  ): Promise<AsistenciaMensualPersonalLocal[]> {
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
              const registrosMensuales: AsistenciaMensualPersonalLocal[] =
                request.result.map((item) => ({
                  Id_Registro_Mensual: item[idField],
                  mes: item.Mes,
                  ID_o_DNI_Personal: item[idFieldName], // ✅ ACTUALIZADO: Era Dni_Personal
                  registros:
                    modoRegistro === ModoRegistro.Entrada
                      ? item.Entradas
                      : item.Salidas,
                  ultima_fecha_actualizacion:
                    this.dateHelper.obtenerTimestampPeruano(),
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
   * ✅ ACTUALIZADO: Usa idODni
   */
  public async actualizarRegistroExistente(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    idODni: string, // ✅ ACTUALIZADO: Era dni
    mes: number,
    dia: number,
    registro: RegistroEntradaSalida,
    idRegistroExistente: number
  ): Promise<OperationResult> {
    try {
      const registroActual = await this.obtenerRegistroMensual(
        tipoPersonal,
        modoRegistro,
        idODni, // ✅ ACTUALIZADO
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
   * Mapea un registro obtenido del store a la interfaz AsistenciaMensualPersonalLocal
   * ✅ ACTUALIZADO: Usa ID_o_DNI_Personal
   */
  private mapearRegistroMensualDesdeStore(
    registroStore: any,
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro
  ): AsistenciaMensualPersonalLocal {
    const idField = this.mapper.getIdFieldForStore(tipoPersonal, modoRegistro);
    const idPersonalField = this.mapper.getIdFieldName(tipoPersonal);

    return {
      Id_Registro_Mensual: registroStore[idField],
      mes: registroStore.Mes,
      ID_o_DNI_Personal: registroStore[idPersonalField], // ✅ ACTUALIZADO: Era Dni_Personal
      registros:
        modoRegistro === ModoRegistro.Entrada
          ? registroStore.Entradas
          : registroStore.Salidas,
      ultima_fecha_actualizacion: this.dateHelper.obtenerTimestampPeruano(),
    };
  }

  /**
   * Elimina un día específico de un registro mensual
   * ✅ ACTUALIZADO: Usa idODni
   */
  public async eliminarDiaDeRegistroMensual(
    tipoPersonal: TipoPersonal,
    modoRegistro: ModoRegistro,
    idODni: string, // ✅ ACTUALIZADO: Era dni
    mes: number,
    dia: number
  ): Promise<OperationResult> {
    try {
      // Obtener el registro mensual actual
      const registroMensual = await this.obtenerRegistroMensual(
        tipoPersonal,
        modoRegistro,
        idODni, // ✅ ACTUALIZADO
        mes
      );

      if (!registroMensual) {
        return {
          exitoso: false,
          mensaje: `No se encontró registro mensual para ID/DNI: ${idODni}, mes: ${mes}`, // ✅ ACTUALIZADO
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
          idODni, // ✅ ACTUALIZADO
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
   * ✅ ACTUALIZADO: Validación mejorada para ID_o_DNI_Personal
   */
  public validarEstructuraAntesSalvar(
    datos: AsistenciaMensualPersonalLocal,
    tipoPersonal?: TipoPersonal // ✅ NUEVO: Para validar según tipo
  ): ValidacionResult {
    const errores: string[] = [];

    if (typeof datos.Id_Registro_Mensual !== "number") {
      errores.push("Id_Registro_Mensual debe ser un número");
    }

    if (typeof datos.mes !== "number" || datos.mes < 1 || datos.mes > 12) {
      errores.push("El mes debe ser un número entre 1 y 12");
    }

    // ✅ NUEVA VALIDACIÓN: Soporte para ID (directivos) y DNI (otros)
    if (
      typeof datos.ID_o_DNI_Personal !== "string" ||
      datos.ID_o_DNI_Personal.trim().length === 0
    ) {
      errores.push("ID_o_DNI_Personal debe ser un string no vacío");
    } else {
      // Validación específica según el tipo de personal
      if (tipoPersonal === TipoPersonal.DIRECTIVO) {
        // Para directivos: puede ser cualquier string válido (usualmente números)
        if (!/^[a-zA-Z0-9]+$/.test(datos.ID_o_DNI_Personal)) {
          errores.push(
            "ID_o_DNI_Personal para directivos debe contener solo caracteres alfanuméricos"
          );
        }
      } else {
        // Para otros roles: debe ser DNI de 8 dígitos
        if (!/^\d{8}$/.test(datos.ID_o_DNI_Personal)) {
          errores.push(
            "ID_o_DNI_Personal para personal no-directivo debe ser un DNI de 8 dígitos"
          );
        }
      }
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

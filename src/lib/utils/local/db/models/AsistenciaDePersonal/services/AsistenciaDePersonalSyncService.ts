/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AsistenciaMensualPersonal,
  ModoRegistro,
  RolesSistema,
  OperationResult,
  ConsultaAsistenciaResult,
  SincronizacionStats,
} from "../AsistenciaDePersonalTypes";

import { AsistenciaCompletaMensualDePersonal } from "@/interfaces/shared/apis/api01/personal/types";
import {
  AsistenciaDiariaResultado,
  ConsultarAsistenciasTomadasPorActorEnRedisResponseBody,
  //   DetallesAsistenciaUnitariaPersonal,
} from "@/interfaces/shared/AsistenciaRequests";
import { AsistenciaDePersonalRepository } from "./AsistenciaDePersonalRepository";
import { AsistenciaDePersonalValidator } from "./AsistenciaDePersonalValidator";
import { AsistenciaDePersonalAPIClient } from "./AsistenciaDePersonalAPIClient";
import { AsistenciaDePersonalMapper } from "./AsistenciaDePersonalMapper";
import { AsistenciaDePersonalCacheManager } from "./AsistenciaDePersonalCacheManager";
import { AsistenciaDePersonalDateHelper } from "./AsistenciaDePersonalDateHelper";

/**
 * 🎯 RESPONSABILIDAD: Sincronización y coordinación de datos
 * - Sincronizar datos entre API, cache y base de datos local
 * - Forzar sincronización completa
 * - Procesar datos de múltiples fuentes
 * - Resolver conflictos de sincronización
 */
export class AsistenciaPersonalSyncService {
  private repository: AsistenciaDePersonalRepository;
  private validator: AsistenciaDePersonalValidator;
  private apiClient: AsistenciaDePersonalAPIClient;
  private mapper: AsistenciaDePersonalMapper;
  private cacheManager: AsistenciaDePersonalCacheManager;
  private dateHelper: AsistenciaDePersonalDateHelper;

  constructor(
    repository: AsistenciaDePersonalRepository,
    validator: AsistenciaDePersonalValidator,
    apiClient: AsistenciaDePersonalAPIClient,
    mapper: AsistenciaDePersonalMapper,
    cacheManager: AsistenciaDePersonalCacheManager,
    dateHelper: AsistenciaDePersonalDateHelper
  ) {
    this.repository = repository;
    this.validator = validator;
    this.apiClient = apiClient;
    this.mapper = mapper;
    this.cacheManager = cacheManager;
    this.dateHelper = dateHelper;
  }

  /**
   * Fuerza la sincronización completa desde la API
   * Elimina ambos registros locales y los reemplaza con datos frescos de la API
   */
  public async forzarSincronizacionCompleta(
    rol: RolesSistema,
    dni: string,
    mes: number
  ): Promise<{
    entrada?: AsistenciaMensualPersonal;
    salida?: AsistenciaMensualPersonal;
    sincronizado: boolean;
    mensaje: string;
  }> {
    try {
      const tipoPersonal = this.mapper.obtenerTipoPersonalDesdeRolOActor(rol);

      console.log(
        `🔄 FORZANDO SINCRONIZACIÓN COMPLETA para ${dni} - mes ${mes}`
      );

      // PASO 1: Eliminar ambos registros locales (entrada y salida)
      console.log("🗑️ Eliminando registros locales desincronizados...");
      await Promise.allSettled([
        this.repository.eliminarRegistroMensual(
          tipoPersonal,
          ModoRegistro.Entrada,
          dni,
          mes
        ),
        this.repository.eliminarRegistroMensual(
          tipoPersonal,
          ModoRegistro.Salida,
          dni,
          mes
        ),
      ]);

      // PASO 2: Consultar API para obtener datos frescos
      console.log("📡 Consultando API para datos frescos...");
      const asistenciaAPI =
        await this.apiClient.consultarAsistenciasConReintentos(rol, dni, mes);

      if (!asistenciaAPI) {
        console.log(
          "❌ API no devolvió datos después de la sincronización forzada"
        );
        return {
          sincronizado: false,
          mensaje:
            "No se encontraron datos en la API después de la sincronización",
        };
      }

      // PASO 3: Procesar y guardar AMBOS tipos de registro desde la API
      console.log("💾 Guardando datos frescos de la API...");
      await this.procesarYGuardarAsistenciaDesdeAPI(asistenciaAPI);

      // PASO 4: Verificar que ambos registros se guardaron correctamente
      const [nuevaEntrada, nuevaSalida] = await Promise.all([
        this.repository.obtenerRegistroMensual(
          tipoPersonal,
          ModoRegistro.Entrada,
          dni,
          mes,
          asistenciaAPI.Id_Registro_Mensual_Entrada
        ),
        this.repository.obtenerRegistroMensual(
          tipoPersonal,
          ModoRegistro.Salida,
          dni,
          mes,
          asistenciaAPI.Id_Registro_Mensual_Salida
        ),
      ]);

      // PASO 5: Verificar que la sincronización fue exitosa
      const verificacion = this.validator.verificarSincronizacionEntradaSalida(
        nuevaEntrada,
        nuevaSalida
      );

      if (verificacion.estanSincronizados) {
        console.log(
          `✅ Datos sincronizados: ${verificacion.diasEscolaresEntrada} días escolares históricos + día actual y fines de semana permitidos`
        );
        return {
          entrada: nuevaEntrada || undefined,
          salida: nuevaSalida || undefined,
          sincronizado: true,
          mensaje: `Datos sincronizados exitosamente: ${verificacion.diasEscolaresEntrada} días escolares históricos`,
        };
      } else {
        console.log(`❌ Sincronización falló: ${verificacion.razon}`);
        return {
          entrada: nuevaEntrada || undefined,
          salida: nuevaSalida || undefined,
          sincronizado: false,
          mensaje: `Error en sincronización: ${verificacion.razon}`,
        };
      }
    } catch (error) {
      console.error("❌ Error durante sincronización forzada:", error);
      return {
        sincronizado: false,
        mensaje: `Error durante la sincronización: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }

  /**
   * Procesa y guarda asistencia desde la API
   */
  public async procesarYGuardarAsistenciaDesdeAPI(
    asistenciaAPI: AsistenciaCompletaMensualDePersonal,
    modoRegistroSolicitado?: ModoRegistro
  ): Promise<OperationResult> {
    try {
      const tipoPersonal = this.mapper.obtenerTipoPersonalDesdeRolOActor(
        asistenciaAPI.Rol
      );

      const procesarYGuardar = async (modoRegistro: ModoRegistro) => {
        const registrosData =
          modoRegistro === ModoRegistro.Entrada
            ? asistenciaAPI.Entradas
            : asistenciaAPI.Salidas;

        const idReal =
          modoRegistro === ModoRegistro.Entrada
            ? asistenciaAPI.Id_Registro_Mensual_Entrada
            : asistenciaAPI.Id_Registro_Mensual_Salida;

        const registrosProcesados = this.mapper.procesarRegistrosJSON(
          registrosData,
          modoRegistro
        );

        if (Object.keys(registrosProcesados).length > 0) {
          await this.repository.guardarRegistroMensual(
            tipoPersonal,
            modoRegistro,
            {
              Id_Registro_Mensual: idReal,
              mes: asistenciaAPI.Mes,
              Dni_Personal: asistenciaAPI.DNI_Usuario,
              registros: registrosProcesados,
            }
          );
        }
      };

      if (modoRegistroSolicitado) {
        await procesarYGuardar(modoRegistroSolicitado);
      } else {
        await Promise.all([
          procesarYGuardar(ModoRegistro.Entrada),
          procesarYGuardar(ModoRegistro.Salida),
        ]);
      }

      return {
        exitoso: true,
        mensaje: "Datos de API procesados y guardados exitosamente",
      };
    } catch (error) {
      console.error("Error al procesar datos de API:", error);
      return {
        exitoso: false,
        mensaje: `Error al procesar datos de API: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }

  /**
   * Fuerza la actualización desde la API eliminando datos locales
   */
  public async forzarActualizacionDesdeAPI(
    rol: RolesSistema,
    dni: string,
    mes: number
  ): Promise<ConsultaAsistenciaResult> {
    try {
      const tipoPersonal = this.mapper.obtenerTipoPersonalDesdeRolOActor(rol);

      console.log(
        `🔄 Forzando actualización desde API para ${rol} ${dni} - mes ${mes}...`
      );

      // Eliminar registros locales existentes
      await Promise.all([
        this.repository.eliminarRegistroMensual(
          tipoPersonal,
          ModoRegistro.Entrada,
          dni,
          mes
        ),
        this.repository.eliminarRegistroMensual(
          tipoPersonal,
          ModoRegistro.Salida,
          dni,
          mes
        ),
      ]);

      // Consultar API y guardar
      return await this.obtenerAsistenciaMensualConAPI(rol, dni, mes);
    } catch (error) {
      console.error("Error al forzar actualización desde API:", error);

      return {
        encontrado: false,
        mensaje: "Error al forzar la actualización de datos",
      };
    }
  }

  /**
   * Obtiene asistencias mensuales con verificación de sincronización
   * Integra datos del día actual desde cache Redis
   */
  public async obtenerAsistenciaMensualConAPI(
    rol: RolesSistema,
    dni: string,
    mes: number
  ): Promise<ConsultaAsistenciaResult> {
    try {
      const tipoPersonal = this.mapper.obtenerTipoPersonalDesdeRolOActor(rol);

      // Obtener fecha actual desde Redux
      const fechaActualRedux = this.dateHelper.obtenerFechaActualDesdeRedux();
      if (!fechaActualRedux) {
        throw new Error("No se pudo obtener la fecha desde Redux");
      }

      const mesActual = fechaActualRedux.getMonth() + 1;
      const diaActual = fechaActualRedux.getDate();
      const esConsultaMesActual = mes === mesActual;

      console.log(
        `🎯 Iniciando consulta para ${dni} - mes ${mes} (actual: ${mesActual})`
      );
      console.log(
        `📅 Es consulta del mes actual: ${esConsultaMesActual ? "SÍ" : "NO"}`
      );

      // PASO 1: Buscar registros locales (entrada y salida)
      const [registroEntradaLocal, registroSalidaLocal] = await Promise.all([
        this.repository.obtenerRegistroMensual(
          tipoPersonal,
          ModoRegistro.Entrada,
          dni,
          mes
        ),
        this.repository.obtenerRegistroMensual(
          tipoPersonal,
          ModoRegistro.Salida,
          dni,
          mes
        ),
      ]);

      // PASO 2: Verificar sincronización por cantidad de días
      const verificacion = this.validator.verificarSincronizacionEntradaSalida(
        registroEntradaLocal,
        registroSalidaLocal
      );

      // PASO 3: Si NO están sincronizados, forzar sincronización desde API
      if (!verificacion.estanSincronizados) {
        console.log(`⚠️ DATOS DESINCRONIZADOS: ${verificacion.razon}`);
        console.log("🔄 Iniciando sincronización forzada desde API...");

        const resultadoSincronizacion = await this.forzarSincronizacionCompleta(
          rol,
          dni,
          mes
        );

        if (resultadoSincronizacion.sincronizado) {
          // Si logramos sincronizar desde API, aplicar integración con cache
          return await this.cacheManager.combinarDatosHistoricosYActuales(
            resultadoSincronizacion.entrada || null,
            resultadoSincronizacion.salida || null,
            rol,
            dni,
            esConsultaMesActual,
            diaActual,
            `🔄 ${resultadoSincronizacion.mensaje}`
          );
        } else {
          // Si sincronización falla, buscar en cache al menos el día actual
          if (esConsultaMesActual) {
            console.log(
              "🔍 Sincronización falló, buscando datos del día actual en cache..."
            );
            return await this.cacheManager.obtenerSoloDatosDelDiaActual(
              rol,
              dni,
              diaActual
            );
          } else {
            return {
              encontrado: false,
              mensaje: `❌ Error en sincronización: ${resultadoSincronizacion.mensaje}`,
            };
          }
        }
      }

      // PASO 4: Los datos están sincronizados, proceder según el tipo de consulta
      if (
        verificacion.diasEscolaresEntrada === 0 &&
        verificacion.diasEscolaresSalida === 0
      ) {
        // CASO 1: No hay datos históricos - Primera consulta del mes
        console.log(
          "📡 No hay datos escolares históricos, consultando API por primera vez..."
        );

        const asistenciaAPI =
          await this.apiClient.consultarAsistenciasConReintentos(rol, dni, mes);

        if (asistenciaAPI) {
          console.log("✅ API devolvió datos históricos, guardando...");
          await this.procesarYGuardarAsistenciaDesdeAPI(asistenciaAPI);

          const [nuevaEntrada, nuevaSalida] = await Promise.all([
            this.repository.obtenerRegistroMensual(
              tipoPersonal,
              ModoRegistro.Entrada,
              dni,
              mes,
              asistenciaAPI.Id_Registro_Mensual_Entrada
            ),
            this.repository.obtenerRegistroMensual(
              tipoPersonal,
              ModoRegistro.Salida,
              dni,
              mes,
              asistenciaAPI.Id_Registro_Mensual_Salida
            ),
          ]);

          return await this.cacheManager.combinarDatosHistoricosYActuales(
            nuevaEntrada,
            nuevaSalida,
            rol,
            dni,
            esConsultaMesActual,
            diaActual,
            "Datos obtenidos y guardados desde la API"
          );
        } else {
          // API no tiene datos (404), buscar en cache local para mostrar info disponible
          console.log("❌ API devolvió 404 (sin datos históricos)");

          if (esConsultaMesActual) {
            console.log(
              "🔍 API sin datos, verificando cache Redis para mostrar al menos el día actual..."
            );
            const resultadoCache =
              await this.cacheManager.obtenerSoloDatosDelDiaActual(
                rol,
                dni,
                diaActual
              );

            if (resultadoCache.encontrado) {
              // Éxito: Encontramos datos del día actual en cache
              return {
                ...resultadoCache,
                mensaje:
                  "📱 API sin datos históricos, mostrando solo asistencia del día actual desde cache Redis",
              };
            } else {
              // Ni API ni cache tienen datos
              return {
                encontrado: false,
                mensaje:
                  "No se encontraron registros de asistencia para el mes consultado (ni en API ni en cache local)",
              };
            }
          } else {
            // Para meses anteriores sin datos en API
            return {
              encontrado: false,
              mensaje:
                "No se encontraron registros de asistencia para el mes consultado",
            };
          }
        }
      }

      // CASO 2: Hay datos históricos sincronizados
      console.log(
        `✅ Datos locales sincronizados: ${verificacion.diasEscolaresEntrada} días escolares históricos`
      );

      return await this.cacheManager.combinarDatosHistoricosYActuales(
        registroEntradaLocal,
        registroSalidaLocal,
        rol,
        dni,
        esConsultaMesActual,
        diaActual,
        `Datos sincronizados obtenidos desde IndexedDB: ${verificacion.diasEscolaresEntrada} días escolares históricos`
      );
    } catch (error) {
      console.error(
        "❌ Error al obtener asistencias mensuales con API:",
        error
      );

      // En caso de error, intentar mostrar al menos datos del cache si es mes actual
      const fechaActualRedux = this.dateHelper.obtenerFechaActualDesdeRedux();
      if (fechaActualRedux && mes === fechaActualRedux.getMonth() + 1) {
        console.log(
          "🆘 Error en consulta principal, intentando mostrar datos del cache como fallback..."
        );
        try {
          const fallbackCache =
            await this.cacheManager.obtenerSoloDatosDelDiaActual(
              rol,
              dni,
              fechaActualRedux.getDate()
            );

          if (fallbackCache.encontrado) {
            return {
              ...fallbackCache,
              mensaje:
                "⚠️ Error en consulta principal, mostrando datos del día actual desde cache como respaldo",
            };
          }
        } catch (cacheError) {
          console.error("Error también en fallback de cache:", cacheError);
        }
      }

      return {
        encontrado: false,
        mensaje: "Error al obtener los datos de asistencia",
      };
    }
  }

  /**
   * Sincroniza las asistencias registradas en Redis con la base de datos local IndexedDB
   */
  public async sincronizarAsistenciasDesdeRedis(
    datosRedis: ConsultarAsistenciasTomadasPorActorEnRedisResponseBody
  ): Promise<SincronizacionStats> {
    const stats: SincronizacionStats = {
      totalRegistros: (datosRedis.Resultados as AsistenciaDiariaResultado[])
        .length,
      registrosNuevos: 0,
      registrosExistentes: 0,
      errores: 0,
    };

    try {
      const tipoPersonal = this.mapper.obtenerTipoPersonalDesdeRolOActor(
        datosRedis.Actor
      );

      const mesActual = datosRedis.Mes;
      const diaActual = datosRedis.Dia;

      if (diaActual === 0) {
        console.error(
          "No se pudo determinar el día desde los resultados de Redis"
        );
        return {
          ...stats,
          errores: stats.totalRegistros,
        };
      }

      for (const resultado of datosRedis.Resultados as AsistenciaDiariaResultado[]) {
        try {
          const registroExistente =
            await this.repository.verificarSiExisteRegistroDiario(
              tipoPersonal,
              datosRedis.ModoRegistro,
              resultado.DNI,
              mesActual,
              diaActual
            );

          if (registroExistente) {
            stats.registrosExistentes++;
            continue;
          }

          // Crear registro para marcar asistencia
          //   const estado = this.mapper.determinarEstadoAsistencia(
          //     (resultado.Detalles as DetallesAsistenciaUnitariaPersonal)
          //       ?.DesfaseSegundos || 0,
          //     datosRedis.ModoRegistro
          //   );

          // Procesar registro (esto se delegará al servicio principal)
          console.log(
            `🔄 Sincronizando registro: ${resultado.DNI} - ${datosRedis.ModoRegistro}`
          );

          stats.registrosNuevos++;
        } catch (error) {
          console.error(
            `Error al sincronizar registro para DNI ${resultado.DNI}:`,
            error
          );
          stats.errores++;
        }
      }

      return stats;
    } catch (error) {
      console.error("Error en sincronizarAsistenciasDesdeRedis:", error);

      return {
        ...stats,
        errores: stats.totalRegistros,
      };
    }
  }

  /**
   * Verifica la integridad de los datos sincronizados
   */
  public async verificarIntegridadDatos(
    rol: RolesSistema,
    dni: string,
    mes: number
  ): Promise<{
    integro: boolean;
    problemas: string[];
    recomendaciones: string[];
  }> {
    const problemas: string[] = [];
    const recomendaciones: string[] = [];

    try {
      const tipoPersonal = this.mapper.obtenerTipoPersonalDesdeRolOActor(rol);

      // Obtener registros locales
      const [registroEntrada, registroSalida] = await Promise.all([
        this.repository.obtenerRegistroMensual(
          tipoPersonal,
          ModoRegistro.Entrada,
          dni,
          mes
        ),
        this.repository.obtenerRegistroMensual(
          tipoPersonal,
          ModoRegistro.Salida,
          dni,
          mes
        ),
      ]);

      // Verificar sincronización
      const sincronizacion =
        this.validator.verificarSincronizacionEntradaSalida(
          registroEntrada,
          registroSalida
        );

      if (!sincronizacion.estanSincronizados) {
        problemas.push(`Desincronización: ${sincronizacion.razon}`);
        recomendaciones.push("Ejecutar sincronización forzada desde API");
      }

      // Verificar estructura de datos
      if (registroEntrada) {
        const validacionEntrada =
          this.validator.validarEstructuraRegistroMensual(registroEntrada);
        if (!validacionEntrada.valido) {
          problemas.push(
            `Entrada inválida: ${validacionEntrada.errores.join(", ")}`
          );
        }
      }

      if (registroSalida) {
        const validacionSalida =
          this.validator.validarEstructuraRegistroMensual(registroSalida);
        if (!validacionSalida.valido) {
          problemas.push(
            `Salida inválida: ${validacionSalida.errores.join(", ")}`
          );
        }
      }

      // Verificar completitud de días laborales
      const diasLaborales = this.dateHelper.obtenerDiasLaboralesAnteriores();
      const entradaCompleta = this.validator.verificarRegistroMensualCompleto(
        registroEntrada,
        diasLaborales
      );
      const salidaCompleta = this.validator.verificarRegistroMensualCompleto(
        registroSalida,
        diasLaborales
      );

      if (!entradaCompleta) {
        problemas.push(
          "Registro de entrada incompleto (faltan días laborales)"
        );
        recomendaciones.push("Consultar API para obtener días faltantes");
      }

      if (!salidaCompleta) {
        problemas.push("Registro de salida incompleto (faltan días laborales)");
        recomendaciones.push("Consultar API para obtener días faltantes");
      }

      return {
        integro: problemas.length === 0,
        problemas,
        recomendaciones,
      };
    } catch (error) {
      console.error("Error al verificar integridad de datos:", error);
      return {
        integro: false,
        problemas: [`Error al verificar integridad: ${error}`],
        recomendaciones: ["Revisar logs de error y conexión a base de datos"],
      };
    }
  }

  /**
   * Repara datos corruptos o desincronizados
   */
  public async repararDatos(
    rol: RolesSistema,
    dni: string,
    mes: number
  ): Promise<OperationResult> {
    try {
      console.log(`🔧 Iniciando reparación de datos para ${dni} - mes ${mes}`);

      // Paso 1: Verificar problemas
      const verificacion = await this.verificarIntegridadDatos(rol, dni, mes);

      if (verificacion.integro) {
        return {
          exitoso: true,
          mensaje: "Los datos ya están íntegros, no se requiere reparación",
        };
      }

      console.log(
        `🔍 Problemas detectados: ${verificacion.problemas.join(", ")}`
      );

      // Paso 2: Intentar reparación mediante sincronización forzada
      const resultadoSync = await this.forzarSincronizacionCompleta(
        rol,
        dni,
        mes
      );

      if (resultadoSync.sincronizado) {
        // Paso 3: Verificar que la reparación fue exitosa
        const nuevaVerificacion = await this.verificarIntegridadDatos(
          rol,
          dni,
          mes
        );

        if (nuevaVerificacion.integro) {
          return {
            exitoso: true,
            mensaje: `Datos reparados exitosamente: ${resultadoSync.mensaje}`,
            datos: {
              problemasOriginales: verificacion.problemas,
              solucionAplicada: "Sincronización forzada desde API",
            },
          };
        } else {
          return {
            exitoso: false,
            mensaje: `Reparación parcial. Problemas restantes: ${nuevaVerificacion.problemas.join(
              ", "
            )}`,
            datos: {
              problemasOriginales: verificacion.problemas,
              problemasRestantes: nuevaVerificacion.problemas,
            },
          };
        }
      } else {
        return {
          exitoso: false,
          mensaje: `No se pudo reparar: ${resultadoSync.mensaje}`,
          datos: {
            problemasDetectados: verificacion.problemas,
            recomendaciones: verificacion.recomendaciones,
          },
        };
      }
    } catch (error) {
      console.error("Error durante reparación de datos:", error);
      return {
        exitoso: false,
        mensaje: `Error durante la reparación: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }
}

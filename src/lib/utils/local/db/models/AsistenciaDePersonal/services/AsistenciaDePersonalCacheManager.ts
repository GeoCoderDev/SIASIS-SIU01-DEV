import { Meses } from "@/interfaces/shared/Meses";
import {
  OperationResult,
  ActoresSistema,
  ModoRegistro,
  TipoAsistencia,
  EstadosAsistenciaPersonal,
  RolesSistema,
  AsistenciaMensualPersonalLocal,
  RegistroEntradaSalida,
} from "../AsistenciaDePersonalTypes";
import {
  AsistenciaPersonalHoy,
  AsistenciasTomadasHoyIDB,
  ConsultaAsistenciaHoy,
} from "../../AsistenciasTomadasHoy/AsistenciasTomadasHoyIDB";
import { AsistenciaDePersonalDateHelper } from "./AsistenciaDePersonalDateHelper";
import { AsistenciaDePersonalMapper } from "./AsistenciaDePersonalMapper";
import IndexedDBConnection from "../../../IndexedDBConnection";

/**
 * 🎯 RESPONSABILIDAD: Manejo del cache de asistencias
 * - Gestionar cache de asistencias de hoy (Redis local)
 * - Integrar datos del cache con registros mensuales
 * - Consultar y actualizar cache
 * - Limpiar cache obsoleto
 */
export class AsistenciaDePersonalCacheManager {
  private cacheAsistenciasHoy: AsistenciasTomadasHoyIDB;
  private mapper: AsistenciaDePersonalMapper;
  private dateHelper: AsistenciaDePersonalDateHelper;

  constructor(
    mapper: AsistenciaDePersonalMapper,
    dateHelper: AsistenciaDePersonalDateHelper
  ) {
    this.mapper = mapper;
    this.dateHelper = dateHelper;
    this.cacheAsistenciasHoy = new AsistenciasTomadasHoyIDB();

    // Inicializar rutinas de mantenimiento del cache
    this.cacheAsistenciasHoy.inicializarMantenimiento();
  }

  /**
   * Consulta cache de asistencias para el día actual
   */
  public async consultarCacheAsistenciaHoy(
    actor: ActoresSistema,
    modoRegistro: ModoRegistro,
    dni: string,
    fecha: string
  ): Promise<AsistenciaPersonalHoy | null> {
    try {
      const consulta: ConsultaAsistenciaHoy = {
        dni,
        actor,
        modoRegistro,
        tipoAsistencia: TipoAsistencia.ParaPersonal,
        fecha,
      };

      console.log(
        `🔍 Consultando cache: ${actor} - ${modoRegistro} - ${dni} - ${fecha}`
      );

      const resultado = await this.cacheAsistenciasHoy.consultarAsistencia(
        consulta
      );

      if (resultado) {
        console.log(
          `✅ Encontrado en cache: ${dni} - ${modoRegistro} - ${
            (resultado as AsistenciaPersonalHoy).estado
          }`
        );
      } else {
        console.log(`❌ No encontrado en cache: ${dni} - ${modoRegistro}`);
      }

      return resultado as AsistenciaPersonalHoy | null;
    } catch (error) {
      console.error("Error al consultar cache de asistencias:", error);
      return null;
    }
  }

  /**
   * Guarda asistencia en el cache
   */
  public async guardarAsistenciaEnCache(
    asistencia: AsistenciaPersonalHoy
  ): Promise<OperationResult> {
    try {
      await this.cacheAsistenciasHoy.guardarAsistencia(asistencia);

      return {
        exitoso: true,
        mensaje: "Asistencia guardada en cache exitosamente",
        datos: asistencia.clave,
      };
    } catch (error) {
      console.error("Error al guardar asistencia en cache:", error);
      return {
        exitoso: false,
        mensaje: `Error al guardar en cache: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }

  /**
   * Integra datos del cache en el registro mensual
   */
  public integrarDatosDeCacheEnRegistroMensual(
    registroMensual: AsistenciaMensualPersonalLocal | null,
    datosCache: AsistenciaPersonalHoy,
    diaActual: number,
    modoRegistro: ModoRegistro,
    dni: string,
    fecha: string
  ): AsistenciaMensualPersonalLocal {
    // Si no existe registro mensual, crear uno nuevo
    if (!registroMensual) {
      const fechaObj = new Date(fecha);
      const mes = (fechaObj.getMonth() + 1) as Meses;

      console.log(`📝 Creando nuevo registro mensual para ${dni} - mes ${mes}`);

      registroMensual = {
        Id_Registro_Mensual: 0, // ID temporal
        mes,
        ID_o_DNI_Personal: dni,
        registros: {},
        ultima_fecha_actualizacion: this.dateHelper.obtenerTimestampPeruano()
      };
    }

    // Agregar/actualizar el día actual con datos del cache
    const registroDia: RegistroEntradaSalida = {
      timestamp: datosCache.timestamp,
      desfaseSegundos: datosCache.desfaseSegundos,
      estado: datosCache.estado,
    };

    registroMensual.registros[diaActual.toString()] = registroDia;

    console.log(
      `🔄 Día ${diaActual} integrado desde cache: ${datosCache.estado} (timestamp: ${datosCache.timestamp})`
    );

    return registroMensual;
  }

  /**
   * Combina datos históricos (IndexedDB) con datos del día actual (cache Redis)
   */
  public async combinarDatosHistoricosYActuales(
    registroEntrada: AsistenciaMensualPersonalLocal | null,
    registroSalida: AsistenciaMensualPersonalLocal | null,
    rol: RolesSistema,
    dni: string,
    esConsultaMesActual: boolean,
    diaActual: number,
    mensajeBase: string
  ): Promise<{
    entrada?: AsistenciaMensualPersonalLocal;
    salida?: AsistenciaMensualPersonalLocal;
    encontrado: boolean;
    mensaje: string;
  }> {
    let entradaFinal = registroEntrada;
    let salidaFinal = registroSalida;
    let encontradoEnCache = false;

    // Integración cache: Solo para consultas del mes actual
    if (esConsultaMesActual) {
      console.log(
        `🔍 Consultando cache Redis para el día actual (${diaActual})...`
      );

      const actor = this.mapper.obtenerActorDesdeRol(rol);
      const fechaHoy = this.dateHelper.obtenerFechaStringActual();

      if (fechaHoy) {
        // Consultar cache para entrada y salida del día actual
        const [entradaCache, salidaCache] = await Promise.all([
          this.consultarCacheAsistenciaHoy(
            actor,
            ModoRegistro.Entrada,
            dni,
            fechaHoy
          ),
          this.consultarCacheAsistenciaHoy(
            actor,
            ModoRegistro.Salida,
            dni,
            fechaHoy
          ),
        ]);

        // Integrar entrada desde cache
        if (entradaCache) {
          console.log(`📱 Entrada del día actual encontrada en cache`);
          entradaFinal = this.integrarDatosDeCacheEnRegistroMensual(
            entradaFinal,
            entradaCache,
            diaActual,
            ModoRegistro.Entrada,
            dni,
            fechaHoy
          );
          encontradoEnCache = true;
        }

        // Integrar salida desde cache
        if (salidaCache) {
          console.log(`📱 Salida del día actual encontrada en cache`);
          salidaFinal = this.integrarDatosDeCacheEnRegistroMensual(
            salidaFinal,
            salidaCache,
            diaActual,
            ModoRegistro.Salida,
            dni,
            fechaHoy
          );
          encontradoEnCache = true;
        }
      }
    }

    const encontrado = !!(entradaFinal || salidaFinal);
    let mensaje = mensajeBase;

    if (encontradoEnCache) {
      mensaje += " + datos del día actual desde cache Redis";
    }

    return {
      entrada: entradaFinal || undefined,
      salida: salidaFinal || undefined,
      encontrado,
      mensaje,
    };
  }

  /**
   * Obtiene solo datos del día actual cuando no hay datos históricos
   */
  public async obtenerSoloDatosDelDiaActual(
    rol: RolesSistema,
    dni: string,
    diaActual: number
  ): Promise<{
    entrada?: AsistenciaMensualPersonalLocal;
    salida?: AsistenciaMensualPersonalLocal;
    encontrado: boolean;
    mensaje: string;
  }> {
    const actor = this.mapper.obtenerActorDesdeRol(rol);
    const fechaHoy = this.dateHelper.obtenerFechaStringActual();

    if (!fechaHoy) {
      return {
        encontrado: false,
        mensaje: "No se pudo obtener la fecha actual",
      };
    }

    console.log(
      `🔍 Buscando datos del día actual en cache para ${dni} - ${fechaHoy}`
    );

    const [entradaCache, salidaCache] = await Promise.all([
      this.consultarCacheAsistenciaHoy(
        actor,
        ModoRegistro.Entrada,
        dni,
        fechaHoy
      ),
      this.consultarCacheAsistenciaHoy(
        actor,
        ModoRegistro.Salida,
        dni,
        fechaHoy
      ),
    ]);

    let entrada: AsistenciaMensualPersonalLocal | undefined;
    let salida: AsistenciaMensualPersonalLocal | undefined;

    if (entradaCache) {
      entrada = this.integrarDatosDeCacheEnRegistroMensual(
        null,
        entradaCache,
        diaActual,
        ModoRegistro.Entrada,
        dni,
        fechaHoy
      );
      console.log(
        `✅ Entrada del día actual encontrada en cache: ${entradaCache.estado}`
      );
    }

    if (salidaCache) {
      salida = this.integrarDatosDeCacheEnRegistroMensual(
        null,
        salidaCache,
        diaActual,
        ModoRegistro.Salida,
        dni,
        fechaHoy
      );
      console.log(
        `✅ Salida del día actual encontrada en cache: ${salidaCache.estado}`
      );
    }

    const encontrado = !!(entrada || salida);

    if (encontrado) {
      console.log(
        `🎯 Datos del día actual encontrados en cache: entrada=${!!entrada}, salida=${!!salida}`
      );
    } else {
      console.log(
        `❌ No se encontraron datos del día actual en cache para ${dni}`
      );
    }

    return {
      entrada,
      salida,
      encontrado,
      mensaje: encontrado
        ? "Solo datos del día actual encontrados en cache Redis"
        : "No se encontraron registros de asistencia para el mes consultado",
    };
  }

  /**
   * Crea asistencia para el cache a partir de datos de registro
   */
  public crearAsistenciaParaCache(
    dni: string,
    rol: ActoresSistema | RolesSistema,
    modoRegistro: ModoRegistro,
    timestamp: number,
    desfaseSegundos: number,
    estado: EstadosAsistenciaPersonal,
    fecha: string
  ): AsistenciaPersonalHoy {
    const clave = this.mapper.generarClaveCache(
      rol as ActoresSistema,
      modoRegistro,
      dni,
      fecha
    );

    return {
      clave,
      dni,
      actor: rol as ActoresSistema,
      modoRegistro,
      tipoAsistencia: TipoAsistencia.ParaPersonal,
      timestamp,
      desfaseSegundos,
      estado,
      fecha,
      timestampConsulta: Date.now(),
    };
  }

  /**
   * Elimina asistencia del cache de asistencias de hoy
   */
  public async eliminarAsistenciaDelCache(
    dni: string,
    rol: RolesSistema,
    modoRegistro: ModoRegistro,
    fecha: string
  ): Promise<OperationResult> {
    try {
      const actor = this.mapper.obtenerActorDesdeRol(rol);
      const consulta: ConsultaAsistenciaHoy = {
        dni,
        actor,
        modoRegistro,
        tipoAsistencia: TipoAsistencia.ParaPersonal,
        fecha,
      };

      // Verificar si existe en el cache
      const asistenciaCache =
        await this.cacheAsistenciasHoy.consultarAsistencia(consulta);

      if (!asistenciaCache) {
        console.log(
          `🗄️ No se encontró asistencia en cache para ${dni} - ${modoRegistro} - ${fecha}`
        );
        return {
          exitoso: false,
          mensaje: "No se encontró la asistencia en el cache",
        };
      }

      // Eliminar del cache usando la clave
      const clave = this.mapper.generarClaveCache(
        actor,
        modoRegistro,
        dni,
        fecha
      );
      await this.eliminarAsistenciaEspecificaDelCache(clave);

      console.log(`✅ Asistencia eliminada del cache: ${clave}`);
      return {
        exitoso: true,
        mensaje: "Asistencia eliminada del cache exitosamente",
        datos: clave,
      };
    } catch (error) {
      console.error("Error al eliminar asistencia del cache:", error);
      return {
        exitoso: false,
        mensaje: `Error al eliminar del cache: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }

  /**
   * Elimina una asistencia específica del cache por clave
   */
  private async eliminarAsistenciaEspecificaDelCache(
    clave: string
  ): Promise<void> {
    try {
      await IndexedDBConnection.init();
      const store = await IndexedDBConnection.getStore(
        "asistencias_tomadas_hoy",
        "readwrite"
      );

      return new Promise<void>((resolve, reject) => {
        const request = store.delete(clave);

        request.onsuccess = () => {
          console.log(`🗑️ Asistencia eliminada del cache: ${clave}`);
          resolve();
        };

        request.onerror = (event) => {
          reject(
            new Error(
              `Error al eliminar asistencia del cache: ${
                (event.target as IDBRequest).error
              }`
            )
          );
        };
      });
    } catch (error) {
      console.error(
        "Error al eliminar asistencia específica del cache:",
        error
      );
      throw error;
    }
  }

  /**
   * Limpia el cache de asistencias vencidas
   */
  public async limpiarCacheVencido(): Promise<OperationResult> {
    try {
      // El cache se auto-limpia, pero podemos forzar la limpieza
      const ahora = Date.now();
      const TIEMPO_EXPIRACION = 24 * 60 * 60 * 1000; // 24 horas

      await IndexedDBConnection.init();
      const store = await IndexedDBConnection.getStore(
        "asistencias_tomadas_hoy",
        "readwrite"
      );

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const registros = request.result as AsistenciaPersonalHoy[];
          let eliminados = 0;

          const promesasEliminacion = registros
            .filter((registro) => {
              const tiempoTranscurrido = ahora - registro.timestampConsulta;
              return tiempoTranscurrido > TIEMPO_EXPIRACION;
            })
            .map((registro) => {
              eliminados++;
              return this.eliminarAsistenciaEspecificaDelCache(registro.clave);
            });

          Promise.all(promesasEliminacion)
            .then(() => {
              resolve({
                exitoso: true,
                mensaje: `Cache limpiado: ${eliminados} registros eliminados`,
                datos: { eliminados },
              });
            })
            .catch((error) => {
              reject(error);
            });
        };

        request.onerror = (event) => {
          reject(
            new Error(
              `Error al obtener registros del cache: ${
                (event.target as IDBRequest).error
              }`
            )
          );
        };
      });
    } catch (error) {
      console.error("Error al limpiar cache vencido:", error);
      return {
        exitoso: false,
        mensaje: `Error al limpiar cache: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }

  /**
   * Obtiene estadísticas del cache
   */
  public async obtenerEstadisticasCache(): Promise<{
    totalRegistros: number;
    registrosHoy: number;
    registrosVencidos: number;
  }> {
    try {
      await IndexedDBConnection.init();
      const store = await IndexedDBConnection.getStore(
        "asistencias_tomadas_hoy",
        "readonly"
      );

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const registros = request.result as AsistenciaPersonalHoy[];
          const ahora = Date.now();
          const TIEMPO_EXPIRACION = 24 * 60 * 60 * 1000; // 24 horas
          const fechaHoy = this.dateHelper.obtenerFechaStringActual();

          let registrosHoy = 0;
          let registrosVencidos = 0;

          registros.forEach((registro) => {
            if (registro.fecha === fechaHoy) {
              registrosHoy++;
            }

            const tiempoTranscurrido = ahora - registro.timestampConsulta;
            if (tiempoTranscurrido > TIEMPO_EXPIRACION) {
              registrosVencidos++;
            }
          });

          resolve({
            totalRegistros: registros.length,
            registrosHoy,
            registrosVencidos,
          });
        };

        request.onerror = (event) => {
          reject(
            new Error(
              `Error al obtener estadísticas del cache: ${
                (event.target as IDBRequest).error
              }`
            )
          );
        };
      });
    } catch (error) {
      console.error("Error al obtener estadísticas del cache:", error);
      return {
        totalRegistros: 0,
        registrosHoy: 0,
        registrosVencidos: 0,
      };
    }
  }
}

import { DIA_ESCOLAR_MINIMO_PARA_CONSULTAR_API } from "@/constants/DISPONIBILLIDAD_IDS_RDP02_GENERADOS";
import store from "@/global/store";

/**
 * 🎯 RESPONSABILIDAD: Manejo de fechas y lógica temporal
 * - Obtener fecha actual desde Redux
 * - Calcular días escolares
 * - Validar rangos de fechas
 * - Determinar lógica de consulta a API
 * - ✅ NUEVOS: Métodos para flujo inteligente de consultas
 */
export class AsistenciaDePersonalDateHelper {
  /**
   * Obtiene la fecha actual desde el estado de Redux
   * @returns Objeto Date con la fecha actual según el estado global o null si no se puede obtener.
   */
  public obtenerFechaActualDesdeRedux(): Date | null {
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
        "Error al obtener fecha desde Redux en AsistenciaPersonalDateHelper:",
        error
      );
      return null;
    }
  }

  // ========================================================================================
  // ✅ NUEVOS MÉTODOS PARA FLUJO INTELIGENTE
  // ========================================================================================

  /**
   * ✅ NUEVO: Obtiene la hora actual desde Redux (0-23)
   */
  public obtenerHoraActual(): number | null {
    const fechaActual = this.obtenerFechaActualDesdeRedux();
    return fechaActual ? fechaActual.getHours() : null;
  }

  /**
   * ✅ NUEVO: Verifica si es fin de semana (Sábado o Domingo)
   */
  public esFinDeSemana(): boolean {
    const fechaActual = this.obtenerFechaActualDesdeRedux();
    if (!fechaActual) return false;

    const diaSemana = fechaActual.getDay(); // 0=domingo, 6=sábado
    return diaSemana === 0 || diaSemana === 6;
  }

  /**
   * ✅ NUEVO: Obtiene timestamp peruano (hora de Perú como número)
   * Para el campo obligatorio `ultima_fecha_actualizacion`
   */
  public obtenerTimestampPeruano(): number {
    const fechaActual = this.obtenerFechaActualDesdeRedux();
    if (!fechaActual) {
      console.warn("No se pudo obtener fecha desde Redux, usando Date.now()");
      return Date.now();
    }

    return fechaActual.getTime();
  }

  /**
   * ✅ NUEVO: Validar si estamos en horario escolar
   * Combina lógica existente con nuevas validaciones
   */
  public validarHorarioEscolar(): {
    esHorarioEscolar: boolean;
    esDiaEscolar: boolean;
    horaActual: number;
    razon: string;
  } {
    const fechaActual = this.obtenerFechaActualDesdeRedux();

    if (!fechaActual) {
      return {
        esHorarioEscolar: false,
        esDiaEscolar: false,
        horaActual: 0,
        razon: "No se pudo obtener fecha desde Redux",
      };
    }

    const horaActual = fechaActual.getHours();
    const diaSemana = fechaActual.getDay(); // 0=domingo, 6=sábado
    const esDiaEscolar = diaSemana >= 1 && diaSemana <= 5; // Lunes a Viernes

    // Validar horario escolar (6:00 AM - 10:00 PM)
    const esHorarioEscolar = horaActual >= 6 && horaActual < 22;

    let razon = "";
    if (!esDiaEscolar) {
      razon = "Es fin de semana";
    } else if (!esHorarioEscolar) {
      razon =
        horaActual < 6
          ? "Muy temprano (antes de 6:00 AM)"
          : "Muy tarde (después de 10:00 PM)";
    } else {
      razon = "Horario escolar válido";
    }

    return {
      esHorarioEscolar: esHorarioEscolar && esDiaEscolar,
      esDiaEscolar,
      horaActual,
      razon,
    };
  }

  /**
   * ✅ NUEVO: Determina tipo de consulta según mes
   */
  public determinarTipoConsulta(mes: number): {
    tipo: "MES_FUTURO" | "MES_ANTERIOR" | "MES_ACTUAL";
    debeLogout: boolean;
    razon: string;
  } {
    const fechaActual = this.obtenerFechaActualDesdeRedux();

    if (!fechaActual) {
      return {
        tipo: "MES_ACTUAL",
        debeLogout: false,
        razon: "No se pudo obtener fecha desde Redux",
      };
    }

    const mesActual = fechaActual.getMonth() + 1;

    if (mes > mesActual) {
      return {
        tipo: "MES_FUTURO",
        debeLogout: true,
        razon: "Consulta de mes futuro no permitida - logout forzado",
      };
    } else if (mes < mesActual) {
      return {
        tipo: "MES_ANTERIOR",
        debeLogout: false,
        razon: "Mes anterior - aplicar optimización IndexedDB",
      };
    } else {
      return {
        tipo: "MES_ACTUAL",
        debeLogout: false,
        razon: "Mes actual - aplicar lógica de horarios",
      };
    }
  }

  /**
   * ✅ NUEVO: Determina estrategia de consulta para mes actual
   */
  public determinarEstrategiaConsultaMesActual(): {
    estrategia:
      | "NO_CONSULTAR"
      | "REDIS_ENTRADAS"
      | "REDIS_COMPLETO"
      | "API_CONSOLIDADO";
    razon: string;
    horaActual: number;
  } {
    const fechaActual = this.obtenerFechaActualDesdeRedux();

    if (!fechaActual) {
      return {
        estrategia: "API_CONSOLIDADO",
        razon: "No se pudo obtener fecha desde Redux - usar API por seguridad",
        horaActual: 0,
      };
    }

    const horaActual = fechaActual.getHours();
    const esFinDeSemana = this.esFinDeSemana();

    // ✅ CORREGIDO: Fines de semana SÍ permiten consultas
    if (esFinDeSemana) {
      // En fines de semana, usar datos consolidados de API
      return {
        estrategia: "API_CONSOLIDADO",
        razon: "Fin de semana - usar datos consolidados de API",
        horaActual,
      };
    }

    // Lógica de horarios para días escolares
    if (horaActual < 6) {
      return {
        estrategia: "API_CONSOLIDADO", // ✅ CAMBIADO: NO bloquear, usar API
        razon: "Antes de 6:00 AM - usar datos consolidados de API",
        horaActual,
      };
    } else if (horaActual >= 6 && horaActual < 12) {
      return {
        estrategia: "REDIS_ENTRADAS",
        razon:
          "Horario de entradas (6:00-12:00) - consultar Redis para entradas",
        horaActual,
      };
    } else if (horaActual >= 12 && horaActual < 22) {
      return {
        estrategia: "REDIS_COMPLETO",
        razon:
          "Horario completo (12:00-22:00) - consultar Redis para entradas y salidas",
        horaActual,
      };
    } else {
      return {
        estrategia: "API_CONSOLIDADO",
        razon: "Después de 22:00 - datos consolidados en PostgreSQL",
        horaActual,
      };
    }
  }

  /**
   * ✅ NUEVO: Valida si debe consultar API para mes anterior
   */
  public debeConsultarAPIMesAnterior(
    existeEnIndexedDB: boolean,
    ultimaFechaActualizacion: number | null,
    mesConsultado: number
  ): {
    debeConsultar: boolean;
    razon: string;
  } {
    if (!existeEnIndexedDB) {
      return {
        debeConsultar: true,
        razon: "No existe en IndexedDB - consulta inicial requerida",
      };
    }

    if (!ultimaFechaActualizacion) {
      return {
        debeConsultar: true,
        razon: "Registro sin fecha de actualización - requiere actualización",
      };
    }

    // Extraer mes de la última actualización
    const fechaActualizacion = new Date(ultimaFechaActualizacion);
    const mesActualizacion = fechaActualizacion.getMonth() + 1;

    if (mesActualizacion === mesConsultado) {
      return {
        debeConsultar: true,
        razon:
          "Datos fueron actualizados en el mismo mes consultado - pueden haber cambiado",
      };
    } else {
      return {
        debeConsultar: false,
        razon:
          "Datos de mes finalizado - no consultar API (optimización aplicada)",
      };
    }
  }

  /**
   * ✅ NUEVO: Crear timestamp con fecha actual de Perú
   */
  public crearTimestampActual(): number {
    return this.obtenerTimestampPeruano();
  }

  /**
   * ✅ NUEVO: Verificar si una fecha está en el pasado
   */
  public esFechaPasada(timestamp: number): boolean {
    const fechaActual = this.obtenerFechaActualDesdeRedux();
    if (!fechaActual) return false;

    return timestamp < fechaActual.getTime();
  }

  /**
   * ✅ NUEVO: Obtener diferencia en días entre dos timestamps
   */
  public obtenerDiferenciaDias(timestamp1: number, timestamp2: number): number {
    const diferenciaMilisegundos = Math.abs(timestamp1 - timestamp2);
    return Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
  }

  // ========================================================================================
  // MÉTODOS ORIGINALES (SIN CAMBIOS)
  // ========================================================================================

  /**
   * Calcula el día escolar del mes (sin contar fines de semana)
   */
  public calcularDiaEscolarDelMes(): number {
    const fechaActual = this.obtenerFechaActualDesdeRedux() || new Date();
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth(); // 0-11
    const diaActual = fechaActual.getDate();

    let diaEscolar = 0;

    // Contar solo días hábiles (lunes a viernes) desde el inicio del mes hasta hoy
    for (let dia = 1; dia <= diaActual; dia++) {
      const fecha = new Date(anio, mes, dia);
      const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado

      // Si es día hábil (lunes a viernes)
      if (diaSemana >= 1 && diaSemana <= 5) {
        diaEscolar++;
      }
    }

    return diaEscolar;
  }

  /**
   * Determina si debemos consultar la API basándose en el día escolar
   */
  public debeConsultarAPI(diaEscolar: number): boolean {
    // Si estamos en el primer día escolar del mes, es seguro que no hay IDs en PostgreSQL
    if (diaEscolar <= 1) {
      return false;
    }

    // A partir del segundo día escolar, es probable que ya tengamos registros con IDs
    return diaEscolar >= DIA_ESCOLAR_MINIMO_PARA_CONSULTAR_API;
  }

  /**
   * Obtiene todos los días laborales anteriores al día actual en el mes (usando fecha Redux)
   */
  public obtenerDiasLaboralesAnteriores(): number[] {
    const fechaActual = this.obtenerFechaActualDesdeRedux();

    if (!fechaActual) {
      console.error("No se pudo obtener la fecha desde Redux");
      return [];
    }

    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth(); // 0-11
    const diaActual = fechaActual.getDate();

    const diasLaborales: number[] = [];

    // Buscar días hábiles (lunes a viernes) desde el inicio del mes hasta AYER
    for (let dia = 1; dia < diaActual; dia++) {
      // Nota: dia < diaActual (no <=)
      const fecha = new Date(anio, mes, dia);
      const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado

      // Si es día hábil (lunes a viernes)
      if (diaSemana >= 1 && diaSemana <= 5) {
        diasLaborales.push(dia);
      }
    }

    return diasLaborales;
  }

  /**
   * Función para verificar si un día es día escolar (lunes a viernes)
   */
  public esDiaEscolar(dia: string, fechaRef?: Date): boolean {
    const fechaActual = fechaRef || this.obtenerFechaActualDesdeRedux();
    if (!fechaActual) return false;

    const diaNumero = parseInt(dia);
    if (isNaN(diaNumero)) return false;

    const añoActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth(); // 0-11

    const fecha = new Date(añoActual, mesActual, diaNumero);
    const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
    return diaSemana >= 1 && diaSemana <= 5; // Solo lunes a viernes
  }

  /**
   * Verifica si es una consulta del mes actual
   */
  public esConsultaMesActual(mes: number): boolean {
    const fechaActual = this.obtenerFechaActualDesdeRedux();
    if (!fechaActual) return false;

    return mes === fechaActual.getMonth() + 1;
  }

  /**
   * Obtiene el mes actual
   */
  public obtenerMesActual(): number | null {
    const fechaActual = this.obtenerFechaActualDesdeRedux();
    return fechaActual ? fechaActual.getMonth() + 1 : null;
  }

  /**
   * Obtiene el día actual
   */
  public obtenerDiaActual(): number | null {
    const fechaActual = this.obtenerFechaActualDesdeRedux();
    return fechaActual ? fechaActual.getDate() : null;
  }

  /**
   * Convierte la fecha actual a string formato YYYY-MM-DD
   */
  public obtenerFechaStringActual(): string | null {
    const fechaActual = this.obtenerFechaActualDesdeRedux();
    return fechaActual ? fechaActual.toISOString().split("T")[0] : null;
  }

  /**
   * Convierte una fecha específica a string formato YYYY-MM-DD
   */
  public convertirFechaAString(fecha: Date): string {
    return fecha.toISOString().split("T")[0];
  }

  /**
   * Genera string de fecha para mes y día específicos
   */
  public generarFechaString(mes: number, dia: number, año?: number): string {
    const añoFinal =
      año ||
      this.obtenerFechaActualDesdeRedux()?.getFullYear() ||
      new Date().getFullYear();

    return `${añoFinal}-${mes.toString().padStart(2, "0")}-${dia
      .toString()
      .padStart(2, "0")}`;
  }
}

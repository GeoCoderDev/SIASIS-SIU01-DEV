import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import { PersonalAdministrativoAsistenciaResponse } from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";
import { DatosBaseAsistenciaHoyIDB } from "./DatosBaseAsistenciaHoyIDB";

class DatosAsistenciaHoyPersonalAdministrativoIDB extends DatosBaseAsistenciaHoyIDB<PersonalAdministrativoAsistenciaResponse> {
  protected rolPrincipal: RolesSistema = RolesSistema.PersonalAdministrativo;

  /**
   * Obtiene el horario del personal administrativo
   */
  public async obtenerHorarioPersonal(): Promise<
    PersonalAdministrativoAsistenciaResponse["HorarioPersonal"] | null
  > {
    try {
      const datos = await this.obtenerDatos();
      return datos?.HorarioPersonal || null;
    } catch (error) {
      this.handleError(error, "obtenerHorarioPersonal");
      return null;
    }
  }

  /**
   * Verifica si el personal tiene horario configurado para hoy
   */
  public async tieneHorarioHoy(): Promise<boolean> {
    try {
      const horario = await this.obtenerHorarioPersonal();
      return horario !== null && horario !== false;
    } catch (error) {
      this.handleError(error, "tieneHorarioHoy");
      return false;
    }
  }

  /**
   * Verifica si actualmente está dentro de su horario laboral
   */
  public async estaEnHorarioLaboral(): Promise<boolean> {
    try {
      const horario = await this.obtenerHorarioPersonal();
      if (!horario) return false;

      const ahora = new Date();
      const inicio = new Date(horario.Horario_Laboral_Entrada);
      const fin = new Date(horario.Horario_Laboral_Salida);

      return ahora >= inicio && ahora <= fin;
    } catch (error) {
      this.handleError(error, "estaEnHorarioLaboral");
      return false;
    }
  }

  /**
   * Calcula el tiempo restante para el fin del horario laboral
   */
  public async tiempoRestanteHorarioLaboral(): Promise<number | null> {
    try {
      const horario = await this.obtenerHorarioPersonal();
      if (!horario) return null;

      const ahora = new Date();
      const fin = new Date(horario.Horario_Laboral_Salida);

      // Si ya pasó el tiempo, devolver 0
      if (ahora > fin) return 0;

      // Devolver diferencia en milisegundos
      return fin.getTime() - ahora.getTime();
    } catch (error) {
      this.handleError(error, "tiempoRestanteHorarioLaboral");
      return null;
    }
  }

  /**
   * Verifica si ya pasó el horario laboral
   */
  public async pasóHorarioLaboral(): Promise<boolean> {
    try {
      const horario = await this.obtenerHorarioPersonal();
      if (!horario) return true; // Si no hay horario, consideramos que ya pasó

      const ahora = new Date();
      const fin = new Date(horario.Horario_Laboral_Salida);

      return ahora > fin;
    } catch (error) {
      this.handleError(error, "pasóHorarioLaboral");
      return true; // En caso de error, asumimos que ya pasó para prevenir problemas
    }
  }

  /**
   * Verifica si aún no es hora de entrada
   */
  public async esAntesDeHorarioLaboral(): Promise<boolean> {
    try {
      const horario = await this.obtenerHorarioPersonal();
      if (!horario) return true; // Si no hay horario, consideramos que es antes de tiempo

      const ahora = new Date();
      const inicio = new Date(horario.Horario_Laboral_Entrada);

      return ahora < inicio;
    } catch (error) {
      this.handleError(error, "esAntesDeHorarioLaboral");
      return true; // En caso de error, asumimos que es antes para prevenir problemas
    }
  }

  /**
   * Calcula el tiempo faltante para la hora de entrada
   */
  public async tiempoFaltanteParaEntrada(): Promise<number | null> {
    try {
      const horario = await this.obtenerHorarioPersonal();
      if (!horario) return null;

      const ahora = new Date();
      const inicio = new Date(horario.Horario_Laboral_Entrada);

      // Si ya pasó la hora de entrada, devolver 0
      if (ahora > inicio) return 0;

      // Devolver diferencia en milisegundos
      return inicio.getTime() - ahora.getTime();
    } catch (error) {
      this.handleError(error, "tiempoFaltanteParaEntrada");
      return null;
    }
  }

  /**
   * Calcula la duración total del horario laboral en milisegundos
   */
  public async duracionTotalHorarioLaboral(): Promise<number | null> {
    try {
      const horario = await this.obtenerHorarioPersonal();
      if (!horario) return null;

      const inicio = new Date(horario.Horario_Laboral_Entrada);
      const fin = new Date(horario.Horario_Laboral_Salida);

      return fin.getTime() - inicio.getTime();
    } catch (error) {
      this.handleError(error, "duracionTotalHorarioLaboral");
      return null;
    }
  }

  /**
   * Formatea el tiempo (en milisegundos) en formato legible (HH:MM:SS)
   */
  public formatearTiempo(milisegundos: number): string {
    if (milisegundos <= 0) return "00:00:00";

    const segundos = Math.floor(milisegundos / 1000);
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segsRestantes = segundos % 60;

    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(
      2,
      "0"
    )}:${String(segsRestantes).padStart(2, "0")}`;
  }

  /**
   * Formatea la hora de entrada y salida en formato legible (HH:MM)
   */
  public async obtenerHorasFormateadas(): Promise<{
    entrada: string;
    salida: string;
  } | null> {
    try {
      const horario = await this.obtenerHorarioPersonal();
      if (!horario) return null;

      const entrada = new Date(horario.Horario_Laboral_Entrada);
      const salida = new Date(horario.Horario_Laboral_Salida);

      const formatearHora = (fecha: Date): string => {
        return `${String(fecha.getHours()).padStart(2, "0")}:${String(
          fecha.getMinutes()
        ).padStart(2, "0")}`;
      };

      return {
        entrada: formatearHora(entrada),
        salida: formatearHora(salida),
      };
    } catch (error) {
      this.handleError(error, "obtenerHorasFormateadas");
      return null;
    }
  }

  /**
   * Obtiene el estado del horario laboral con mensajes útiles
   */
  public async obtenerEstadoHorarioLaboral(): Promise<{
    estado: "antes" | "durante" | "despues";
    mensaje: string;
    tiempo?: string;
  }> {
    try {
      if (this.esDiaNoLaborable()) {
        return {
          estado: "despues",
          mensaje: "Hoy no es un día laborable.",
        };
      }

      if (await this.hayEventoHoy()) {
        return {
          estado: "despues",
          mensaje: "Hoy hay un evento especial.",
        };
      }

      if (!(await this.tieneHorarioHoy())) {
        return {
          estado: "despues",
          mensaje: "No tienes horario programado para hoy.",
        };
      }

      if (await this.esAntesDeHorarioLaboral()) {
        const tiempoFaltante = await this.tiempoFaltanteParaEntrada();
        const horas = await this.obtenerHorasFormateadas();

        return {
          estado: "antes",
          mensaje: `Tu horario comienza a las ${horas?.entrada || "00:00"}.`,
          tiempo: tiempoFaltante
            ? this.formatearTiempo(tiempoFaltante)
            : undefined,
        };
      }

      if (await this.estaEnHorarioLaboral()) {
        const tiempoRestante = await this.tiempoRestanteHorarioLaboral();
        const horas = await this.obtenerHorasFormateadas();

        return {
          estado: "durante",
          mensaje: `Tu horario termina a las ${horas?.salida || "00:00"}.`,
          tiempo: tiempoRestante
            ? this.formatearTiempo(tiempoRestante)
            : undefined,
        };
      }

      return {
        estado: "despues",
        mensaje: "Tu horario laboral de hoy ha concluido.",
      };
    } catch (error) {
      this.handleError(error, "obtenerEstadoHorarioLaboral");
      return {
        estado: "despues",
        mensaje: "Error al verificar tu horario laboral.",
      };
    }
  }

  /**
   * Calcula el porcentaje de tiempo transcurrido del horario laboral
   * Útil para mostrar barras de progreso
   */
  public async obtenerPorcentajeTranscurridoHorarioLaboral(): Promise<number> {
    try {
      const horario = await this.obtenerHorarioPersonal();
      if (!horario) return 100;

      const ahora = new Date();
      const inicio = new Date(horario.Horario_Laboral_Entrada);
      const fin = new Date(horario.Horario_Laboral_Salida);

      // Si no ha comenzado
      if (ahora < inicio) return 0;

      // Si ya terminó
      if (ahora > fin) return 100;

      // Calcular porcentaje
      const tiempoTotal = fin.getTime() - inicio.getTime();
      const tiempoTranscurrido = ahora.getTime() - inicio.getTime();

      return Math.round((tiempoTranscurrido / tiempoTotal) * 100);
    } catch (error) {
      this.handleError(error, "obtenerPorcentajeTranscurridoHorarioLaboral");
      return 100; // En caso de error, asumimos que está completo
    }
  }

  /**
   * Obtiene información sobre si llegó puntual hoy
   */
  public async obtenerEstadoPuntualidad(): Promise<{
    esPuntual: boolean;
    mensaje: string;
  }> {
    try {
      const horario = await this.obtenerHorarioPersonal();
      if (!horario) {
        return {
          esPuntual: false,
          mensaje: "No hay información de horario para hoy.",
        };
      }

      const ahora = new Date();
      const entrada = new Date(horario.Horario_Laboral_Entrada);

      // Consideramos un margen de 5 minutos para la puntualidad
      const margenPuntualidad = 5 * 60 * 1000; // 5 minutos en milisegundos
      const entradaConMargen = new Date(entrada.getTime() + margenPuntualidad);

      if (ahora <= entradaConMargen) {
        return {
          esPuntual: true,
          mensaje: "Has llegado a tiempo.",
        };
      } else if (await this.estaEnHorarioLaboral()) {
        const minutosTarde = Math.floor(
          (ahora.getTime() - entrada.getTime()) / (60 * 1000)
        );
        return {
          esPuntual: false,
          mensaje: `Has llegado con aproximadamente ${minutosTarde} minutos de retraso.`,
        };
      } else {
        return {
          esPuntual: false,
          mensaje: "No se pudo determinar la puntualidad para hoy.",
        };
      }
    } catch (error) {
      this.handleError(error, "obtenerEstadoPuntualidad");
      return {
        esPuntual: false,
        mensaje: "Error al verificar la puntualidad.",
      };
    }
  }

  /**
   * Calcula el tiempo de trabajo en la jornada actual
   */
  public async calcularTiempoDeTrabajoActual(): Promise<{
    duracion: string;
    minutos: number;
  } | null> {
    try {
      const horario = await this.obtenerHorarioPersonal();
      if (!horario) return null;

      const ahora = new Date();
      const entrada = new Date(horario.Horario_Laboral_Entrada);
      const salida = new Date(horario.Horario_Laboral_Salida);

      // Si no ha comenzado el horario o ya terminó
      if (ahora < entrada || ahora > salida) return null;

      // Calcular tiempo transcurrido
      const tiempoTranscurrido = ahora.getTime() - entrada.getTime();
      const minutos = Math.floor(tiempoTranscurrido / (60 * 1000));

      const horas = Math.floor(minutos / 60);
      const minutosRestantes = minutos % 60;

      return {
        duracion: `${horas}h ${minutosRestantes}m`,
        minutos: minutos,
      };
    } catch (error) {
      this.handleError(error, "calcularTiempoDeTrabajoActual");
      return null;
    }
  }

  /**
   * Obtiene un resumen general del estado laboral para hoy
   */
  public async obtenerResumenLaboral(): Promise<{
    tieneHorario: boolean;
    estado: "antes" | "durante" | "despues";
    horaEntrada?: string;
    horaSalida?: string;
    tiempoRestante?: string;
    tiempoTrabajado?: string;
    porcentajeCompletado?: number;
    esPuntual?: boolean;
  }> {
    try {
      // Verificar si tiene horario hoy
      const tieneHorario = await this.tieneHorarioHoy();
      if (!tieneHorario) {
        return {
          tieneHorario: false,
          estado: "despues",
        };
      }

      // Obtener datos de estado
      const estado = await this.obtenerEstadoHorarioLaboral();
      const horas = await this.obtenerHorasFormateadas();
      const porcentaje =
        await this.obtenerPorcentajeTranscurridoHorarioLaboral();
      const tiempoTrabajado = await this.calcularTiempoDeTrabajoActual();
      const puntualidad = await this.obtenerEstadoPuntualidad();

      return {
        tieneHorario: true,
        estado: estado.estado,
        horaEntrada: horas?.entrada,
        horaSalida: horas?.salida,
        tiempoRestante: estado.tiempo,
        tiempoTrabajado: tiempoTrabajado?.duracion,
        porcentajeCompletado: porcentaje,
        esPuntual: puntualidad.esPuntual,
      };
    } catch (error) {
      this.handleError(error, "obtenerResumenLaboral");
      return {
        tieneHorario: false,
        estado: "despues",
      };
    }
  }
}

// Exportar una instancia singleton
const datosAsistenciaHoyPersonalAdministrativoIDB =
  new DatosAsistenciaHoyPersonalAdministrativoIDB();
export default datosAsistenciaHoyPersonalAdministrativoIDB;

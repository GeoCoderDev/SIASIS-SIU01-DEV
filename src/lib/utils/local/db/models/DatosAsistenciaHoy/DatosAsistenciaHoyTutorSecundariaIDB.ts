import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import {
  HorarioTomaAsistencia,
  ProfesorSecundariaAsistenciaResponse,
} from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";

import { DatosBaseAsistenciaHoyIDB } from "./DatosBaseAsistenciaHoyIDB";

class DatosAsistenciaHoyTutorSecundariaIDB extends DatosBaseAsistenciaHoyIDB<ProfesorSecundariaAsistenciaResponse> {
  protected rolPrincipal: RolesSistema = RolesSistema.Tutor;

  /**
   * Obtiene el horario específico del tutor
   */
  public async obtenerHorarioProfesor(): Promise<
    ProfesorSecundariaAsistenciaResponse["HorarioProfesor"] | null
  > {
    try {
      const datos = await this.obtenerDatos();
      return datos?.HorarioProfesor || null;
    } catch (error) {
      this.handleError(error, "obtenerHorarioProfesor");
      return null;
    }
  }

  /**
   * Obtiene el horario escolar de nivel secundaria
   */
  public async obtenerHorarioEscolar(): Promise<HorarioTomaAsistencia | null> {
    try {
      const datos = await this.obtenerDatos();
      return datos?.HorarioEscolarSecundaria || null;
    } catch (error) {
      this.handleError(error, "obtenerHorarioEscolar");
      return null;
    }
  }

  /**
   * Verifica si el tutor tiene horario configurado para hoy
   */
  public async tieneHorarioHoy(): Promise<boolean> {
    try {
      const horario = await this.obtenerHorarioProfesor();
      return horario !== null && horario !== false;
    } catch (error) {
      this.handleError(error, "tieneHorarioHoy");
      return false;
    }
  }

  /**
   * Verifica si el tutor actualmente está dentro de su horario de trabajo
   */
  public async estaEnHorarioLaboral(): Promise<boolean> {
    try {
      const horario = await this.obtenerHorarioProfesor();
      if (!horario) return false;

      const ahora = new Date();
      const inicio = new Date(horario.Hora_Entrada_Dia_Actual);
      const fin = new Date(horario.Hora_Salida_Dia_Actual);

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
      const horario = await this.obtenerHorarioProfesor();
      if (!horario) return null;

      const ahora = new Date();
      const fin = new Date(horario.Hora_Salida_Dia_Actual);

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
   * Verifica si ya pasó el horario laboral del tutor
   */
  public async pasóHorarioLaboral(): Promise<boolean> {
    try {
      const horario = await this.obtenerHorarioProfesor();
      if (!horario) return true; // Si no hay horario, consideramos que ya pasó

      const ahora = new Date();
      const fin = new Date(horario.Hora_Salida_Dia_Actual);

      return ahora > fin;
    } catch (error) {
      this.handleError(error, "pasóHorarioLaboral");
      return true; // En caso de error, asumimos que ya pasó para prevenir problemas
    }
  }

  /**
   * Verifica si aún no es hora de entrada del tutor
   */
  public async esAntesDeHorarioLaboral(): Promise<boolean> {
    try {
      const horario = await this.obtenerHorarioProfesor();
      if (!horario) return true; // Si no hay horario, consideramos que es antes de tiempo

      const ahora = new Date();
      const inicio = new Date(horario.Hora_Entrada_Dia_Actual);

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
      const horario = await this.obtenerHorarioProfesor();
      if (!horario) return null;

      const ahora = new Date();
      const inicio = new Date(horario.Hora_Entrada_Dia_Actual);

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
   * Obtiene el horario escolar para mostrar a sus estudiantes
   */
  public async obtenerHorarioEscolarEstudiantes(): Promise<{
    entrada: string;
    salida: string;
  } | null> {
    try {
      const horarioEscolar = await this.obtenerHorarioEscolar();
      if (!horarioEscolar) return null;

      const entrada = new Date(horarioEscolar.Inicio);
      const salida = new Date(horarioEscolar.Fin);

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
      this.handleError(error, "obtenerHorarioEscolarEstudiantes");
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
   * Formatea la hora de entrada y salida del tutor en formato legible (HH:MM)
   */
  public async obtenerHorasFormateadas(): Promise<{
    entrada: string;
    salida: string;
  } | null> {
    try {
      const horario = await this.obtenerHorarioProfesor();
      if (!horario) return null;

      const entrada = new Date(horario.Hora_Entrada_Dia_Actual);
      const salida = new Date(horario.Hora_Salida_Dia_Actual);

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
   * Obtiene el estado del horario laboral con mensajes útiles específicos para tutores
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
          mensaje: "No tienes tutoría programada para hoy.",
        };
      }

      if (await this.esAntesDeHorarioLaboral()) {
        const tiempoFaltante = await this.tiempoFaltanteParaEntrada();
        const horas = await this.obtenerHorasFormateadas();

        return {
          estado: "antes",
          mensaje: `Tu tutoría comienza a las ${horas?.entrada || "00:00"}.`,
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
          mensaje: `Tu tutoría termina a las ${horas?.salida || "00:00"}.`,
          tiempo: tiempoRestante
            ? this.formatearTiempo(tiempoRestante)
            : undefined,
        };
      }

      return {
        estado: "despues",
        mensaje: "Tu tutoría de hoy ha concluido.",
      };
    } catch (error) {
      this.handleError(error, "obtenerEstadoHorarioLaboral");
      return {
        estado: "despues",
        mensaje: "Error al verificar tu horario de tutoría.",
      };
    }
  }

  /**
   * Obtiene información específica para tutores sobre el estado del aula
   */
  public async obtenerEstadoAula(): Promise<{
    mensaje: string;
    horario?: { entrada: string; salida: string };
  }> {
    try {
      if (this.esDiaNoLaborable()) {
        return {
          mensaje: "Hoy no es un día laborable para tus estudiantes.",
        };
      }

      if (await this.hayEventoHoy()) {
        const evento = await this.obtenerEventoHoy();
        return {
          mensaje: `Hoy hay un evento especial: ${
            evento?.nombre || "Evento escolar"
          }.`,
        };
      }

      const horarioEstudiantes = await this.obtenerHorarioEscolarEstudiantes();
      if (!horarioEstudiantes) {
        return {
          mensaje:
            "No hay información disponible sobre el horario de tus estudiantes.",
        };
      }

      return {
        mensaje: "Horario de tus estudiantes para hoy:",
        horario: horarioEstudiantes,
      };
    } catch (error) {
      this.handleError(error, "obtenerEstadoAula");
      return {
        mensaje: "Error al obtener información sobre el aula.",
      };
    }
  }
}

// Exportar una instancia singleton
const datosAsistenciaHoyTutorSecundariaIDB =
  new DatosAsistenciaHoyTutorSecundariaIDB();
export default datosAsistenciaHoyTutorSecundariaIDB;

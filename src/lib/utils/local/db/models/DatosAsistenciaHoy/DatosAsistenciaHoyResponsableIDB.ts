import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import {
  HorarioTomaAsistencia,
  ResponsableAsistenciaResponse,
} from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";

import { NivelEducativo } from "@/interfaces/shared/NivelEducativo";
import { DatosBaseAsistenciaHoyIDB } from "./DatosBaseAsistenciaHoyIDB";

class DatosAsistenciaHoyResponsableIDB extends DatosBaseAsistenciaHoyIDB<ResponsableAsistenciaResponse> {
  protected rolPrincipal: RolesSistema = RolesSistema.Responsable;

  /**
   * Obtiene todos los horarios escolares por nivel educativo
   */
  public async obtenerHorariosEscolares(): Promise<
    ResponsableAsistenciaResponse["HorariosEscolares"] | null
  > {
    try {
      const datos = await this.obtenerDatos();
      return datos?.HorariosEscolares || null;
    } catch (error) {
      this.handleError(error, "obtenerHorariosEscolares");
      return null;
    }
  }

  /**
   * Obtiene el horario escolar para un nivel educativo específico
   */
  public async obtenerHorarioEscolarNivel(
    nivel: NivelEducativo
  ): Promise<HorarioTomaAsistencia | null> {
    try {
      const horarios = await this.obtenerHorariosEscolares();
      if (!horarios) return null;

      return horarios[nivel] || null;
    } catch (error) {
      this.handleError(error, "obtenerHorarioEscolarNivel", { nivel });
      return null;
    }
  }

  /**
   * Obtiene el horario escolar de primaria
   */
  public async obtenerHorarioEscolarPrimaria(): Promise<HorarioTomaAsistencia | null> {
    return this.obtenerHorarioEscolarNivel(NivelEducativo.PRIMARIA);
  }

  /**
   * Obtiene el horario escolar de secundaria
   */
  public async obtenerHorarioEscolarSecundaria(): Promise<HorarioTomaAsistencia | null> {
    return this.obtenerHorarioEscolarNivel(NivelEducativo.SECUNDARIA);
  }

  /**
   * Obtiene horario de asistencia para un hijo según su nivel educativo
   */
  public async obtenerHorarioHijo(
    nivelEducativo: NivelEducativo
  ): Promise<HorarioTomaAsistencia | null> {
    return this.obtenerHorarioEscolarNivel(nivelEducativo);
  }

  /**
   * Formatea el horario escolar en formato legible (HH:MM)
   */
  public async obtenerHorarioEscolarFormateado(
    nivel: NivelEducativo
  ): Promise<{ entrada: string; salida: string } | null> {
    try {
      const horario = await this.obtenerHorarioEscolarNivel(nivel);
      if (!horario) return null;

      const entrada = new Date(horario.Inicio);
      const salida = new Date(horario.Fin);

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
      this.handleError(error, "obtenerHorarioEscolarFormateado", { nivel });
      return null;
    }
  }

  /**
   * Verifica si en este momento los estudiantes de un nivel específico están en clase
   */
  public async estudiantesEnClaseAhora(
    nivel: NivelEducativo
  ): Promise<boolean> {
    try {
      const horario = await this.obtenerHorarioEscolarNivel(nivel);
      if (!horario) return false;

      const ahora = new Date();
      const inicio = new Date(horario.Inicio);
      const fin = new Date(horario.Fin);

      return ahora >= inicio && ahora <= fin;
    } catch (error) {
      this.handleError(error, "estudiantesEnClaseAhora", { nivel });
      return false;
    }
  }

  /**
   * Verifica si los estudiantes de primaria están en clase ahora
   */
  public async estudiantesPrimariaEnClaseAhora(): Promise<boolean> {
    return this.estudiantesEnClaseAhora(NivelEducativo.PRIMARIA);
  }

  /**
   * Verifica si los estudiantes de secundaria están en clase ahora
   */
  public async estudiantesSecundariaEnClaseAhora(): Promise<boolean> {
    return this.estudiantesEnClaseAhora(NivelEducativo.SECUNDARIA);
  }

  /**
   * Calcula el tiempo restante para la salida de los estudiantes de un nivel específico
   */
  public async tiempoRestanteSalidaEstudiantes(
    nivel: NivelEducativo
  ): Promise<number | null> {
    try {
      const horario = await this.obtenerHorarioEscolarNivel(nivel);
      if (!horario) return null;

      const ahora = new Date();
      const fin = new Date(horario.Fin);

      // Si ya pasó la hora de salida, devolver 0
      if (ahora > fin) return 0;

      // Devolver diferencia en milisegundos
      return fin.getTime() - ahora.getTime();
    } catch (error) {
      this.handleError(error, "tiempoRestanteSalidaEstudiantes", { nivel });
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
   * Obtiene el estado actual de las clases de un nivel específico con mensajes útiles
   */
  public async obtenerEstadoClases(nivel: NivelEducativo): Promise<{
    estado: "antes" | "durante" | "despues";
    mensaje: string;
    tiempo?: string;
  }> {
    try {
      if (this.esDiaNoLaborable()) {
        return {
          estado: "despues",
          mensaje: "Hoy no es un día laborable para los estudiantes.",
        };
      }

      if (await this.hayEventoHoy()) {
        const evento = await this.obtenerEventoHoy();
        return {
          estado: "despues",
          mensaje: `Hoy hay un evento especial: ${
            evento?.nombre || "Evento escolar"
          }.`,
        };
      }

      const horario = await this.obtenerHorarioEscolarNivel(nivel);
      if (!horario) {
        return {
          estado: "despues",
          mensaje: "No hay información disponible sobre el horario escolar.",
        };
      }

      const ahora = new Date();
      const inicio = new Date(horario.Inicio);
      const fin = new Date(horario.Fin);

      const horasFormateadas = await this.obtenerHorarioEscolarFormateado(
        nivel
      );

      if (ahora < inicio) {
        const tiempoFaltante = inicio.getTime() - ahora.getTime();
        return {
          estado: "antes",
          mensaje: `Las clases comienzan a las ${
            horasFormateadas?.entrada || "00:00"
          }.`,
          tiempo: this.formatearTiempo(tiempoFaltante),
        };
      }

      if (ahora <= fin) {
        const tiempoRestante = fin.getTime() - ahora.getTime();
        return {
          estado: "durante",
          mensaje: `Los estudiantes están en clase. Salida a las ${
            horasFormateadas?.salida || "00:00"
          }.`,
          tiempo: this.formatearTiempo(tiempoRestante),
        };
      }

      return {
        estado: "despues",
        mensaje: "Las clases han finalizado por hoy.",
      };
    } catch (error) {
      this.handleError(error, "obtenerEstadoClases", { nivel });
      return {
        estado: "despues",
        mensaje: "Error al verificar el estado de las clases.",
      };
    }
  }

  /**
   * Obtiene el estado de las clases para estudiantes de primaria
   */
  public async obtenerEstadoClasesPrimaria(): Promise<{
    estado: "antes" | "durante" | "despues";
    mensaje: string;
    tiempo?: string;
  }> {
    return this.obtenerEstadoClases(NivelEducativo.PRIMARIA);
  }

  /**
   * Obtiene el estado de las clases para estudiantes de secundaria
   */
  public async obtenerEstadoClasesSecundaria(): Promise<{
    estado: "antes" | "durante" | "despues";
    mensaje: string;
    tiempo?: string;
  }> {
    return this.obtenerEstadoClases(NivelEducativo.SECUNDARIA);
  }
}

// Exportar una instancia singleton
const datosAsistenciaHoyResponsableIDB = new DatosAsistenciaHoyResponsableIDB();
export default datosAsistenciaHoyResponsableIDB;

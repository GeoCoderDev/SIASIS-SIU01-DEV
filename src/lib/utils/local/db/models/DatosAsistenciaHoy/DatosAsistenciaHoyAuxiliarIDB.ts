import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import {
  AuxiliarAsistenciaResponse,
  HorarioTomaAsistencia,
} from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";
import { DatosBaseAsistenciaHoyIDB } from "./DatosBaseAsistenciaHoyIDB";

class DatosAsistenciaHoyAuxiliarIDB extends DatosBaseAsistenciaHoyIDB<AuxiliarAsistenciaResponse> {
  protected rolPrincipal: RolesSistema = RolesSistema.Auxiliar;

  /**
   * Obtiene el horario de toma de asistencia para auxiliares
   */
  public async obtenerHorarioTomaAsistencia(): Promise<HorarioTomaAsistencia | null> {
    try {
      const datos = await this.obtenerDatos();
      return datos?.HorarioTomaAsistenciaAuxiliares || null;
    } catch (error) {
      this.handleError(error, "obtenerHorarioTomaAsistencia");
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
   * Verifica si el auxiliar está dentro del horario para tomar asistencia
   */
  public async estaEnHorarioTomaAsistencia(): Promise<boolean> {
    try {
      const horario = await this.obtenerHorarioTomaAsistencia();
      if (!horario) return false;

      const ahora = new Date();
      const inicio = new Date(horario.Inicio);
      const fin = new Date(horario.Fin);

      return ahora >= inicio && ahora <= fin;
    } catch (error) {
      this.handleError(error, "estaEnHorarioTomaAsistencia");
      return false;
    }
  }

  /**
   * Calcula el tiempo restante para el fin del horario de toma de asistencia
   */
  public async tiempoRestanteTomaAsistencia(): Promise<number | null> {
    try {
      const horario = await this.obtenerHorarioTomaAsistencia();
      if (!horario) return null;

      const ahora = new Date();
      const fin = new Date(horario.Fin);

      // Si ya pasó el tiempo, devolver 0
      if (ahora > fin) return 0;

      // Devolver diferencia en milisegundos
      return fin.getTime() - ahora.getTime();
    } catch (error) {
      this.handleError(error, "tiempoRestanteTomaAsistencia");
      return null;
    }
  }

  /**
   * Verifica si ya pasó el horario de toma de asistencia
   */
  public async pasóHorarioTomaAsistencia(): Promise<boolean> {
    try {
      const horario = await this.obtenerHorarioTomaAsistencia();
      if (!horario) return true; // Si no hay horario, consideramos que ya pasó

      const ahora = new Date();
      const fin = new Date(horario.Fin);

      return ahora > fin;
    } catch (error) {
      this.handleError(error, "pasóHorarioTomaAsistencia");
      return true; // En caso de error, asumimos que ya pasó para prevenir problemas
    }
  }

  /**
   * Verifica si aún no es hora de tomar asistencia
   */
  public async esAntesDeTiempoTomaAsistencia(): Promise<boolean> {
    try {
      const horario = await this.obtenerHorarioTomaAsistencia();
      if (!horario) return true; // Si no hay horario, consideramos que es antes de tiempo

      const ahora = new Date();
      const inicio = new Date(horario.Inicio);

      return ahora < inicio;
    } catch (error) {
      this.handleError(error, "esAntesDeTiempoTomaAsistencia");
      return true; // En caso de error, asumimos que es antes para prevenir problemas
    }
  }

  /**
   * Calcula el tiempo faltante para que inicie el horario de toma de asistencia
   */
  public async tiempoFaltanteInicioTomaAsistencia(): Promise<number | null> {
    try {
      const horario = await this.obtenerHorarioTomaAsistencia();
      if (!horario) return null;

      const ahora = new Date();
      const inicio = new Date(horario.Inicio);

      // Si ya pasó el tiempo de inicio, devolver 0
      if (ahora > inicio) return 0;

      // Devolver diferencia en milisegundos
      return inicio.getTime() - ahora.getTime();
    } catch (error) {
      this.handleError(error, "tiempoFaltanteInicioTomaAsistencia");
      return null;
    }
  }

  /**
   * Formatea el tiempo restante (en milisegundos) en formato legible (HH:MM:SS)
   */
  public formatearTiempoRestante(milisegundos: number): string {
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
   * Obtiene el estado de la toma de asistencia con mensajes útiles
   */
  public async obtenerEstadoTomaAsistencia(): Promise<{
    estado: "antes" | "durante" | "despues";
    mensaje: string;
    tiempo?: string;
  }> {
    try {
      if (this.esDiaNoLaborable()) {
        return {
          estado: "despues",
          mensaje:
            "Hoy no es un día laborable. No se requiere tomar asistencia.",
        };
      }

      if (await this.hayEventoHoy()) {
        return {
          estado: "despues",
          mensaje:
            "Hoy hay un evento especial. No se requiere tomar asistencia.",
        };
      }

      if (await this.esAntesDeTiempoTomaAsistencia()) {
        const tiempoFaltante = await this.tiempoFaltanteInicioTomaAsistencia();
        return {
          estado: "antes",
          mensaje: "Aún no es hora de tomar asistencia.",
          tiempo: tiempoFaltante
            ? this.formatearTiempoRestante(tiempoFaltante)
            : undefined,
        };
      }

      if (await this.estaEnHorarioTomaAsistencia()) {
        const tiempoRestante = await this.tiempoRestanteTomaAsistencia();
        return {
          estado: "durante",
          mensaje: "Es momento de tomar asistencia.",
          tiempo: tiempoRestante
            ? this.formatearTiempoRestante(tiempoRestante)
            : undefined,
        };
      }

      return {
        estado: "despues",
        mensaje: "Ya pasó el horario para tomar asistencia.",
      };
    } catch (error) {
      this.handleError(error, "obtenerEstadoTomaAsistencia");
      return {
        estado: "despues",
        mensaje: "Error al verificar el estado de toma de asistencia.",
      };
    }
  }

  /**
   * Calcula el porcentaje de tiempo transcurrido durante la toma de asistencia
   * Útil para mostrar barras de progreso
   */
  public async obtenerPorcentajeTranscurridoTomaAsistencia(): Promise<number> {
    try {
      const horario = await this.obtenerHorarioTomaAsistencia();
      if (!horario) return 100;

      const ahora = new Date();
      const inicio = new Date(horario.Inicio);
      const fin = new Date(horario.Fin);

      // Si no ha comenzado
      if (ahora < inicio) return 0;

      // Si ya terminó
      if (ahora > fin) return 100;

      // Calcular porcentaje
      const tiempoTotal = fin.getTime() - inicio.getTime();
      const tiempoTranscurrido = ahora.getTime() - inicio.getTime();

      return Math.round((tiempoTranscurrido / tiempoTotal) * 100);
    } catch (error) {
      this.handleError(error, "obtenerPorcentajeTranscurridoTomaAsistencia");
      return 100; // En caso de error, asumimos que está completo
    }
  }
}

// Exportar una instancia singleton
const datosAsistenciaHoyAuxiliarIDB = new DatosAsistenciaHoyAuxiliarIDB();
export default datosAsistenciaHoyAuxiliarIDB;

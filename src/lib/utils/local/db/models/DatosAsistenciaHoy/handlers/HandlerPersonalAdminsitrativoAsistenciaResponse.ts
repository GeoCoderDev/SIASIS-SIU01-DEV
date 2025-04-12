import {
  PersonalAdministrativoAsistenciaResponse,
  HorarioTomaAsistencia,
} from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";
import { alterarUTCaZonaPeruana } from "@/lib/helpers/alteradores/alterarUTCaZonaPeruana";
import { T_Comunicados, T_Eventos } from "@prisma/client";

/**
 * Handler para los datos de asistencia específicos del Personal Administrativo
 */
export class HandlerPersonalAdministrativoAsistenciaResponse {
  private data: PersonalAdministrativoAsistenciaResponse;

  /**
   * Constructor que recibe los datos de asistencia
   * @param asistenciaData Datos del personal administrativo
   */
  constructor(asistenciaData: PersonalAdministrativoAsistenciaResponse) {
    this.data = asistenciaData;
  }

  /**
   * Verifica si hoy es un día de evento
   * @returns El evento si existe, o false si no hay evento
   */
  public esHoyDiaDeEvento(): false | T_Eventos {
    return this.data.DiaEvento;
  }

  /**
   * Obtiene la fecha actual en UTC
   * @returns Fecha UTC
   */
  public getFechaUTC(): Date {
    return new Date(alterarUTCaZonaPeruana(String(this.data.FechaUTC)));
  }

  /**
   * Obtiene la fecha actual en hora local de Perú
   * @returns Fecha local Perú
   */
  public getFechaLocalPeru(): Date {
    return new Date(alterarUTCaZonaPeruana(String(this.data.FechaLocalPeru)));
  }

  /**
   * Obtiene los comunicados para mostrar hoy
   * @returns Array de comunicados
   */
  public getComunicados(): T_Comunicados[] {
    return this.data.ComunicadosParaMostrarHoy || [];
  }

  /**
   * Verifica si hay comunicados para hoy
   * @returns true si hay comunicados, false si no
   */
  public hayComunicados(): boolean {
    return this.getComunicados().length > 0;
  }

  /**
   * Obtiene el horario laboral personal
   * @returns Objeto con horario de entrada y salida, o null si no hay horario
   */
  public getHorarioPersonal(): {
    Horario_Laboral_Entrada: Date;
    Horario_Laboral_Salida: Date;
  } | null {
    return this.data.HorarioPersonal !== false
      ? this.data.HorarioPersonal || null
      : null;
  }

  /**
   * Obtiene el horario laboral como horario de toma de asistencia general
   * @returns Objeto con horario de inicio y fin
   */
  public getHorarioTomaAsistenciaGeneral(): HorarioTomaAsistencia {
    const horarioPersonal = this.getHorarioPersonal();

    if (horarioPersonal) {
      return {
        Inicio: horarioPersonal.Horario_Laboral_Entrada,
        Fin: horarioPersonal.Horario_Laboral_Salida,
      };
    }

    // Si no hay horario específico, retornamos un horario por defecto
    // usando la fecha actual (como placeholder)
    const fechaActual = this.getFechaLocalPeru();
    return {
      Inicio: fechaActual,
      Fin: fechaActual,
    };
  }

  /**
   * Verifica si un horario está activo actualmente
   * @param horario Horario a verificar
   * @returns true si el horario está activo, false si no
   */
  public estaHorarioActivo(horario: HorarioTomaAsistencia): boolean {
    const ahora = this.getFechaLocalPeru();
    const inicio = new Date(horario.Inicio);
    const fin = new Date(horario.Fin);

    return ahora >= inicio && ahora <= fin;
  }

  /**
   * Verifica si el personal está en su horario de trabajo
   * @returns true si está en horario, false si no tiene horario o no está en horario
   */
  public estaEnHorarioDeTrabajo(): boolean {
    const horarioPersonal = this.getHorarioPersonal();
    if (!horarioPersonal) return false;

    return this.estaHorarioActivo({
      Inicio: horarioPersonal.Horario_Laboral_Entrada,
      Fin: horarioPersonal.Horario_Laboral_Salida,
    });
  }

  /**
   * Obtiene el cargo del personal administrativo
   * Esta función debe ser implementada según la estructura de datos real
   * @returns Cargo del personal o string vacío si no está disponible
   */
  public getCargo(): string {
    // Implementación provisional - depende de la estructura real de datos
    return "Personal Administrativo";
  }

  /**
   * Obtiene todos los datos originales
   * @returns Los datos completos de asistencia del personal administrativo
   */
  public getDatosCompletos(): PersonalAdministrativoAsistenciaResponse {
    return this.data;
  }

  /**
   * Verifica si la fecha actual está fuera del año escolar
   * basándose en los datos disponibles
   * @returns true si está fuera, false si no
   */
  public estaFueraDeAnioEscolar(): boolean {
    return this.data.FueraAñoEscolar !== false;
  }

  /**
   * Verifica si la fecha actual está dentro de las vacaciones de medio año
   * basándose en los datos disponibles
   * @returns true si está en vacaciones, false si no
   */
  public estaEnVacacionesMedioAnio(): boolean {
    return this.data.DentroVacionesMedioAño !== false;
  }
}

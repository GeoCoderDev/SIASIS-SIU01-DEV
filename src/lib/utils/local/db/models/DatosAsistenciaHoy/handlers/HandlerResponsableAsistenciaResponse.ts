import {
  ResponsableAsistenciaResponse,
  HorarioTomaAsistencia,
} from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";
import { alterarUTCaZonaPeruana } from "@/lib/helpers/alteradores/alterarUTCaZonaPeruana";
import { T_Comunicados, T_Eventos } from "@prisma/client";
import { NivelEducativo } from "@/interfaces/shared/NivelEducativo";

/**
 * Handler para los datos de asistencia específicos del Responsable (padre/apoderado)
 */
export class HandlerResponsableAsistenciaResponse {
  private data: ResponsableAsistenciaResponse;

  /**
   * Constructor que recibe los datos de asistencia
   * @param asistenciaData Datos del responsable
   */
  constructor(asistenciaData: ResponsableAsistenciaResponse) {
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
   * Obtiene los horarios escolares por nivel educativo
   * @param nivel Nivel educativo (P para primaria, S para secundaria)
   * @returns Horario para el nivel especificado o null si no existe
   */
  public getHorarioEscolar(
    nivel: NivelEducativo
  ): HorarioTomaAsistencia | null {
    return this.data.HorariosEscolares[nivel] || null;
  }

  /**
   * Obtiene el horario escolar para primaria
   * @returns Horario para primaria o null si no existe
   */
  public getHorarioEscolarPrimaria(): HorarioTomaAsistencia | null {
    return this.getHorarioEscolar(NivelEducativo.PRIMARIA);
  }

  /**
   * Obtiene el horario escolar para secundaria
   * @returns Horario para secundaria o null si no existe
   */
  public getHorarioEscolarSecundaria(): HorarioTomaAsistencia | null {
    return this.getHorarioEscolar(NivelEducativo.SECUNDARIA);
  }

  /**
   * Obtiene el horario principal para el responsable (se usa el de primaria como estándar)
   * @returns Objeto con horario de inicio y fin
   */
  public getHorarioTomaAsistenciaGeneral(): HorarioTomaAsistencia {
    // Intentamos primero con primaria, luego con secundaria
    const horarioPrimaria = this.getHorarioEscolarPrimaria();
    if (horarioPrimaria) return horarioPrimaria;

    const horarioSecundaria = this.getHorarioEscolarSecundaria();
    if (horarioSecundaria) return horarioSecundaria;

    // Si no hay ningún horario, retornamos un horario por defecto
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
   * Verifica si el horario escolar de primaria está activo
   * @returns true si está activo, false si no existe o no está activo
   */
  public estaActivoHorarioEscolarPrimaria(): boolean {
    const horario = this.getHorarioEscolarPrimaria();
    return horario ? this.estaHorarioActivo(horario) : false;
  }

  /**
   * Verifica si el horario escolar de secundaria está activo
   * @returns true si está activo, false si no existe o no está activo
   */
  public estaActivoHorarioEscolarSecundaria(): boolean {
    const horario = this.getHorarioEscolarSecundaria();
    return horario ? this.estaHorarioActivo(horario) : false;
  }

  /**
   * Verifica si algún horario escolar está activo actualmente
   * @returns true si algún horario está activo, false si ninguno está activo
   */
  public hayHorarioEscolarActivo(): boolean {
    return (
      this.estaActivoHorarioEscolarPrimaria() ||
      this.estaActivoHorarioEscolarSecundaria()
    );
  }

  /**
   * Obtiene todos los datos originales
   * @returns Los datos completos de asistencia del responsable
   */
  public getDatosCompletos(): ResponsableAsistenciaResponse {
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

import {
  ProfesorTutorSecundariaAsistenciaResponse,
  HorarioTomaAsistencia,
} from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";
import { alterarUTCaZonaPeruana } from "@/lib/helpers/alteradores/alterarUTCaZonaPeruana";
import { T_Comunicados, T_Eventos } from "@prisma/client";

/**
 * Handler para los datos de asistencia específicos del Profesor/Tutor de Secundaria
 * Compatible tanto con profesores regulares como con tutores de secundaria
 */
export class HandlerProfesorTutorSecundariaAsistenciaResponse {
  private data: ProfesorTutorSecundariaAsistenciaResponse;

  /**
   * Constructor que recibe los datos de asistencia
   * @param asistenciaData Datos del profesor/tutor de secundaria
   */
  constructor(asistenciaData: ProfesorTutorSecundariaAsistenciaResponse) {
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
   * Obtiene el horario del profesor/tutor para hoy
   * @returns Horario del profesor/tutor o null si no hay horario disponible
   */
  public getHorarioProfesor(): {
    Hora_Entrada_Dia_Actual: Date;
    Hora_Salida_Dia_Actual: Date;
  } | null {
    return this.data.HorarioProfesor !== false
      ? this.data.HorarioProfesor || null
      : null;
  }

  /**
   * Obtiene el horario de trabajo del profesor, que se usa como horario principal
   * @returns Objeto con horario de inicio y fin
   */
  public getHorarioTomaAsistenciaGeneral(): HorarioTomaAsistencia {
    const horarioProfesor = this.getHorarioProfesor();

    // Si hay un horario específico para el profesor, lo usamos
    if (horarioProfesor) {
      return {
        Inicio: horarioProfesor.Hora_Entrada_Dia_Actual,
        Fin: horarioProfesor.Hora_Salida_Dia_Actual,
      };
    }

    // Si no hay horario específico, usamos el horario escolar como fallback
    return this.getHorarioEscolarSecundaria();
  }

  /**
   * Obtiene el horario escolar para secundaria
   * @returns Objeto con horario de inicio y fin
   */
  public getHorarioEscolarSecundaria(): HorarioTomaAsistencia {
    return this.data.HorarioEscolarSecundaria;
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
   * Verifica si el profesor está en horario de trabajo según su horario específico
   * @returns true si está en horario, false si no tiene horario o no está en horario
   */
  public estaEnHorarioDeTrabajo(): boolean {
    const horarioProfesor = this.getHorarioProfesor();
    if (!horarioProfesor) return false;

    return this.estaHorarioActivo({
      Inicio: horarioProfesor.Hora_Entrada_Dia_Actual,
      Fin: horarioProfesor.Hora_Salida_Dia_Actual,
    });
  }

  /**
   * Verifica si el horario escolar de secundaria está activo
   * @returns true si está activo, false si no
   */
  public estaActivoHorarioEscolar(): boolean {
    return this.estaHorarioActivo(this.getHorarioEscolarSecundaria());
  }

  /**
   * Determina si el profesor es un tutor (tiene un aula asignada)
   * Esta función se debe implementar según la lógica específica del sistema
   * @returns true si es tutor, false si es solo profesor
   */
  public esTutor(): boolean {
    // Esta lógica debe ser implementada según la estructura de datos real
    // Por ejemplo, verificando si hay datos específicos de tutoría
    // o algún campo que indique que es tutor
    return !!this.data.HorarioProfesor; // Implementación provisional
  }

  /**
   * Obtiene todos los datos originales
   * @returns Los datos completos de asistencia del profesor/tutor de secundaria
   */
  public getDatosCompletos(): ProfesorTutorSecundariaAsistenciaResponse {
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

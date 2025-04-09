import {
  DirectivoAsistenciaResponse,
  HorarioTomaAsistencia,
  PersonalAdministrativoParaTomaDeAsistencia,
  ProfesoresPrimariaParaTomaDeAsistencia,
  ProfesorTutorSecundariaParaTomaDeAsistencia,
  RangoFechas,
} from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";
import { alterarUTCaZonaPeruana } from "@/lib/helpers/alteradores/alterarUTCaZonaPeruana";
import { T_Comunicados, T_Eventos } from "@prisma/client";

/**
 * Clase para manejar y acceder a los datos de asistencia
 */
export class HandlerDirectivoAsistenciaResponse {
  private data: DirectivoAsistenciaResponse;

  /**
   * Constructor que recibe los datos de asistencia
   * @param asistenciaData Datos completos de asistencia
   */
  constructor(asistenciaData: DirectivoAsistenciaResponse) {
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
   * Verifica si la fecha actual está fuera del año escolar
   * @returns El rango de fechas fuera del año escolar, o false si estamos en año escolar
   */
  public estaFueraDeAnioEscolar(): false | RangoFechas {
    return this.data.FueraAñoEscolar;
  }

  /**
   * Verifica si la fecha actual está dentro de las vacaciones de medio año
   * @returns El rango de fechas de vacaciones, o false si no estamos en vacaciones
   */
  public estaEnVacacionesMedioAnio(): false | RangoFechas {
    return this.data.DentroVacionesMedioAño;
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
   * Obtiene la lista completa del personal administrativo
   * @returns Array del personal administrativo
   */
  public getPersonalAdministrativo(): PersonalAdministrativoParaTomaDeAsistencia[] {
    return this.data.ListaDePersonalesAdministrativos || [];
  }

  /**
   * Busca un miembro del personal administrativo por DNI
   * @param dni DNI a buscar
   * @returns Datos del personal o null si no se encuentra
   */
  public buscarPersonalAdministrativoPorDNI(
    dni: string
  ): PersonalAdministrativoParaTomaDeAsistencia | null {
    return (
      this.getPersonalAdministrativo().find(
        (personal) => personal.DNI_Personal_Administrativo === dni
      ) || null
    );
  }

  /**
   * Filtra personal administrativo por cargo
   * @param cargo Cargo a filtrar
   * @returns Array de personal con el cargo especificado
   */
  public filtrarPersonalPorCargo(
    cargo: string
  ): PersonalAdministrativoParaTomaDeAsistencia[] {
    return this.getPersonalAdministrativo().filter(
      (personal) => personal.Cargo === cargo
    );
  }

  /**
   * Obtiene la lista completa de profesores de primaria
   * @returns Array de profesores de primaria
   */
  public getProfesoresPrimaria(): ProfesoresPrimariaParaTomaDeAsistencia[] {
    return this.data.ListaDeProfesoresPrimaria || [];
  }

  /**
   * Busca un profesor de primaria por DNI
   * @param dni DNI a buscar
   * @returns Datos del profesor o null si no se encuentra
   */
  public buscarProfesorPrimariaPorDNI(
    dni: string
  ): ProfesoresPrimariaParaTomaDeAsistencia | null {
    return (
      this.getProfesoresPrimaria().find(
        (profesor) => profesor.DNI_Profesor_Primaria === dni
      ) || null
    );
  }

  /**
   * Obtiene la lista completa de profesores de secundaria
   * @returns Array de profesores de secundaria
   */
  public getProfesoresSecundaria(): ProfesorTutorSecundariaParaTomaDeAsistencia[] {
    return this.data.ListaDeProfesoresSecundaria || [];
  }

  /**
   * Busca un profesor de secundaria por DNI
   * @param dni DNI a buscar
   * @returns Datos del profesor o null si no se encuentra
   */
  public buscarProfesorSecundariaPorDNI(
    dni: string
  ): ProfesorTutorSecundariaParaTomaDeAsistencia | null {
    return (
      this.getProfesoresSecundaria().find(
        (profesor) => profesor.DNI_Profesor_Secundaria === dni
      ) || null
    );
  }

  /**
   * Obtiene el horario de toma de asistencia para todo el personal
   * @returns Objeto con horario de inicio y fin
   */
  public getHorarioTomaAsistenciaGeneral(): HorarioTomaAsistencia {
    return this.data.HorariosLaboraresGenerales
      .TomaAsistenciaRangoTotalPersonales;
  }

  /**
   * Obtiene el horario de toma de asistencia para profesores de primaria
   * @returns Objeto con horario de inicio y fin
   */
  public getHorarioTomaAsistenciaPrimaria(): HorarioTomaAsistencia {
    return this.data.HorariosLaboraresGenerales.TomaAsistenciaProfesorPrimaria;
  }

  /**
   * Obtiene el horario de toma de asistencia para auxiliares
   * @returns Objeto con horario de inicio y fin
   */
  public getHorarioTomaAsistenciaAuxiliares(): HorarioTomaAsistencia {
    return this.data.HorariosLaboraresGenerales.TomaAsistenciaAuxiliares;
  }

  /**
   * Obtiene los horarios escolares por nivel educativo
   * @param nivel Nivel educativo (P para primaria, S para secundaria)
   * @returns Horario para el nivel especificado o null si no existe
   */
  public getHorarioEscolar(nivel: "P" | "S"): HorarioTomaAsistencia | null {
    return this.data.HorariosEscolares[nivel] || null;
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
   * Verifica si la toma de asistencia del personal está activa
   * @returns true si está activa, false si no
   */
  public estaActivaTomaAsistenciaGeneral(): boolean {
    return this.estaHorarioActivo(this.getHorarioTomaAsistenciaGeneral());
  }

  /**
   * Verifica si la toma de asistencia de primaria está activa
   * @returns true si está activa, false si no
   */
  public estaActivaTomaAsistenciaPrimaria(): boolean {
    return this.estaHorarioActivo(this.getHorarioTomaAsistenciaPrimaria());
  }

  /**
   * Verifica si la toma de asistencia de auxiliares está activa
   * @returns true si está activa, false si no
   */
  public estaActivaTomaAsistenciaAuxiliares(): boolean {
    return this.estaHorarioActivo(this.getHorarioTomaAsistenciaAuxiliares());
  }

  /**
   * Obtiene la cantidad total de personal administrativo
   * @returns Número de personal administrativo
   */
  public getTotalPersonalAdministrativo(): number {
    return this.getPersonalAdministrativo().length;
  }

  /**
   * Obtiene la cantidad total de profesores de primaria
   * @returns Número de profesores de primaria
   */
  public getTotalProfesoresPrimaria(): number {
    return this.getProfesoresPrimaria().length;
  }

  /**
   * Obtiene la cantidad total de profesores de secundaria
   * @returns Número de profesores de secundaria
   */
  public getTotalProfesoresSecundaria(): number {
    return this.getProfesoresSecundaria().length;
  }

  /**
   * Verifica si un miembro del personal debe estar presente ahora
   * @param dni DNI del personal administrativo
   * @returns true si debe estar presente, false si no o si no se encuentra
   */
  public debeEstarPresentePersonalAhora(dni: string): boolean {
    const personal = this.buscarPersonalAdministrativoPorDNI(dni);
    if (!personal) return false;

    const ahora = this.getFechaLocalPeru();
    const horaEntrada = new Date(this.getFechaLocalPeru());
    const horaSalida = new Date(this.getFechaLocalPeru());

    // Configurar las horas a partir de las cadenas HH:MM:SS
    const [entradaHours, entradaMinutes] = String(
      personal.Horario_Laboral_Entrada
    )
      .split(":")
      .map(Number);
    const [salidaHours, salidaMinutes] = String(personal.Horario_Laboral_Salida)
      .split(":")
      .map(Number);

    horaEntrada.setHours(entradaHours, entradaMinutes, 0, 0);
    horaSalida.setHours(salidaHours, salidaMinutes, 0, 0);

    return ahora >= horaEntrada && ahora <= horaSalida;
  }

  /**
   * Obtiene todos los datos originales
   * @returns Los datos completos de asistencia
   */
  public getDatosCompletos(): DirectivoAsistenciaResponse {
    return this.data;
  }
}

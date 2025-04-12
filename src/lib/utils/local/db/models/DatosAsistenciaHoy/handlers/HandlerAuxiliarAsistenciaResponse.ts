import {
    AuxiliarAsistenciaResponse,
    HorarioTomaAsistencia
  } from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";
  import { alterarUTCaZonaPeruana } from "@/lib/helpers/alteradores/alterarUTCaZonaPeruana";
  import { T_Comunicados, T_Eventos } from "@prisma/client";
  
  /**
   * Handler para los datos de asistencia específicos del Auxiliar
   */
  export class HandlerAuxiliarAsistenciaResponse {
    private data: AuxiliarAsistenciaResponse;
  
    /**
     * Constructor que recibe los datos de asistencia
     * @param asistenciaData Datos del auxiliar
     */
    constructor(asistenciaData: AuxiliarAsistenciaResponse) {
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
     * Obtiene el horario de toma de asistencia para auxiliares
     * @returns Objeto con horario de inicio y fin
     */
    public getHorarioTomaAsistenciaGeneral(): HorarioTomaAsistencia {
      return this.data.HorarioTomaAsistenciaAuxiliares;
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
     * Verifica si la toma de asistencia de los auxiliares está activa
     * @returns true si está activa, false si no
     */
    public estaActivaTomaAsistencia(): boolean {
      return this.estaHorarioActivo(this.getHorarioTomaAsistenciaGeneral());
    }
  
    /**
     * Verifica si el horario escolar de secundaria está activo
     * @returns true si está activo, false si no
     */
    public estaActivoHorarioEscolar(): boolean {
      return this.estaHorarioActivo(this.getHorarioEscolarSecundaria());
    }
  
    /**
     * Verifica si el auxiliar está en su horario de trabajo
     * (usando el horario de toma de asistencia como referencia)
     * @returns true si está en horario, false si no
     */
    public estaEnHorarioDeTrabajo(): boolean {
      return this.estaActivaTomaAsistencia();
    }
  
    /**
     * Obtiene todos los datos originales
     * @returns Los datos completos de asistencia del auxiliar
     */
    public getDatosCompletos(): AuxiliarAsistenciaResponse {
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
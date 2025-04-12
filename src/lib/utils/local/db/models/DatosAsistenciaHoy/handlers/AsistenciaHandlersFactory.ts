/* eslint-disable @typescript-eslint/no-explicit-any */
import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import {
  AuxiliarAsistenciaResponse,
  DirectivoAsistenciaResponse,
  PersonalAdministrativoAsistenciaResponse,
  ProfesorPrimariaAsistenciaResponse,
  ProfesorTutorSecundariaAsistenciaResponse,
  ResponsableAsistenciaResponse,
} from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";

// Importamos los handlers específicos para cada rol

import { HandlerProfesorPrimariaAsistenciaResponse } from "./HandlerProfesorPrimariaAsistenciaResponse";
import { HandlerDirectivoAsistenciaResponse } from "./HandlerDirectivoAsistenciaResponse";
import { HandlerProfesorTutorSecundariaAsistenciaResponse } from "./HandlerProfesorTutorSecundariaAsistenciaResponse";
import { HandlerAuxiliarAsistenciaResponse } from "./HandlerAuxiliarAsistenciaResponse";
import { HandlerPersonalAdministrativoAsistenciaResponse } from "./HandlerPersonalAdminsitrativoAsistenciaResponse";
import { HandlerResponsableAsistenciaResponse } from "./HandlerResponsableAsistenciaResponse";

/**
 * Tipo unión que representa cualquier tipo de handler de asistencia
 */
export type AsistenciaHandler =
  | HandlerDirectivoAsistenciaResponse
  | HandlerProfesorPrimariaAsistenciaResponse
  | HandlerProfesorTutorSecundariaAsistenciaResponse
  | HandlerAuxiliarAsistenciaResponse
  | HandlerPersonalAdministrativoAsistenciaResponse
  | HandlerResponsableAsistenciaResponse;

/**
 * Factory para crear handlers de asistencia según el rol del usuario
 * @param rol Rol del usuario
 * @param data Datos de asistencia
 * @returns El handler específico para ese rol, o null si los datos son inválidos
 */
export function createAsistenciaHandler(
  rol: RolesSistema,
  data:
    | DirectivoAsistenciaResponse
    | ProfesorPrimariaAsistenciaResponse
    | ProfesorTutorSecundariaAsistenciaResponse
    | PersonalAdministrativoAsistenciaResponse
    | ResponsableAsistenciaResponse
    | AuxiliarAsistenciaResponse
): AsistenciaHandler | null {
  if (!data) return null;

  try {
    switch (rol) {
      case RolesSistema.Directivo:
        return new HandlerDirectivoAsistenciaResponse(
          data as DirectivoAsistenciaResponse
        );

      case RolesSistema.ProfesorPrimaria:
        return new HandlerProfesorPrimariaAsistenciaResponse(
          data as ProfesorPrimariaAsistenciaResponse
        );

      case RolesSistema.ProfesorSecundaria:
      case RolesSistema.Tutor:
        return new HandlerProfesorTutorSecundariaAsistenciaResponse(
          data as ProfesorTutorSecundariaAsistenciaResponse
        );

      case RolesSistema.Auxiliar:
        return new HandlerAuxiliarAsistenciaResponse(
          data as AuxiliarAsistenciaResponse
        );

      case RolesSistema.PersonalAdministrativo:
        return new HandlerPersonalAdministrativoAsistenciaResponse(
          data as PersonalAdministrativoAsistenciaResponse
        );

      case RolesSistema.Responsable:
        return new HandlerResponsableAsistenciaResponse(
          data as ResponsableAsistenciaResponse
        );

      default:
        console.warn(`Rol no soportado: ${rol}`);
        return null;
    }
  } catch (error) {
    console.error(`Error al crear handler para rol ${rol}:`, error);
    return null;
  }
}

/**
 * Verifica si un objeto es un handler de asistencia válido
 * @param handler Objeto a verificar
 * @returns True si es un handler válido, false en caso contrario
 */
export function isAsistenciaHandler(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: any
): handler is AsistenciaHandler {
  return (
    handler &&
    typeof handler === "object" &&
    typeof handler.getFechaLocalPeru === "function" &&
    typeof handler.getComunicados === "function" &&
    typeof handler.getDatosCompletos === "function"
  );
}

/**
 * Intenta determinar el rol de un handler basado en sus propiedades
 * @param handler El handler a evaluar
 * @returns El rol estimado, o null si no se puede determinar
 */
export function inferHandlerRole(
  handler: AsistenciaHandler
): RolesSistema | null {
  if (handler instanceof HandlerDirectivoAsistenciaResponse) {
    return RolesSistema.Directivo;
  } else if (handler instanceof HandlerProfesorPrimariaAsistenciaResponse) {
    return RolesSistema.ProfesorPrimaria;
  } else if (
    handler instanceof HandlerProfesorTutorSecundariaAsistenciaResponse
  ) {
    // Aquí podríamos intentar diferenciar entre ProfesorSecundaria y Tutor
    // basándonos en alguna propiedad específica
    return (
      handler as HandlerProfesorTutorSecundariaAsistenciaResponse
    ).esTutor()
      ? RolesSistema.Tutor
      : RolesSistema.ProfesorSecundaria;
  } else if (handler instanceof HandlerAuxiliarAsistenciaResponse) {
    return RolesSistema.Auxiliar;
  } else if (
    handler instanceof HandlerPersonalAdministrativoAsistenciaResponse
  ) {
    return RolesSistema.PersonalAdministrativo;
  } else if (handler instanceof HandlerResponsableAsistenciaResponse) {
    return RolesSistema.Responsable;
  }

  return null;
}

import { T_Comunicados, T_Eventos } from "@prisma/client";
import { HorarioTomaAsistencia } from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";

/**
 * Interfaz base para todos los handlers de asistencia
 * Define los métodos comunes que todos los handlers deben implementar
 */
export interface IAsistenciaBaseHandler {
  /**
   * Verifica si hoy es un día de evento
   */
  esHoyDiaDeEvento(): false | T_Eventos;

  /**
   * Obtiene la fecha actual en UTC
   */
  getFechaUTC(): Date;

  /**
   * Obtiene la fecha actual en hora local de Perú
   */
  getFechaLocalPeru(): Date;

  /**
   * Obtiene los comunicados para mostrar hoy
   */
  getComunicados(): T_Comunicados[];

  /**
   * Verifica si hay comunicados para hoy
   */
  hayComunicados(): boolean;

  /**
   * Obtiene el horario principal para este rol
   */
  getHorarioTomaAsistenciaGeneral(): HorarioTomaAsistencia;

  /**
   * Verifica si un horario está activo actualmente
   */
  estaHorarioActivo(horario: HorarioTomaAsistencia): boolean;

  /**
   * Verifica si la fecha actual está fuera del año escolar
   */
  estaFueraDeAnioEscolar(): boolean | any;

  /**
   * Verifica si la fecha actual está dentro de las vacaciones de medio año
   */
  estaEnVacacionesMedioAnio(): boolean | any;

  /**
   * Obtiene todos los datos originales
   */
  getDatosCompletos(): any;
}

/**
 * Interfaz para handlers con funciones relacionadas a horarios escolares
 */
export interface IHandlerWithEscolarSchedule extends IAsistenciaBaseHandler {
  /**
   * Verifica si el horario escolar está activo
   */
  estaActivoHorarioEscolar(): boolean;
}

/**
 * Interfaz para handlers con funciones específicas para directivos
 */
export interface IDirectivoHandler extends IAsistenciaBaseHandler {
  /**
   * Obtiene la lista completa del personal administrativo
   */
  getPersonalAdministrativo(): any[];

  /**
   * Obtiene la lista completa de profesores de primaria
   */
  getProfesoresPrimaria(): any[];

  /**
   * Obtiene la lista completa de profesores de secundaria
   */
  getProfesoresSecundaria(): any[];

  /**
   * Obtiene la cantidad total de personal administrativo
   */
  getTotalPersonalAdministrativo(): number;

  /**
   * Obtiene la cantidad total de profesores de primaria
   */
  getTotalProfesoresPrimaria(): number;

  /**
   * Obtiene la cantidad total de profesores de secundaria
   */
  getTotalProfesoresSecundaria(): number;
}

/**
 * Interfaz para handlers con horarios específicos de trabajo
 */
export interface IHandlerWithWorkSchedule extends IAsistenciaBaseHandler {
  /**
   * Verifica si el usuario está en su horario de trabajo
   */
  estaEnHorarioDeTrabajo(): boolean;
}

/**
 * Interfaz para handlers con función de tutoría
 */
export interface ITutorHandler
  extends IHandlerWithWorkSchedule,
    IHandlerWithEscolarSchedule {
  /**
   * Determina si el profesor es un tutor
   */
  esTutor(): boolean;
}

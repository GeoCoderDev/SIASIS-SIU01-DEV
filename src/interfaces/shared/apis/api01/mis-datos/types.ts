// =========================================
// RUTA: /api/mis-datos
// =========================================

import {
  T_Aulas,
  T_Auxiliares,
  T_Directivos,
  T_Personal_Administrativo,
  T_Profesores_Primaria,
  T_Profesores_Secundaria,
} from "@prisma/client";
import { ErrorResponseAPIBase, SuccessResponseAPIBase } from "../../types";

// -----------------------------------------
// Tipos Base para Roles (sin contraseña)
// -----------------------------------------

/**
 * Datos de Directivo
 */
export type MisDatosDirectivo = Omit<T_Directivos, "Contraseña">;

/**
 * Datos de Profesor Primaria con aula opcional
 */
export type MisDatosProfesorPrimaria = Omit<
  T_Profesores_Primaria,
  "Contraseña"
> & {
  Aula: Omit<
    T_Aulas,
    "DNI_Profesor_Primaria" | "DNI_Profesor_Secundaria"
  > | null;
};

/**
 * Datos de Auxiliar
 */
export type MisDatosAuxiliar = Omit<T_Auxiliares, "Contraseña">;

/**
 * Datos de Profesor Secundaria
 */
export type MisDatosProfesorSecundaria = Omit<
  T_Profesores_Secundaria,
  "Contraseña"
>;

/**
 * Datos de Tutor (Profesor secundaria con aula)
 */
export type MisDatosTutor = Omit<T_Profesores_Secundaria, "Contraseña"> & {
  Aula: Omit<T_Aulas, "DNI_Profesor_Primaria" | "DNI_Profesor_Secundaria">;
};

/**
 * Datos de Personal Administrativo
 */
export type MisDatosPersonalAdministrativo = Omit<
  T_Personal_Administrativo,
  "Contraseña"
>;

// -----------------------------------------
// Respuestas según endpoint
// -----------------------------------------

/**
 * Union de datos para personal escolar (API01)
 * Responde a: /api/mis-datos para roles de personal escolar
 */
export type MisDatosSuccessAPI01Data =
  | MisDatosDirectivo
  | MisDatosProfesorPrimaria
  | MisDatosAuxiliar
  | MisDatosProfesorSecundaria
  | MisDatosTutor
  | MisDatosPersonalAdministrativo;

export interface MisDatosSuccessResponseAPI01 extends SuccessResponseAPIBase {
  data: MisDatosSuccessAPI01Data;
}

export interface MisDatosErrorResponseAPI01 extends ErrorResponseAPIBase{}
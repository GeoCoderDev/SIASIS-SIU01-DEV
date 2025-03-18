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
  // T_Responsables,
} from "@prisma/client";
import { ErrorResponseAPIBase, SuccessResponseAPIBase } from "../../types";
import { Genero } from "../../../Genero";

// -----------------------------------------
//                METODO GET
// -----------------------------------------

/**
 * Datos de Directivo
 */
export type MisDatosDirectivo = Omit<T_Directivos, "Contraseña"> & {
  Genero: Genero;
};

/**
 * Datos de Profesor Primaria con aula opcional
 */
export type MisDatosProfesorPrimaria = Omit<
  T_Profesores_Primaria,
  "Contraseña"
> & {
  Genero: Genero;
  Aula: Omit<
    T_Aulas,
    "DNI_Profesor_Primaria" | "DNI_Profesor_Secundaria"
  > | null;
};

/**
 * Datos de Auxiliar
 */
export type MisDatosAuxiliar = Omit<T_Auxiliares, "Contraseña"> & {
  Genero: Genero;
};

/**
 * Datos de Profesor Secundaria
 */
export type MisDatosProfesorSecundaria = Omit<
  T_Profesores_Secundaria,
  "Contraseña"
> & { Genero: Genero };

/**
 * Datos de Tutor (Profesor secundaria con aula)
 */
export type MisDatosTutor = Omit<T_Profesores_Secundaria, "Contraseña"> & {
  Genero: Genero;
  Aula: Omit<T_Aulas, "DNI_Profesor_Primaria" | "DNI_Profesor_Secundaria">;
};

/**
 * Datos de Personal Administrativo
 */
export type MisDatosPersonalAdministrativo = Omit<
  T_Personal_Administrativo,
  "Contraseña"
> & { Genero: Genero };

export type ObtenerMisDatosSuccessAPI01Data =
  | MisDatosDirectivo
  | MisDatosProfesorPrimaria
  | MisDatosAuxiliar
  | MisDatosProfesorSecundaria
  | MisDatosTutor
  | MisDatosPersonalAdministrativo;

export interface MisDatosSuccessResponseAPI01 extends SuccessResponseAPIBase {
  data: ObtenerMisDatosSuccessAPI01Data;
}

export type MisDatosErrorResponseAPI01 = ErrorResponseAPIBase;

// -----------------------------------------
//                METODO PUT
// -----------------------------------------

export type ActualizarMisDatosDirectivoBody = Partial<
  Pick<T_Directivos, "DNI" | "Nombres" | "Apellidos" | "Genero" | "Celular">
> & { Genero: Genero };

export type ActualizarMisDatosProfesorPrimariaBody = Partial<
  Pick<T_Profesores_Primaria, "Correo_Electronico" | "Celular">
>;

export type ActualizarMisDatosAuxiliarBody = Partial<
  Pick<T_Auxiliares, "Correo_Electronico" | "Celular">
>;

export type ActualizarMisDatosProfesorSecundariaBody = Partial<
  Pick<T_Profesores_Secundaria, "Correo_Electronico" | "Celular">
>;

export type ActualizarMisDatosTutorBody = Partial<
  Pick<T_Profesores_Secundaria, "Celular">
>;

// export type ActualizarMisDatosResponsableBody = Partial<
//   Pick<T_Responsables, "Celular">
// >;

export type ActualizarMisDatosPersonalAdministrativoBody = Partial<
  Pick<T_Personal_Administrativo, "Celular">
>;

export type ActualizarMisDatoUsuarioBodyAPI01 =
  | ActualizarMisDatosDirectivoBody
  | ActualizarMisDatosProfesorPrimariaBody
  | ActualizarMisDatosAuxiliarBody
  | ActualizarMisDatosProfesorSecundariaBody
  | ActualizarMisDatosTutorBody
  | ActualizarMisDatosPersonalAdministrativoBody;

// Interfaz para la respuesta exitosa
export interface ActualizarUsuarioSuccessResponseAPI01
  extends SuccessResponseAPIBase {
  success: true;
  message: string;
  data: ActualizarMisDatoUsuarioBodyAPI01; // Los datos que se actualizaron
}

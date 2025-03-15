import { T_Responsables } from "@prisma/client";
import { ApiResponseBase } from "../../types";
import { MisDatosSuccessAPI01Data } from "../../api01/mis-datos/types";

/**
 * Datos de Responsable
 */
export type MisDatosResponsable = Omit<T_Responsables, "Contraseña">;

/**
 * Respuesta completa para personal escolar
 */
export interface SuccesMisDatosResponseAPI01 extends ApiResponseBase {
  data: MisDatosSuccessAPI01Data;
}

/**
 * Datos para responsables (API02)
 * Responde a: /api/mis-datos para rol de responsable
 */
export type MisDatosSuccessAPI02Data = MisDatosResponsable;

/**
 * Respuesta completa para responsables
 */
export interface SuccesMisDatosResponseAPI02 extends ApiResponseBase {
  data: MisDatosSuccessAPI02Data;
}

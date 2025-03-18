import { T_Responsables } from "@prisma/client";
import { ApiResponseBase } from "../../types";

/**
 * Datos de Responsable
 */
export type MisDatosResponsable = Omit<T_Responsables, "Contraseña">;

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

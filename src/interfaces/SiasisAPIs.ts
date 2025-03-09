import { RolesSistema } from "./RolesSistema";

export interface ApiResponseBase {
  message: string;
}

export interface SuccessResponseAPIBase {
  message: string;
}

export interface ErrorResponseAPIBase {
  message: string;
}

export interface SuccessLoginData {
  Nombres: string;
  Apellidos: string;
  Rol: RolesSistema;
  token: string;
}

export type ResponseSuccessLogin = ApiResponseBase & {
  data: SuccessLoginData;
};

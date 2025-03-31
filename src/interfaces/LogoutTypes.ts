import { SiasisComponent } from "./shared/SiasisComponents";

export enum LogoutTypes {
  DECISION_USUARIO = "DECISION_USUARIO",
  SESION_EXPIRADA = "SESION_EXPIRADA",
  ERROR_SISTEMA = "ERROR_SISTEMA",
  ERROR_SINCRONIZACION = "ERROR_SINCRONIZACION",
  ERROR_BASE_DATOS = "ERROR_BASE_DATOS",
  ERROR_RED = "ERROR_RED",
  ERROR_DATOS_CORRUPTOS = "ERROR_DATOS_CORRUPTOS",
}

export interface ErrorDetailsForLogout {
  codigo?: string;
  origen?: string;
  mensaje?: string;
  timestamp?: number;
  contexto?: string;
  siasisComponent?: SiasisComponent;
}


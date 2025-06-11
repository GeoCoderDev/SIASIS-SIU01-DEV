/* eslint-disable @typescript-eslint/no-explicit-any */
import { EstadosAsistenciaPersonal } from "@/interfaces/shared/EstadosAsistenciaPersonal";
import { Meses } from "@/interfaces/shared/Meses";
import { ModoRegistro } from "@/interfaces/shared/ModoRegistroPersonal";
import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import { ActoresSistema } from "@/interfaces/shared/ActoresSistema";
import { TipoAsistencia } from "../../../../../../interfaces/shared/AsistenciaRequests";

// Re-exportar tipos existentes para facilitar el acceso
export { ModoRegistro } from "@/interfaces/shared/ModoRegistroPersonal";
export { EstadosAsistenciaPersonal } from "@/interfaces/shared/EstadosAsistenciaPersonal";
export { RolesSistema } from "@/interfaces/shared/RolesSistema";
export { ActoresSistema } from "@/interfaces/shared/ActoresSistema";
export { TipoAsistencia } from "../../../../../../interfaces/shared/AsistenciaRequests";

// Enumeración para los diferentes tipos de personal
export enum TipoPersonal {
  PROFESOR_PRIMARIA = "profesor_primaria",
  PROFESOR_SECUNDARIA = "profesor_secundaria",
  AUXILIAR = "auxiliar",
  PERSONAL_ADMINISTRATIVO = "personal_administrativo",
}

// Interfaces para los registros de entrada/salida
export interface RegistroEntradaSalida {
  timestamp: number;
  desfaseSegundos: number;
  estado: EstadosAsistenciaPersonal;
}

// Interfaces para asistencia mensual
export interface AsistenciaMensualPersonal {
  Id_Registro_Mensual: number;
  mes: Meses;
  Dni_Personal: string;
  registros: Record<string, RegistroEntradaSalida>;
}

// Interface para el resultado de operaciones
export interface OperationResult {
  exitoso: boolean;
  mensaje: string;
  datos?: any;
}

// Interface para resultados de consulta
export interface ConsultaAsistenciaResult {
  entrada?: AsistenciaMensualPersonal;
  salida?: AsistenciaMensualPersonal;
  encontrado: boolean;
  mensaje: string;
}

// Interface para verificación de sincronización
export interface SincronizacionResult {
  estanSincronizados: boolean;
  razon: string;
  diasEntrada: number;
  diasSalida: number;
  diasEscolaresEntrada: number;
  diasEscolaresSalida: number;
}

// Interface para estadísticas de sincronización
export interface SincronizacionStats {
  totalRegistros: number;
  registrosNuevos: number;
  registrosExistentes: number;
  errores: number;
}

// Interface para configuración de servicios
export interface AsistenciaPersonalConfig {
  setIsSomethingLoading?: (isLoading: boolean) => void;
  setError?: (error: any) => void;
  setSuccessMessage?: (message: any) => void;
}

// Interface para datos de cache
export interface CacheData {
  clave: string;
  dni: string;
  actor: ActoresSistema;
  modoRegistro: ModoRegistro;
  tipoAsistencia: TipoAsistencia;
  timestamp: number;
  desfaseSegundos: number;
  estado: EstadosAsistenciaPersonal;
  fecha: string;
  timestampConsulta: number;
}

// Interface para consulta de cache
export interface ConsultaCache {
  dni: string;
  actor: ActoresSistema;
  modoRegistro: ModoRegistro;
  tipoAsistencia: TipoAsistencia;
  fecha: string;
}

// Interface para resultado de eliminación
export interface EliminacionResult {
  exitoso: boolean;
  mensaje: string;
  eliminadoLocal: boolean;
  eliminadoRedis: boolean;
  eliminadoCache: boolean;
}

// Interface para validación
export interface ValidacionResult {
  valido: boolean;
  errores: string[];
}

// Interface para verificación de marcado
export interface MarcadoHoyResult {
  marcado: boolean;
  timestamp?: number;
  desfaseSegundos?: number;
  estado?: string;
}

// Interface para parámetros de marcado de asistencia
export interface ParametrosMarcadoAsistencia {
  datos: {
    ModoRegistro: ModoRegistro;
    DNI: string;
    Rol: RolesSistema;
    Dia: number;
    Detalles?: {
      Timestamp: number;
      DesfaseSegundos: number;
    };
    esNuevoRegistro?: boolean;
  };
}

// Interface para parámetros de eliminación
export interface ParametrosEliminacionAsistencia {
  dni: string;
  rol: RolesSistema;
  modoRegistro: ModoRegistro;
  dia?: number;
  mes?: number;
  siasisAPI?: "API01" | "API02";
}

// Interface para parámetros de consulta
export interface ParametrosConsultaAsistencia {
  rol: RolesSistema;
  dni: string;
  mes: number;
}

// Type guards para verificación de tipos
export function esAsistenciaMensualPersonal(
  obj: any
): obj is AsistenciaMensualPersonal {
  return (
    obj &&
    typeof obj.Id_Registro_Mensual === "number" &&
    typeof obj.mes === "number" &&
    typeof obj.Dni_Personal === "string" &&
    typeof obj.registros === "object"
  );
}

export function esRegistroEntradaSalida(
  obj: any
): obj is RegistroEntradaSalida {
  return (
    obj &&
    typeof obj.timestamp === "number" &&
    typeof obj.desfaseSegundos === "number" &&
    typeof obj.estado === "string"
  );
}

// Constantes útiles
export const ROLES_VALIDOS_PERSONAL = [
  RolesSistema.ProfesorPrimaria,
  RolesSistema.ProfesorSecundaria,
  RolesSistema.Tutor,
  RolesSistema.Auxiliar,
  RolesSistema.PersonalAdministrativo,
] as const;

export const ESTADOS_ASISTENCIA_VALIDOS = [
  EstadosAsistenciaPersonal.En_Tiempo,
  EstadosAsistenciaPersonal.Tarde,
  EstadosAsistenciaPersonal.Cumplido,
  EstadosAsistenciaPersonal.Salida_Anticipada,
  EstadosAsistenciaPersonal.Falta,
  EstadosAsistenciaPersonal.Inactivo,
  EstadosAsistenciaPersonal.Sin_Registro,
] as const;

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { LogoutTypes, ErrorDetailsForLogout } from "@/interfaces/LogoutTypes";
import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import { JWTPayload } from "@/interfaces/shared/JWTPayload";
import { NOMBRE_ARCHIVO_CON_DATOS_ASISTENCIA_DIARIOS } from "@/constants/NOMBRE_ARCHIVOS_EN_BLOBS";
import { borrarCookiesDeSesion } from "../auth/close/_utils/borrarCookiesDeSesion";
import { formatErrorDetailsForUrl } from "@/lib/helpers/parsers/errorDetailsInURL";
import {
  AuxiliarAsistenciaResponse,
  BaseAsistenciaResponse,
  DatosAsistenciaHoyIE20935,
  DirectivoAsistenciaResponse,
  PersonalAdministrativoAsistenciaResponse,
  ProfesorPrimariaAsistenciaResponse,
  ProfesorTutorSecundariaAsistenciaResponse,
  ResponsableAsistenciaResponse,
} from "@/interfaces/shared/Asistencia/DatosAsistenciaHoyIE20935";

import { NivelEducativo } from "@/interfaces/shared/NivelEducativo";

export async function GET(req: NextRequest) {
  try {
    // Obtener cookies
    const token = req.cookies.get("token")?.value;
    const rol = req.cookies.get("Rol")?.value as RolesSistema | undefined;

    // Verificar si existen las cookies necesarias
    if (!token || !rol) {
      return redirectToLogin(LogoutTypes.SESION_EXPIRADA, {
        mensaje: "Sesión no encontrada",
        origen: "api/obtenerDatosAsistencia",
      });
    }

    // Seleccionar la clave JWT correcta según el rol
    const jwtKey = getJwtKeyForRole(rol);
    if (!jwtKey) {
      return redirectToLogin(LogoutTypes.ERROR_DATOS_CORRUPTOS, {
        mensaje: "Configuración de seguridad inválida",
        origen: "api/obtenerDatosAsistencia",
      });
    }

    // Decodificar el token JWT
    let decodedToken: JWTPayload;
    try {
      decodedToken = jwt.verify(token, jwtKey) as JWTPayload;
    } catch (error) {
      console.log(error);
      return redirectToLogin(LogoutTypes.ERROR_DATOS_CORRUPTOS, {
        mensaje: "Token de seguridad inválido",
        origen: "api/obtenerDatosAsistencia",
        siasisComponent: "SIU01",
      });
    }

    // Verificar que el rol en el token coincida con el rol en la cookie
    if (decodedToken.Rol !== rol) {
      return redirectToLogin(LogoutTypes.ERROR_DATOS_CORRUPTOS, {
        mensaje: "Datos de sesión inconsistentes",
        origen: "api/obtenerDatosAsistencia",
        contexto: "Rol en token no coincide con rol en cookie",
      });
    }

    // Una vez autenticado correctamente, obtener los datos del blob
    // Modificar el bloque try-catch para la obtención de datos del blob
    try {
      // Usar la URL de descarga segura para obtener el contenido
      const response = await fetch(
        `${process.env
          .THIS_INSTANCE_VERCEL_BLOB_BASE_URL!}/${NOMBRE_ARCHIVO_CON_DATOS_ASISTENCIA_DIARIOS}`
      );

      if (!response.ok) {
        throw new Error(
          `Error en la respuesta del servidor: ${response.status} ${response.statusText}`
        );
      }

      const datosCompletos =
        (await response.json()) as DatosAsistenciaHoyIE20935;

      // Filtrar datos según el rol
      const datosFiltrados = filtrarDatosSegunRol(
        datosCompletos,
        rol,
        decodedToken.ID_Usuario
      );

      // Devolver los datos filtrados
      return NextResponse.json(datosFiltrados);
    } catch (error) {
      console.error("Error al obtener datos de asistencia:", error);
      // Determinar el tipo de error
      let logoutType = LogoutTypes.ERROR_SISTEMA;
      const errorDetails: ErrorDetailsForLogout = {
        mensaje: "Error al recuperar datos de asistencia",
        origen: "api/datos-asistencia-hoy",
        timestamp: Date.now(),
        siasisComponent: "RDP04",
      };

      if (error instanceof Error) {
        // Si es un error de red o problemas de conexión
        if (
          error.message.includes("fetch") ||
          error.message.includes("network") ||
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("timeout")
        ) {
          logoutType = LogoutTypes.ERROR_RED;
          errorDetails.mensaje =
            "Error de conexión al obtener datos de asistencia";
        }
        // Si es un error de parseo de JSON
        else if (
          error.message.includes("JSON") ||
          error.message.includes("parse")
        ) {
          logoutType = LogoutTypes.ERROR_DATOS_CORRUPTOS;
          errorDetails.mensaje = "Error al procesar los datos de asistencia";
          errorDetails.contexto = "Formato de datos inválido";
        }

        errorDetails.mensaje += `: ${error.message}`;
      }

      return redirectToLogin(logoutType, errorDetails);
    }
  } catch (error) {
    console.error("Error general:", error);
    return redirectToLogin(LogoutTypes.ERROR_SISTEMA, {
      mensaje: "Error inesperado del sistema",
      origen: "api/datos-asistencia-hoy",
    });
  }
}

// Función para obtener la clave JWT según el rol
function getJwtKeyForRole(rol: RolesSistema): string | undefined {
  const keys = {
    [RolesSistema.Directivo]: process.env.JWT_KEY_DIRECTIVOS,
    [RolesSistema.ProfesorPrimaria]: process.env.JWT_KEY_PROFESORES_PRIMARIA,
    [RolesSistema.Auxiliar]: process.env.JWT_KEY_AUXILIARES,
    [RolesSistema.ProfesorSecundaria]:
      process.env.JWT_KEY_PROFESORES_SECUNDARIA,
    [RolesSistema.Tutor]: process.env.JWT_KEY_TUTORES,
    [RolesSistema.Responsable]: process.env.JWT_KEY_RESPONSABLES,
    [RolesSistema.PersonalAdministrativo]:
      process.env.JWT_KEY_PERSONAL_ADMINISTRATIVO,
  };

  return keys[rol];
}

// Función para filtrar los datos según el rol
function filtrarDatosSegunRol(
  datos: DatosAsistenciaHoyIE20935,
  rol: RolesSistema,
  idUsuario: string
): BaseAsistenciaResponse {
  // Datos base para todos los roles
  const datosBase: BaseAsistenciaResponse = {
    DiaEvento: datos.DiaEvento,
    FechaUTC: datos.FechaUTC,
    FechaLocalPeru: datos.FechaLocalPeru,
    FueraAñoEscolar: datos.FueraAñoEscolar,
    DentroVacionesMedioAño: datos.DentroVacionesMedioAño,
    ComunicadosParaMostrarHoy: datos.ComunicadosParaMostrarHoy,
  };

  switch (rol) {
    case RolesSistema.Directivo:
      // Directivos tienen acceso a todos los datos
      return {
        ...datosBase,
        ListaDePersonalesAdministrativos:
          datos.ListaDePersonalesAdministrativos,
        ListaDeProfesoresPrimaria: datos.ListaDeProfesoresPrimaria,
        ListaDeProfesoresSecundaria: datos.ListaDeProfesoresSecundaria,
        HorariosLaboraresGenerales: datos.HorariosLaboraresGenerales,
        HorariosEscolares: datos.HorariosEscolares,
      } as DirectivoAsistenciaResponse;

    case RolesSistema.ProfesorPrimaria:
      // Profesores de primaria reciben su horario y el de estudiantes de primaria
      return {
        ...datosBase,
        HorarioTomaAsistenciaProfesorPrimaria:
          datos.HorariosLaboraresGenerales.TomaAsistenciaProfesorPrimaria,
        HorarioEscolarPrimaria:
          datos.HorariosEscolares[NivelEducativo.PRIMARIA],
      } as ProfesorPrimariaAsistenciaResponse;

    case RolesSistema.Auxiliar:
      // Auxiliares reciben su horario y el de estudiantes de secundaria
      return {
        ...datosBase,
        HorarioTomaAsistenciaAuxiliares:
          datos.HorariosLaboraresGenerales.TomaAsistenciaAuxiliares,
        HorarioEscolarSecundaria:
          datos.HorariosEscolares[NivelEducativo.SECUNDARIA],
      } as AuxiliarAsistenciaResponse;

    case RolesSistema.ProfesorSecundaria:
    case RolesSistema.Tutor:
      // Profesores de secundaria y tutores reciben su propio horario y el de estudiantes de secundaria
      const profesorInfo = datos.ListaDeProfesoresSecundaria.find(
        (p) => p.DNI_Profesor_Secundaria === idUsuario
      );

      return {
        ...datosBase,
        HorarioProfesor: profesorInfo
          ? {
              Hora_Entrada_Dia_Actual: profesorInfo.Hora_Entrada_Dia_Actual,
              Hora_Salida_Dia_Actual: profesorInfo.Hora_Salida_Dia_Actual,
            }
          : false,
        HorarioEscolarSecundaria:
          datos.HorariosEscolares[NivelEducativo.SECUNDARIA],
      } as ProfesorTutorSecundariaAsistenciaResponse;

    case RolesSistema.Responsable:
      // Responsables reciben los horarios escolares de primaria y secundaria
      return {
        ...datosBase,
        HorariosEscolares: datos.HorariosEscolares,
      } as ResponsableAsistenciaResponse;

    case RolesSistema.PersonalAdministrativo:
      // Personal administrativo recibe solo su propio horario
      const personalInfo = datos.ListaDePersonalesAdministrativos.find(
        (p) => p.DNI_Personal_Administrativo === idUsuario
      );

      return {
        ...datosBase,
        HorarioPersonal: personalInfo
          ? {
              Horario_Laboral_Entrada: personalInfo.Horario_Laboral_Entrada,
              Horario_Laboral_Salida: personalInfo.Horario_Laboral_Salida,
            }
          : false,
      } as PersonalAdministrativoAsistenciaResponse;

    default:
      // Por defecto, solo devolver los datos base
      return datosBase;
  }
}

// Función para eliminar cookies y redirigir a login
function redirectToLogin(
  logoutType: LogoutTypes,
  errorDetails?: ErrorDetailsForLogout
) {
  let location = `/login?LOGOUT_TYPE=${logoutType}`;

  if (errorDetails) {
    location += `&ERROR_DETAILS=${formatErrorDetailsForUrl(errorDetails)}`;
  }

  return new Response(null, {
    status: 302,
    headers: {
      ...borrarCookiesDeSesion(),
      Location: location,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";

import { LogoutTypes, ErrorDetailsForLogout } from "@/interfaces/LogoutTypes";
import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import { NOMBRE_ARCHIVO_CON_DATOS_ASISTENCIA_DIARIOS } from "@/constants/NOMBRE_ARCHIVOS_EN_BLOBS";
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
import { verifyAuthToken } from "@/lib/utils/backend/auth/functions/jwtComprobations";
import { redirectToLogin } from "@/lib/utils/backend/auth/functions/redirectToLogin";

export async function GET(req: NextRequest) {
  try {
    const { decodedToken, rol, error } = await verifyAuthToken(req);

    if (error) return error;

    // Una vez autenticado correctamente, obtener los datos del blob
    // Modificar el bloque try-catch para la obtención de datos del blob

    const response = await fetch(
      `${process.env
        .RDP04_THIS_INSTANCE_VERCEL_BLOB_BASE_URL!}/${NOMBRE_ARCHIVO_CON_DATOS_ASISTENCIA_DIARIOS}`
    );

    //Se procede a buscar el respaldo de datos de asistencia de hoy de Google Drive

    // const response = await fetch(
    //   "https://drive.google.com/uc?export=download&id=11PncPCPnndt15GbWwSuxHzgESRpmYFlk"
    // );

    if (!response.ok) {
      throw new Error(
        `Error en la respuesta del servidor: ${response.status} ${response.statusText}`
      );
    }

    const datosCompletos = (await response.json()) as DatosAsistenciaHoyIE20935;

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
  // } catch (error) {
  //   console.error("Error general:", error);
  //   return redirectToLogin(LogoutTypes.ERROR_SISTEMA, {
  //     mensaje: "Error inesperado del sistema",
  //     origen: "api/datos-asistencia-hoy",
  //   });
  // }
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
        ListaDeAuxiliares: datos.ListaDeAuxiliares,
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

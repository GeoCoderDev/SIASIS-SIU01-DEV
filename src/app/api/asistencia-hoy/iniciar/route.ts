import { NextRequest, NextResponse } from "next/server";
import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import { Meses } from "@/interfaces/shared/Meses";
import { LogoutTypes, ErrorDetailsForLogout } from "@/interfaces/LogoutTypes";
import { verifyAuthToken } from "@/lib/utils/backend/auth/functions/jwtComprobations";
import { redirectToLogin } from "@/lib/utils/backend/auth/functions/redirectToLogin";
import { redisClient } from "../../../../../config/Redis/RedisClient";
import { obtenerFechaActualPeru } from "../../_functions/obtenerFechaActualPeru";
import {
  NOMBRE_BANDERA_INICIO_TOMA_ASISTENCIA_PERSONAL,
  NOMBRE_BANDERA_INICIO_TOMA_ASISTENCIA_PRIMARIA,
  NOMBRE_BANDERA_INICIO_TOMA_ASISTENCIA_SECUNDARIA,
} from "@/constants/NOMBRES_BANDERAS_INICIO_TOMA_ASISTENCIAS";
import {
  EstadoTomaAsistenciaResponseBody,
  IniciarTomaAsistenciaRequestBody,
  TipoAsistencia,
} from "@/interfaces/shared/AsistenciaRequests";

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación - solo roles con permisos para iniciar asistencia
    const { error } = await verifyAuthToken(req, [
      RolesSistema.Directivo,
      RolesSistema.Auxiliar,
      RolesSistema.ProfesorPrimaria,
    ]);

    if (error) return error;

    // Obtener datos del body
    const body = (await req.json()) as IniciarTomaAsistenciaRequestBody;

    // Validar que se proporcionó TipoAsistencia
    if (!body.TipoAsistencia) {
      return NextResponse.json(
        {
          success: false,
          message: "Se requiere el parámetro TipoAsistencia en el body",
        },
        { status: 400 }
      );
    }

    // Validar que TipoAsistencia sea válido
    if (!Object.values(TipoAsistencia).includes(body.TipoAsistencia)) {
      return NextResponse.json(
        {
          success: false,
          message: "El TipoAsistencia proporcionado no es válido",
        },
        { status: 400 }
      );
    }

    // Obtener la fecha actual en Perú
    const fechaActualPeru = obtenerFechaActualPeru();
    const [anio, mes, dia] = fechaActualPeru.split("-").map(Number);

    // Determinar la key correcta en Redis según el TipoAsistencia
    let redisKey;
    let tipoAsistencia;

    switch (body.TipoAsistencia) {
      case TipoAsistencia.ParaPersonal:
        redisKey = NOMBRE_BANDERA_INICIO_TOMA_ASISTENCIA_PERSONAL;
        tipoAsistencia = TipoAsistencia.ParaPersonal;
        break;
      case TipoAsistencia.ParaEstudiantesPrimaria:
        redisKey = NOMBRE_BANDERA_INICIO_TOMA_ASISTENCIA_PRIMARIA;
        tipoAsistencia = TipoAsistencia.ParaEstudiantesPrimaria;
        break;
      case TipoAsistencia.ParaEstudiantesSecundaria:
        redisKey = NOMBRE_BANDERA_INICIO_TOMA_ASISTENCIA_SECUNDARIA;
        tipoAsistencia = TipoAsistencia.ParaEstudiantesSecundaria;
        break;
      default:
        return NextResponse.json(
          { success: false, message: "Tipo de asistencia no reconocido" },
          { status: 400 }
        );
    }

    // Almacenar en Redis que la asistencia ha sido iniciada
    // Establecemos el valor "true" y una duración de 24 horas (86400 segundos)
    const valorGuardado = await redisClient.set(redisKey, "true", {
      ex: 86400,
    });

    if (valorGuardado !== "OK") {
      return NextResponse.json(
        {
          success: false,
          message: "Error al almacenar el estado de asistencia en Redis",
        },
        { status: 500 }
      );
    }

    // Construir la respuesta
    const respuesta: EstadoTomaAsistenciaResponseBody = {
      TipoAsistencia: tipoAsistencia,
      Dia: dia,
      Mes: mes as Meses,
      Anio: anio,
      AsistenciaIniciada: true,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Estado de asistencia iniciado correctamente",
        data: respuesta,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al iniciar estado de toma de asistencia:", error);

    // Determinar el tipo de error
    let logoutType: LogoutTypes | null = null;
    const errorDetails: ErrorDetailsForLogout = {
      mensaje: "Error al iniciar estado de toma de asistencia",
      origen: "api/estado-toma-asistencia",
      timestamp: Date.now(),
      siasisComponent: "RDP04",
    };

    if (error instanceof Error) {
      // Si es un error de redis crítico o problemas de conexión severos
      if (
        error.message.includes("Redis connection lost") ||
        error.message.includes("Redis connection failed") ||
        error.message.includes("Redis connection timed out")
      ) {
        logoutType = LogoutTypes.ERROR_SISTEMA;
        errorDetails.mensaje = "Error de conexión con el sistema de datos";
      }
      // Si es un error de parseo de JSON
      else if (
        error.message.includes("JSON") ||
        error.message.includes("parse") ||
        error.message.includes("Unexpected token")
      ) {
        logoutType = LogoutTypes.ERROR_DATOS_CORRUPTOS;
        errorDetails.mensaje = "Error al procesar los datos de la solicitud";
      }

      errorDetails.mensaje += `: ${error.message}`;
    }

    // Si identificamos un error crítico, redirigir al login
    if (logoutType) {
      return redirectToLogin(logoutType, errorDetails);
    }

    // Para otros errores, simplemente devolver una respuesta JSON de error
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

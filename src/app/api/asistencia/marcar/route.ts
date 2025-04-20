import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import { verifyAuthToken } from "@/lib/utils/backend/auth/functions/jwtComprobations";
import { ActoresSistema } from "@/interfaces/shared/ActoresSistema";
import { ModoRegistro } from "@/interfaces/shared/ModoRegistroPersonal";
import { NextRequest, NextResponse } from "next/server";
import { alterarUTCaZonaPeruana } from "@/lib/helpers/alteradores/alterarUTCaZonaPeruana";
import { redisClient } from "../../../../../config/Redis/RedisClient";
import { RegistrarAsistenciaIndividualRequestBody } from "@/interfaces/shared/apis/api01/asistencia/types";

export async function POST(req: NextRequest) {
  try {
    // Usar tu middleware de autenticación
    const { error } = await verifyAuthToken(req, [
      RolesSistema.Directivo,
      RolesSistema.Auxiliar,
      RolesSistema.ProfesorPrimaria,
    ]);

    if (error) return error;
    // Procesar el cuerpo de la solicitud
    const body = (await req.json()) as RegistrarAsistenciaIndividualRequestBody;
    const {
      Actor,
      DNI,
      FechaHoraEsperadaISO,
      ModoRegistro: ModoRegistroActor,
      AulaDelEstudiante,
      NivelDelEstudiante,
    } = body;

    if (!DNI || !Actor || !ModoRegistro || !FechaHoraEsperadaISO) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Faltan datos obligatorios (DNI, Actor, ModoRegistro, FechaHoraEsperada)",
        },
        { status: 400 }
      );
    }

    // Validar el rol y modo
    if (!Object.values(ActoresSistema).includes(Actor as ActoresSistema)) {
      return NextResponse.json(
        { success: false, message: "Rol no válido" },
        { status: 400 }
      );
    }

    if (!Object.values(ModoRegistro).includes(ModoRegistroActor)) {
      return NextResponse.json(
        { success: false, message: "Modo no válido (debe ser E o S)" },
        { status: 400 }
      );
    }

    // No permitir marcar asistencia a Responsables
    if (Actor === ActoresSistema.Responsable) {
      return NextResponse.json(
        {
          success: false,
          message: "No se controla asistencia para Responsables",
        },
        { status: 400 }
      );
    }

    // Para estudiantes, solo se permite marcar entrada
    if (Actor === ActoresSistema.Estudiante && ModoRegistro === ModoRegistro) {
      return NextResponse.json(
        {
          success: false,
          message: "Para estudiantes solo se registra entrada",
        },
        { status: 400 }
      );
    }

    // Calcular el timestamp actual y desfase
    const timestampActual = Date.now();

    // Convertir la hora programada (del aula) a timestamp
    // horaDebeEstarAula viene en formato ISO o timestamp
    const horaAula = new Date(
      alterarUTCaZonaPeruana(FechaHoraEsperadaISO)
    ).getTime();

    // Calcular desfase en segundos (negativo si está tarde, positivo si está temprano)
    const desfaseSegundos = Math.floor((horaAula - timestampActual) / 1000);

    // Crear la clave y el registro
    const clave = `${obtenerFechaActualPeru()}:${ModoRegistroActor}:${Actor}:${DNI}:${
      NivelDelEstudiante ? ":" + NivelDelEstudiante : ""
    }${AulaDelEstudiante ? ":" + AulaDelEstudiante : ""}`;

    const valor = [
      ModoRegistroActor,
      timestampActual.toString(),
      desfaseSegundos.toString(),
    ];

    // Guardar en Redis
    await redisClient.set(clave, valor);

    // Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: `Asistencia registrada correctamente: ${ModoRegistroActor}:${DNI} - ${ModoRegistroActor}`,
        datos: {
          clave,
          ModoRegistroActor,
          timestamp: timestampActual,
          desfase: {
            segundos: desfaseSegundos,
            estado:
              desfaseSegundos > 0
                ? "Temprano"
                : desfaseSegundos < 0
                ? "Tarde"
                : "En hora",
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Función para obtener la fecha actual en Perú en formato YYYY-MM-DD
function obtenerFechaActualPeru(): string {
  // Perú está en UTC-5
  const fechaPerú = new Date();
  fechaPerú.setHours(fechaPerú.getHours() - 5); // Ajustar a hora de Perú (UTC-5)
  return fechaPerú.toISOString().split("T")[0];
}

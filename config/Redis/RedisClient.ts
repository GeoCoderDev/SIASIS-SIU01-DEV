import { TipoAsistencia } from "@/interfaces/shared/AsistenciaRequests";
import { Redis } from "@upstash/redis";

// Cliente Redis usando variables de entorno existentes
export const redisClient = (tipoAsistencia: TipoAsistencia) => {
  switch (tipoAsistencia) {
    case TipoAsistencia.ParaPersonal:
      return new Redis({
        url: process.env.RDP05_INS1_REDIS_BD_BASE_URL_API!,
        token: process.env.RDP05_INS1_REDIS_BD_TOKEN_FOR_API!,
      });

    case TipoAsistencia.ParaEstudiantesSecundaria:
      return new Redis({
        url: process.env.RDP05_INS2_REDIS_BD_BASE_URL_API!,
        token: process.env.RDP05_INS2_REDIS_BD_TOKEN_FOR_API!,
      });

    case TipoAsistencia.ParaEstudiantesPrimaria:
      return new Redis({
        url: process.env.RDP05_INS3_REDIS_BD_BASE_URL_API!,
        token: process.env.RDP05_INS3_REDIS_BD_TOKEN_FOR_API!,
      });

    default:
      throw new Error("Tipo de asistencia no soportado");
  }
};

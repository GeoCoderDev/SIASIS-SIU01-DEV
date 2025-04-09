"use client";

import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import { obtenerAsistenciaStoragePorRol } from "@/lib/utils/local/db/models/DatosAsistenciaHoy";
import { DatosAsistenciaHoyDirectivoIDB } from "@/lib/utils/local/db/models/DatosAsistenciaHoy/DatosAsistenciaHoyDirectivoIDB";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/global/store";
import Loader from "@/components/shared/loaders/Loader";
import { HandlerDirectivoAsistenciaResponse } from "@/lib/utils/local/db/models/DatosAsistenciaHoy/handlers/HandlerDirectivoAsistenciaResponse";
import { tiempoRestanteHasta } from "@/global/state/others/fechaHoraActualReal";
import { alterarUTCaZonaPeruana } from "@/lib/helpers/alteradores/alterarUTCaZonaPeruana";
import formatearISOaFormato12Horas from "@/lib/helpers/formatters/formatearISOaFormato12Horas";
import { HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS } from "@/constants/HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS";

const TomarAsistenciaPersonal = () => {
  const fechaHoraActual = useSelector(
    (state: RootState) => state.others.fechaHoraActualReal
  );

  const [datosAsistenciaHoyDirectivo, setDatosAsistenciaHoyDirectivo] =
    useState<null | HandlerDirectivoAsistenciaResponse>();

  // Obtener datos de asistencia al cargar el componente
  useEffect(() => {
    const dataAsistence = async () => {
      const datosAsistenciaHoyDirectivoIDB = obtenerAsistenciaStoragePorRol(
        RolesSistema.Directivo
      ) as DatosAsistenciaHoyDirectivoIDB;

      const data = await datosAsistenciaHoyDirectivoIDB.obtenerDatos();
      console.log(data);
      if (data) {
        const handlerDirectivoAsistenciaResponse =
          new HandlerDirectivoAsistenciaResponse(data);

        setDatosAsistenciaHoyDirectivo(handlerDirectivoAsistenciaResponse);
      }
    };

    dataAsistence();
  }, []);

  // Procesamos las fechas y horas solo si tenemos los datos disponibles
  const fechaHoraInicioAsistencia = datosAsistenciaHoyDirectivo
    ? alterarUTCaZonaPeruana(
        String(
          datosAsistenciaHoyDirectivo.getHorarioTomaAsistenciaGeneral().Inicio
        )
      )
    : null;

  const fechaHoraCierreAsistencia = datosAsistenciaHoyDirectivo
    ? new Date(
        alterarUTCaZonaPeruana(
          String(
            datosAsistenciaHoyDirectivo.getHorarioTomaAsistenciaGeneral().Fin
          )
        )
      )
    : null;

  const tiempoRestante = useSelector((state: RootState) =>
    datosAsistenciaHoyDirectivo && fechaHoraInicioAsistencia
      ? tiempoRestanteHasta(
          { fechaHoraActualReal: state.others.fechaHoraActualReal },
          fechaHoraInicioAsistencia
        )
      : null
  );

  // Función para renderizar el contenido según el estado actual
  // Función para renderizar el contenido según el estado actual
  const renderContenidoAsistencia = () => {
    // Si no tenemos datos aún, mostrar loader
    if (!datosAsistenciaHoyDirectivo || !tiempoRestante || !fechaHoraActual) {
      return (
        <div>
          <Loader className="w-[1.5rem] bg-black p-[0.3rem]" />
        </div>
      );
    }

    // Si no es día escolar (es fin de semana)
    if (fechaHoraActual.utilidades?.esDiaEscolar === false) {
      return (
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <span className="font-bold">No hay clases hoy</span>
          <p>Hoy es fin de semana, no se requiere tomar asistencia.</p>
        </div>
      );
    }

    // Verificamos si ya pasó la hora de actualización de datos (5:05 AM)
    const haySincronizacionDatos =
      Number(fechaHoraActual.utilidades?.hora) >=
        HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS &&
      Number(fechaHoraActual.utilidades?.minutos) > 5;

    console.log(fechaHoraActual);

    console.log(haySincronizacionDatos);
    // Verificamos si la fecha de datos de asistencia es de un día anterior
    const fechaActual = new Date(fechaHoraActual.fechaHora!);
    const esNuevoDia =
      datosAsistenciaHoyDirectivo.getFechaLocalPeru().getDay() <
      fechaActual.getDay();

    // Caso: Estamos en un nuevo día pero aún no es hora de sincronizar datos
    if (esNuevoDia && !haySincronizacionDatos) {
      return (
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <span className="font-bold">Preparando datos para Hoy</span>
          <p>
            Se podra empezar a tomar la asistencia mas adelante
            {/* {fechaHoraActual.formateada?.fechaCorta} estará disponible a partir
            de las {HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS}:05 AM. */}
          </p>
        </div>
      );
    }

    // Si aún no es hora de sincronizar datos (caso original)
    if (!haySincronizacionDatos) {
      return (
        <div className="p-4 bg-yellow-50 rounded-lg text-center">
          <span className="font-bold">Sistema en preparación</span>
          <p>
            Todavía no se puede tomar la asistencia. El sistema estará
            disponible a partir de las {fechaHoraInicioAsistencia} de hoy{" "}
            {fechaHoraActual.formateada?.fechaCorta}
          </p>
        </div>
      );
    }

    // Si ya pasó la hora de cierre de asistencia
    const horaActual = fechaHoraActual.utilidades!.hora;
    const minutosActual = fechaHoraActual.utilidades!.minutos;
    const horaCierre = fechaHoraCierreAsistencia!.getHours();
    const minutosCierre = fechaHoraCierreAsistencia!.getMinutes();

    const asistenciaCerrada =
      horaActual > horaCierre ||
      (horaActual === horaCierre && minutosActual >= minutosCierre);

    if (asistenciaCerrada) {
      return (
        <div className="p-4 bg-red-50 rounded-lg text-center">
          <span className="font-bold">Registro de asistencia cerrado</span>
          <p>
            El período de registro finalizó a las{" "}
            {formatearISOaFormato12Horas(
              String(
                datosAsistenciaHoyDirectivo.getHorarioTomaAsistenciaGeneral()
                  .Fin!
              )
            )}
          </p>
        </div>
      );
    }

    // Si estamos en horario válido para tomar asistencia
    return (
      <div className="p-4 bg-green-50 rounded-lg text-center">
        <span className="font-bold">
          Tiempo restante para registrar asistencia:
        </span>
        <p className="text-lg font-bold text-green-700">
          {tiempoRestante.formateado}
        </p>
      </div>
    );
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-[2rem] font-semibold">
        Control de Asistencia Diaria
      </h1>
      {renderContenidoAsistencia()}
    </div>
  );
};

export default TomarAsistenciaPersonal;

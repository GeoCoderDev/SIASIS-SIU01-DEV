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

const TomarAsistenciaPersonal = () => {
  // const esSabadoDomingo

  const fechaHoraActual = useSelector(
    (state: RootState) => state.others.fechaHoraActualReal
  );

  console.log(fechaHoraActual);
  const [datosAsistenciaHoyDirectivo, setDatosAsistenciaHoyDirectivo] =
    useState<null | HandlerDirectivoAsistenciaResponse>();

  const tiempoRestante = useSelector((state: RootState) =>
    datosAsistenciaHoyDirectivo
      ? tiempoRestanteHasta(
          { fechaHoraActualReal: state.others.fechaHoraActualReal },
          alterarUTCaZonaPeruana(
            String(
              datosAsistenciaHoyDirectivo.getHorarioTomaAsistenciaGeneral()
                .Inicio
            )
          )
        )
      : null
  );

  // Lógica para la cuenta regresiva (esto sería implementado con la lógica real)
  useEffect(() => {
    const dataAsistence = async () => {
      const datosAsistenciaHoyDirectivoIDB = obtenerAsistenciaStoragePorRol(
        RolesSistema.Directivo
      ) as DatosAsistenciaHoyDirectivoIDB;

      const data = await datosAsistenciaHoyDirectivoIDB.obtenerDatos();

      const handlerDirectivoAsistenciaResponse =
        new HandlerDirectivoAsistenciaResponse(data!);

      setDatosAsistenciaHoyDirectivo(handlerDirectivoAsistenciaResponse);
    };

    dataAsistence();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-[2rem] font-semibold">
        Control de Asistencia Diaria
      </h1>
      {datosAsistenciaHoyDirectivo && tiempoRestante ? (
        <>
          {fechaHoraActual.utilidades?.esDiaEscolar === false ? (
            <>
              <div>ES SABADO O DOMINGO</div>
            </>
          ) : (
            <>
              {Number(fechaHoraActual.utilidades?.hora) >= 5 &&
              Number(fechaHoraActual.utilidades?.minutos) > 5 ? (
                <>
                  {/* EN CASO NO SI SEA DIA ESCOLAR Y HAYAN PASADO LAS 5:05AM (YA SE ACTUALIZO EL BLOB) */}
                  <div>{tiempoRestante.formateado}</div>
                </>
              ) : (
                <>
                  {/* EN CASO TODAVIA NO SE HAYA SINCRONIZADO PERO YA SEA DIA ESCOLAR(ANTES DE LAS 5:05AM) */}
                  <div>Todavia no se puede tomar la asistencia</div>
                </>
              )}
            </>
          )}
        </>
      ) : (
        <div>
          <Loader className="w-[1.5rem] bg-white p-[0.3rem]" />
        </div>
      )}
    </div>
  );
};

export default TomarAsistenciaPersonal;

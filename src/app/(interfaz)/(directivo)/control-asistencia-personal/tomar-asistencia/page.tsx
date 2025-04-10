"use client";

import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import { obtenerAsistenciaStoragePorRol } from "@/lib/utils/local/db/models/DatosAsistenciaHoy";
import { DatosAsistenciaHoyDirectivoIDB } from "@/lib/utils/local/db/models/DatosAsistenciaHoy/DatosAsistenciaHoyDirectivoIDB";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/global/store";
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

  const fetchDataAsistence = async () => {
    //Quitamos los posibles datos de asistencia anterior
    setDatosAsistenciaHoyDirectivo(null);

    // Solicitamos los nuevos datos
    const datosAsistenciaHoyDirectivoIDB = obtenerAsistenciaStoragePorRol(
      RolesSistema.Directivo
    ) as DatosAsistenciaHoyDirectivoIDB;

    const data = await datosAsistenciaHoyDirectivoIDB.obtenerDatos();

    if (data) {
      const handlerDirectivoAsistenciaResponse =
        new HandlerDirectivoAsistenciaResponse(data);

      setDatosAsistenciaHoyDirectivo(handlerDirectivoAsistenciaResponse);
    }
  };

  // Verificamos si ya pasó la hora de actualización de datos (5:05 AM)
  const haySincronizacionDatos =
    Number(fechaHoraActual.utilidades?.hora) >=
    HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS;

  useEffect(() => {
    fetchDataAsistence();
  }, []);

  // Obtener datos de asistencia al cargar el componente
  useEffect(() => {
    if (!datosAsistenciaHoyDirectivo) return;

    if (
      haySincronizacionDatos &&
      fechaHoraActual.utilidades?.diaMes !==
        new Date(datosAsistenciaHoyDirectivo.getFechaLocalPeru()).getDate()
    ) {
      console.log("Se procede a hacer fetch!!");
      fetchDataAsistence();
    }
  }, [haySincronizacionDatos, datosAsistenciaHoyDirectivo]);

  // Procesamos las fechas y horas solo si tenemos los datos disponibles
  const fechaHoraInicioAsistencia = datosAsistenciaHoyDirectivo
    ? new Date(
        alterarUTCaZonaPeruana(
          String(
            datosAsistenciaHoyDirectivo.getHorarioTomaAsistenciaGeneral().Inicio
          )
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

  const tiempoRestanteParaInicioAsistencia = useSelector((state: RootState) =>
    datosAsistenciaHoyDirectivo && fechaHoraInicioAsistencia
      ? tiempoRestanteHasta(
          { fechaHoraActualReal: state.others.fechaHoraActualReal },
          fechaHoraInicioAsistencia
        )
      : null
  );

  const tiempoRestanteParaCierreAsistencia = useSelector((state: RootState) =>
    datosAsistenciaHoyDirectivo && fechaHoraCierreAsistencia
      ? tiempoRestanteHasta(
          { fechaHoraActualReal: state.others.fechaHoraActualReal },
          fechaHoraCierreAsistencia
        )
      : null
  );

  // Función para formatear la fecha actual
  const formatearFechaActual = () => {
    if (!fechaHoraActual?.fechaHora) return "Cargando fecha...";

    const fecha = new Date(fechaHoraActual.fechaHora);
    const diasSemana = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    return `${diasSemana[fecha.getDay()]} ${fecha.getDate()}/${
      meses[fecha.getMonth()]
    }/${fecha.getFullYear()}`;
  };

  // Determinar el estado actual del sistema de asistencia
  const determinarEstadoSistema = () => {
    // Si no tenemos datos aún
    if (
      !datosAsistenciaHoyDirectivo ||
      !tiempoRestanteParaInicioAsistencia ||
      !tiempoRestanteParaCierreAsistencia ||
      !fechaHoraActual
    ) {
      return {
        estado: "cargando",
        mensaje: "Cargando información...",
        tiempoRestante: null,
        botonActivo: false,
        colorEstado: "bg-gray-100",
        mostrarContadorPersonal: false,
      };
    }

    // Si no es día escolar (es fin de semana)
    if (fechaHoraActual.utilidades?.esDiaEscolar === false) {
      return {
        estado: "no_disponible",
        mensaje: "No hay clases hoy",
        descripcion: "Hoy es fin de semana, no se requiere tomar asistencia.",
        tiempoRestante: null,
        botonActivo: false,
        colorEstado: "bg-gray-100",
        mostrarContadorPersonal: false,
      };
    }

    // Verificamos si la fecha de datos de asistencia es de un día anterior
    const fechaActual = new Date(fechaHoraActual.fechaHora!);
    const esNuevoDia =
      datosAsistenciaHoyDirectivo.getFechaLocalPeru().getDay() <
      fechaActual.getDay();

    // Caso: Estamos en un nuevo día pero aún no es hora de sincronizar datos
    if (esNuevoDia && !haySincronizacionDatos) {
      return {
        estado: "preparando",
        mensaje: "Preparando datos para hoy",
        descripcion: "Se actualizará la información para el nuevo día escolar.",
        tiempoRestante: null,
        botonActivo: false,
        colorEstado: "bg-blue-50",
        mostrarContadorPersonal: false,
      };
    }

    if (
      tiempoRestanteParaInicioAsistencia &&
      !tiempoRestanteParaInicioAsistencia.yaVencido
    ) {
      return {
        estado: "pendiente",
        mensaje: "En espera para iniciar",
        descripcion: `El registro de asistencia estará disponible en ${tiempoRestanteParaInicioAsistencia.formateado}.`,
        tiempoRestante: tiempoRestanteParaInicioAsistencia.formateado,
        botonActivo: false,
        colorEstado: "bg-orange-50",
        progreso: Math.floor(
          (tiempoRestanteParaInicioAsistencia.total / 3600000) * 100
        ), // Suponiendo 1 hora de espera total
        mostrarContadorPersonal: true,
        etiquetaPersonal: "Personal Programado",
      };
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
      return {
        estado: "cerrado",
        mensaje: "Registro de asistencia cerrado",
        descripcion: `El período de registro finalizó a las ${formatearISOaFormato12Horas(
          String(
            datosAsistenciaHoyDirectivo.getHorarioTomaAsistenciaGeneral().Fin!
          )
        )}`,
        tiempoRestante: null,
        botonActivo: false,
        colorEstado: "bg-red-50",
        mostrarContadorPersonal: true,
        etiquetaPersonal: "Registros Completados",
      };
    }

    // Si estamos en horario válido para tomar asistencia
    return {
      estado: "disponible",
      mensaje: "Sistema listo para registro",
      descripcion: `El registro estará disponible hasta las ${formatearISOaFormato12Horas(
        String(
          datosAsistenciaHoyDirectivo.getHorarioTomaAsistenciaGeneral().Fin!
        )
      )}`,
      tiempoRestante: tiempoRestanteParaCierreAsistencia.formateado,
      botonActivo: true,
      colorEstado: "bg-green-50",
      mostrarContadorPersonal: true,
      etiquetaPersonal: "Personal Pendiente",
    };
  };

  // Obtener el estado actual
  const estadoSistema = determinarEstadoSistema();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
          Registro de Asistencia Diaria
        </h1>
        <p className="text-gray-600">
          Gestione la asistencia del personal de forma eficiente
        </p>
      </div>

      {/* Cards de información */}
      <div
        className={`grid grid-cols-1 ${
          estadoSistema.mostrarContadorPersonal
            ? "sm:grid-cols-3"
            : "sm:grid-cols-2"
        } gap-4 mb-6`}
      >
        {/* Fecha actual */}
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm flex items-center">
          <div className="bg-white p-2 rounded-full mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs text-blue-700 font-medium">Fecha Actual</p>
            <p className="text-lg font-bold text-gray-800">
              {formatearFechaActual()}
            </p>
          </div>
        </div>

        {/* Estado */}
        <div
          className={`${estadoSistema.colorEstado} rounded-lg p-4 shadow-sm flex items-center`}
        >
          <div className="bg-white p-2 rounded-full mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs text-blue-700 font-medium">Estado</p>
            <p className="text-lg font-bold text-gray-800">
              {estadoSistema.estado === "cargando" ? (
                <span className="flex items-center">
                  Cargando...
                  <svg
                    className="animate-spin ml-2 h-4 w-4 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : estadoSistema.estado === "disponible" ? (
                "Disponible Ahora"
              ) : estadoSistema.estado === "pendiente" ? (
                "En espera"
              ) : estadoSistema.estado === "cerrado" ? (
                "Cerrado"
              ) : estadoSistema.estado === "preparando" ? (
                "Sincronizando"
              ) : (
                "No disponible"
              )}
            </p>
          </div>
        </div>

        {/* Personal contador condicional */}
        {estadoSistema.mostrarContadorPersonal && (
          <div className="bg-purple-50 rounded-lg p-4 shadow-sm flex items-center">
            <div className="bg-white p-2 rounded-full mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-purple-700 font-medium">
                {estadoSistema.etiquetaPersonal}
              </p>
              <p className="text-lg font-bold text-gray-800">
                {datosAsistenciaHoyDirectivo
                  ? `${
                      datosAsistenciaHoyDirectivo.getTotalPersonalAdministrativo() +
                      datosAsistenciaHoyDirectivo.getTotalProfesoresPrimaria() +
                      datosAsistenciaHoyDirectivo.getTotalProfesoresSecundaria()
                    } miembros`
                  : "Cargando..."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Panel principal */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Encabezado de estado */}
        <div
          className={`p-4 ${
            estadoSistema.estado === "disponible"
              ? "bg-green-500 text-white"
              : estadoSistema.estado === "pendiente"
              ? "bg-orange-500 text-white"
              : estadoSistema.estado === "cerrado"
              ? "bg-red-500 text-white"
              : estadoSistema.estado === "preparando"
              ? "bg-blue-500 text-white"
              : "bg-gray-500 text-white"
          }`}
        >
          <h2 className="text-xl font-bold">
            {estadoSistema.estado === "disponible"
              ? "Iniciar Proceso de Registro"
              : estadoSistema.estado === "pendiente"
              ? "Proceso de Registro Pendiente"
              : estadoSistema.estado === "cerrado"
              ? "Registro de Asistencia Finalizado"
              : estadoSistema.estado === "preparando"
              ? "Actualizando Sistema"
              : estadoSistema.estado === "no_disponible"
              ? "No Hay Registro Programado"
              : "Cargando Sistema"}
          </h2>
          <p className="opacity-90">
            {estadoSistema.estado === "disponible"
              ? "El sistema está listo para iniciar el registro de asistencia"
              : estadoSistema.estado === "pendiente"
              ? "El registro de asistencia aún no está disponible"
              : estadoSistema.estado === "cerrado"
              ? "El período de registro ya ha concluido por hoy"
              : estadoSistema.estado === "preparando"
              ? "Sincronizando datos para el nuevo día escolar"
              : estadoSistema.estado === "no_disponible"
              ? "No hay actividades escolares programadas hoy"
              : "Cargando la información necesaria..."}
          </p>
        </div>

        {/* Contenido principal */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-gray-500 font-medium mb-4">
              Información importante
            </h3>

            {/* Mensaje según estado */}
            <div
              className={`inline-flex items-start p-4 rounded-lg ${
                estadoSistema.estado === "disponible"
                  ? "bg-blue-50 text-blue-800 border-l-4 border-blue-500"
                  : estadoSistema.estado === "pendiente"
                  ? "bg-orange-50 text-orange-800 border-l-4 border-orange-500"
                  : estadoSistema.estado === "cerrado"
                  ? "bg-red-50 text-red-800 border-l-4 border-red-500"
                  : estadoSistema.estado === "preparando"
                  ? "bg-indigo-50 text-indigo-800 border-l-4 border-indigo-500"
                  : "bg-gray-50 text-gray-800 border-l-4 border-gray-500"
              }`}
            >
              <svg
                className={`w-6 h-6 mr-2 ${
                  estadoSistema.estado === "disponible"
                    ? "text-blue-500"
                    : estadoSistema.estado === "pendiente"
                    ? "text-orange-500"
                    : estadoSistema.estado === "cerrado"
                    ? "text-red-500"
                    : estadoSistema.estado === "preparando"
                    ? "text-indigo-500"
                    : "text-gray-500"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div className="text-left">
                {estadoSistema.estado === "disponible" && (
                  <span>
                    El registro estará disponible hasta las{" "}
                    <strong>
                      {formatearISOaFormato12Horas(
                        String(
                          datosAsistenciaHoyDirectivo!.getHorarioTomaAsistenciaGeneral()
                            .Fin!
                        )
                      )}
                    </strong>
                    .
                    <br />
                    Asegúrese de completar el proceso para todo el personal
                    antes de esa hora.
                  </span>
                )}
                {estadoSistema.estado === "pendiente" && (
                  <span>
                    El registro de asistencia estará disponible en{" "}
                    <strong>{estadoSistema.tiempoRestante}</strong>.
                    <br />
                    Se habilitará automáticamente cuando llegue el momento.
                  </span>
                )}
                {estadoSistema.estado === "cerrado" && (
                  <span>
                    El período de registro finalizó a las{" "}
                    <strong>
                      {formatearISOaFormato12Horas(
                        String(
                          datosAsistenciaHoyDirectivo!.getHorarioTomaAsistenciaGeneral()
                            .Fin!
                        )
                      )}
                    </strong>
                    .
                    <br />
                    Los reportes de asistencia ya están disponibles en la
                    sección correspondiente.
                  </span>
                )}
                {estadoSistema.estado === "preparando" && (
                  <span>
                    El sistema está sincronizando datos para el nuevo día
                    escolar.
                    <br />
                    Este proceso es automático y estará disponible a partir de
                    las {HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS}:05 AM.
                  </span>
                )}
                {estadoSistema.estado === "cargando" && (
                  <span>
                    Inicializando el sistema de registro de asistencia...
                  </span>
                )}
                {estadoSistema.estado === "no_disponible" && (
                  <span>
                    No hay actividades escolares programadas para hoy.
                    <br />
                    El sistema de registro se activará automáticamente el
                    próximo día escolar.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Barra de progreso para estado pendiente */}
          {estadoSistema.estado === "pendiente" &&
            estadoSistema.progreso !== undefined && (
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-orange-400 h-2.5 rounded-full"
                    style={{ width: `${100 - estadoSistema.progreso}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Tiempo transcurrido</span>
                  <span>Tiempo restante: {estadoSistema.tiempoRestante}</span>
                </div>
              </div>
            )}

          {/* Botón de acción */}
          <div className="text-center">
            <button
              className={`flex items-center justify-center mx-auto px-8 py-3 rounded-lg font-medium transition-all ${
                estadoSistema.botonActivo
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!estadoSistema.botonActivo}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              Iniciar Registro de Asistencia
            </button>
            <p className="text-sm text-gray-500 mt-3">
              {estadoSistema.botonActivo
                ? "Al hacer clic en el botón, comenzará el proceso de registro para todo el personal"
                : estadoSistema.estado === "pendiente"
                ? "El botón se habilitará cuando sea la hora programada para el registro"
                : estadoSistema.estado === "cerrado"
                ? "El período de registro ha concluido por hoy"
                : estadoSistema.estado === "preparando"
                ? "Espere a que el sistema complete la sincronización"
                : "El botón se activará cuando el sistema esté listo"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TomarAsistenciaPersonal;

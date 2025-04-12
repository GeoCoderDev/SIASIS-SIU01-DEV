"use client";
import PersonalIcon from "@/components/icons/thinStyle/PersonalIcon";
import ThinRelojIcon from "@/components/icons/thinStyle/ThinRelojIcon";
import VerificationIcon from "@/components/icons/thinStyle/VerificationIcon";
import useEstadoSistemaAsistencia from "@/hooks/useEstadoSistemaAsistencia";
import { DiasSemana, diasSemanaTextos } from "@/interfaces/shared/DiasSemana";
import { Meses, mesesTextos } from "@/interfaces/shared/Meses";

const TomarAsistenciaPersonal = () => {
  // Usar el hook personalizado para gestionar el estado del sistema
  const { estadoSistema, iniciarRegistro } = useEstadoSistemaAsistencia({
    onInicioRegistro: () => {
      console.log("Iniciando proceso de registro de asistencia");
      // Aquí se podría navegar a otra página o abrir un modal
    },
  });

  // Función para formatear la fecha actual
  const formatearFechaActual = () => {
    const fechaHoraActual = new Date();

    return `${
      diasSemanaTextos[fechaHoraActual.getDay() as DiasSemana]
    } ${fechaHoraActual.getDate()} de ${
      mesesTextos[fechaHoraActual.getMonth() as Meses]
    } de ${fechaHoraActual.getFullYear()}`;
  };

  // Función para renderizar el icono de personal adecuado según el estado
  const renderIconoPersonal = () => {
    if (
      !estadoSistema.iconoPersonal ||
      estadoSistema.iconoPersonal === "usuarios"
    ) {
      return <PersonalIcon className="h-5 w-5 text-purple-500" />;
    } else if (estadoSistema.iconoPersonal === "verificacion") {
      return <VerificationIcon className="h-5 w-5 text-purple-500" />;
    } else if (estadoSistema.iconoPersonal === "reloj") {
      return <ThinRelojIcon className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto scale-80 transform origin-top">
      <div className="text-center mb-3">
        <h1 className="text-xl sm-only:text-2xl md-only:text-2xl lg-only:text-2xl font-semibold text-gray-800">
          Registro de Asistencia Diaria
        </h1>
        <p className="text-sm text-gray-600">
          Gestione la asistencia del personal de forma eficiente
        </p>
      </div>

      {/* Cards de información */}
      <div
        className={`grid grid-cols-1 sm-only:grid-cols-2 md-only:grid-cols-3 lg-only:grid-cols-3 gap-3`}
      >
        {/* Fecha actual */}
        <div className="bg-blue-50 rounded-lg p-3 flex items-center">
          <div className="bg-white p-2 rounded-full mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-500"
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
            <p className="text-sm font-bold text-gray-800">
              {formatearFechaActual()}
            </p>
          </div>
        </div>

        {/* Estado */}
        <div
          className={`${estadoSistema.colorEstado} rounded-lg p-3 flex items-center`}
        >
          <div className="bg-white p-2 rounded-full mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-500"
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
            <p className="text-sm font-bold text-gray-800">
              {estadoSistema.estado === "sincronizando" ||
              estadoSistema.estado === "cargando" ? (
                <span className="flex items-center">
                  {estadoSistema.estado === "sincronizando"
                    ? "Sincronizando..."
                    : "Cargando..."}
                  <svg
                    className="animate-spin ml-2 h-3 w-3 text-blue-500"
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
                "Disponible ahora"
              ) : estadoSistema.estado === "pendiente" ? (
                "Esperando apertura"
              ) : estadoSistema.estado === "cerrado" ? (
                "Período cerrado"
              ) : estadoSistema.estado === "preparando" ? (
                "Actualización pendiente"
              ) : estadoSistema.estado === "en_proceso" ? (
                "Registro en curso"
              ) : (
                "No disponible hoy"
              )}
            </p>
          </div>
        </div>

        {/* Personal contador condicional */}
        {estadoSistema.mostrarContadorPersonal && (
          <div className="bg-purple-50 rounded-lg p-3 flex items-center">
            <div className="bg-white p-2 rounded-full mr-2">
              {renderIconoPersonal()}
            </div>
            <div>
              <p className="text-xs text-purple-700 font-medium">
                {estadoSistema.etiquetaPersonal}
              </p>
              <p className="text-sm font-bold text-gray-800">
                {/* 
                  Este valor ahora viene directamente calculado 
                  en el slice y en el hook
                */}
                25 miembros
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Panel principal */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-3">
        {/* Encabezado de estado */}
        <div
          className={`p-3 ${
            estadoSistema.estado === "disponible"
              ? "bg-green-500 text-white"
              : estadoSistema.estado === "pendiente"
              ? "bg-orange-500 text-white"
              : estadoSistema.estado === "cerrado"
              ? "bg-red-500 text-white"
              : estadoSistema.estado === "preparando" ||
                estadoSistema.estado === "sincronizando"
              ? "bg-blue-500 text-white"
              : estadoSistema.estado === "en_proceso"
              ? "bg-emerald-500 text-white"
              : "bg-gray-500 text-white"
          }`}
        >
          <h2 className="text-base font-bold">{estadoSistema.mensaje}</h2>
          <p className="opacity-90 text-sm">{estadoSistema.descripcion}</p>
        </div>

        {/* Contenido principal */}
        <div className="p-4">
          <div className="text-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium mb-3">
              Información importante
            </h3>

            {/* Mensaje según estado */}
            <div
              className={`inline-flex items-start p-3 rounded-lg text-sm ${
                estadoSistema.estado === "disponible"
                  ? "bg-blue-50 text-blue-800 border-l-4 border-blue-500"
                  : estadoSistema.estado === "pendiente"
                  ? "bg-orange-50 text-orange-800 border-l-4 border-orange-500"
                  : estadoSistema.estado === "cerrado"
                  ? "bg-red-50 text-red-800 border-l-4 border-red-500"
                  : estadoSistema.estado === "preparando" ||
                    estadoSistema.estado === "sincronizando"
                  ? "bg-indigo-50 text-indigo-800 border-l-4 border-indigo-500"
                  : estadoSistema.estado === "en_proceso"
                  ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500"
                  : "bg-gray-50 text-gray-800 border-l-4 border-gray-500"
              }`}
            >
              <svg
                className={`w-5 h-5 mr-2 flex-shrink-0 ${
                  estadoSistema.estado === "disponible"
                    ? "text-blue-500"
                    : estadoSistema.estado === "pendiente"
                    ? "text-orange-500"
                    : estadoSistema.estado === "cerrado"
                    ? "text-red-500"
                    : estadoSistema.estado === "preparando" ||
                      estadoSistema.estado === "sincronizando"
                    ? "text-indigo-500"
                    : estadoSistema.estado === "en_proceso"
                    ? "text-emerald-500"
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
              <div className="text-left text-xs">
                {estadoSistema.estado === "disponible" && (
                  <span>
                    El período de registro permanecerá abierto hasta las
                    finalizadas. Una vez iniciado el proceso, debe completar la
                    asistencia de todo el personal.
                  </span>
                )}
                {estadoSistema.estado === "pendiente" && (
                  <span>
                    El sistema abrirá el registro de asistencia en{" "}
                    <strong>{estadoSistema.tiempoRestante}</strong>. Toda la
                    información está preparada para el momento de apertura.
                  </span>
                )}
                {estadoSistema.estado === "cerrado" && (
                  <span>
                    El registro de asistencia ha concluido. Para consultar los
                    registros completos, visite la sección de reportes.
                  </span>
                )}
                {estadoSistema.estado === "preparando" && (
                  <span>
                    El sistema actualiza automáticamente los datos a las 5:00
                    AM. Esta actualización prepara toda la información
                    necesaria.
                  </span>
                )}
                {estadoSistema.estado === "sincronizando" && (
                  <span>
                    El sistema está actualizando la información para hoy. Este
                    proceso normalmente toma unos segundos.
                  </span>
                )}
                {estadoSistema.estado === "en_proceso" && (
                  <span>
                    Se está procesando la asistencia. Complete el proceso para
                    todos los miembros del personal. Tiempo restante:{" "}
                    <strong>{estadoSistema.tiempoDisponible}</strong>.
                  </span>
                )}
                {estadoSistema.estado === "cargando" && (
                  <span>
                    Inicializando componentes del sistema de registro. La
                    aplicación estará lista en unos momentos.
                  </span>
                )}
                {estadoSistema.estado === "no_disponible" && (
                  <span>
                    No se programan actividades para días no laborables. El
                    sistema reanudará automáticamente el próximo día hábil.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Barra de progreso para estado pendiente */}
          {estadoSistema.estado === "pendiente" &&
            estadoSistema.progreso !== undefined && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-400 h-2 rounded-full"
                    style={{ width: `${100 - estadoSistema.progreso}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Tiempo transcurrido</span>
                  <span>Apertura en: {estadoSistema.tiempoRestante}</span>
                </div>
              </div>
            )}

          {/* Barra de progreso para estado en proceso */}
          {estadoSistema.estado === "en_proceso" &&
            estadoSistema.tiempoDisponible && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-400 h-2 rounded-full"
                    style={{
                      width: `${estadoSistema.progreso || 50}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Tiempo transcurrido</span>
                  <span>Restante: {estadoSistema.tiempoDisponible}</span>
                </div>
              </div>
            )}

          {/* Botón de acción */}
          <div className="text-center">
            <button
              onClick={iniciarRegistro}
              className={`flex items-center justify-center mx-auto px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                estadoSistema.botonActivo
                  ? "bg-green-500 text-white hover:bg-green-600 active:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!estadoSistema.botonActivo}
            >
              {estadoSistema.estado === "en_proceso" ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Procesando registros...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
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
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              {estadoSistema.estado === "disponible"
                ? "Al hacer clic, comenzará el proceso de registro para todo el personal"
                : estadoSistema.estado === "pendiente"
                ? "El botón se habilitará cuando sea la hora programada para el registro"
                : estadoSistema.estado === "cerrado"
                ? "El período de registro ha concluido para el día de hoy"
                : estadoSistema.estado === "preparando"
                ? "Espere a que se completen las actualizaciones programadas"
                : estadoSistema.estado === "sincronizando"
                ? "El sistema está sincronizando la información, espere un momento"
                : estadoSistema.estado === "en_proceso"
                ? "El proceso está en curso, no cierre esta ventana"
                : "El sistema no está disponible en este momento"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TomarAsistenciaPersonal;

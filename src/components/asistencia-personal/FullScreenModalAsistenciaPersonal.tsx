"use client";

import ProfesorPrimariaIcon from "../icons/ProfesorPrimariaIcon";
import AuxiliarIcon from "../icons/AuxiliarIcon";
import ProfesorOTutorIcon from "../icons/ProfesorOTutorIcon";
import PersonasGenericasIcon from "../icons/PersonasGenericasIcon";
import { useEffect } from "react";
import { Speaker } from "@/lib/utils/voice/Speaker";
import userStorage from "@/lib/utils/local/db/models/UserStorage";
import { RolBoton } from "../shared/buttons/RolButton";
import { FechaHoraActualRealState } from "@/global/state/others/fechaHoraActualReal";
import { determinarPeriodoDia } from "@/lib/calc/determinarPeriodoDia";
import { saludosDia } from "@/Assets/voice/others/SaludosDIa";

const FullScreenModalAsistenciaPersonal = ({
  closeFullScreenModal,
  fechaHoraActual,
}: {
  closeFullScreenModal: () => void;
  fechaHoraActual: FechaHoraActualRealState;
}) => {
  const saludo = saludosDia[determinarPeriodoDia(fechaHoraActual.fechaHora!)];

  useEffect(() => {
    const saludoDeBienvenida = async () => {
      const nombreCompletoCortoDirectivoLogeado =
        await userStorage.getNombreCompletoCorto();

      const speaker = Speaker.getInstance();

      speaker.start(
        `${saludo}, Directivo ${nombreCompletoCortoDirectivoLogeado}, usted ha iniciado la toma de Asistencia de Personal`
      );
    };

    saludoDeBienvenida();
  }, []);

  return (
    <div className="animate__animated animate__fadeInUp [animation-duration:800ms] fixed top-0 left-0 min-w-[100vw] min-h-[100dvh] bg-white z-[1001] flex flex-col">
      {/* Cabecera */}
      <header className="bg-blue-50 border-b border-blue-100 p-3 md:p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-blue-600 font-medium text-xs sm:text-sm">
                Hoy Jueves 12/03/2025
              </span>
              <span className="text-blue-900 font-bold text-lg sm:text-xl text-center sm:text-left">
                Registro de Asistencia de Personal
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-end">
              <span className="text-red-600 font-medium text-xs sm:text-sm">
                Tiempo restante:
              </span>
              <span className="text-red-700 font-bold text-sm sm:text-base">
                8h 30min 34s
              </span>
            </div>
            <button
              onClick={closeFullScreenModal}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-2 sm:py-2 sm:px-4 rounded-lg transition-colors shadow-sm text-sm sm:text-base"
            >
              Cerrar Toma de Asistencia
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 p-4 sm:p-6 bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="w-full max-w-4xl flex flex-col items-center">
          {/* Título principal */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 text-center mb-6 sm:mb-10 mt-2 sm:mt-4">
            {saludo}, haz clic en tu Rol
          </h1>

          {/* Tarjetas de roles en grid de 2x2 */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-lg mx-auto">
            <RolBoton
              className="justify-self-center"
              onClick={() => {}}
              icon={
                <ProfesorPrimariaIcon className="max-lg:short-height:h-[7.5vh] max-sm:w-[1.65rem] sm-only:w-[2.1rem] md-only:w-[2rem] lg-only:w-[2.4rem] xl-only:w-[3rem] text-negro" />
              }
              rol="Profesor (Primaria)"
            />
            <RolBoton
              className="justify-self-center"
              onClick={() => {}}
              icon={
                <AuxiliarIcon className="max-lg:short-height:h-[7.75vh] max-sm:w-[1.55rem] sm-only:w-[1.7rem] md-only:w-[1.75rem] lg-only:w-[2rem] xl-only:w-[2.5rem] text-negro" />
              }
              rol="Auxiliar"
            />
            <RolBoton
              className="justify-self-center"
              onClick={() => {}}
              icon={
                <ProfesorOTutorIcon className="max-lg:short-height:h-[7vh] max-sm:w-[1.5rem] sm-only:w-[1.7rem] md-only:w-[2rem] lg-only:w-[2rem] xl-only:w-[2.5rem] text-negro" />
              }
              rol="Profesor/Tutor (Secundaria)"
            />
            <RolBoton
              className="justify-self-center"
              onClick={() => {}}
              icon={
                <PersonasGenericasIcon className="max-lg:short-height:h-[8vh] max-sm:w-[1.65rem] sm-only:w-[1.9rem] md-only:w-[2rem] lg-only:w-[2.5rem] xl-only:w-[3rem] text-negro" />
              }
              rol="Otro"
            />
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="bg-gray-50 border-t border-gray-100 p-3 md:p-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-xs sm:text-sm">
          <p>Sistema de Asistencia I.E. 20935 Asunción 8 - Imperial, Cañete</p>
        </div>
      </footer>
    </div>
  );
};

export default FullScreenModalAsistenciaPersonal;

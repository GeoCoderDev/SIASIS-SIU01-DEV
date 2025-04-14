"use client";

import ProfesorPrimariaIcon from "../icons/ProfesorPrimariaIcon";
import AuxiliarIcon from "../icons/AuxiliarIcon";
import ProfesorOTutorIcon from "../icons/ProfesorOTutorIcon";
import PersonasGenericasIcon from "../icons/PersonasGenericasIcon";
import { useEffect } from "react";
import { Speaker } from "@/lib/utils/voice/Speaker";
import userStorage from "@/lib/utils/local/db/models/UserStorage";
import { RolBoton } from "../shared/buttons/RolButton";

const FullScreenModalAsistenciaPersonal = ({
  closeFullScreenModal,
}: {
  closeFullScreenModal: () => void;
}) => {
  useEffect(() => {
    const saludoDeBienvenida = async () => {
      const nombreCompletoCortoDirectivoLogeado =
        await userStorage.getNombreCompletoCorto();

      const speaker = Speaker.getInstance();

      speaker.start(
        `Buenos Días, Directivo ${nombreCompletoCortoDirectivoLogeado}, usted ha iniciado la toma de Asistencia de Personal`
      );
    };

    saludoDeBienvenida();
  }, []);

  return (
    <div className="animate__animated animate__fadeInUp [animation-duration:800ms] fixed top-0 left-0 min-w-[100vw] min-h-[100dvh] bg-white z-[1001] flex flex-col">
      {/* Cabecera */}
      <header className="bg-blue-50 border-b border-blue-100 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-blue-600 font-medium text-sm">
                Hoy Jueves 12/03/2025
              </span>
              <span className="text-blue-900 font-bold text-xl">
                Registro de Asistencia de Personal
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-red-600 font-medium text-sm">
                Tiempo restante:
              </span>
              <span className="text-red-700 font-bold">8h 30min 34s</span>
            </div>
            <button
              onClick={closeFullScreenModal}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
            >
              Cerrar Toma de Asistencia
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 p-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Título principal */}
          <h1 className="text-3xl font-bold text-green-600 text-center mb-10 mt-4">
            Buenos Días, haz clic en tu Rol
          </h1>

          {/* Tarjetas de roles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <RolBoton
              path="/login/profesor-primaria"
              icon={
                <ProfesorPrimariaIcon className="max-lg:short-height:h-[7.5vh] max-sm:w-[1.65rem] sm-only:w-[2.1rem] md-only:w-[2rem] lg-only:w-[2.4rem] xl-only:w-[3rem] text-negro" />
              }
              rol="Profesor (Primaria)"
            />
            <RolBoton
              path="/login/auxiliar"
              icon={
                <AuxiliarIcon className="max-lg:short-height:h-[7.75vh] max-sm:w-[1.55rem] sm-only:w-[1.7rem] md-only:w-[1.75rem] lg-only:w-[2rem] xl-only:w-[2.5rem] text-negro" />
              }
              rol="Auxiliar"
            />
            <RolBoton
              path="/login/profesor-tutor-secundaria"
              icon={
                <ProfesorOTutorIcon className="max-lg:short-height:h-[7vh] max-sm:w-[1.5rem] sm-only:w-[1.7rem] md-only:w-[2rem] lg-only:w-[2rem] xl-only:w-[2.5rem] text-negro" />
              }
              rol="Profesor/Tutor (Secundaria)"
            />
            <RolBoton
              path="/login/personal-administrativo"
              icon={
                <PersonasGenericasIcon className="max-lg:short-height:h-[8vh] max-sm:w-[1.65rem] sm-only:w-[1.9rem] md-only:w-[2rem] lg-only:w-[2.5rem] xl-only:w-[3rem] text-negro" />
              }
              rol="Otro"
            />
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="bg-gray-50 border-t border-gray-100 p-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>Sistema de Asistencia I.E. 20935 Asunción 8 - Imperial, Cañete</p>
        </div>
      </footer>
    </div>
  );
};

export default FullScreenModalAsistenciaPersonal;

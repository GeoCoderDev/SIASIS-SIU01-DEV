import ModalContainer from "../../ModalContainer";
import BotonConIcono from "@/components/buttons/BotonConIcono";
import CalendarioIcon from "@/components/icons/CalendarioIcon";
import GuardarIcon from "@/components/icons/GuardarIcon";

const ModificarVacacionesInterescolares = ({
  eliminateModal,
}: {
  eliminateModal: () => void;
}) => {
  return (
    <ModalContainer
      className="w-[95vw] sm:w-[500px] max-w-[80vw] sm:max-w-[500px] mx-auto"
      eliminateModal={eliminateModal}
    >
      <div className="pt-2 px-4">
        {/* Título */}
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">
          Período de Vacaciones
        </h2>

        {/* Fechas */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
          {/* Inicio */}
          <div className="flex-1 w-full">
            <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3 pl-[6px]">
              Inicio de Vacaciones
            </label>
            <div className="flex flex-wrap xs-only:justify-center sm:justify-start items-center gap-3">
              <BotonConIcono
                texto="21/07/2025"
                IconTSX={<CalendarioIcon className="w-4 ml-2" />}
                className="bg-red-500 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-600 transition-colors xs-only:w-[150px]"
              />
              <p className="text-gray-600 font-medium">(Lunes)</p>
            </div>
          </div>

          {/* Fin */}
          <div className="flex-1 w-full">
            <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3 pl-[6px]">
              Fin de Vacaciones
            </label>
            <div className="flex flex-wrap xs-only:justify-center sm:justify-start items-center gap-3">
              <BotonConIcono
                texto="01/08/2025"
                IconTSX={<CalendarioIcon className="w-4 ml-2" />}
                className="bg-red-600 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-600 transition-colors xs-only:w-[150px]"
              />
              <p className="text-gray-600 font-medium">(Viernes)</p>
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-center">
          <BotonConIcono
            texto="Guardar Cambios"
            IconTSX={<GuardarIcon className="w-4 ml-2" />}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg transition-colors xs-only:w-[250px]"
          />
        </div>
        <br />
      </div>
    </ModalContainer>
  );
};

export default ModificarVacacionesInterescolares;
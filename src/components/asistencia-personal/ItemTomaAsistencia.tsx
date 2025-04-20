import { Genero } from "@/interfaces/shared/Genero";
import FotoPerfilClientSide from "../utils/photos/FotoPerfilClientSide";

export interface PersonalParaTomarAsistencia {
  DNI: string;
  GoogleDriveFotoId: string | null;
  Nombres: string;
  Apellidos: string;
  Genero: Genero;
  Cargo?: string;
}

const ItemTomaAsistencia = ({
  handlePersonalSeleccionado,
  personal,
  disabled = false,
}: {
  personal: PersonalParaTomarAsistencia;
  handlePersonalSeleccionado: (personal: PersonalParaTomarAsistencia) => void;
  disabled?: boolean;
}) => {
  return (
    <div
      key={personal.DNI}
      onClick={() => !disabled && handlePersonalSeleccionado(personal)}
      className={`flex items-center bg-white border border-gray-200 rounded-lg shadow-sm ${
        !disabled
          ? "hover:bg-blue-50 active:bg-blue-100 cursor-pointer"
          : "opacity-50 cursor-not-allowed"
      } transition-colors p-1.5 sm-only:p-2 md-only:p-2 lg-only:p-2 xl-only:p-2 w-full sm-only:w-[48%] md-only:w-[48%] lg-only:w-[32%] xl-only:w-[32%]`}
    >
      <div className="w-8 h-8 sm-only:w-9 sm-only:h-9 md-only:w-9 md-only:h-9 lg-only:w-10 lg-only:h-10 xl-only:w-10 xl-only:h-10 rounded-full overflow-hidden mr-2 flex-shrink-0 border-2 border-blue-200">
        <FotoPerfilClientSide
          Google_Drive_Foto_ID={personal.GoogleDriveFotoId}
        />
      </div>
      <div
        title={`${personal.Nombres} ${personal.Apellidos}`}
        className="text-xs sm-only:text-sm md-only:text-sm lg-only:text-sm xl-only:text-sm font-medium truncate leading-tight"
      >
        {personal.Nombres} {personal.Apellidos}
        {personal.Cargo && (
          <div className="italic text-xs text-gris-oscuro">
            {personal.Cargo}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemTomaAsistencia;

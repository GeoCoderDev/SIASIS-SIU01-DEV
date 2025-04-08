import { AuxiliarSinContraseña } from "@/interfaces/shared/apis/shared/others/types";
import FotoPerfilClientSide from "../../../../../components/utils/photos/FotoPerfilClientSide";
import TelefonoIcon from "../../../../../components/icons/TelefonoIcon";
import BotonConIcono from "../../../../../components/buttons/BotonConIcono";
import VerEditarIcon from "@/components/icons/VerEditarIcon";
import { Link } from "next-view-transitions";

const AuxiliarCard = ({
  Auxiliar: {
    Apellidos,
    Celular,
    Correo_Electronico,
    DNI_Auxiliar,
    Estado,
    Nombres,
    Nombre_Usuario,
    Google_Drive_Foto_ID,
  },
}: {
  Auxiliar: AuxiliarSinContraseña;
}) => {
  return (
    <div className="w-[311px] h-[367.65px] flex flex-col items-center gap-2 p-6 rounded-[10px] shadow-[0_0_3px_6px_#00000050]">
      <FotoPerfilClientSide
        className="w-[75px] h-[75px] rounded-full object-cover"
        Google_Drive_Foto_ID={Google_Drive_Foto_ID}
      />
      <span className="text-[20px] font-semibold text-center">
        {Nombres} {Apellidos}
      </span>
      <span className="text-[20px] text-azul-principal font-medium">
        {DNI_Auxiliar}
      </span>
      <span className="italic font-semibold text-[16px]">
        {Nombre_Usuario}
      </span>
      <span className="flex items-center gap-1 text-[16px]">
        <TelefonoIcon className="w-[1.2rem] text-verde-principal" /> {Celular}
      </span>
      <span className="text-[13.29px] font-semibold text-center">
        {Correo_Electronico}
      </span>
      <span
        className={`text-[16px] font-semibold ${
          Estado ? "text-verde-principal" : "text-rojo-oscuro"
        }`}
      >
        Estado: {Estado ? "Activo" : "Inactivo"}
      </span>

      <Link href={`/auxiliares/${DNI_Auxiliar}`} className="mt-auto">
        <BotonConIcono
          className="bg-amarillo-ediciones flex gap-2 items-center px-3 py-2"
          texto="Ver/Editar"
          IconTSX={<VerEditarIcon className="w-5" />}
        />
      </Link>
    </div>
  );
};

export default AuxiliarCard;
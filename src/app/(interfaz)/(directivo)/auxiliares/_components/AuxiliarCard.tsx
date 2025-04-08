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
    <div className="w-[311px] h-[385px] rounded-[15px] shadow-[0_0_6px_3px_rgba(0,0,0,0.15)] flex flex-col items-center justify-start p-4 gap-2 text-center bg-white">
      <FotoPerfilClientSide
        className="w-[85px] h-[85px] rounded-full object-cover"
        Google_Drive_Foto_ID={Google_Drive_Foto_ID}
      />

      <span className="text-[20px] font-semibold text-negro">
        {Nombres} {Apellidos}
      </span>

      <span className="text-[20px] font-medium text-azul-principal">
        {DNI_Auxiliar}
      </span>

      <span className="italic text-[16px] text-negro font-bold">{Nombre_Usuario}</span>

      <div className="flex items-center justify-center gap-1 text-[16px] text-negro">
        <TelefonoIcon className="w-[1.2rem] text-verde-principal" />
        <span>{Celular}</span>
      </div>

      <span className="text-[13.29px] text-negro font-bold">{Correo_Electronico}</span>

      <span className="text-[16px] font-semibold text-verde-principal">
        Estado: {Estado ? "Activo" : "Inactivo"}
      </span>

      <Link href={`/auxiliares/${DNI_Auxiliar}`} className="mt-2">
        <BotonConIcono
          className="bg-amarillo-ediciones text-negro font-medium flex gap-2 items-center px-3 py-2 rounded"
          texto="Ver/Editar"
          IconTSX={<VerEditarIcon className="w-4 h-4" />}
        />
      </Link>
    </div>
  );
};

export default AuxiliarCard;
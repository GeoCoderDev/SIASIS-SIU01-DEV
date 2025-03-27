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
    <div className="flex flex-col gap-2.5 p-6 rounded-[10px] shadow-[0_0_3px_6px_#00000050]">
      <FotoPerfilClientSide
        className="w-[2rem]"
        Google_Drive_Foto_ID={Google_Drive_Foto_ID}
      />
      <span>
        {Nombres} {Apellidos}
      </span>
      <span className="text-azul-principal font-semibold"> {DNI_Auxiliar}</span>
      <span className="font-semibold">{Nombre_Usuario}</span>
      <span>
        <TelefonoIcon className="w-[1.2rem] text-verde-principal" /> {Celular}
      </span>
      <span className="font-semibold">{Correo_Electronico}</span>
      <span
        className={`font-semibold ${
          Estado ? "text-verde-principal" : "text-rojo-oscuro"
        }`}
      >
        Estado: {Estado ? "Activo" : "Inactivo"}
      </span>

      <Link href={`/auxiliares/${DNI_Auxiliar}`}>
        <BotonConIcono
          className="bg-amarillo-ediciones flex gap-2 items-center px-3 py-2 "
          texto="Ver/Editar"
          IconTSX={<VerEditarIcon className="w-5" />}
        />
      </Link>
    </div>
  );
};

export default AuxiliarCard;

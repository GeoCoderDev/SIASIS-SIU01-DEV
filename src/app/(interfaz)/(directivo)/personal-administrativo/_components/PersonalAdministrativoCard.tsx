import FotoPerfilClientSide from "../../../../../components/utils/photos/FotoPerfilClientSide";
import TelefonoIcon from "../../../../../components/icons/TelefonoIcon";
import BotonConIcono from "../../../../../components/buttons/BotonConIcono";
import VerEditarIcon from "@/components/icons/VerEditarIcon";
import { Link } from "next-view-transitions";
import { PersonalAdministrativoSinContraseña } from "@/interfaces/shared/apis/shared/others/types";
import RelojIcon from "@/components/icons/RelojIcon";
import formatearISOaFormato12Horas from "@/lib/helpers/formatters/formatearISOaFormato12Horas";

const PersonalAdministrativoCard = ({
  PersonalAdministrativo: {
    Apellidos,
    Celular,
    Cargo,
    Horario_Laboral_Entrada,
    Horario_Laboral_Salida,
    DNI_Personal_Administrativo,
    Estado,
    Nombres,
    Nombre_Usuario,
    Google_Drive_Foto_ID,
  },
}: {
  PersonalAdministrativo: PersonalAdministrativoSinContraseña;
}) => {
  return (
    <div    className="
    flex flex-col justify-between items-center text-center gap-2.5
    p-4 sm:p-5
    rounded-[10px]
    shadow-[0_0_3px_6px_#00000050]
    w-full xs:w-[16rem] sm:w-[17rem] md:w-[18rem] lg:w-[18rem]
    min-h-[28rem]
    mx-auto">
      <FotoPerfilClientSide
        className="w-[5rem] sm:w-[5rem] md:w-[5rem]"
        Google_Drive_Foto_ID={Google_Drive_Foto_ID}
      />
      <span className="font-semibold">
        {Nombres} {Apellidos}
      </span>
      <span className="text-azul-principal font-semibold">
        {" "}
        {DNI_Personal_Administrativo}
      </span>
      <span className="font-semibold">{Nombre_Usuario}</span>
      <span className="flex items-center gap-x-2">
      <TelefonoIcon className="w-[1.2rem] text-verde-principal" />
      {Celular}
      </span>
      <span className="flex items-center gap-x-2">
        <RelojIcon className="w-[1.2rem] text-negro" />
        {formatearISOaFormato12Horas(String(Horario_Laboral_Entrada))} - {formatearISOaFormato12Horas(String(Horario_Laboral_Salida))}
      </span>

      <span
        className={`font-semibold ${
          Estado ? "text-verde-principal" : "text-rojo-oscuro"
        }`}
      >
        Estado: {Estado ? "Activo" : "Inactivo"}
      </span>
      <span className="font-semibold">{Cargo}</span>

      <Link
        href={`/personal-administrativo/${DNI_Personal_Administrativo}`}
        as={`/personal-administrativo/${DNI_Personal_Administrativo}`}
      >
        <BotonConIcono
          className="bg-amarillo-ediciones flex gap-2 items-center px-3 py-2 w-full sm:w-fit justify-center"
          texto="Ver/Editar"
          IconTSX={<VerEditarIcon className="w-5" />}
        />
      </Link>
    </div>
  );
};

export default PersonalAdministrativoCard;

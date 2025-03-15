import FotoPerfilSideServer from "../../utils/photos/FotoPerfilClientSide";

const MyUserCard = ({
  Google_Drive_Foto_ID,
  Apellidos,
  Nombre_Usuario,
  Nombres,
}: {
  Google_Drive_Foto_ID: string | null;
  Nombre_Usuario?: string;
  Nombres?: string;
  Apellidos?: string;
}) => {
  return (
    <div className="[box-shadow:0_0_12px_4px_#00000050] h-min p-[2rem] rounded-[1rem] flex flex-col max-w-[85%] items-center justify-center gap-6">
      <FotoPerfilSideServer
        className="  w-[10rem]  aspect-auto"
        Google_Drive_Foto_ID={Google_Drive_Foto_ID}
      />

      <div className="flex flex-col gap-2">
        <div className="w-full text-[1.2rem] text-center">
          {Nombres} {Apellidos}
        </div>
        <div className=" font-semibold text-center w-full">
          {Nombre_Usuario}
        </div>
      </div>
    </div>
  );
};

export default MyUserCard;

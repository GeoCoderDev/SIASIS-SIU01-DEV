import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import Header from "./Header";
import { RolesSistema } from "@/interfaces/RolesSistema";

const PlantillaResponsable = ({
  children,
  Nombres,
  Apellidos,
  Google_Drive_Foto_ID,
  Genero,
}: {
  children: React.ReactNode;
  Nombres: RequestCookie;
  Apellidos: RequestCookie;
  Genero: RequestCookie;
  Google_Drive_Foto_ID: RequestCookie | undefined;
}) => {
  return (
    <>
      <Header
        Nombres={Nombres}
        Apellidos={Apellidos}
        Genero={Genero}
        Rol={RolesSistema.Responsable}
        Google_Drive_Foto_ID={Google_Drive_Foto_ID}
      />
      {children}
    </>
  );
};

export default PlantillaResponsable;

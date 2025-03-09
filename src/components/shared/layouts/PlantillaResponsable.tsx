import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import Header from "./Header";
import { RolesSistema } from "@/interfaces/RolesSistema";

const PlantillaResponsable = ({
  children,
  Nombres,
  Apellidos,
}: {
  children: React.ReactNode;
  Nombres: RequestCookie;
  Apellidos: RequestCookie;
}) => {
  return (
    <>
      <Header
        Nombres={Nombres}
        Apellidos={Apellidos}
        Rol={RolesSistema.Responsable}
      />
      {children}
    </>
  );
};

export default PlantillaResponsable;

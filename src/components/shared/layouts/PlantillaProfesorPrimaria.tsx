import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import React from "react";
import Header from "./Header";
import { RolesSistema } from "@/interfaces/RolesSistema";

const PlantillaProfesorPrimaria = ({
  children,
  Nombres,
  Apellidos,
  Google_Drive_Foto_ID,
}: {
  children: React.ReactNode;
  Nombres: RequestCookie;
  Apellidos: RequestCookie;
  Google_Drive_Foto_ID: RequestCookie | undefined;
}) => {
  return (
    <>
      <Header
        Nombres={Nombres}
        Apellidos={Apellidos}
        Rol={RolesSistema.ProfesorPrimaria}
        Google_Drive_Foto_ID={Google_Drive_Foto_ID}
      />
      {children}
    </>
  );
};
export default PlantillaProfesorPrimaria;

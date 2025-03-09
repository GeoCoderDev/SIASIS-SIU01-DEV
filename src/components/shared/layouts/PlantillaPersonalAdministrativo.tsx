import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import React from "react";
import Header from "./Header";

const PlantillaPersonalAdministrativo = ({
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
      <Header Nombres={Nombres} Apellidos={Apellidos} />
      {children}
    </>
  );
};

export default PlantillaPersonalAdministrativo;

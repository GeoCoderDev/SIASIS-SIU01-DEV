import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import React from "react";
import Header from "./Header";
import { RolesSistema } from "@/interfaces/RolesSistema";

const PlantillaTutor = ({
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
        Rol={RolesSistema.Tutor}
      />
      {children}
    </>
  );
};

export default PlantillaTutor;

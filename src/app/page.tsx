import { RolesTextos } from "@/Assets/RolesTextos";
import { Genero } from "@/interfaces/shared/Genero";
import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import { cookies } from "next/headers";
import React from "react";

const imagenesBienvenida: Record<RolesSistema, string> = {
  D: "/images/png/imagen.png",
  PP: "",
  A: "",
  PS: "",
  T: "",
  R: "",
  PA: "",
};

const Home = async () => {
  //Si se ha llegado hasta este componente es porque esas cookies estaran presentes
  const cookieStore = await cookies();
  const rol = cookieStore.get("Rol")!.value as RolesSistema;
  const nombres = cookieStore.get("Nombres")!.value;
  const apellidos = cookieStore.get("Apellidos")!.value;
  const genero = cookieStore.get("Genero")!.value as Genero;

  return (
    <div>
      <h1>¡Hola!</h1>
      <h3 className="text-gris-oscuro font-semibold">
        {genero === Genero.Masculino ? "Bienvenido" : "Bienvenida"} de nuevo,{" "}
        {RolesTextos[rol].desktop[genero]}
      </h3>

      <h3>
        {nombres.split(" ").shift()} {apellidos.split(" ").shift()}
      </h3>

      <img
        src={imagenesBienvenida[rol]}
        alt="Imagen de Bienvenida al Sistema"
      />
    </div>
  );
};

export default Home;

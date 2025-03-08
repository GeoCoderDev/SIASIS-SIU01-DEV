import { RolesSistema } from "@/interfaces/RolesSistema";
// import { cookies } from "next/headers";
import PlantillaDirectivo from "./PlantillaDirectivo";
import PlantillaProfesorPrimaria from "./PlantillaProfesorPrimaria";
import PlantillaProfesorSecundaria from "./PlantillaProfesorSecundaria";
import PlantillaAuxiliar from "./PlantillaAuxiliar";
import PlantillaTutor from "./PlantillaTutor";
import PlantillaResponsable from "./PlantillaResponsable";
import PlantillaPersonalAdministrativo from "./PlantillaPersonalAdministrativo";

const PlantillaSegunRol = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // const cookieStore = await cookies();
  // const rol = cookieStore?.get("rol")?.value as RolesSistema;
  const rol = "PPA" as RolesSistema;

  if (rol === RolesSistema.Directivo) {
    return <PlantillaDirectivo>{children}</PlantillaDirectivo>;
  }
  if (rol === RolesSistema.ProfesorPrimaria) {
    return <PlantillaProfesorPrimaria>{children}</PlantillaProfesorPrimaria>;
  }
  if (rol === RolesSistema.Auxiliar) {
    return <PlantillaAuxiliar>{children}</PlantillaAuxiliar>;
  }
  if (rol === RolesSistema.ProfesorSecundaria) {
    return (
      <PlantillaProfesorSecundaria>{children}</PlantillaProfesorSecundaria>
    );
  }
  if (rol === RolesSistema.Tutor) {
    return <PlantillaTutor>{children}</PlantillaTutor>;
  }
  if (rol === RolesSistema.Responsable) {
    return <PlantillaResponsable>{children}</PlantillaResponsable>;
  }

  if(rol === RolesSistema.PersonalAdministrativo){

    return <PlantillaPersonalAdministrativo>{children}</PlantillaPersonalAdministrativo>;
  }

  return <></>

};

export default PlantillaSegunRol;

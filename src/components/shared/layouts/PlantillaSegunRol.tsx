import PlantillaDirectivo from "./PlantillaDirectivo";
import PlantillaProfesorPrimaria from "./PlantillaProfesorPrimaria";
import PlantillaProfesorSecundaria from "./PlantillaProfesorSecundaria";
import PlantillaAuxiliar from "./PlantillaAuxiliar";
import PlantillaTutor from "./PlantillaTutor";
import PlantillaResponsable from "./PlantillaResponsable";
import PlantillaPersonalAdministrativo from "./PlantillaPersonalAdministrativo";
import Header from "./Header";
import { cookies } from "next/headers";
import { RolesSistema } from "@/interfaces/RolesSistema";

const PlantillaSegunRol = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cookieStore = await cookies();
  const rol = cookieStore.get("Rol");
  const nombres = cookieStore.get("Nombres");
  const apellidos = cookieStore.get("Apellidos");

  if (!rol) {
    // Redirección del lado del servidor si no hay rol y no estamos ya en /login
    return <>{children}</>;
  }

  switch (rol.value) {
    case RolesSistema.Directivo:
      return (
        <PlantillaDirectivo>
          {" "}
          <Header Nombres={nombres} Apellidos={apellidos} />
          {children}
        </PlantillaDirectivo>
      );
    case RolesSistema.ProfesorPrimaria:
      return (
        <PlantillaProfesorPrimaria>
          {" "}
          <Header Nombres={nombres} Apellidos={apellidos} />
          {children}
        </PlantillaProfesorPrimaria>
      );

    case RolesSistema.Auxiliar:
      return (
        <PlantillaAuxiliar>
          {" "}
          <Header Nombres={nombres} Apellidos={apellidos} />
          {children}
        </PlantillaAuxiliar>
      );
    case RolesSistema.ProfesorSecundaria:
      return (
        <PlantillaProfesorSecundaria>
          {" "}
          <Header Nombres={nombres} Apellidos={apellidos} />
          {children}
        </PlantillaProfesorSecundaria>
      );
    case RolesSistema.Tutor:
      return (
        <PlantillaTutor>
          {" "}
          <Header Nombres={nombres} Apellidos={apellidos} />
          {children}
        </PlantillaTutor>
      );
    case RolesSistema.Responsable:
      return (
        <PlantillaResponsable>
          {" "}
          <Header Nombres={nombres} Apellidos={apellidos} />
          {children}
        </PlantillaResponsable>
      );
    case RolesSistema.PersonalAdministrativo:
      return (
        <PlantillaPersonalAdministrativo>
          {" "}
          <Header Nombres={nombres} Apellidos={apellidos} />
          {children}
        </PlantillaPersonalAdministrativo>
      );
  }
};

export default PlantillaSegunRol;

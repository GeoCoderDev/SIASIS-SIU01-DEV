import AuxiliarIcon from "@/components/icons/AuxiliarIcon";
import DirectivoIcon from "@/components/icons/DirectivoIcon";
import PersonalLimpiezaIcon from "@/components/icons/PersonalLimpiezaIcon";
import ProfesorOTutorIcon from "@/components/icons/ProfesorOTutorIcon";
import ProfesorPrimariaIcon from "@/components/icons/ProfesorPrimariaIcon";
import ResponsableIcon from "@/components/icons/ResponsableIcon";
import { Link } from "next-view-transitions";


export type RolForLoginSelection =
  | "Directivo"
  | "Profesor (Primaria)"
  | "Auxiliar"
  | "Profesor/Tutor (Secundaria)"
  | "Responsable (Padre/Apoderado)"
  | "Personal Administrativo";

interface RolBotonProps {
  rol: RolForLoginSelection;
  icon: React.ReactNode;
  href: string;
}

const RolBoton = ({ href, icon, rol }: RolBotonProps) => {
  return (
    <Link
      href={href}
      className="border-[3px] border-color-interfaz flex flex-col items-center justify-center max-lg:short-height:w-[8.75rem] max-sm:w-[8.5rem] sm-only:w-[9.3rem] md-only:w-[9.75rem] lg-only:w-[9.75rem] xl-only:w-[11rem] max-lg:short-height:h-[5rem] max-sm:h-[6rem] sm-only:h-[6.5rem] md-only:h-[6.5rem] lg-only:h-[6.75rem] xl-only:h-[7.5rem] rounded-[0.75rem] max-lg:short-height:gap-1 gap-2"
    >
      {icon}

      <span className="max-lg:short-height:text-[3.5vh] max-sm:text-[0.75rem] sm-only:text-[0.85rem] md-only:text-[0.9rem] lg-only:text-[0.9rem] xl:only:text-[1rem] max-w-[85%] text-wrap text-center max-lg:short-height:leading-[4.5vh] max-sm:leading-[0.9rem] sm-only:leading-[1.1rem] md-only:leading-[1.1rem] lg-only:leading-[1.1rem] xl-only:leading-[1.2rem]">
        {rol}
      </span>
    </Link>
  );
};

const SeleccionRoles = () => {
  return (
    <main className="w-[100vw] h-[100dvh] flex flex-col items-center justify-center max-lg:short-height:p-4 max-sm:p-6 max-lg:short-height:gap-y-[1.3vh] max-sm:gap-y-[3vh]">
      <div className=" flex flex-col items-center justify-center shadow-[0px_0px_20px_8px_rgba(0,0,0,0.25)] max-lg:short-height:contents  max-sm:contents sm-only:max-w-[77vw] md-only:max-w-[60vw] lg-only:max-w-[53vw]  xl-only:max-w-[40vw] lg-only:max-h-[85vh] xl-only:max-h-[85vh] py-[2rem] sm-only:px-[2rem] md-only:px-[2rem] lg-only:px-[2rem] xl-only:px-[3rem]  sm-only:gap-y-[0.9rem] md-only:gap-y-[1rem] lg-only:gap-y-[1rem] xl-only:gap-y-[1rem] rounded-[1.5rem]">
        <h1 className="text-center text-color-interfaz max-lg:short-height:text-[5.8vh] max-sm:text-[1.4rem] sm-only:text-[1.4rem] md-only:text-[1.6rem] lg-only:text-[1.7rem] xl-only:text-[2rem] [font-weight:500]">
          SIASIS | ASUNCIÓN 8 - 20935
        </h1>

        <h2 className="text-center [font-weight:500] max-lg:short-height:text-[7vh] max-sm:text-[1.6rem] sm-only:text-[1.5rem] md-only:text-[1.75rem] lg-only:text-[1.85rem] xl-only:text-[2.2rem] mt-[-0.5rem]">
          SELECCIONE SU ROL
        </h2>

        <p className="max-sm:text-[1rem] sm:text-[0.9rem] md:text-[1rem] lg-only:text-[1.1rem] xl-only:text-[1.3rem] text-gris-oscuro">
          Elija el rol con el que ingresara al sistema de asistencia.
        </p>

        <div className="flex flex-row items-center justify-center max-w-full flex-wrap max-lg:short-height:gap-x-[3vw] max-sm:gap-x-[6vw] sm-only:gap-x-[min(2vw,2rem)] md-only:gap-x-[3rem] lg-only:gap-x-[3rem] xl-only:gap-x-[4rem] max-lg:short-height:gap-y-[3vh] max-sm:gap-y-[1rem] sm-only:gap-y-[1rem] md-only:gap-y-[1.3rem] lg-only:gap-y-[1.3rem] xl-only:gap-y-[2rem] md-only:mt-2 lg-only:mt-2 xl-only:mt-4">
          <RolBoton
            href="/login/directivo"
            icon={
              <DirectivoIcon className="max-lg:short-height:h-[7.5vh] max-sm:w-[1.7rem] sm-only:w-[1.85rem] md-only:w-[2rem] lg-only:w-[2.6rem] xl-only:w-[3.4rem] text-negro" />
            }
            rol="Directivo"
          />
          <RolBoton
            href="/login/profesor-primaria"
            icon={
              <ProfesorPrimariaIcon className="max-lg:short-height:h-[7.5vh] max-sm:w-[1.65rem] sm-only:w-[2.1rem] md-only:w-[2rem] lg-only:w-[2.4rem] xl-only:w-[3rem] text-negro" />
            }
            rol="Profesor (Primaria)"
          />
          <RolBoton
            href="/login/auxiliar"
            icon={
              <AuxiliarIcon className="max-lg:short-height:h-[7.75vh] max-sm:w-[1.55rem] sm-only:w-[1.7rem] md-only:w-[1.75rem] lg-only:w-[2rem] xl-only:w-[2.5rem] text-negro" />
            }
            rol="Auxiliar"
          />
          <RolBoton
            href="/login/profesor-tutor-secundaria"
            icon={
              <ProfesorOTutorIcon className="max-lg:short-height:h-[7vh] max-sm:w-[1.5rem] sm-only:w-[1.7rem] md-only:w-[2rem] lg-only:w-[2rem] xl-only:w-[2.5rem] text-negro" />
            }
            rol="Profesor/Tutor (Secundaria)"
          />
          <RolBoton
            href="/login/responsable"
            icon={
              <ResponsableIcon className="max-lg:short-height:h-[8vh] max-sm:w-[1.5rem] sm-only:w-[1.7rem] md-only:w-[1.7rem] lg-only:w-[1.9rem] xl-only:w-[2.3rem] text-negro" />
            }
            rol="Responsable (Padre/Apoderado)"
          />
          <RolBoton
            href="/login/personal-administrativo"
            icon={
              <PersonalLimpiezaIcon className="max-lg:short-height:h-[8vh] max-sm:w-[1.65rem] sm-only:w-[1.9rem] md-only:w-[2rem] lg-only:w-[2.5rem] xl-only:w-[3rem] text-negro" />
            }
            rol="Personal Administrativo"
          />
        </div>
      </div>
    </main>
  );
};

export default SeleccionRoles;

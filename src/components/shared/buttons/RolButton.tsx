import getRandomSIU01IntanceURL from "@/lib/helpers/functions/getRandomSIU01IntanceURL";
import { Link } from "next-view-transitions";

export type RolForLoginSelection =
  | "Directivo"
  | "Profesor (Primaria)"
  | "Auxiliar"
  | "Profesor/Tutor (Secundaria)"
  | "Responsable (Padre/Apoderado)"
  | "Otro";

export interface RolBotonProps {
  rol: RolForLoginSelection;
  icon: React.ReactNode;
  path: string;
}

export const RolBoton = ({ path, icon, rol }: RolBotonProps) => {
  return (
    <Link
      href={getRandomSIU01IntanceURL() + path}
      className="border-[3px] border-color-interfaz flex flex-col items-center justify-center max-lg:short-height:w-[8.75rem] max-sm:w-[8.5rem] sm-only:w-[9.3rem] md-only:w-[9.75rem] lg-only:w-[9.75rem] xl-only:w-[11rem] max-lg:short-height:h-[5rem] max-sm:h-[6rem] sm-only:h-[6.5rem] md-only:h-[6.5rem] lg-only:h-[6.75rem] xl-only:h-[7.5rem] rounded-[0.75rem] max-lg:short-height:gap-1 gap-2"
    >
      {icon}

      <span className="max-lg:short-height:text-[3.5vh] max-sm:text-[0.75rem] sm-only:text-[0.85rem] md-only:text-[0.9rem] lg-only:text-[0.9rem] xl:only:text-[1rem] max-w-[85%] text-wrap text-center max-lg:short-height:leading-[4.5vh] max-sm:leading-[0.9rem] sm-only:leading-[1.1rem] md-only:leading-[1.1rem] lg-only:leading-[1.1rem] xl-only:leading-[1.2rem]">
        {rol}
      </span>
    </Link>
  );
};

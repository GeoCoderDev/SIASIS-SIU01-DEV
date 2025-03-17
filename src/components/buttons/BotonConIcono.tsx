import { ReactElement } from "react";

interface BotonConIconoProps {
  className?: string;
  texto: string;
  IconTSX: ReactElement;
  onClick?: () => void;
  typeButton?: "submit" | "reset" | "button";
  disabled?: boolean;
  LoaderTSX?: ReactElement;
  isSomethingLoading?: boolean;
}

const BotonConIcono = ({
  disabled = false,
  texto,
  IconTSX,
  className = "",
  onClick,
  typeButton = "button",
  LoaderTSX,
  isSomethingLoading=false,
}: BotonConIconoProps) => {
  return (
    <button
      disabled={disabled || isSomethingLoading}
      onClick={onClick}
      type={typeButton}
      title={disabled ? "Aun no has modificado nada" : "Guarda tu cambios"}
      className={`flex flex-wrap items-center justify-center disabled:grayscale-[0.6] disabled:cursor-not-allowed ${className}`}
    >
      {texto} {isSomethingLoading ? LoaderTSX : IconTSX}
    </button>
  );
};

export default BotonConIcono;

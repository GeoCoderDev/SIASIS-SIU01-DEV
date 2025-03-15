import { ReactElement } from "react";

interface BotonConIconoProps {
  className?: string;
  texto: string;
  IconTSX: ReactElement;
  onClick?: () => void;
  typeButton?: "submit" | "reset" | "button";
}

const BotonConIcono = ({
  texto,
  IconTSX,
  className = "",
  onClick,
  typeButton = "button",
}: BotonConIconoProps) => {
  return (
    <button onClick={onClick} type={typeButton} className={`flex flex-wrap items-center ${className}`}>
      {texto} {IconTSX}
    </button>
  );
};

export default BotonConIcono;

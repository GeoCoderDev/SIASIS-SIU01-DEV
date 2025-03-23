import { T_Auxiliares } from "@prisma/client";

const AuxiliardCard = ({Auxiliar: {}}: { Auxiliar: Omit<T_Auxiliares, "Contraseña" | ""> }) => {
  return <div>AuxiliardCard</div>;
};

export default AuxiliardCard;

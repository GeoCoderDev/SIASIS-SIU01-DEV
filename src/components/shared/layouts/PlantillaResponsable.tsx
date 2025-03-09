import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import Header from "./Header";

const PlantillaResponsable = ({
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

export default PlantillaResponsable;

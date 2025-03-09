"use client";

import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { redirect, usePathname } from "next/navigation";

const Header = ({
  Nombres,
  Apellidos,
}: {
  Nombres: RequestCookie | undefined;
  Apellidos: RequestCookie | undefined;
}) => {
  if (!Nombres || !Apellidos) {
    redirect("/login");
  }

  const pathname = usePathname();
  const isLoginPage = pathname.startsWith("/login");

  return isLoginPage ? (
    <></>
  ) : (
    <header className="p-4 bg-blue-700 text-white flex justify-between items-center">
      <div className="logo">I.E. 20935 Asunción 8</div>
      <div className="user-info">
        <span>
          Bienvenido, {Nombres.value} {Apellidos.value}
        </span>
      </div>
    </header>
  );
};

export default Header;

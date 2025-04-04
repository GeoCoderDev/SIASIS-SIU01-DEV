import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      Interfaz Propio Auxiliar
      {children}
    </main>
  );
};

export default Layout;

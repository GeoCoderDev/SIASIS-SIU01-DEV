"use client";

import { RootState } from "@/global/store";
import Image from "next/image";

import { useSelector } from "react-redux";

import InterceptedLinkForDataThatCouldBeLost from "./shared/InterceptedLinkForDataThatCouldBeLost";

const Home = () => {
  const sidebarIsOpen = useSelector(
    (state: RootState) => state.globalConstants.urlAPI
  );

  return (
    <div>
      <h1 className="text-[2rem] hover:text-azul-principal">
        REGISTRAR RESPONSABLES
      </h1>
      <p data-testId="desc">This is my description</p>
      <p>This is a test {sidebarIsOpen}</p>
      <Image
        src="/images/svg/Logo.svg"
        alt="Colegio Asuncion 8 Logo"
        width={200}
        height={200}
      />

      <InterceptedLinkForDataThatCouldBeLost
        href="/hola"
        negativeCallback={() => {
          window.alert("No se puede ir a esa pagina");
        }}
        className="text-azul-principal p-6"
      >
        Hola
      </InterceptedLinkForDataThatCouldBeLost>
    </div>
  );
};

export default Home;

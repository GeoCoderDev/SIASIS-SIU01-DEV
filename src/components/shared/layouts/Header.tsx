"use client";

import FooterIcon from "@/components/icons/FooterIcon";
import HamburguesaIcon from "@/components/icons/HamburguesaIcon";
import { setHeaderHeight } from "@/global/state/ElementDimensions/headerHeight";
import { setWindowHeight } from "@/global/state/ElementDimensions/windowHeight";
import { setWindowWidth } from "@/global/state/ElementDimensions/windowWidth";
import {
  setSidebarIsOpen,
  switchSidebarIsOpen,
} from "@/global/state/Flags/sidebarIsOpen";
import { RootState } from "@/global/store";
import { useDelegacionEventos } from "@/hooks/useDelegacionDeEventos";
import { RolesSistema } from "@/interfaces/RolesSistema";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import LogoCabecera from "../logos/LogoCabecera";
import { logout } from "@/lib/helpers/logout";
import DespliegueIcon from "@/components/icons/DespliegueIcon";
import { RolesTextos } from "@/Assets/RolesTextos";
import InterceptedLinkForDataThatCouldBeLost from "../InterceptedLinkForDataThatCouldBeLost";
import { Genero } from "@/interfaces/Genero";

const Header = ({
  Nombres,
  Apellidos,
  Genero,
  Rol,
  Google_Drive_Foto_ID,
}: {
  Nombres: RequestCookie;
  Apellidos: RequestCookie;
  Genero?: RequestCookie;
  Rol: RolesSistema;
  Google_Drive_Foto_ID: RequestCookie | undefined;
}) => {
  const sidebarIsOpen = useSelector(
    (state: RootState) => state.flags.sidebarIsOpen
  );

  const pathname = usePathname();
  const isLoginPage = pathname.startsWith("/login");

  const dispatch = useDispatch();

  // Estado para controlar la visibilidad del menú desplegable
  const [menuVisible, setMenuVisible] = useState(false);

  // Función para cambiar la visibilidad del menú
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const { delegarEvento } = useDelegacionEventos();
  // const { UserSessionData } = useUserSessionData() as {
  //   UserSessionData: UserData;
  // };

  useEffect(() => {
    // if (!UserSessionData) return;
    if (!delegarEvento) return;
    const resizeObserverHeader = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        dispatch(
          setHeaderHeight({
            value: parseFloat(getComputedStyle(entry.target).height),
          })
        );
      });
    });

    if (window.innerWidth > 768) {
      dispatch(setSidebarIsOpen({ value: true }));
    }

    dispatch(setWindowHeight({ value: window.innerHeight }));
    dispatch(setWindowWidth({ value: window.innerWidth }));

    const handleResize = () => {
      dispatch(setWindowHeight({ value: window.innerHeight }));
      dispatch(setWindowWidth({ value: window.innerWidth }));
    };

    window.addEventListener("resize", handleResize);

    const headerHTML = document.getElementById("header");

    if (!headerHTML) return;

    resizeObserverHeader.observe(headerHTML);

    delegarEvento(
      "mousedown",
      "#Menu-deplegable, #Menu-deplegable *, #despliegue-icon, #despliegue-icon *",
      () => {
        setMenuVisible(false);
      },
      true
    );

    // const getPhotoPerfilImage = async () => {
    //   if (isLoginPage) return;

    //   const resToken = await fetch("/api/auth/myToken");
    //   if (!resToken.ok) return;

    //   const { token } = await resToken.json();

    //   const resImage = await fetch(`${urlAPI}/api/auth/me/image`, {
    //     method: "GET",
    //     headers: { Authorization: token },
    //   });

    //   if (resImage.ok) {
    //     const { Foto_Perfil_URL } = await resImage.json();
    //     UserSessionData.urlImage = Foto_Perfil_URL;
    //   }
    // };

    // Solicitando la imagen de perfil del usuario
    // if (
    //   UserSessionData.role === "student" ||
    //   UserSessionData.role === "teacher"
    // ) {
    //   getPhotoPerfilImage();
    // }

    return () => {
      resizeObserverHeader.observe(headerHTML);
      window.removeEventListener("resize", handleResize);
    };
  }, [delegarEvento /* UserSessionData*/]);

  return isLoginPage ? (
    <></>
  ) : (
    Nombres && Apellidos && (
      <header
        style={{ boxShadow: "0 0px 2px 2px rgba(0,0,0,0.2)" }}
        id="header"
        className="flex w-full items-center gap-x-4 text-center z-[1000] bg-verde-spotify py-3 sticky top-0 left-0 max-w-full px-4 sm:pl-6 sm:pr-4 text-xs sm:text-base min-h-[5rem] bg-color-interfaz justify-start"
      >
        <div
          className="cursor-pointer select-none"
          onClick={() => dispatch(switchSidebarIsOpen())}
        >
          {Rol === RolesSistema.Directivo ? (
            <HamburguesaIcon
              title={sidebarIsOpen ? "Ocultar Sidebar" : "Mostrar Sidebar"}
              className="aspect-auto w-10 -border-2 "
              color="white"
            />
          ) : (
            <FooterIcon
              className="w-10"
              color="white"
              title={
                sidebarIsOpen
                  ? "Ocultar Barra Inferior"
                  : "Mostrar Barra Inferior"
              }
            />
          )}
        </div>

        <LogoCabecera />

        <div className="flex-1"></div>

        <div className="justify-self-end flex items-center justify-center gap-4">
          <div className="flex flex-col items-start mr-2 justify-center gap-y-1">
            <h1 className="text-blanco font-extrabold text-left text-[1.1rem] leading-5">
              {Nombres.value.split(" ").shift()}{" "}
              {Apellidos.value.split(" ").shift()}
            </h1>
            <i className="text-blanco text-left text-[0.9rem] leading-4 sm:hidden italic">
              {
                RolesTextos[Rol as keyof typeof RolesTextos].mobile[
                  Genero ? (Genero.value as Genero) : ("M" as Genero)
                ]
              }
            </i>
            <i className="text-blanco text-left text-[0.9rem] leading-4 italic max-sm:hidden">
              {
                RolesTextos[Rol as keyof typeof RolesTextos].desktop[
                  Genero ? (Genero.value as Genero) : ("M" as Genero)
                ]
              }
            </i>
          </div>

          <img
            style={{ boxShadow: "0 0px 8px rgba(0, 0, 0, 0.2)" }}
            className="aspect-square w-12 max-h-12  max-md:mr-2  rounded-[50%] border border-[#ffffff60] bg-contain object-cover bg-no-repeat bg-center"
            src={
              Google_Drive_Foto_ID
                ? `https://drive.google.com/thumbnail?id=${Google_Drive_Foto_ID.value}`
                : "/images/svg/No-Foto-Perfil.svg"
            }
            alt="Foto"
          />

          <div id="despliegue-icon" onClick={toggleMenu} className="relative">
            <DespliegueIcon className="text-blanco aspect-auto sm:w-7 w-10 hover:cursor-pointer" />
          </div>

          {menuVisible && (
            <ul
              id="Menu-deplegable"
              style={{ boxShadow: "0px 0px 4px 2px rgba(0,0,0,0.2)" }}
              className="absolute bg-white w-auto max-w-[90vw] min-w-[9rem] flex flex-col items-center justify-center mt-3 rounded-lg top-full"
              onClick={() => {
                setMenuVisible(false);
              }}
            >
              <InterceptedLinkForDataThatCouldBeLost href={"/mis-datos"}>
                <li className="hover:font-bold cursor-pointer h-10 flex items-center justify-center px-3 border-t border-gray-200 w-[8rem]">
                  Editar Perfil
                </li>
              </InterceptedLinkForDataThatCouldBeLost>
              <li
                className="border-t border-gray-200 h-10 hover:font-bold cursor-pointer flex items-center justify-center px-3 w-[8rem]"
                onClick={logout}
              >
                Cerrar Sesión
              </li>
            </ul>
          )}
        </div>
      </header>
    )
  );
};

export default Header;

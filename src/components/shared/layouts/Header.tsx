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
import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

const Header = ({
  Nombres,
  Apellidos,
  Rol,
}: {
  Nombres: RequestCookie;
  Apellidos: RequestCookie;
  Rol: RolesSistema;
}) => {
  const sidebarIsOpen = useSelector(
    (state: RootState) => state.flags.sidebarIsOpen
  );

  const pathname = usePathname();
  const isLoginPage = pathname.startsWith("/login");

  const dispatch = useDispatch();

  //Estado para controlar la visibilidad del menú desplegable
  // const [menuVisible, setMenuVisible] = useState(false);

  // Función para cambiar la visibilidad del menú
  // const toggleMenu = () => {
  //   setMenuVisible(!menuVisible);
  // };

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
      "mouseup",
      "#Menu-deplegable, #Menu-deplegable *",
      () => {
        // setMenuVisible(false);
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
        className="flex w-full items-center text-center z-[1000] bg-verde-spotify py-2.5 sticky top-0 left-0 max-w-full pl-4 pr-2 sm:pl-6 sm:pr-4 text-xs sm:text-base min-h-[5rem] bg-color-interfaz"
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
            <FooterIcon className="w-10" color="white" />
          )}
        </div>
      </header>
    )
  );
};

export default Header;

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import InterceptedLinkForDataThatCouldBeLost from "../../InterceptedLinkForDataThatCouldBeLost";
import { SiasisModule } from "@/Assets/routes/modules.routes";
import { RolesSistema } from "@/interfaces/RolesSistema";

const SideBarElementDirectivo = ({
  IconTSX,
  route,
  text,
  allowedRoles,
  etiquetaSuperior,
}: SiasisModule) => {
  const pathName = usePathname();

  const [renderizar, setRenderizar] = useState(false);

  useEffect(() => {
    if (allowedRoles.indexOf(RolesSistema.Directivo) === -1) {
      setRenderizar(() => false);
    } else {
      setRenderizar(() => true);
    }
  }, []);

  const isSelected = pathName.startsWith(`${route}`);

  return renderizar ? (
    <>
      {etiquetaSuperior && <span className="ml-6 mt-6 mb-2 text-[0.85rem]">{etiquetaSuperior}</span>}

      <InterceptedLinkForDataThatCouldBeLost
        negativeCallback={() => {}}
        href={`${route}`}
      >
        <li
          className={` flex items-center pl-5 pr-8 overflow-hidden min-w-[12.5rem] max-w-[25rem]  ${
            !isSelected && "hover:bg-gray-200"
          } py-2 `}
          title={text}
        >
          <span
            className={`flex items-center border-l-[3px] ${
              isSelected ? "border-color-interfaz" : "border-transparent"
            } pl-4 gap-x-4 `}
          >
            <IconTSX
              className={`-border-2 border-blue-600 aspect-auto w-5 ${
                isSelected ? "text-color-interfaz" : "text-negro"
              }`}
            />

            <span
              className={`w-max text-[0.95rem] text-ellipsis text-nowrap ${
                isSelected && "text-color-interfaz overflow-hidden"
              } `}
            >
              {text}
            </span>
          </span>
        </li>
      </InterceptedLinkForDataThatCouldBeLost>
    </>
  ) : (
    <></>
  );
};

export default SideBarElementDirectivo;

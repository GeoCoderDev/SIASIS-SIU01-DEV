"use client";
import { RootState } from "@/global/store";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useDelegacionEventos } from "../../../../hooks/useDelegacionDeEventos";
import { switchSidebarIsOpen } from "@/global/state/Flags/sidebarIsOpen";

const EstilosFuncionalidadSidebarDirectivo = () => {
  const dispatch = useDispatch();

  const headerHeight = useSelector(
    (state: RootState) => state.elementsDimensions.headerHeight
  );
  const windowHeight = useSelector(
    (state: RootState) => state.elementsDimensions.windowHeight
  );

  const windowWidth = useSelector(
    (state: RootState) => state.elementsDimensions.windowWidth
  );

  const sidebarIsOpen = useSelector(
    (state: RootState) => state.flags.sidebarIsOpen
  );

  const { delegarEvento, eliminarEvento } = useDelegacionEventos();

  useEffect(() => {
    if (!delegarEvento || !eliminarEvento) return;

    const idEvent = delegarEvento("click", "#sidebar-ul", () => {
      if (windowWidth < 768) dispatch(switchSidebarIsOpen());
    });

    return eliminarEvento("click", idEvent);
  }, [delegarEvento, windowWidth]);

  return (
    <style>
      {`
    #sidebar{
      width: max-content;
      max-width: 100vw;
      box-shadow: 1px 0 4px 2px #00000020;
      top:${headerHeight}px;                           
      height: ${windowHeight - headerHeight}px;
      max-height: ${windowHeight - headerHeight}px;      
      display: ${
        sidebarIsOpen ? "block" : "none"
      };                                 
    }

    #sidebar-ul{
      background-color: white;
      height: 100%;
      width: 100%;
    }

    @media screen and (max-width: 768px){
      #sidebar{
        width: 100vw;
        position: fixed;
        top: 0;
        min-height: 100dvh;
        left: 0;        
        background-color:${sidebarIsOpen ? "#00000080" : "transparent"};
        z-index: 10000;
      }

      #sidebar-ul{
        background-color: white;
        height: 100%;
        width: max-content;
        max-width: 80%;
      }

    }
              
`}
    </style>
  );
};

export default EstilosFuncionalidadSidebarDirectivo;

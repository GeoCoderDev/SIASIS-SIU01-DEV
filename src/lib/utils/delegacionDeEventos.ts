// delegacionDeEventos.ts
import { useEffect, useState } from "react";
import { TypeEventAvailable } from "./interfaces/TypeEventAvailable";

export const useDelegacionEventos = () => {
  const [delegarEvento, setDelegarEvento] =
    useState<
      (
        typeEvent: TypeEventAvailable,
        querySelectorOrElement: string | HTMLElement,
        callback: (e: Event) => void,
        except?: boolean
      ) => number
    >();
  const [eliminarEvento, setEliminarEvento] =
    useState<(typeEvent: TypeEventAvailable, idEvento: number) => void>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("./clientSideDelegation").then(({ initializeDelegacion }) => {
        const {
          delegarEvento: delegarEventoRec,
          eliminarEventoDelegado: eliminarEventoRec,
        } = initializeDelegacion();

        setDelegarEvento(() => delegarEventoRec);
        setEliminarEvento(() => eliminarEventoRec);
      });
    }
  }, []);

  return { delegarEvento, eliminarEvento };
};

"use client";

import { useEffect, useState } from "react";
import { AuxiliarSinContraseña } from "../../../../interfaces/shared/apis/shared/others/types";
// import auxiliarLocal from "@/lib/utils/local/db/models/AuxiliarIDB";
import AuxiliardCard from "./_components/AuxiliarCard";
import ErrorMessage from "@/components/shared/errors/ErrorMessage";
import { ErrorResponseAPIBase } from "@/interfaces/shared/apis/types";

import Loader from "@/components/shared/loaders/Loader";
import AuxiliarIDB from "@/lib/utils/local/db/models/AuxiliarIDB";

const Auxiliares = () => {
  const [auxiliares, setAuxiliares] = useState<AuxiliarSinContraseña[]>();

  const [isSomethingLoading, setIsSomethingLoading] = useState(true);
  const [error, setError] = useState<ErrorResponseAPIBase | null>(null);

  useEffect(() => {
    const getAuxiliares = async () => {
      const auxiliares = await new AuxiliarIDB(
        "API01",
        setIsSomethingLoading,
        setError
      ).getAll();

      setAuxiliares(auxiliares);
    };

    getAuxiliares();
  }, []);

  return (
    <div className="w-full max-w-[80rem] h-full flex flex-col justify-between">
      <h1 className="text-[2.25rem] text-negro font-semibold mt-2 -text-center -w-full">
        LISTA DE AUXILIARES
      </h1>

      {error && <ErrorMessage error={error} />}

      {!isSomethingLoading && auxiliares && auxiliares.length === 0 && (
        <span> No se encontraron Auxiliares Regitrados en el Sistema</span>
      )}

      <div className="flex flex-wrap justify-evenly gap-y-8 w-full items-center -border-2 flex-1 pt-6 gap-x-[max(2.5rem,1vw)]">
        {isSomethingLoading && (
          <span>
            Actualizando <Loader className="w-[2rem] p-2 bg-black " />
          </span>
        )}
        {auxiliares && (
          <>
            {auxiliares.map((auxiliar) => (
              <AuxiliardCard key={auxiliar.DNI_Auxiliar} Auxiliar={auxiliar} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Auxiliares;

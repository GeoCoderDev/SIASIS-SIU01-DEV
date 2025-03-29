"use client";

import { useEffect, useState } from "react";
import { AuxiliarSinContraseña } from "../../../../interfaces/shared/apis/shared/others/types";
import auxiliarLocal from "@/lib/utils/local/db/models/AuxiliarIDB";
import AuxiliardCard from "./_components/AuxiliarCard";
import useRequestAPIFeatures from "@/hooks/useRequestSiasisAPIFeatures";
import ErrorMessage from "@/components/shared/errors/ErrorMessage";
import { ApiResponseBase } from "@/interfaces/shared/apis/types";
import { MisDatosErrorResponseAPI01 } from "@/interfaces/shared/apis/api01/mis-datos/types";
import { GetAuxiliaresSuccessResponse } from "@/interfaces/shared/apis/api01/auxiliares/types";
import Loader from "@/components/shared/loaders/Loader";

const Auxiliares = () => {
  const [auxiliares, setAuxiliares] = useState<AuxiliarSinContraseña[]>();

  const {
    error,
    fetchSiasisAPI,
    isSomethingLoading,
    setError,
    setIsSomethingLoading,
  } = useRequestAPIFeatures("API01", false);

  useEffect(() => {
    if (!fetchSiasisAPI) return;

    const fetchAuxiliares = async () => {
      const localAuxiliares = await auxiliarLocal.getAll();

      setAuxiliares(localAuxiliares as AuxiliarSinContraseña[]);

      //Al cache q se aspira tener
      if (localAuxiliares.length > 0) {
        setIsSomethingLoading(false);
        return;
      }

      setIsSomethingLoading(true);
      try {
        const fetchCancelable = await fetchSiasisAPI({
          endpoint: "/api/auxiliares",
          method: "GET",
        });

        if (!fetchCancelable) throw new Error();

        const res = await fetchCancelable.fetch();

        const responseJson = (await res.json()) as ApiResponseBase;

        if (!responseJson.success) {
          setIsSomethingLoading(false);
          return setError(responseJson as MisDatosErrorResponseAPI01);
        }

        const { auxiliares: currentAuxiliares } = (
          responseJson as GetAuxiliaresSuccessResponse
        ).data;

        setAuxiliares(currentAuxiliares);

        //Actualizando Cache
        await auxiliarLocal.upsertFromServer(currentAuxiliares);

        setIsSomethingLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        if (error) {
          setError({
            message: "Error al obtener tus datos, vuelve a inténtalo más tarde",
            success: false,
          });
        }
        setIsSomethingLoading(false);
      }
    };

    fetchAuxiliares();
  }, [fetchSiasisAPI, setError]);

  return (
    <div className="w-full max-w-[80rem] h-full flex flex-col justify-between">
      <h1 className="text-[2.25rem] text-negro font-semibold mt-2 -text-center -w-full">
        LISTA DE AUXILIARES
      </h1>

      {isSomethingLoading && (
        <span>
          Actualizando <Loader className="w-[2rem] p-2 bg-black " />
        </span>
      )}

      {error && <ErrorMessage error={error} />}

      {!isSomethingLoading && auxiliares && auxiliares.length === 0 && (
        <span> No se encontraron Auxiliares Regitrados en el Sistema</span>
      )}

      {auxiliares && (
        <div className="flex flex-wrap justify-evenly gap-y-8 w-full items-center -border-2 flex-1 pt-6 gap-x-[max(2.5rem,1vw)]">
          {auxiliares.map((auxiliar) => (
            <AuxiliardCard key={auxiliar.DNI_Auxiliar} Auxiliar={auxiliar} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Auxiliares;

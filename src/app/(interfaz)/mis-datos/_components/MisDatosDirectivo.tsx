"use client";
import MyUserCard from "@/components/shared/cards/UserCard";

import { useEffect, useState } from "react";
import DatoFomularioConEtiqueta from "../../../../components/forms/DatoFomularioConEtiqueta";

import useRequestAPIFeatures from "@/hooks/useRequestSiasisAPIFeatures";
import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import type {
  MisDatosDirectivo,
  MisDatosErrorResponseAPI01,
  MisDatosSuccessResponseAPI01,
} from "@/interfaces/shared/apis/api01/mis-datos/types";
import { ApiResponseBase } from "@/interfaces/shared/apis/types";
import ErrorMessage1 from "@/components/shared/errors/ErrorMessage1";
import BotonConIcono from "@/components/buttons/BotonConIcono";
import LapizIcon from "@/components/icons/LapizIcon";
import FormSection from "@/components/forms/FormSection";

const MisDatosDirectivo = ({
  googleDriveFotoIdCookieValue,
}: {
  googleDriveFotoIdCookieValue: string | null;
}) => {
  const [misDatosDirectivo, setMisDatosDirectivo] = useState<
    Partial<MisDatosDirectivo>
  >({
    Google_Drive_Foto_ID: googleDriveFotoIdCookieValue || undefined,
  });

  const {
    error,
    setError,
    fetchSiasisAPI,
    isSomethingLoading,
    setIsSomethingLoading,
  } = useRequestAPIFeatures("API01");
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    if (!fetchSiasisAPI) return;

    const fetchMisDatos = async () => {
      setIsSomethingLoading(true);
      try {
        const fetchCancelable = await fetchSiasisAPI({
          endpoint: "/api/mis-datos",
          method: "GET",
          queryParams: {
            Rol: RolesSistema.Directivo,
          },
        });

        if (!fetchCancelable) throw new Error();

        const res = await fetchCancelable.fetch();
        const responseJson = (await res.json()) as ApiResponseBase;

        if (!responseJson.success) {
          return setError(responseJson as MisDatosErrorResponseAPI01);
        }

        setMisDatosDirectivo(
          (responseJson as MisDatosSuccessResponseAPI01)
            .data as MisDatosDirectivo
        );
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

    fetchMisDatos();
  }, [fetchSiasisAPI, setError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementa la lógica de envío aquí
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMisDatosDirectivo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="border-2 border-blue-500 w-full max-w-[75rem] h-full grid grid-cols-7 grid-rows-[min-content_1fr] gap-y-4 md:gap-0">
      {error && <ErrorMessage1 {...error} />}

      {/* SECCION DE BOTONES */}
      <div className="flex col-span-full border-2 flex-wrap py-2 justify-start items-center gap-x-6 gap-y-2">
        <h1 className="font-medium text-[2.5rem]">MIS DATOS</h1>
        {!isSomethingLoading && (
          <BotonConIcono
            texto={modoEdicion ? "Cancelar Edición" : "Editar Datos"}
            IconTSX={
              !modoEdicion ? <LapizIcon className="w-[1.1rem]" /> : <></>
            }
            onClick={() => setModoEdicion(!modoEdicion)}
            className="bg-amarillo-ediciones text-negro gap-2 content-center font-bold px-3 py-2 rounded-[10px] "
          />
        )}
      </div>

      {/* SECCION DEL FORMULARIO */}
      <div className="col-span-full  md:col-span-4 border-2">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <FormSection titulo="Información Personal">
              <DatoFomularioConEtiqueta<string, MisDatosDirectivo>
                modoEdicion={modoEdicion}
                etiqueta="DNI"
                nombreDato="DNI"
                valor={misDatosDirectivo.DNI}
                modificable={true}
                className="text-[1.6rem]"
                fullWidth
              />
              <DatoFomularioConEtiqueta<string, MisDatosDirectivo>
                modoEdicion={modoEdicion}
                etiqueta="Nombres"
                nombreDato="Nombres"
                valor={misDatosDirectivo.Nombres}
                modificable={false}
              />
              <DatoFomularioConEtiqueta<string, MisDatosDirectivo>
                modoEdicion={modoEdicion}
                etiqueta="Apellidos"
                nombreDato="Apellidos"
                valor={misDatosDirectivo.Apellidos}
                modificable={false}
                className="-text-[1.6rem] w-full mt-2"
              />
              <DatoFomularioConEtiqueta<string, MisDatosDirectivo>
                modoEdicion={modoEdicion}
                etiqueta="Género"
                nombreDato="Genero"
                skeletonClassName={{className:"min-w-[1rem]"}}
                valor={misDatosDirectivo.Genero}
                modificable={false}
                className="-text-[1.6rem] w-min mt-2"
              />
              <DatoFomularioConEtiqueta<string, MisDatosDirectivo>
                modoEdicion={modoEdicion}
                etiqueta="Celular"
                nombreDato="Celular"
                valor={misDatosDirectivo.Celular}
                modificable={false}
                className="-text-[1.6rem] w-full mt-2"
              />
            </FormSection>

            <FormSection titulo="Informacion del Usuario">
              <DatoFomularioConEtiqueta<string, MisDatosDirectivo> 
                modoEdicion={modoEdicion}
                etiqueta="Nombre de Usuario"
                nombreDato="Nombre_Usuario"
                valor={misDatosDirectivo.Nombre_Usuario}
                modificable={false}
                onChange={handleChange}
                className="-text-[1.6rem] w-full mt-2"
              />
              <DatoFomularioConEtiqueta<string, MisDatosDirectivo> 
                modoEdicion={modoEdicion}
                etiqueta="Nombre de Usuario"
                nombreDato="Nombre_Usuario"
                valor={misDatosDirectivo.Nombre_Usuario}
                modificable={false}
                onChange={handleChange}
                className="-text-[1.6rem] w-full mt-2"
              />
              <DatoFomularioConEtiqueta<string, MisDatosDirectivo> 
                modoEdicion={modoEdicion}
                etiqueta="Nombre de Usuario"
                nombreDato="Nombre_Usuario"
                valor={misDatosDirectivo.Nombre_Usuario}
                modificable={false}
                onChange={handleChange}
                className="-text-[1.6rem] w-full mt-2"
              />
            </FormSection>

            {/* Agrega más campos aquí según tu interfaz MisDatosDirectivo */}

            {modoEdicion && (
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded mt-4"
              >
                Guardar Cambios
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SECCION DE USER CARD */}
      <div className="flex w-full h-full justify-center items-start row-start-2 col-span-full md:row-auto md:col-span-3 p-4">
        <MyUserCard
          Nombres={misDatosDirectivo.Nombres}
          Apellidos={misDatosDirectivo.Apellidos}
          Nombre_Usuario={misDatosDirectivo.Nombre_Usuario}
          Google_Drive_Foto_ID={misDatosDirectivo.Google_Drive_Foto_ID || null}
        />
      </div>
    </div>
  );
};

export default MisDatosDirectivo;

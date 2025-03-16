/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { T_Directivos } from "@prisma/client";
import CandadoUpdate from "@/components/icons/CandadoUpdate";
import CorreoUpdate from "@/components/icons/CorreoUpdate";
import EquisIcon from "@/components/icons/EquisIcon";
import MemoriaIcon from "@/components/icons/MemoriaIcon";

const MisDatosDirectivo = ({
  googleDriveFotoIdCookieValue,
}: {
  googleDriveFotoIdCookieValue: string | null;
}) => {
  const [modoEdicion, setModoEdicion] = useState(false);

  const [cambiarFotoModal, setCambiarFotoModal] = useState(false);
  const [cambiarCorreoElectronicoModal, setCambiarCorreoElectronicoModal] =
    useState(false);
  const [cambiarContraseñaModal, setCambiarContraseñaModal] = useState(false);

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
  } = useRequestAPIFeatures("API01", true);

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
    <div className="@container -border-2 border-blue-500 w-full max-w-[75rem] h-full grid grid-cols-7 grid-rows-[min-content_1fr] gap-y-4 md:gap-0">
      {error && <ErrorMessage1 {...error} />}

      {/* SECCION DE BOTONES */}
      <div className="flex col-span-full -border-2 flex-wrap py-2 justify-start items-center gap-x-6 gap-y-2">
        <h1
          className="font-medium 
  sxs-only:text-[1.55rem] xs-only:text-[1.65rem] sm-only:text-[1.75rem] md-only:text-[1.9rem] lg-only:text-[2.1rem] xl-only:text-[2.4rem]"
        >
          MIS DATOS
        </h1>
        {!isSomethingLoading && (
          <BotonConIcono
            texto={modoEdicion ? "Cancelar Edición" : "Editar Datos"}
            IconTSX={
              !modoEdicion ? (
                <LapizIcon className="w-[0.95rem]" />
              ) : (
                <EquisIcon className="text-blanco w-[0.85rem]" />
              )
            }
            onClick={() => setModoEdicion(!modoEdicion)}
            className={`${
              modoEdicion
                ? "bg-rojo-oscuro text-blanco"
                : "bg-amarillo-ediciones text-negro"
            }  gap-[0.5rem] content-center font-semibold px-[0.6rem] py-[0.35rem] rounded-[6px] 
    sxs-only:text-[0.75rem] xs-only:text-[0.8rem] sm-only:text-[0.85rem] md-only:text-[0.9rem] lg-only:text-[0.95rem] xl-only:text-[1rem]`}
          />
        )}
      </div>

      {/* SECCION DEL FORMULARIO */}
      <div className="col-span-full @lg:col-span-4 -border-2 justify-center">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6 justify-center items-center">
            <FormSection titulo="Información Personal">
              <DatoFomularioConEtiqueta<string, T_Directivos>
                isSomethingLoading={isSomethingLoading}
                modoEdicion={modoEdicion}
                etiqueta="DNI"
                nombreDato="DNI"
                valor={misDatosDirectivo.DNI}
                modificable
                onChange={handleChange}
                className="sxs-only:text-[1.105rem] xs-only:text-[1.17rem] sm-only:text-[1.235rem] md-only:text-[1.3rem] lg-only:text-[1.365rem] xl-only:text-[1.43rem]"
                fullWidth
              />
              <DatoFomularioConEtiqueta<string, T_Directivos>
                isSomethingLoading={isSomethingLoading}
                modoEdicion={modoEdicion}
                etiqueta="Nombres"
                nombreDato="Nombres"
                modificable
                onChange={handleChange}
                valor={misDatosDirectivo.Nombres}
              />
              <DatoFomularioConEtiqueta<string, T_Directivos>
                isSomethingLoading={isSomethingLoading}
                modoEdicion={modoEdicion}
                etiqueta="Apellidos"
                nombreDato="Apellidos"
                modificable
                onChange={handleChange}
                valor={misDatosDirectivo.Apellidos}
              />
              <DatoFomularioConEtiqueta<string, T_Directivos>
                isSomethingLoading={isSomethingLoading}
                modoEdicion={modoEdicion}
                etiqueta="Género"
                nombreDato="Genero"
                modificable
                onChange={handleChange}
                skeletonClassName={{ className: "min-w-[1.1rem]" }}
                valor={misDatosDirectivo.Genero}
              />
              <DatoFomularioConEtiqueta<string, T_Directivos>
                isSomethingLoading={isSomethingLoading}
                modoEdicion={modoEdicion}
                etiqueta="Celular"
                nombreDato="Celular"
                modificable
                onChange={handleChange}
                valor={misDatosDirectivo.Celular}
              />
            </FormSection>

            {modoEdicion && (
              <BotonConIcono
                onClick={() => {
                  setCambiarFotoModal(true);
                }}
                className="w-max content-center font-semibold p-3 py-2 rounded-[10px] bg-amarillo-ediciones gap-2 sxs-only:text-[0.75rem] xs-only:text-[0.8rem] sm-only:text-[0.85rem] md-only:text-[0.9rem] lg-only:text-[0.95rem] xl-only:text-[1rem]"
                texto="Guardar Cambios"
                IconTSX={
                  <MemoriaIcon className="w-[1.4rem] sxs-only:w-[0.85rem] xs-only:w-[0.9rem] sm-only:w-[0.95rem] md-only:w-[1rem] lg-only:w-[1.1rem] xl-only:w-[1.2rem]" />
                }
              />
            )}

            <FormSection titulo="Informacion del Usuario">
              <DatoFomularioConEtiqueta<string, T_Directivos>
                isSomethingLoading={isSomethingLoading}
                modoEdicion={modoEdicion}
                etiqueta="Nombre de Usuario"
                nombreDato="Nombre_Usuario"
                valor={misDatosDirectivo.Nombre_Usuario}
              />
              <DatoFomularioConEtiqueta<string, T_Directivos>
                isSomethingLoading={isSomethingLoading}
                modoEdicion={modoEdicion}
                etiqueta="Contraseña"
                nombreDato="Contraseña"
                valorOculto
                onChange={handleChange}
                modificableConModal
                IconTSX={<CandadoUpdate className="text-negro w-[1.3rem]" />}
                setModalVisibility={setCambiarContraseñaModal}
              />
              <DatoFomularioConEtiqueta<string, T_Directivos>
                isSomethingLoading={isSomethingLoading}
                modoEdicion={modoEdicion}
                etiqueta="Correo Electronico"
                nombreDato="Correo_Electronico"
                valor={misDatosDirectivo.Correo_Electronico}
                IconTSX={<CorreoUpdate className="w-[1.3rem]" />}
                onChange={handleChange}
                modificableConModal
                setModalVisibility={setCambiarCorreoElectronicoModal}
              />
            </FormSection>
          </div>
        </form>
      </div>

      {/* SECCION DE USER CARD - Ahora usa container queries */}
      <div className="flex w-full h-full justify-center items-start @lg:row-auto row-start-2 col-span-full @lg:col-span-3 @lg:order-none order-2 p-4">
        <MyUserCard
          setCambiarFotoModal={setCambiarFotoModal}
          isSomethingLoading={isSomethingLoading}
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

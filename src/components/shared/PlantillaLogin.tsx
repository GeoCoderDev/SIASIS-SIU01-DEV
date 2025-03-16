"use client";
import Link from "next/link";
import ContrasenaIcon from "../icons/ContrasenaIcon";
import UsuarioIcon from "../icons/UsuarioIcon";
import VolverIcon from "../icons/VolverIcon";
import Image from "next/image";
import { useState } from "react";
import useRequestAPIFeatures from "@/hooks/useRequestSiasisAPIFeatures";

import Loader from "./loaders/Loader";
import ErrorMessage1 from "./errors/ErrorMessage1";
import SuccessMessage1 from "./successes/SuccessMessage1";
import userStorage from "@/lib/utils/local/db/models/UserStorage";
import { SiasisAPIS } from "@/interfaces/shared/SiasisComponents";
import { ErrorResponseAPIBase } from "@/interfaces/shared/apis/types";
import { ResponseSuccessLogin } from "@/interfaces/shared/apis/shared/login/types";

export type RolForLogin =
  | "DIRECTIVO"
  | "PROFESOR DE PRIMARIA"
  | "AUXILIAR"
  | "PROFESOR/TUTOR(Secundaria)"
  | "RESPONSABLE(Padre/Apoderado)"
  | "PERSONAL ADMINISTRATIVO";

export interface FormularioLogin {
  Nombre_Usuario: string;
  Contraseña: string;
}

interface PlantillaLoginProps {
  rol: RolForLogin;
  siasisAPI: SiasisAPIS;
  endpoint: string;
}

const initialFormularioLogin: FormularioLogin = {
  Nombre_Usuario: "",
  Contraseña: "",
};

const PlantillaLogin = ({ rol, siasisAPI, endpoint }: PlantillaLoginProps) => {
  const {
    error,
    fetchSiasisAPI,
    isSomethingLoading,
    setError,
    setIsSomethingLoading,
    setSuccessMessage,
    successMessage,
  } = useRequestAPIFeatures(siasisAPI);

  const [formularioLogin, setFormularioLogin] = useState<FormularioLogin>(
    initialFormularioLogin
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [intentosRestantes, setIntentosRestantes] = useState<
    number | undefined
  >(3);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setError(null);
    setFormularioLogin({
      ...formularioLogin,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSomethingLoading(true);

      const fetchCancellable = fetchSiasisAPI({
        endpoint,
        method: "POST",
        body: JSON.stringify(formularioLogin),
        userAutheticated: false,
      });

      const res = await (await fetchCancellable)!.fetch();

      if (!res.ok) {
        const error = (await res.json()) as ErrorResponseAPIBase;
        setIsSomethingLoading(false);
        throw new Error(error.message);
      }

      const response = await res.json();

      const { message, data } = response as ResponseSuccessLogin;

      setSuccessMessage({ message });

      const resSetCookies = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!resSetCookies.ok) {
        const { message } =
          (await resSetCookies.json()) as ErrorResponseAPIBase;
        throw new Error(message);
      }

      //Guadando data en IndexedDB
      await userStorage.saveUserData(data);

      setIsSomethingLoading(false);
      window.location.href = "/";

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setIsSomethingLoading(false);
      setError({
        message: "Ocurrio un error interno en el sistema",
        success: false,
      });
    }
  };

  return (
    <>
      <main className="w-full h-full min-h-screen bg-gris-claro max-sm:bg-blanco flex items-center justify-center max-sm:p-0">
        <div className="flex flex-row max-sm:flex-col bg-blanco shadow-[0px_0px_23.5px_5px_rgba(0,0,0,0.25)] max-sm:shadow-none max-sm:rounded-none max-sm:w-full max-sm:h-full p-8 max-sm:p-2 w-full max-w-2xl">
          {/* Sección Izquierda: Formulario de Inicio de Sesión */}
          <div className="w-1/2 pr-4 max-sm:w-full max-sm:px-4 max-sm:py-2 max-sm:order-2">
            <Link href="/login">
              <button className="flex items-center text-blanco bg-color-interfaz px-4 py-2 rounded-lg">
                <VolverIcon className="w-5 h-5 mr-2" />
                Volver
              </button>
            </Link>

            <h2 className="text-[0.8rem] text-gris-oscuro mt-3">
              Inicio de Sesión
            </h2>
            <h3 className="text-[1.5rem] font-bold text-gris-oscuro">{rol}</h3>

            <form className="mt-4" onSubmit={handleSubmit}>
              <div className="mb-3 flex items-center border border-color-interfaz rounded-lg overflow-hidden">
                <div className="bg-color-interfaz p-2 flex items-center">
                  <UsuarioIcon className="w-6 h-6 text-white" />
                </div>
                <input
                  type="text"
                  required
                  name="Nombre_Usuario"
                  onChange={handleChange}
                  value={formularioLogin.Nombre_Usuario}
                  placeholder="Ingrese su nombre de usuario"
                  className="w-full text-negro placeholder:text-gris-intermedio text-[1rem] outline-none bg-transparent px-2"
                />
              </div>

              <div className="mb-3 flex items-center border border-color-interfaz rounded-lg overflow-hidden">
                <div className="bg-color-interfaz p-2 flex items-center">
                  <ContrasenaIcon className="w-6 h-6 text-white" />
                </div>
                <input
                  type="password"
                  required
                  name="Contraseña"
                  onChange={handleChange}
                  value={formularioLogin.Contraseña}
                  placeholder="Ingrese su contraseña"
                  className="w-full text-negro placeholder:text-gris-intermedio text-[1rem] outline-none bg-transparent px-2"
                />
              </div>

              <p className="text-gris-oscuro text-[0.9rem]">
                Intentos disponibles:{" "}
                <span className="font-bold">{intentosRestantes}</span>
              </p>

              {error && <ErrorMessage1 {...error} />}

              {successMessage && (
                <SuccessMessage1 message={successMessage.message} />
              )}

              <button
                type="submit"
                disabled={isSomethingLoading || Boolean(error)}
                className="mt-3 w-full bg-color-interfaz text-blanco rounded-lg text-[1rem] flex gap-4 items-center justify-center py-3 disabled:grayscale-[0.75] pointer"
              >
                Ingresar
                {isSomethingLoading && !error && !successMessage && (
                  <Loader className="w-[1.5rem]" />
                )}
              </button>
            </form>
          </div>

          {/* Sección Derecha: Logo (en desktop) / Superior: Logo (en mobile) */}
          <div className="w-1/2 flex justify-center items-center max-sm:w-full max-sm:pt-4 max-sm:pb-2 max-sm:order-1">
            <Image
              src="/images/svg/Logo.svg"
              alt="Colegio Asuncion 8 Logo"
              width={396}
              height={396}
              className="max-sm:w-[160px] max-sm:h-auto"
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default PlantillaLogin;

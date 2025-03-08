"use client";
import Image from "next/image";
import Link from "next/link";
import VolverIcon from "@/components/icons/VolverIcon";
import UsuarioIcon from "@/components/icons/UsuarioIcon";
import ContrasenaIcon from "@/components/icons/ContrasenIcon";

export default function ProfesorPrimariaLogin() {
  return (
    <main className="w-[100vw] h-[100dvh] bg-gris-claro flex items-center justify-center">
      <div className="flex bg-blanco shadow-[0px_0px_23.5px_5px_rgba(0,0,0,0.25)] rounded-lg p-8 w-full max-w-2xl">
        
        {/* Sección Izquierda: Formulario de Inicio de Sesión */}
        <div className="w-1/2 pr-4">
          <Link href="/login">
            <button className="flex items-center text-blanco bg-color-interfaz px-4 py-2 rounded-lg">
            <VolverIcon className="w-5 h-5 mr-2" />
              Volver
            </button>
          </Link>

          <h2 className="text-[0.8rem] text-gris-oscuro mt-5">Inicio de Sesión</h2>
          <h3 className="text-[1.5rem] font-bold text-gris-oscuro">PROFESOR DE PRIMARIA</h3>

          <div className="mt-6">
            <div className="mb-4 flex items-center border border-color-interfaz rounded-lg overflow-hidden">
            <div className="bg-color-interfaz p-3 flex items-center">
                <UsuarioIcon className="w-6 h-6" />
              </div>
              <input
                type="text"
                placeholder="Ingrese su nombre de usuario"
                className="w-full text-gris-intermedio text-[1rem] outline-none bg-transparent px-3"
              />
            </div>

            <div className="mb-4 flex items-center border border-color-interfaz rounded-lg overflow-hidden">
              <div className="bg-color-interfaz p-3 flex items-center">
                <ContrasenaIcon className="w-6 h-6" />
              </div>
              <input
                type="password"
                placeholder="Ingrese su contraseña"
                className="w-full text-gris-intermedio text-[1rem] outline-none bg-transparent px-3"
              />
          </div>

            <p className="text-gris-oscuro text-[0.9rem]">
              Intentos disponibles: <span className="font-bold">3</span>
            </p>

            <button className="mt-4 w-full bg-color-interfaz text-blanco py-2 rounded-lg text-[1rem]">
              Ingresar
            </button>
          </div>
        </div>

        {/* Sección Derecha: Logo */}
        <div className="w-1/2 flex justify-center items-center">
          <Image
            src="/images/svg/Logo.svg"
            alt="Colegio Asuncion 8 Logo"
            width={396}
            height={396}
          />
        </div>
      </div>
    </main>
  );
}

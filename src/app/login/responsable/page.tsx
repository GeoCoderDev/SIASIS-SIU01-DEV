"use client";

import PlantillaLogin, { FormularioLogin } from "@/components/shared/PlantillaLogin";
import { useState } from "react";

const initialFormularioLogin: FormularioLogin = {
  nombre_usuario: "",
  contraseña: "",
};

export default function ResponsableLogin() {
  const [formularioLogin, setFormularioLogin] = useState<FormularioLogin>(
    initialFormularioLogin
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [intentosRestantes, setIntentosRestantes] = useState<
    number | undefined
  >();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formularioLogin);
  };

  return (
    <PlantillaLogin
      formulario={formularioLogin}
      setFormulario={setFormularioLogin}
      rol="PROFESOR DE PRIMARIA"
      handleSubmit={handleSubmit}
      intentosRestantes={intentosRestantes ?? 3}
    />
  );
}

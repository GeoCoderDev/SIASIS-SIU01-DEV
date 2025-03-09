"use client";

import PlantillaLogin from "@/components/shared/PlantillaLogin";

export default function ResponsableLogin() {
  return (
    <PlantillaLogin
      endpoint="/api/login/responsable"
      rol="PROFESOR DE PRIMARIA"
      siasisAPI="API02"
    />
  );
}

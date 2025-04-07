"use client";
import { tiempoRestanteHasta } from "@/global/state/others/fechaHoraActualReal";
import { RootState } from "@/global/store";
import { alterarUTCaZonaPeruana } from "@/lib/helpers/alteradores/alterarUTCaZonaPeruana";
import { useSelector } from "react-redux";

const RelojServidor = () => {
  const fechaHoraActual = useSelector(
    (state: RootState) => state.others.fechaHoraActualReal
  );

  // Obtener tiempo restante usando el selector
  const tiempoRestante = useSelector((state: RootState) =>
    tiempoRestanteHasta(
      { fechaHoraActualReal: state.others.fechaHoraActualReal },
      alterarUTCaZonaPeruana("2025-04-07T00:16:00.000Z")
    )
  );

  return (
    <>
      <div>
        <span>{fechaHoraActual.formateada?.horaCompleta}</span>
        <br />
        <span>{tiempoRestante?.formateado}</span>
      </div>
    </>
  );
};

export default RelojServidor;

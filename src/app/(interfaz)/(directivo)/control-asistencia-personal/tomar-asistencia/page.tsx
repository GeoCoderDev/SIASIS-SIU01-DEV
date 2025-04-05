"use client";

import { useEffect, useState } from "react";

const TomarAsistenciaPersonal = () => {
  // Estado para el cronómetro de cuenta regresiva
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [timeLeft, setTimeLeft] = useState({ minutes: 18, seconds: 56 });

  // Lógica para la cuenta regresiva (esto sería implementado con la lógica real)
  useEffect(() => {
    // Aquí iría la lógica real del cronómetro
    // Este es solo un ejemplo para mostrar la estructura
  }, []);

  return (
    <>

      <h1 className="text-[2rem] font-semibold">Control de Asistencia Diaria</h1>

      <div>

        

      </div>

    
    </>
  );
};

export default TomarAsistenciaPersonal;

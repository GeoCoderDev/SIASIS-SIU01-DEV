import React from "react";

interface DatoFomularioConEtiquetaProps<T, R> {
  etiqueta: string;
  valor?: T;
  nombreDato?: keyof R;
  modificable?: boolean;
  modoEdicion?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fullWidth?: boolean;
}

const DatoFomularioConEtiqueta = <T, R>({
  etiqueta,
  valor,
  modificable = false,
  nombreDato = undefined,
  modoEdicion = false,
  className = "",
  onChange,
  fullWidth = false,
}: DatoFomularioConEtiquetaProps<T, R>) => {
  return (
    <label
      className={`flex flex-col border-2text-[1rem] -border-2 -border-blue-500 gap-[0.3rem] ${
        fullWidth && "min-w-full"
      }`}
    >
      {etiqueta}:
      <div
        className={`min-h-[2rem] min-w-[8rem] text-[1.2rem] ${
          valor === undefined ? "skeleton" : ""
        }`}
      >
        {valor !== undefined ? (
          <>
            {modificable && modoEdicion ? (
              <input
                className={`text-[1.2rem] border-2 border-color-interfaz ${className}`}
                name={nombreDato as string}
                value={valor as string}
                onChange={onChange}
              />
            ) : (
              <span className={`text-[1.2rem] w-max ${className}`}>
                {valor as string}
              </span>
            )}
          </>
        ) : null}
      </div>
    </label>
  );
};

export default DatoFomularioConEtiqueta;

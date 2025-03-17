import React, { Dispatch, ReactElement, SetStateAction } from "react";
import SiasisSelect from "../inputs/SiasisSelect";
import SiasisInputText from "../inputs/SiasisInputText";

interface DatoFomularioConEtiquetaProps<R> {
  etiqueta: string;
  valor?: string | number;
  nombreDato?: keyof R;
  modificable?: boolean;
  modoEdicion?: boolean;
  className?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  fullWidth?: boolean;
  modificableConModal?: boolean;
  setModalVisibility?: Dispatch<SetStateAction<boolean>>;
  skeletonClassName?: { className: string };
  IconTSX?: ReactElement;
  isSomethingLoading: boolean;
  valorOculto?: boolean;
  inputType?: "text" | "select";
  selectValues?: Record<string, string>;
}

const DatoFomularioConEtiqueta = <R,>({
  etiqueta,
  valor,
  modificable = false,
  nombreDato = undefined,
  modoEdicion = false,
  className = "",
  onChange,
  fullWidth = false,
  skeletonClassName,
  IconTSX,
  modificableConModal = false,
  isSomethingLoading,
  setModalVisibility,
  valorOculto = false,
  inputType = "text",
  selectValues,
}: DatoFomularioConEtiquetaProps<R>) => {
  return (
    <label
      className={`flex ${
        valorOculto ? "flex-row items-center" : "flex-col"
      } gap-[0.2rem] 
        sxs-only:text-[0.rem] xs-only:text-[0.75rem] sm-only:text-[0.8rem] md-only:text-[0.85rem] lg-only:text-[1rem] xl-only:text-[0.95rem]
        font-normal -text-gray-600
        ${fullWidth && "min-w-full"}`}
    >
      {etiqueta}:
      {!isSomethingLoading && valorOculto && (
        <button
          className="flex items-center justify-center bg-amarillo-ediciones rounded-[50%] aspect-square 
            sxs-only:w-[1.5rem] xs-only:w-[1.6rem] sm-only:w-[1.7rem] md-only:w-[1.8rem] lg-only:w-[1.9rem] xl-only:w-[2rem]
             transition-all ml-1 hover:bg-yellow-400"
          onClick={() => {
            setModalVisibility!(true);
          }}
        >
          {IconTSX}
        </button>
      )}
      <div
        className={`min-h-[1.5rem] 
          sxs-only:min-h-[1.4rem] xs-only:min-h-[1.5rem] sm-only:min-h-[1.6rem] md-only:min-h-[1.7rem] lg-only:min-h-[1.8rem] xl-only:min-h-[1.9rem]
          sxs-only:text-[0.85rem] xs-only:text-[0.9rem] sm-only:text-[0.95rem] md-only:text-[1rem] lg-only:text-[1.05rem] xl-only:text-[1.1rem]
          font-normal text-black
          ${
            (!valorOculto && valor === undefined) || isSomethingLoading
              ? `skeleton sxs-only:min-w-[5rem] xs-only:min-w-[5.5rem] sm-only:min-w-[6rem] md-only:min-w-[6.5rem] lg-only:min-w-[7rem] xl-only:min-w-[7.5rem] ${skeletonClassName?.className}`
              : ""
          }`}
      >
        {!isSomethingLoading && (
          <>
            {modificable && modoEdicion ? (
              <>
                {inputType === "text" && onChange && (
                  <SiasisInputText
                    value={valor || ""}
                    name={nombreDato as string}
                    onChange={onChange}
                    className={
                      className ??
                      "sxs-only:text-[0.85rem] xs-only:text-[0.9rem] sm-only:text-[0.95rem] md-only:text-[1rem] lg-only:text-[1.05rem] xl-only:text-[1.1rem]"
                    }
                    placeholder={`Ingrese ${etiqueta.toLowerCase()}`}
                  />
                )}

                {inputType === "select" && onChange && (
                  <SiasisSelect
                    value={valor || ""}
                    name={nombreDato as string}
                    onChange={onChange}
                    className={
                      className ??
                      "sxs-only:text-[0.85rem] xs-only:text-[0.9rem] sm-only:text-[0.95rem] md-only:text-[1rem] lg-only:text-[1.05rem] xl-only:text-[1.1rem]"
                    }
                    placeholder={`Seleccione ${etiqueta.toLowerCase()}`}
                  >
                    {selectValues &&
                      Object.entries(selectValues).map(([value, text]) => (
                        <option key={value} value={value}>
                          {text}
                        </option>
                      ))}
                  </SiasisSelect>
                )}
              </>
            ) : (
              <span
                className={` 
                  w-max max-w-full break-words font-normal
                  ${
                    modificableConModal && "flex flex-wrap items-center gap-1.5"
                  }  ${
                  className ??
                  "sxs-only:text-[0.85rem] xs-only:text-[0.9rem] sm-only:text-[0.95rem] md-only:text-[1rem] lg-only:text-[1.05rem] xl-only:text-[1.1rem]"
                }`}
              >
                {selectValues ? selectValues[valor as string] : valor}
                {!isSomethingLoading && modificableConModal && !valorOculto && (
                  <button
                    className="flex items-center justify-center bg-amarillo-ediciones rounded-[50%] aspect-square 
                      sxs-only:w-[1.5rem] xs-only:w-[1.6rem] sm-only:w-[1.7rem] md-only:w-[1.8rem] lg-only:w-[1.9rem] xl-only:w-[2rem]
                      transition-all hover:bg-yellow-400"
                    onClick={() => {
                      setModalVisibility!(true);
                    }}
                  >
                    {IconTSX}
                  </button>
                )}
              </span>
            )}
          </>
        )}
      </div>
    </label>
  );
};

export default DatoFomularioConEtiqueta;

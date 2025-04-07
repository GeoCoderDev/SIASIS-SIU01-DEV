import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { ReduxPayload } from "../ReducersPayload";
import getRandomAPI03IntanceURL from "@/lib/helpers/functions/getRandomAPI03InstanceURL";
import { ZONA_HORARIA_LOCAL } from "@/constants/ZONA_HORARIA_LOCAL";

// Interfaces para datos de tiempo formateados y utilidades
interface FormatosHora {
  fechaCompleta: string;
  fechaCorta: string;
  horaCompleta: string;
  horaSinSegundos: string;
}

interface UtilidadesTiempo {
  hora: number;
  minutos: number;
  segundos: number;
  esDiaEscolar: boolean;
  esHorarioLaboral: boolean;
}

export interface TiempoRestante {
  total: number;
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  yaVencido: boolean;
  formateado: string;
}

// Interfaz para la fecha y hora actual con datos formateados
interface FechaHoraActualRealState {
  fechaHora: string | null;
  timezone: string;
  lastSync: number;
  error: string | null;
  inicializado: boolean;
  formateada: FormatosHora | null;
  utilidades: UtilidadesTiempo | null;
}

const initialState: FechaHoraActualRealState = {
  fechaHora: null,
  timezone: ZONA_HORARIA_LOCAL,
  lastSync: 0,
  error: null,
  inicializado: false,
  formateada: null,
  utilidades: null,
};

// Thunk para obtener la hora del servidor
export const fetchFechaHoraActual = createAsyncThunk(
  "fechaHoraActualReal/fetch",
  async (timezone: string = ZONA_HORARIA_LOCAL, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${getRandomAPI03IntanceURL()}/api/time?timezone=${timezone}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener la hora del servidor");
      }

      const data = await response.json();

      return {
        fechaHora: data.serverTime,
        timezone: data.timezone,
        lastSync: Date.now(), // Usamos Date.now() solo para marcar cuando ocurrió la sincronización
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
);

// Función auxiliar para calcular tiempo restante
// const calcularTiempoRestante = (
//   fechaActual: Date,
//   fechaObjetivoPeruana: Date
// ): TiempoRestante => {
//   // Calcular diferencia en milisegundos
//   const diffMs = fechaObjetivoPeruana.getTime() - fechaActual.getTime();

//   // Si la fecha ya pasó
//   if (diffMs <= 0) {
//     return {
//       total: 0,
//       dias: 0,
//       horas: 0,
//       minutos: 0,
//       segundos: 0,
//       yaVencido: true,
//       formateado: "Fecha vencida",
//     };
//   }

//   // Convertir a unidades de tiempo
//   const segundos = Math.floor((diffMs / 1000) % 60);
//   const minutos = Math.floor((diffMs / (1000 * 60)) % 60);
//   const horas = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
//   const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

//   // Formato legible
//   let formateado = "";
//   if (dias > 0) formateado += `${dias} día${dias > 1 ? "s" : ""} `;
//   if (horas > 0 || dias > 0)
//     formateado += `${horas} hora${horas > 1 ? "s" : ""} `;
//   if (minutos > 0 || horas > 0 || dias > 0)
//     formateado += `${minutos} minuto${minutos > 1 ? "s" : ""} `;
//   formateado += `${segundos} segundo${segundos > 1 ? "s" : ""}`;

//   return {
//     total: diffMs,
//     dias,
//     horas,
//     minutos,
//     segundos,
//     yaVencido: false,
//     formateado,
//   };
// };

// Función auxiliar para actualizar formatos y utilidades
const actualizarFormatosYUtilidades = (state: FechaHoraActualRealState) => {
  if (!state.fechaHora) {
    state.formateada = null;
    state.utilidades = null;
    return;
  }

  const fechaHoraDate = new Date(state.fechaHora);

  // Actualizar formatos
  state.formateada = {
    fechaCompleta: new Intl.DateTimeFormat("es-PE", {
      timeZone: state.timezone,
      dateStyle: "full",
      timeStyle: "long",
    }).format(fechaHoraDate),

    fechaCorta: new Intl.DateTimeFormat("es-PE", {
      timeZone: state.timezone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(fechaHoraDate),

    horaCompleta: new Intl.DateTimeFormat("es-PE", {
      timeZone: state.timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(fechaHoraDate),

    horaSinSegundos: new Intl.DateTimeFormat("es-PE", {
      timeZone: state.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(fechaHoraDate),
  };

  // Actualizar utilidades
  const hora = fechaHoraDate.getHours();
  const dia = fechaHoraDate.getDay();

  state.utilidades = {
    hora: hora,
    minutos: fechaHoraDate.getMinutes(),
    segundos: fechaHoraDate.getSeconds(),
    esDiaEscolar: dia >= 1 && dia <= 5, // Lunes a Viernes
    esHorarioLaboral: hora >= 7 && hora < 19, // 7am a 7pm
  };

  // Marcar como inicializado
  state.inicializado = true;
};

const fechaHoraActualRealSlice = createSlice({
  name: "fechaHoraActualReal",
  initialState,
  reducers: {
    setFechaHoraActualReal: (
      state,
      action: PayloadAction<ReduxPayload<string | null>>
    ) => {
      state.fechaHora = action.payload.value;
      actualizarFormatosYUtilidades(state);
    },
    updateFechaHoraActual: (state) => {
      if (state.fechaHora) {
        // Parseamos la fecha del servidor
        const fechaActual = new Date(state.fechaHora);
        // Añadimos un segundo
        fechaActual.setSeconds(fechaActual.getSeconds() + 1);
        // Actualizamos el estado
        state.fechaHora = fechaActual.toISOString();
        // Actualizamos formatos y utilidades
        actualizarFormatosYUtilidades(state);
      }
    },
    setTimezone: (state, action: PayloadAction<ReduxPayload<string>>) => {
      state.timezone = action.payload.value;
      // Actualizamos formatos y utilidades con la nueva zona horaria
      actualizarFormatosYUtilidades(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFechaHoraActual.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchFechaHoraActual.fulfilled, (state, action) => {
        state.fechaHora = action.payload.fechaHora;
        state.timezone = action.payload.timezone;
        state.lastSync = action.payload.lastSync;
        state.error = null;
        // Actualizamos formatos y utilidades
        actualizarFormatosYUtilidades(state);
      })
      .addCase(fetchFechaHoraActual.rejected, (state, action) => {
        state.error = (action.payload as string) || "Error desconocido";
      });
  },
});

// Función selectora para obtener tiempo restante hasta una fecha objetivo en hora local peruana
export const tiempoRestanteHasta = (
  state: { fechaHoraActualReal: FechaHoraActualRealState },
  fechaObjetivoPeruana: string | Date
): TiempoRestante | null => {
  if (!state.fechaHoraActualReal.fechaHora) return null;

  const timezone = "America/Lima"; // Zona horaria peruana

  // Convertir la fecha actual del servidor a la hora local peruana
  const fechaActualUTC = new Date(state.fechaHoraActualReal.fechaHora);

  // Obtener la fecha actual en hora local peruana usando la información del formatter
  const fechaActualPeruanaStr = new Intl.DateTimeFormat("es-PE", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(fechaActualUTC);

  // Parsear la fecha local peruana a un objeto Date
  // Formato esperado: "dd/mm/yyyy, hh:mm:ss"
  const [datePart, timePart] = fechaActualPeruanaStr.split(", ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hours, minutes, seconds] = timePart.split(":").map(Number);

  // Crear una fecha en hora local
  const fechaActualPeruana = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    seconds
  );

  // Convertir la fecha objetivo a un objeto Date
  const fechaObjetivoObj =
    typeof fechaObjetivoPeruana === "string"
      ? new Date(fechaObjetivoPeruana)
      : fechaObjetivoPeruana;

  // Calcular diferencia en milisegundos
  const diffMs = fechaObjetivoObj.getTime() - fechaActualPeruana.getTime();

  // Si la fecha ya pasó
  if (diffMs <= 0) {
    return {
      total: 0,
      dias: 0,
      horas: 0,
      minutos: 0,
      segundos: 0,
      yaVencido: true,
      formateado: "Fecha vencida",
    };
  }

  // Convertir a unidades de tiempo
  const segundos = Math.floor((diffMs / 1000) % 60);
  const minutos = Math.floor((diffMs / (1000 * 60)) % 60);
  const horas = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Formato legible
  let formateado = "";
  if (dias > 0) formateado += `${dias} día${dias > 1 ? "s" : ""} `;
  if (horas > 0 || dias > 0)
    formateado += `${horas} hora${horas > 1 ? "s" : ""} `;
  if (minutos > 0 || horas > 0 || dias > 0)
    formateado += `${minutos} minuto${minutos > 1 ? "s" : ""} `;
  formateado += `${segundos} segundo${segundos > 1 ? "s" : ""}`;

  return {
    total: diffMs,
    dias,
    horas,
    minutos,
    segundos,
    yaVencido: false,
    formateado,
  };
};

export const { setFechaHoraActualReal, updateFechaHoraActual, setTimezone } =
  fechaHoraActualRealSlice.actions;
export default fechaHoraActualRealSlice.reducer;

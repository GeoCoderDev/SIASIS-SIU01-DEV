import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { ReduxPayload } from "../ReducersPayload";
import getRandomAPI03IntanceURL from "@/lib/helpers/functions/getRandomAPI03InstanceURL";
import { ZONA_HORARIA_LOCAL } from "@/constants/ZONA_HORARIA_LOCAL";

// Constante para el offset de tiempo (para pruebas)
// Modificar estos valores para cambiar el offset aplicado a la hora del servidor
export const TIME_OFFSET = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  enabled: true, // Habilitar/deshabilitar el offset
};

// Interfaces para datos de tiempo formateados y utilidades
export interface FormatosHora {
  fechaCompleta: string;
  fechaCorta: string;
  horaCompleta: string;
  horaSinSegundos: string;
}

export interface UtilidadesTiempo {
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
export interface FechaHoraActualRealState {
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

      // Crear una fecha usando el timestamp ya ajustado a la zona horaria
      const fechaLocal = new Date(data.serverTime);

      // Aplicamos el offset si está habilitado
      if (TIME_OFFSET.enabled) {
        fechaLocal.setDate(fechaLocal.getDate() + TIME_OFFSET.days);
        fechaLocal.setHours(fechaLocal.getHours() + TIME_OFFSET.hours);
        fechaLocal.setMinutes(fechaLocal.getMinutes() + TIME_OFFSET.minutes);
        fechaLocal.setSeconds(fechaLocal.getSeconds() + TIME_OFFSET.seconds);
      }

      return {
        fechaHora: fechaLocal.toISOString(),
        timezone: data.timezone,
        lastSync: Date.now(),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
);

// Función auxiliar para actualizar formatos y utilidades
const actualizarFormatosYUtilidades = (state: FechaHoraActualRealState) => {
  if (!state.fechaHora) {
    state.formateada = null;
    state.utilidades = null;
    return;
  }

  const fechaHoraDate = new Date(state.fechaHora);

  // No aplicamos transformaciones de zona horaria aquí, ya que la fecha
  // ya viene ajustada desde la API

  // Actualizar formatos sin especificar timeZone para evitar doble ajuste
  state.formateada = {
    fechaCompleta: new Intl.DateTimeFormat("es-PE", {
      dateStyle: "full",
      timeStyle: "long",
    }).format(fechaHoraDate),

    fechaCorta: new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(fechaHoraDate),

    horaCompleta: new Intl.DateTimeFormat("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(fechaHoraDate),

    horaSinSegundos: new Intl.DateTimeFormat("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(fechaHoraDate),
  };

  // Actualizar utilidades directamente de la fecha sin ajustes
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
        // Parseamos la fecha actual
        const fechaActual = new Date(state.fechaHora);

        // Añadimos un segundo para que el tiempo avance
        fechaActual.setSeconds(fechaActual.getSeconds() + 1);

        // Actualizamos el estado con la nueva fecha
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

// Función selectora para obtener tiempo restante hasta una fecha objetivo
export const tiempoRestanteHasta = (
  state: { fechaHoraActualReal: FechaHoraActualRealState },
  fechaObjetivoPeruana: string | Date
): TiempoRestante | null => {
  if (!state.fechaHoraActualReal.fechaHora) return null;

  // Usamos directamente la fecha actual sin transformaciones adicionales de zona horaria
  const fechaActual = new Date(state.fechaHoraActualReal.fechaHora);

  // Convertir la fecha objetivo a un objeto Date
  const fechaObjetivoObj =
    typeof fechaObjetivoPeruana === "string"
      ? new Date(fechaObjetivoPeruana)
      : fechaObjetivoPeruana;

  // Calcular diferencia en milisegundos
  const diffMs = fechaObjetivoObj.getTime() - fechaActual.getTime();

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

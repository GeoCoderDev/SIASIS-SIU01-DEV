import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/global/store";
import { alterarUTCaZonaPeruana } from "@/lib/helpers/alteradores/alterarUTCaZonaPeruana";
import formatearISOaFormato12Horas from "@/lib/helpers/formatters/formatearISOaFormato12Horas";
import { HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS } from "@/constants/HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS";
import { FechaHoraActualRealState } from "@/global/state/others/fechaHoraActualReal";
import { ReduxPayload } from "../ReducersPayload";
import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import { T_Comunicados, T_Eventos } from "@prisma/client";
import {
  AsistenciaHandler,
  isAsistenciaHandler,
} from "@/lib/utils/local/db/models/DatosAsistenciaHoy/handlers/AsistenciaHandlersFactory";
import { tiempoRestanteHasta } from "@/lib/calc/time/tiempoRestanteHasta";
import { HandlerDirectivoAsistenciaResponse } from "../../../lib/utils/local/db/models/DatosAsistenciaHoy/handlers/HandlerDirectivoAsistenciaResponse";

// Interfaces para los datos del sistema de asistencia
export interface HorarioAsistencia {
  inicio: string | null;
  fin: string | null;
}

export type EstadoSistemaType =
  | "disponible"
  | "pendiente"
  | "cerrado"
  | "preparando"
  | "sincronizando"
  | "en_proceso"
  | "cargando"
  | "no_disponible";

export interface EstadoSistema {
  estado: EstadoSistemaType;
  mensaje: string;
  descripcion: string;
  tiempoRestante: string | null;
  botonActivo: boolean;
  colorEstado: string;
  mostrarContadorPersonal: boolean;
  etiquetaPersonal?: string;
  iconoPersonal?: "usuarios" | "verificacion" | "reloj";
  progreso?: number;
  tiempoDisponible?: string;
}

export interface EstadoSistemaAsistenciaState {
  sincronizando: boolean;
  inicioRegistro: boolean;
  datosAsistenciaHoy: AsistenciaHandler | null;
  haySincronizacionDatos: boolean;
  horarioAsistencia: HorarioAsistencia;
  ultimaActualizacion: number; // Timestamp para controlar actualizaciones
  rolActual: RolesSistema; // Para saber qué tipo de handler estamos utilizando
  diaEvento: false | T_Eventos; // Si es un día de evento
  comunicados: T_Comunicados[]; // Comunicados del día
}

// Estado inicial
const initialState: EstadoSistemaAsistenciaState = {
  sincronizando: false,
  inicioRegistro: false,
  datosAsistenciaHoy: null,
  haySincronizacionDatos: false,
  horarioAsistencia: {
    inicio: null,
    fin: null,
  },
  ultimaActualizacion: 0,
  rolActual: RolesSistema.Directivo, // Valor por defecto
  diaEvento: false,
  comunicados: [],
};

// Slice
const estadoSistemaAsistenciaSlice = createSlice({
  name: "estadoSistemaAsistencia",
  initialState,
  reducers: {
    setSincronizando: (state, action: PayloadAction<ReduxPayload<boolean>>) => {
      state.sincronizando = action.payload.value;
      state.ultimaActualizacion = Date.now();
    },
    setInicioRegistro: (
      state,
      action: PayloadAction<ReduxPayload<boolean>>
    ) => {
      state.inicioRegistro = action.payload.value;
      state.ultimaActualizacion = Date.now();
    },
    setDatosAsistenciaHoy: (
      state,
      action: PayloadAction<ReduxPayload<AsistenciaHandler | null>>
    ) => {
      state.datosAsistenciaHoy = action.payload.value;

      // Si tenemos datos, actualizamos los horarios de asistencia según el handler
      if (
        state.datosAsistenciaHoy &&
        isAsistenciaHandler(state.datosAsistenciaHoy)
      ) {
        // Obtenemos el horario general
        const horarioGeneral =
          state.datosAsistenciaHoy.getHorarioTomaAsistenciaGeneral();

        if (horarioGeneral.Inicio) {
          state.horarioAsistencia.inicio = alterarUTCaZonaPeruana(
            String(horarioGeneral.Inicio)
          );
        }

        if (horarioGeneral.Fin) {
          state.horarioAsistencia.fin = alterarUTCaZonaPeruana(
            String(horarioGeneral.Fin)
          );
        }

        // Actualizamos los datos generales comunes a todos los handlers
        state.diaEvento = state.datosAsistenciaHoy.esHoyDiaDeEvento();
        state.comunicados = state.datosAsistenciaHoy.getComunicados();
      }

      state.ultimaActualizacion = Date.now();
    },
    setHaySincronizacionDatos: (
      state,
      action: PayloadAction<ReduxPayload<boolean>>
    ) => {
      state.haySincronizacionDatos = action.payload.value;
      state.ultimaActualizacion = Date.now();
    },
    setRolActual: (
      state,
      action: PayloadAction<ReduxPayload<RolesSistema>>
    ) => {
      state.rolActual = action.payload.value;
      state.ultimaActualizacion = Date.now();
    },
    actualizarEstadoSistema: (state) => {
      // Esta acción solo actualiza el timestamp para forzar un recálculo
      // cuando usemos los selectores memoizados
      state.ultimaActualizacion = Date.now();
    },
    resetearEstado: (state) => {
      state.sincronizando = false;
      state.inicioRegistro = false;
      state.datosAsistenciaHoy = null;
      state.haySincronizacionDatos = false;
      state.horarioAsistencia = {
        inicio: null,
        fin: null,
      };
      state.diaEvento = false;
      state.comunicados = [];
      // Mantenemos el rol actual
      state.ultimaActualizacion = Date.now();
    },
  },
});

// Selector básico para obtener el estado completo
export const selectEstadoSistemaAsistencia = (state: RootState) =>
  state.asistencia.estadoSistemaAsistencia;

// Selector para obtener datos del horario
export const selectHorarioAsistencia = createSelector(
  [selectEstadoSistemaAsistencia],
  (estadoSistema) => estadoSistema.horarioAsistencia
);

// Selector para verificar si hay datos de asistencia
export const selectHayDatosAsistencia = createSelector(
  [selectEstadoSistemaAsistencia],
  (estadoSistema) => !!estadoSistema.datosAsistenciaHoy
);

// Selector para verificar si se está sincronizando
export const selectSincronizando = createSelector(
  [selectEstadoSistemaAsistencia],
  (estadoSistema) => estadoSistema.sincronizando
);

// Selector para verificar si se ha iniciado el registro
export const selectInicioRegistro = createSelector(
  [selectEstadoSistemaAsistencia],
  (estadoSistema) => estadoSistema.inicioRegistro
);

// Selector para obtener el rol actual
export const selectRolActual = createSelector(
  [selectEstadoSistemaAsistencia],
  (estadoSistema) => estadoSistema.rolActual
);

// Selector para obtener los comunicados
export const selectComunicados = createSelector(
  [selectEstadoSistemaAsistencia],
  (estadoSistema) => estadoSistema.comunicados
);

// Selector para verificar si es día de evento
export const selectEsDiaEvento = createSelector(
  [selectEstadoSistemaAsistencia],
  (estadoSistema) => estadoSistema.diaEvento
);

// Selector para obtener el total de personal según el rol
export const selectTotalPersonal = createSelector(
  [selectEstadoSistemaAsistencia],
  (estadoSistema) => {
    if (
      !estadoSistema.datosAsistenciaHoy ||
      !isAsistenciaHandler(estadoSistema.datosAsistenciaHoy)
    ) {
      return 0;
    }

    // Para el Directivo, tenemos métodos específicos para obtener conteos
    if (estadoSistema.rolActual === RolesSistema.Directivo) {
      const handler =
        estadoSistema.datosAsistenciaHoy as HandlerDirectivoAsistenciaResponse;
      // Verificamos que tenga los métodos esperados para un handler de Directivo
      if (
        typeof handler.getTotalPersonalAdministrativo === "function" &&
        typeof handler.getTotalProfesoresPrimaria === "function" &&
        typeof handler.getTotalProfesoresSecundaria === "function"
      ) {
        return (
          handler.getTotalPersonalAdministrativo() +
          handler.getTotalProfesoresPrimaria() +
          handler.getTotalProfesoresSecundaria()
        );
      }
    }

    // Para otros roles, no tenemos una forma estandarizada de contabilizar personal
    // Se podría implementar dependiendo de los requisitos específicos

    return 0;
  }
);

// Selector para obtener los tiempos restantes relevantes
export const selectTiemposRestantes = createSelector(
  [
    selectEstadoSistemaAsistencia,
    (state: RootState) => state.others.fechaHoraActualReal,
  ],
  (estadoSistema, fechaHoraActual) => {
    if (
      !estadoSistema.horarioAsistencia.inicio ||
      !estadoSistema.horarioAsistencia.fin ||
      !fechaHoraActual.fechaHora
    ) {
      return {
        tiempoRestanteInicio: null,
        tiempoRestanteFin: null,
      };
    }

    const tiempoRestanteInicio = tiempoRestanteHasta(
      { fechaHoraActualReal: fechaHoraActual },
      new Date(estadoSistema.horarioAsistencia.inicio)
    );

    const tiempoRestanteFin = tiempoRestanteHasta(
      { fechaHoraActualReal: fechaHoraActual },
      new Date(estadoSistema.horarioAsistencia.fin)
    );

    return {
      tiempoRestanteInicio,
      tiempoRestanteFin,
    };
  }
);

// Función para determinar si las clases ya acabaron por hoy
const determinarAsistenciaCerrada = (
  fechaHoraActualReal: FechaHoraActualRealState,
  horarioCierre: string | null
): boolean => {
  if (!fechaHoraActualReal.utilidades || !horarioCierre) {
    return false;
  }

  const horaActual = fechaHoraActualReal.utilidades.hora;
  const minutosActual = fechaHoraActualReal.utilidades.minutos;

  const fechaCierre = new Date(horarioCierre);
  const horaCierre = fechaCierre.getHours();
  const minutosCierre = fechaCierre.getMinutes();

  return (
    horaActual > horaCierre ||
    (horaActual === horaCierre && minutosActual >= minutosCierre)
  );
};

// Selector principal para calcular el estado del sistema
export const selectEstadoSistema = createSelector(
  [
    selectEstadoSistemaAsistencia,
    (state: RootState) => state.others.fechaHoraActualReal,
    selectTiemposRestantes,
    selectEsDiaEvento,
  ],
  (
    estadoSistema,
    fechaHoraActual,
    tiemposRestantes,
    esDiaEvento
  ): EstadoSistema => {
    // Si es un día de evento, mostramos un estado especial
    if (esDiaEvento !== false) {
      return {
        estado: "no_disponible",
        mensaje: "Día de evento escolar",
        descripcion: `Hoy es ${
          esDiaEvento.Nombre || "día de evento"
        }, no se requiere tomar asistencia.`,
        tiempoRestante: null,
        botonActivo: false,
        colorEstado: "bg-purple-100",
        mostrarContadorPersonal: false,
      };
    }

    // Si estamos en proceso de registro, permanecemos en ese estado
    if (estadoSistema.inicioRegistro) {
      return {
        estado: "en_proceso",
        mensaje: "Registro en proceso",
        descripcion: "El registro de asistencia está siendo procesado.",
        tiempoRestante: tiemposRestantes.tiempoRestanteFin?.formateado || null,
        botonActivo: false,
        colorEstado: "bg-green-100",
        mostrarContadorPersonal: true,
        etiquetaPersonal: "Personal pendiente",
        iconoPersonal: "reloj",
        tiempoDisponible: tiemposRestantes.tiempoRestanteFin?.formateado,
      };
    }

    // Si estamos sincronizando
    if (estadoSistema.sincronizando) {
      return {
        estado: "sincronizando",
        mensaje: "Sincronizando sistema...",
        descripcion:
          "Actualizando la información del sistema para la jornada actual",
        tiempoRestante: null,
        botonActivo: false,
        colorEstado: "bg-blue-100",
        mostrarContadorPersonal: false,
      };
    }

    // Si no tenemos datos aún o no tenemos fecha/hora actual
    if (
      !estadoSistema.datosAsistenciaHoy ||
      !isAsistenciaHandler(estadoSistema.datosAsistenciaHoy) ||
      !estadoSistema.horarioAsistencia.inicio ||
      !estadoSistema.horarioAsistencia.fin ||
      !fechaHoraActual.fechaHora ||
      !fechaHoraActual.utilidades
    ) {
      return {
        estado: "cargando",
        mensaje: "Cargando información...",
        descripcion: "Obteniendo la información necesaria...",
        tiempoRestante: null,
        botonActivo: false,
        colorEstado: "bg-gray-100",
        mostrarContadorPersonal: false,
      };
    }

    // Si no es día escolar (es fin de semana)
    if (fechaHoraActual.utilidades.esFinDeSemana) {
      return {
        estado: "no_disponible",
        mensaje: "No hay clases hoy",
        descripcion: "Hoy es fin de semana, no se requiere tomar asistencia.",
        tiempoRestante: null,
        botonActivo: false,
        colorEstado: "bg-gray-100",
        mostrarContadorPersonal: false,
      };
    }

    // Verificamos si la fecha de datos de asistencia es de un día anterior
    const fechaActual = new Date(fechaHoraActual.fechaHora);

    // Obtenemos la fecha local de Perú del handler
    const fechaDatosAsistencia =
      estadoSistema.datosAsistenciaHoy.getFechaLocalPeru();

    const esNuevoDia = fechaDatosAsistencia.getDate() !== fechaActual.getDate();

    // Caso: Estamos en un nuevo día pero aún no es hora de sincronizar datos
    if (esNuevoDia && !estadoSistema.haySincronizacionDatos) {
      return {
        estado: "preparando",
        mensaje: "Datos pendientes de actualización",
        descripcion: `Se actualizará la información para ${fechaHoraActual.utilidades.diaSemana} ${fechaHoraActual.utilidades.diaMes} a partir de las ${HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS}:00.`,
        tiempoRestante: null,
        botonActivo: false,
        colorEstado: "bg-blue-50",
        mostrarContadorPersonal: false,
      };
    }

    // Si aún no es tiempo de iniciar la asistencia
    if (
      tiemposRestantes.tiempoRestanteInicio &&
      !tiemposRestantes.tiempoRestanteInicio.yaVencido
    ) {
      return {
        estado: "pendiente",
        mensaje: "En espera para iniciar",
        descripcion: `El registro de asistencia estará disponible en ${tiemposRestantes.tiempoRestanteInicio.formateado}.`,
        tiempoRestante: tiemposRestantes.tiempoRestanteInicio.formateado,
        botonActivo: false,
        colorEstado: "bg-orange-50",
        progreso: Math.floor(
          (tiemposRestantes.tiempoRestanteInicio.total / 3600000) * 100
        ),
        mostrarContadorPersonal: true,
        etiquetaPersonal:
          estadoSistema.rolActual === RolesSistema.Directivo
            ? "Personal por registrar"
            : "Registros pendientes",
        iconoPersonal: "usuarios",
      };
    }

    // Verificamos si ya pasó la hora de cierre de asistencia
    const asistenciaCerrada = determinarAsistenciaCerrada(
      fechaHoraActual,
      estadoSistema.horarioAsistencia.fin
    );

    if (asistenciaCerrada) {
      return {
        estado: "cerrado",
        mensaje: "Registro de asistencia cerrado",
        descripcion: estadoSistema.horarioAsistencia.fin
          ? `El período de registro finalizó a las ${formatearISOaFormato12Horas(
              estadoSistema.horarioAsistencia.fin
            )}`
          : "El período de registro ha finalizado para el día de hoy",
        tiempoRestante: null,
        botonActivo: false,
        colorEstado: "bg-red-50",
        mostrarContadorPersonal: true,
        etiquetaPersonal:
          estadoSistema.rolActual === RolesSistema.Directivo
            ? "Asistencias registradas"
            : "Registros completados",
        iconoPersonal: "verificacion",
      };
    }

    // Si estamos en horario válido para tomar asistencia
    return {
      estado: "disponible",
      mensaje: "Sistema listo para registro",
      descripcion: estadoSistema.horarioAsistencia.fin
        ? `El registro estará disponible hasta las ${formatearISOaFormato12Horas(
            estadoSistema.horarioAsistencia.fin
          )}`
        : "El sistema está listo para registrar asistencia",
      tiempoRestante: tiemposRestantes.tiempoRestanteFin?.formateado || null,
      botonActivo: true,
      colorEstado: "bg-green-50",
      mostrarContadorPersonal: true,
      etiquetaPersonal:
        estadoSistema.rolActual === RolesSistema.Directivo
          ? "Personal pendiente"
          : "Registros pendientes",
      iconoPersonal: "reloj",
      tiempoDisponible: tiemposRestantes.tiempoRestanteFin?.formateado,
    };
  }
);

// Exportar acciones y reducer
export const {
  setSincronizando,
  setInicioRegistro,
  setDatosAsistenciaHoy,
  setHaySincronizacionDatos,
  setRolActual,
  actualizarEstadoSistema,
  resetearEstado,
} = estadoSistemaAsistenciaSlice.actions;

export default estadoSistemaAsistenciaSlice.reducer;

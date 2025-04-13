// // ===== MODIFICACIONES AL SLICE DE REDUX =====

// import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
// import type{ RootState } from "@/global/store";
// import { alterarUTCaZonaPeruana } from "@/lib/helpers/alteradores/alterarUTCaZonaPeruana";
// import formatearISOaFormato12Horas from "@/lib/helpers/formatters/formatearISOaFormato12Horas";
// import { HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS } from "@/constants/HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS";
// import { FechaHoraActualRealState } from "@/global/state/others/fechaHoraActualReal";
// import { ReduxPayload } from "../ReducersPayload";
// import { RolesSistema } from "@/interfaces/shared/RolesSistema";
// import { T_Comunicados, T_Eventos } from "@prisma/client";
// import { tiempoRestanteHasta } from "@/lib/calc/time/tiempoRestanteHasta";
// import { NivelEducativo } from "@/interfaces/shared/NivelEducativo";

// // Interfaces para los datos del sistema de asistencia
// export interface HorarioAsistencia {
//   inicio: string | null;
//   fin: string | null;
// }

// export type EstadoSistemaType =
//   | "disponible" // Sistema listo para registrar asistencia
//   | "pendiente" // Esperando que se abra el período de asistencia
//   | "cerrado" // El período de asistencia ya cerró para hoy
//   | "preparando" // Preparando datos (antes de hora de sincronización)
//   | "sincronizando" // Obteniendo datos
//   | "en_proceso" // Realizando registro de asistencia
//   | "cargando" // Cargando sistema/datos
//   | "fin_de_semana" // Día no laboral (sábado/domingo)
//   | "fuera_horario" // Horario no laboral (ej: noche de día laboral)
//   | "dia_evento"; // Día de evento/feriado

// // Colores para cada estado del sistema (no hay cambios)
// export const coloresEstado: Record<EstadoSistemaType, string> = {
//   disponible: "bg-green-50",
//   pendiente: "bg-orange-50",
//   cerrado: "bg-red-50",
//   preparando: "bg-blue-50",
//   sincronizando: "bg-blue-100",
//   en_proceso: "bg-green-100",
//   cargando: "bg-gray-100",
//   fin_de_semana: "bg-purple-50",
//   fuera_horario: "bg-gray-50",
//   dia_evento: "bg-yellow-50",
// };

// // Colores para los encabezados según estado (no hay cambios)
// export const coloresEncabezado: Record<EstadoSistemaType, string> = {
//   disponible: "bg-verde-principal text-white",
//   pendiente: "bg-naranja-principal text-white",
//   cerrado: "bg-rojo-oscuro text-white",
//   preparando: "bg-azul-principal text-white",
//   sincronizando: "bg-azul-principal text-white",
//   en_proceso: "bg-verde-principal text-white",
//   cargando: "bg-gris-oscuro text-white",
//   fin_de_semana: "bg-violeta-principal text-white",
//   fuera_horario: "bg-gris-oscuro text-white",
//   dia_evento: "bg-amarillo-ediciones text-gray-800",
// };

// // Colores para iconos según estado (no hay cambios)
// export const coloresIcono: Record<EstadoSistemaType, string> = {
//   disponible: "text-blue-500",
//   pendiente: "text-orange-500",
//   cerrado: "text-red-500",
//   preparando: "text-indigo-500",
//   sincronizando: "text-indigo-500",
//   en_proceso: "text-emerald-500",
//   cargando: "text-gray-500",
//   fin_de_semana: "text-purple-500",
//   fuera_horario: "text-gray-500",
//   dia_evento: "text-yellow-600",
// };

// // Colores para cuadros de información (no hay cambios)
// export const coloresMensaje: Record<EstadoSistemaType, string> = {
//   disponible: "bg-blue-50 text-blue-800 border-l-4 border-blue-500",
//   pendiente: "bg-orange-50 text-orange-800 border-l-4 border-orange-500",
//   cerrado: "bg-red-50 text-red-800 border-l-4 border-red-500",
//   preparando: "bg-indigo-50 text-indigo-800 border-l-4 border-indigo-500",
//   sincronizando: "bg-indigo-50 text-indigo-800 border-l-4 border-indigo-500",
//   en_proceso: "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500",
//   cargando: "bg-gray-50 text-gray-800 border-l-4 border-gray-500",
//   fin_de_semana: "bg-purple-50 text-purple-800 border-l-4 border-purple-500",
//   fuera_horario: "bg-gray-50 text-gray-800 border-l-4 border-gray-500",
//   dia_evento: "bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500",
// };

// export type TipoIconoPersonal = "usuarios" | "verificacion" | "reloj";

// export interface EstadoSistema {
//   estado: EstadoSistemaType;
//   mensaje: string;
//   descripcion: string;
//   tiempoRestante: string | null;
//   botonActivo: boolean;
//   colorEstado: string;
//   colorEncabezado: string;
//   colorIcono: string;
//   colorMensaje: string;
//   mostrarContadorPersonal: boolean;
//   etiquetaPersonal?: string;
//   iconoPersonal?: TipoIconoPersonal;
//   progreso?: number;
//   tiempoDisponible?: string;
//   esFinDeSemana?: boolean;
//   esDiaEvento?: boolean;
//   esFueraHorario?: boolean;
// }

// // Modificamos la interfaz del estado para almacenar datos serializados
// export interface EstadoSistemaAsistenciaState {
//   sincronizando: boolean;
//   inicioRegistro: boolean;
//   datosAsistenciaHoy: any; // Aquí guardaremos los datos serializados (objeto plano)
//   haySincronizacionDatos: boolean;
//   horarioAsistencia: HorarioAsistencia;
//   ultimaActualizacion: number;
//   rolActual: RolesSistema;
//   diaEvento: false | T_Eventos;
//   comunicados: T_Comunicados[];
// }

// // Estado inicial (sin cambios)
// const initialState: EstadoSistemaAsistenciaState = {
//   sincronizando: false,
//   inicioRegistro: false,
//   datosAsistenciaHoy: null,
//   haySincronizacionDatos: false,
//   horarioAsistencia: {
//     inicio: null,
//     fin: null,
//   },
//   ultimaActualizacion: 0,
//   rolActual: RolesSistema.Directivo, // Valor por defecto
//   diaEvento: false,
//   comunicados: [],
// };

// /**
//  * Función auxiliar para serializar fechas en objetos complejos
//  * Convierte cualquier objeto de tipo Date a string ISO
//  */
// function serializarObjeto(obj: any): any {
//   if (!obj) return obj;
  
//   // Si es una fecha, convertir a string
//   if (obj instanceof Date) {
//     return obj.toISOString();
//   }
  
//   // Si es un array, serializar cada elemento
//   if (Array.isArray(obj)) {
//     return obj.map(item => serializarObjeto(item));
//   }
  
//   // Si es un objeto, serializar cada propiedad
//   if (typeof obj === 'object') {
//     const resultado: any = {};
//     for (const key in obj) {
//       // Saltarse métodos y propiedades del prototipo
//       if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] !== 'function') {
//         resultado[key] = serializarObjeto(obj[key]);
//       }
//     }
//     return resultado;
//   }
  
//   // Cualquier otro tipo se devuelve sin cambios
//   return obj;
// }

// // Slice de Redux
// const estadoSistemaAsistenciaSlice = createSlice({
//   name: "estadoSistemaAsistencia",
//   initialState,
//   reducers: {
//     setSincronizando: (state, action: PayloadAction<ReduxPayload<boolean>>) => {
//       state.sincronizando = action.payload.value;
//       state.ultimaActualizacion = Date.now();
//     },
//     setInicioRegistro: (
//       state,
//       action: PayloadAction<ReduxPayload<boolean>>
//     ) => {
//       state.inicioRegistro = action.payload.value;
//       state.ultimaActualizacion = Date.now();
//     },
//     setDatosAsistenciaHoy: (
//       state,
//       action: PayloadAction<ReduxPayload<any>>
//     ) => {
//       // Obtenemos el handler pero no lo guardamos directamente
//       const handler = action.payload.value;
      
//       if (handler) {
//         try {
//           // En lugar de usar métodos específicos del handler, verificamos y usamos propiedades genéricas
//           // Esto evita importaciones circulares
          
//           // Extraer datos del horario general
//           let horarioGeneral = null;
//           if (typeof handler.getHorarioTomaAsistenciaGeneral === 'function') {
//             horarioGeneral = handler.getHorarioTomaAsistenciaGeneral();
//           } else if (handler.data && handler.data.HorariosLaboraresGenerales && handler.data.HorariosLaboraresGenerales.TomaAsistenciaRangoTotalPersonales) {
//             horarioGeneral = handler.data.HorariosLaboraresGenerales.TomaAsistenciaRangoTotalPersonales;
//           }
          
//           if (horarioGeneral && horarioGeneral.Inicio) {
//             state.horarioAsistencia.inicio = alterarUTCaZonaPeruana(
//               String(horarioGeneral.Inicio)
//             );
//           }

//           if (horarioGeneral && horarioGeneral.Fin) {
//             state.horarioAsistencia.fin = alterarUTCaZonaPeruana(
//               String(horarioGeneral.Fin)
//             );
//           }

//           // Extraer datos comunes (día evento, comunicados)
//           if (typeof handler.esHoyDiaDeEvento === 'function') {
//             state.diaEvento = handler.esHoyDiaDeEvento();
//           } else if (handler.data && handler.data.DiaEvento) {
//             state.diaEvento = handler.data.DiaEvento;
//           }
          
//           if (typeof handler.getComunicados === 'function') {
//             state.comunicados = handler.getComunicados();
//           } else if (handler.data && handler.data.ComunicadosParaMostrarHoy) {
//             state.comunicados = handler.data.ComunicadosParaMostrarHoy;
//           }
          
//           // Para almacenar los datos completos, serializamos el objeto data del handler
//           // o el objeto handler completo si no tiene data
//           if (handler.data) {
//             // Crear una copia serializada de los datos (convirtiendo fechas a strings)
//             state.datosAsistenciaHoy = serializarObjeto(handler.data);
//           } else {
//             // Si no hay data, serializamos todo el objeto handler pero sin métodos
//             const serializableHandler = {};
//             for (const key in handler) {
//               if (Object.prototype.hasOwnProperty.call(handler, key) && typeof handler[key] !== 'function') {
//                 serializableHandler[key] = handler[key];
//               }
//             }
//             state.datosAsistenciaHoy = serializarObjeto(serializableHandler);
//           }
//         } catch (error) {
//           console.error("Error al procesar datos del handler:", error);
//           state.datosAsistenciaHoy = null;
//         }
//       } else {
//         state.datosAsistenciaHoy = null;
//       }

//       // Actualizar timestamp
//       state.ultimaActualizacion = Date.now();
//     },
//     setHaySincronizacionDatos: (
//       state,
//       action: PayloadAction<ReduxPayload<boolean>>
//     ) => {
//       state.haySincronizacionDatos = action.payload.value;
//       state.ultimaActualizacion = Date.now();
//     },
//     setRolActual: (
//       state,
//       action: PayloadAction<ReduxPayload<RolesSistema>>
//     ) => {
//       state.rolActual = action.payload.value;
//       state.ultimaActualizacion = Date.now();
//     },
//     actualizarEstadoSistema: (state) => {
//       // Esta acción solo actualiza el timestamp para forzar un recálculo
//       // cuando usemos los selectores memoizados
//       state.ultimaActualizacion = Date.now();
//     },
//     resetearEstado: (state) => {
//       state.sincronizando = false;
//       state.inicioRegistro = false;
//       state.datosAsistenciaHoy = null;
//       state.haySincronizacionDatos = false;
//       state.horarioAsistencia = {
//         inicio: null,
//         fin: null,
//       };
//       state.diaEvento = false;
//       state.comunicados = [];
//       // Mantenemos el rol actual
//       state.ultimaActualizacion = Date.now();
//     },
//   },
// });

// // Selectores (la mayoría sin cambios)
// export const selectEstadoSistemaAsistencia = (state: RootState) =>
//   state.asistencia.estadoSistemaAsistencia;

// export const selectHorarioAsistencia = createSelector(
//   [selectEstadoSistemaAsistencia],
//   (estadoSistema) => estadoSistema.horarioAsistencia
// );

// export const selectHayDatosAsistencia = createSelector(
//   [selectEstadoSistemaAsistencia],
//   (estadoSistema) => !!estadoSistema.datosAsistenciaHoy
// );

// export const selectSincronizando = createSelector(
//   [selectEstadoSistemaAsistencia],
//   (estadoSistema) => estadoSistema.sincronizando
// );

// export const selectInicioRegistro = createSelector(
//   [selectEstadoSistemaAsistencia],
//   (estadoSistema) => estadoSistema.inicioRegistro
// );

// export const selectRolActual = createSelector(
//   [selectEstadoSistemaAsistencia],
//   (estadoSistema) => estadoSistema.rolActual
// );

// export const selectComunicados = createSelector(
//   [selectEstadoSistemaAsistencia],
//   (estadoSistema) => estadoSistema.comunicados
// );

// export const selectEsDiaEvento = createSelector(
//   [selectEstadoSistemaAsistencia],
//   (estadoSistema) => estadoSistema.diaEvento
// );

// // Selector modificado para trabajar con datos serializados
// export const selectTotalPersonal = createSelector(
//   [selectEstadoSistemaAsistencia],
//   (estadoSistema) => {
//     if (!estadoSistema.datosAsistenciaHoy) {
//       return 0;
//     }

//     if (estadoSistema.rolActual === RolesSistema.Directivo) {
//       // Accedemos directamente a las listas serializadas
//       const listaPersonalAdmin = estadoSistema.datosAsistenciaHoy.ListaDePersonalesAdministrativos || [];
//       const listaProfesoresPrimaria = estadoSistema.datosAsistenciaHoy.ListaDeProfesoresPrimaria || [];
//       const listaProfesoresSecundaria = estadoSistema.datosAsistenciaHoy.ListaDeProfesoresSecundaria || [];
      
//       return listaPersonalAdmin.length + listaProfesoresPrimaria.length + listaProfesoresSecundaria.length;
//     }

//     return 0;
//   }
// );

// // Función para parsear fechas ISO a objetos Date
// const fechaFromISO = (isoString: string | null): Date | null => {
//   if (!isoString) return null;
//   try {
//     return new Date(isoString);
//   } catch (e) {
//     console.error("Error convirtiendo fecha ISO:", e);
//     return null;
//   }
// };

// // Selector para tiempos restantes (sin cambios significativos)
// export const selectTiemposRestantes = createSelector(
//   [
//     selectEstadoSistemaAsistencia,
//     (state: RootState) => state.others.fechaHoraActualReal,
//   ],
//   (estadoSistema, fechaHoraActual) => {
//     if (
//       !estadoSistema.horarioAsistencia.inicio ||
//       !estadoSistema.horarioAsistencia.fin ||
//       !fechaHoraActual.fechaHora
//     ) {
//       return {
//         tiempoRestanteInicio: null,
//         tiempoRestanteFin: null,
//       };
//     }

//     const tiempoRestanteInicio = tiempoRestanteHasta(
//       { fechaHoraActualReal: fechaHoraActual },
//       new Date(estadoSistema.horarioAsistencia.inicio)
//     );

//     const tiempoRestanteFin = tiempoRestanteHasta(
//       { fechaHoraActualReal: fechaHoraActual },
//       new Date(estadoSistema.horarioAsistencia.fin)
//     );

//     return {
//       tiempoRestanteInicio,
//       tiempoRestanteFin,
//     };
//   }
// );

// // Funciones auxiliares (sin cambios)
// const determinarAsistenciaCerrada = (
//   fechaHoraActualReal: FechaHoraActualRealState,
//   horarioCierre: string | null
// ): boolean => {
//   if (!fechaHoraActualReal.utilidades || !horarioCierre) {
//     return false;
//   }

//   const horaActual = fechaHoraActualReal.utilidades.hora;
//   const minutosActual = fechaHoraActualReal.utilidades.minutos;

//   const fechaCierre = new Date(horarioCierre);
//   const horaCierre = fechaCierre.getHours();
//   const minutosCierre = fechaCierre.getMinutes();

//   return (
//     horaActual > horaCierre ||
//     (horaActual === horaCierre && minutosActual >= minutosCierre)
//   );
// };

// const esFueraHorarioLaboral = (
//   fechaHoraActualReal: FechaHoraActualRealState
// ): boolean => {
//   if (!fechaHoraActualReal.utilidades) return false;

//   const hora = fechaHoraActualReal.utilidades.hora;

//   // Consideramos horario no laboral desde las 20:00 hasta las 06:00
//   return hora >= 20 || hora < 6;
// };

// // Selector principal para calcular el estado del sistema
// // Modificado para usar fechaLocalPeru como string serializado
// export const selectEstadoSistema = createSelector(
//   [
//     selectEstadoSistemaAsistencia,
//     (state: RootState) => state.others.fechaHoraActualReal,
//     selectTiemposRestantes,
//     selectEsDiaEvento,
//   ],
//   (
//     estadoSistema,
//     fechaHoraActual,
//     tiemposRestantes,
//     esDiaEvento
//   ): EstadoSistema => {
//     // Valores por defecto para estados base
//     let estadoBase: EstadoSistemaType = "cargando";
//     let mensaje = "Cargando información...";
//     let descripcion = "Obteniendo la información necesaria...";
//     let botonActivo = false;
//     let mostrarContadorPersonal = false;
//     let etiquetaPersonal = undefined;
//     let iconoPersonal: TipoIconoPersonal | undefined = undefined;
//     let tiempoRestante = null;
//     let tiempoDisponible = undefined;
//     let progreso = undefined;

//     // Si es un día de evento, mostramos un estado especial
//     if (esDiaEvento !== false) {
//       estadoBase = "dia_evento";
//       mensaje = "Día de evento escolar";
//       descripcion = `Hoy es ${
//         esDiaEvento.Nombre || "día de evento"
//       }, no se requiere tomar asistencia.`;
//       mostrarContadorPersonal = false;
//       botonActivo = false;
//     }
//     // Si estamos en proceso de registro, permanecemos en ese estado
//     else if (estadoSistema.inicioRegistro) {
//       estadoBase = "en_proceso";
//       mensaje = "Registro en proceso";
//       descripcion = "El registro de asistencia está siendo procesado.";
//       tiempoRestante = tiemposRestantes.tiempoRestanteFin?.formateado || null;
//       botonActivo = false;
//       mostrarContadorPersonal = true;
//       etiquetaPersonal = "Personal pendiente";
//       iconoPersonal = "reloj";
//       tiempoDisponible = tiemposRestantes.tiempoRestanteFin?.formateado;
//     }
//     // Si estamos sincronizando
//     else if (estadoSistema.sincronizando) {
//       estadoBase = "sincronizando";
//       mensaje = "Sincronizando sistema...";
//       descripcion =
//         "Actualizando la información del sistema para la jornada actual";
//       botonActivo = false;
//       mostrarContadorPersonal = false;
//     }
//     // Si no tenemos datos aún o no tenemos fecha/hora actual
//     else if (
//       !estadoSistema.datosAsistenciaHoy ||
//       !estadoSistema.horarioAsistencia.inicio ||
//       !estadoSistema.horarioAsistencia.fin ||
//       !fechaHoraActual.fechaHora ||
//       !fechaHoraActual.utilidades
//     ) {
//       estadoBase = "cargando";
//       mensaje = "Cargando información...";
//       descripcion = "Obteniendo la información necesaria...";
//       botonActivo = false;
//       mostrarContadorPersonal = false;
//     }
//     // Si no es día escolar (es fin de semana)
//     else if (fechaHoraActual.utilidades.esFinDeSemana) {
//       const diaSemana = fechaHoraActual.utilidades.diaSemana;
//       estadoBase = "fin_de_semana";
//       mensaje = `Hoy es ${diaSemana}, no hay clases`;
//       descripcion =
//         "No se requiere tomar asistencia durante los fines de semana. El sistema retomará su funcionamiento normal el próximo día hábil.";
//       botonActivo = false;
//       mostrarContadorPersonal = false;
//     }
//     // Verificar si estamos en horario no laboral (noche o madrugada)
//     else if (esFueraHorarioLaboral(fechaHoraActual)) {
//       const hora = fechaHoraActual.utilidades.hora;
//       estadoBase = "fuera_horario";

//       if (hora >= 20) {
//         mensaje = "Fuera de horario laboral";
//         descripcion =
//           "El sistema de asistencia solo está disponible durante el horario escolar. El próximo período de registro comenzará mañana.";
//       } else {
//         mensaje = "Horario previo a jornada escolar";
//         descripcion =
//           "El sistema de asistencia aún no está disponible. El registro comenzará más tarde durante la jornada escolar.";
//       }

//       botonActivo = false;
//       mostrarContadorPersonal = false;
//     } else {
//       // Verificamos si la fecha de datos de asistencia es de un día anterior
//       const fechaActual = new Date(fechaHoraActual.fechaHora);
      
//       // Obtenemos la fecha local de Perú serializada y la convertimos a Date
//       const fechaLocalPeruStr = estadoSistema.datosAsistenciaHoy?.FechaLocalPeru;
//       const fechaDatosAsistencia = fechaLocalPeruStr ? new Date(fechaLocalPeruStr) : null;

//       const esNuevoDia = fechaDatosAsistencia && 
//         fechaDatosAsistencia.getDate() !== fechaActual.getDate();

//       // Caso: Estamos en un nuevo día pero aún no es hora de sincronizar datos
//       if (esNuevoDia && !estadoSistema.haySincronizacionDatos) {
//         estadoBase = "preparando";
//         mensaje = "Datos pendientes de actualización";
//         descripcion = `Se actualizará la información para ${fechaHoraActual.utilidades.diaSemana} ${fechaHoraActual.utilidades.diaMes} a partir de las ${HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS}:00.`;
//         botonActivo = false;
//         mostrarContadorPersonal = false;
//       }
//       // Si aún no es tiempo de iniciar la asistencia
//       else if (
//         tiemposRestantes.tiempoRestanteInicio &&
//         !tiemposRestantes.tiempoRestanteInicio.yaVencido
//       ) {
//         estadoBase = "pendiente";
//         mensaje = "En espera para iniciar";
//         descripcion = `El registro de asistencia estará disponible en ${tiemposRestantes.tiempoRestanteInicio.formateado}.`;
//         tiempoRestante = tiemposRestantes.tiempoRestanteInicio.formateado;
//         botonActivo = false;
//         progreso = Math.floor(
//           (tiemposRestantes.tiempoRestanteInicio.total / 3600000) * 100
//         );
//         mostrarContadorPersonal = true;
//         etiquetaPersonal =
//           estadoSistema.rolActual === RolesSistema.Directivo
//             ? "Personal por registrar"
//             : "Registros pendientes";
//         iconoPersonal = "usuarios";
//       }
//       // Verificamos si ya pasó la hora de cierre de asistencia
//       else if (
//         determinarAsistenciaCerrada(
//           fechaHoraActual,
//           estadoSistema.horarioAsistencia.fin
//         )
//       ) {
//         estadoBase = "cerrado";
//         mensaje = "Registro de asistencia cerrado";
//         descripcion = estadoSistema.horarioAsistencia.fin
//           ? `El período de registro finalizó a las ${formatearISOaFormato12Horas(
//               estadoSistema.horarioAsistencia.fin
//             )}`
//           : "El período de registro ha finalizado para el día de hoy";
//         botonActivo = false;
//         mostrarContadorPersonal = true;
//         etiquetaPersonal =
//           estadoSistema.rolActual === RolesSistema.Directivo
//             ? "Asistencias registradas"
//             : "Registros completados";
//         iconoPersonal = "verificacion";
//       }
//       // Si estamos en horario válido para tomar asistencia
//       else {
//         estadoBase = "disponible";
//         mensaje = "Sistema listo para registro";
//         descripcion = estadoSistema.horarioAsistencia.fin
//           ? `El registro estará disponible hasta las ${formatearISOaFormato12Horas(
//               estadoSistema.horarioAsistencia.fin
//             )}`
//           : "El sistema está listo para registrar asistencia";
//         tiempoRestante = tiemposRestantes.tiempoRestanteFin?.formateado || null;
//         botonActivo = true;
//         mostrarContadorPersonal = true;
//         etiquetaPersonal =
//           estadoSistema.rolActual === RolesSistema.Directivo
//             ? "Personal pendiente"
//             : "Registros pendientes";
//         iconoPersonal = "reloj";
//         tiempoDisponible = tiemposRestantes.tiempoRestanteFin?.formateado;
//       }
//     }

//     // Construimos el objeto de estado completo
//     return {
//       estado: estadoBase,
//       mensaje,
//       descripcion,
//       tiempoRestante,
//       botonActivo,
//       colorEstado: coloresEstado[estadoBase],
//       colorEncabezado: coloresEncabezado[estadoBase],
//       colorIcono: coloresIcono[estadoBase],
//       colorMensaje: coloresMensaje[estadoBase],
//       mostrarContadorPersonal,
//       etiquetaPersonal,
//       iconoPersonal,
//       progreso,
//       tiempoDisponible,
//       esFinDeSemana: estadoBase === "fin_de_semana",
//       esDiaEvento: estadoBase === "dia_evento",
//       esFueraHorario: estadoBase === "fuera_horario",
//     };
//   }
// );

// // Exportar acciones y reducer
// export const {
//   setSincronizando,
//   setInicioRegistro,
//   setDatosAsistenciaHoy,
//   setHaySincronizacionDatos,
//   setRolActual,
//   actualizarEstadoSistema,
//   resetearEstado,
// } = estadoSistemaAsistenciaSlice.actions;

// export default estadoSistemaAsistenciaSlice.reducer;


// // ===== MODIFICACIONES AL HOOK useActualizarEstadoAsistencia =====

// // Este código iría en un archivo separado para evitar importaciones circulares
// import { useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/global/store";

// // Redux actions & selectors
// import {
//   selectEstadoSistema,
//   selectHorarioAsistencia,
//   selectHayDatosAsistencia,
//   selectSincronizando,
//   selectTiemposRestantes,
//   selectComunicados,
//   selectEsDiaEvento,
//   actualizarEstadoSistema,
//   setSincronizando,
//   setDatosAsistenciaHoy,
//   resetearEstado,
// } from "@/global/state/asistencia/estadoSistemaAsistencia";

// // Interfaces & constants
// import { HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS } from "@/constants/HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS";

// // Importamos la clase DatosAsistenciaHoyIDB que contiene el método getHandler
// import { DatosAsistenciaHoyIDB } from "@/lib/utils/local/db/models/DatosAsistenciaHoy/DatosAsistenciaHoyIDB";

// interface UseActualizarEstadoAsistenciaOptions {
//   /**
//    * Intervalo en milisegundos para actualizar el estado del sistema
//    * @default 1000 (1 segundo)
//    */
//   updateInterval?: number;

//   /**
//    * Si se debe sincronizar automáticamente con el almacenamiento local al montar el hook
//    * @default true
//    */
//   sincronizarAlIniciar?: boolean;

//   /**
//    * Función que se ejecuta cuando cambia el estado del sistema
//    */
//   onEstadoChange?: (nuevoEstado: string) => void;
// }

// /**
//  * Hook personalizado para gestionar la actualización del estado del sistema de asistencia
//  * Aprovecha el hook useFechaHoraReal para sincronizar con el tiempo real
//  */
// const useActualizarEstadoAsistencia = ({
//   updateInterval = 1000,
//   sincronizarAlIniciar = true,
//   onEstadoChange,
// }: UseActualizarEstadoAsistenciaOptions = {}) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

//   // Obtener fecha y hora actual del estado global
//   const fechaHoraActual = useSelector(
//     (state: RootState) => state.others.fechaHoraActualReal
//   );

//   // Selectores para el estado del sistema de asistencia
//   const estadoSistema = useSelector(selectEstadoSistema);
//   const horarioAsistencia = useSelector(selectHorarioAsistencia);
//   const hayDatosAsistencia = useSelector(selectHayDatosAsistencia);
//   const sincronizando = useSelector(selectSincronizando);
//   const tiemposRestantes = useSelector(selectTiemposRestantes);
//   const comunicados = useSelector(selectComunicados);
//   const esDiaEvento = useSelector(selectEsDiaEvento);

//   // Verificar si ya pasó la hora de actualización de datos
//   const haySincronizacionDatos =
//     fechaHoraActual.inicializado &&
//     fechaHoraActual.utilidades &&
//     Number(fechaHoraActual.utilidades.hora) >=
//       HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS;

//   // Función para sincronizar con el almacenamiento local según el rol
//   const sincronizarConAlmacenamiento = async () => {
//     if (!fechaHoraActual.inicializado) return;

//     dispatch(setSincronizando({ value: true }));

//     try {
//       // Obtenemos la instancia de DatosAsistenciaHoyIDB
//       const datosAsistenciaStorage = new DatosAsistenciaHoyIDB();

//       // Obtenemos el handler directamente con el método getHandler
//       const handler = await datosAsistenciaStorage.getHandler();

//       if (handler) {
//         // Guardamos el handler en el estado (ahora setDatosAsistenciaHoy se encarga de serializarlo)
//         // No necesitamos preocuparnos por el tipo específico del handler
//         dispatch(setDatosAsistenciaHoy({ value: handler }));

//         if (onEstadoChange) {
//           onEstadoChange("actualizado");
//         }
//       } else {
//         // Si no hay handler, intentamos obtener nuevos datos
//         const data = await datosAsistenciaStorage.obtenerDatos();

//         if (!data) {
//           console.warn(
//             `No se encontraron datos de asistencia para el rol actual`
//           );
//         } else {
//           // Intentamos obtener el handler nuevamente después de la sincronización
//           const handlerActualizado = await datosAsistenciaStorage.getHandler();

//           if (handlerActualizado) {
//             dispatch(setDatosAsistenciaHoy({ value: handlerActualizado }));

//             if (onEstadoChange) {
//               onEstadoChange("actualizado");
//             }
//           } else {
//             console.warn(
//               `No se pudo obtener el handler después de sincronizar`
//             );
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error al obtener datos de asistencia:", error);
//     } finally {
//       dispatch(setSincronizando({ value: false }));
//     }
//   };

//   // Sincronización inicial al montar el componente
//   useEffect(() => {
//     if (sincronizarAlIniciar && fechaHoraActual.inicializado) {
//       sincronizarConAlmacenamiento();
//     }
//   }, [sincronizarAlIniciar, fechaHoraActual.inicializado]);

//   // Obtener datos de asistencia actual serializados
//   const datosAsistenciaActual = useSelector(
//     (state: RootState) =>
//       state.asistencia.estadoSistemaAsistencia.datosAsistenciaHoy
//   );

//   // Efecto para verificar si necesitamos actualizar los datos cuando cambia el día
//   useEffect(() => {
//     if (
//       !hayDatosAsistencia ||
//       !fechaHoraActual.utilidades ||
//       !datosAsistenciaActual ||
//       !fechaHoraActual.inicializado
//     )
//       return;

//     try {
//       // Obtenemos la fecha local del objeto serializado
//       const fechaLocalPeruStr = datosAsistenciaActual.FechaLocalPeru;
      
//       if (!fechaLocalPeruStr) return;
      
//       const fechaDatosAsistencia = new Date(fechaLocalPeruStr);
//       const diaActual = fechaHoraActual.utilidades!.diaMes;
//       const diaDatosAsistencia = fechaDatosAsistencia.getDate();

//       if (haySincronizacionDatos && diaDatosAsistencia !== diaActual) {
//         console.log(`Detectado cambio de día, actualizando datos...`);
//         sincronizarConAlmacenamiento();
//       }
//     } catch (error) {
//       console.error("Error al verificar cambio de día:", error);
//     }
//   }, [
//     haySincronizacionDatos,
//     hayDatosAsistencia,
//     fechaHoraActual.utilidades,
//     datosAsistenciaActual,
//     fechaHoraActual.inicializado,
//   ]);

//   // Actualización periódica del estado del sistema
//   useEffect(() => {
//     if (!fechaHoraActual.inicializado) return;

//     // Limpiar intervalo existente si hay uno
//     if (updateIntervalRef.current) {
//       clearInterval(updateIntervalRef.current);
//     }

//     // Configurar nuevo intervalo para actualizar el estado periódicamente
//     updateIntervalRef.current = setInterval(() => {
//       dispatch(actualizarEstadoSistema());
//     }, updateInterval);

//     return () => {
//       if (updateIntervalRef.current) {
//         clearInterval(updateIntervalRef.current);
//         updateIntervalRef.current = null;
//       }
//     };
//   }, [dispatch, updateInterval, fechaHoraActual.inicializado]);

//   // Función para restablecer el estado del sistema
//   const restablecer = () => {
//     dispatch(resetearEstado());
//   };

//   // Función para forzar una sincronización manual
//   const forzarSincronizacion = () => {
//     sincronizarConAlmacenamiento();
//   };

//   return {
//     // Estado actual del sistema
//     estadoSistema,
//     horarioAsistencia,
//     hayDatosAsistencia,
//     sincronizando,
//     tiemposRestantes,
//     comunicados,
//     esDiaEvento,

//     // Indicador de si el sistema está inicializado
//     inicializado: fechaHoraActual.inicializado && hayDatosAsistencia,

//     // Funciones de control
//     sincronizarConAlmacenamiento,
//     restablecer,
//     forzarSincronizacion,
//   };
// };

// export default useActualizarEstadoAsistencia;
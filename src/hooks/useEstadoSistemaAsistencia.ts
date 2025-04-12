import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/global/store";
import {
  selectEstadoSistema,
  selectHorarioAsistencia,
  selectHayDatosAsistencia,
  selectSincronizando,
  selectInicioRegistro,
  selectTiemposRestantes,
  selectTotalPersonal,
  selectRolActual,
  selectComunicados,
  selectEsDiaEvento,
  actualizarEstadoSistema,
  setSincronizando,
  setInicioRegistro,
  setDatosAsistenciaHoy,
  setHaySincronizacionDatos,
  setRolActual,
  resetearEstado,
} from "@/global/state/asistencia/estadoSistemaAsistencia";
import { RolesSistema } from "@/interfaces/shared/RolesSistema";
import { obtenerAsistenciaStoragePorRol } from "@/lib/utils/local/db/models/DatosAsistenciaHoy";
import { HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS } from "@/constants/HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS";
import { createAsistenciaHandler } from "@/lib/utils/local/db/models/DatosAsistenciaHoy/handlers/AsistenciaHandlersFactory";

interface UseEstadoSistemaAsistenciaOptions {
  /**
   * Intervalo en milisegundos para actualizar el estado del sistema
   * @default 1000 (1 segundo)
   */
  updateInterval?: number;

  /**
   * Si se debe sincronizar automáticamente con el almacenamiento local al montar el hook
   * @default true
   */
  sincronizarAlIniciar?: boolean;

  /**
   * Función que se ejecuta cuando se inicia el registro de asistencia
   */
  onInicioRegistro?: () => void;

  /**
   * Rol del usuario actual para determinar qué tipo de datos cargar
   * @default RolesSistema.Directivo
   */
  rol?: RolesSistema;
}

/**
 * Hook personalizado para gestionar el estado del sistema de asistencia
 * Compatible con todos los roles del sistema
 * Se integra con useFechaHoraReal para obtener la hora actual
 */
const useEstadoSistemaAsistencia = ({
  updateInterval = 1000,
  sincronizarAlIniciar = true,
  onInicioRegistro,
  rol = RolesSistema.Directivo,
}: UseEstadoSistemaAsistenciaOptions = {}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Obtener fecha y hora actual del estado global
  const fechaHoraActual = useSelector(
    (state: RootState) => state.others.fechaHoraActualReal
  );

  // Selectores para el estado del sistema de asistencia
  const estadoSistema = useSelector(selectEstadoSistema);
  const horarioAsistencia = useSelector(selectHorarioAsistencia);
  const hayDatosAsistencia = useSelector(selectHayDatosAsistencia);
  const sincronizando = useSelector(selectSincronizando);
  const inicioRegistro = useSelector(selectInicioRegistro);
  const tiemposRestantes = useSelector(selectTiemposRestantes);
  const totalPersonal = useSelector(selectTotalPersonal);
  const rolActual = useSelector(selectRolActual);
  const comunicados = useSelector(selectComunicados);
  const esDiaEvento = useSelector(selectEsDiaEvento);

  // Referencia para almacenar el intervalo
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Configurar el rol actual al iniciar
  useEffect(() => {
    if (rol !== rolActual) {
      dispatch(setRolActual({ value: rol }));
    }
  }, [dispatch, rol, rolActual]);

  // Verificar si ya pasó la hora de actualización de datos
  const haySincronizacionDatos =
    Number(fechaHoraActual.utilidades?.hora) >=
    HORA_ACTUALIZACION_DATOS_ASISTENCIA_DIARIOS;

  // Actualizar el estado cuando cambia la hora de sincronización
  useEffect(() => {
    dispatch(setHaySincronizacionDatos({ value: haySincronizacionDatos }));
  }, [dispatch, haySincronizacionDatos]);

  // Función para sincronizar con el almacenamiento local según el rol
  const sincronizarConAlmacenamiento = async () => {
    dispatch(setSincronizando({ value: true }));

    try {
      // Obtenemos el almacenamiento según el rol actual
      const datosAsistenciaStorage = obtenerAsistenciaStoragePorRol(rol);

      if (!datosAsistenciaStorage) {
        console.error(`No se encontró almacenamiento para el rol: ${rol}`);
        return;
      }

      // Obtenemos los datos según el rol
      const data = await datosAsistenciaStorage.obtenerDatos();

      if (data) {
        // Creamos el handler apropiado usando la fábrica de handlers
        const handler = createAsistenciaHandler(rol, data);

        if (handler) {
          // Guardamos los datos en el estado
          dispatch(setDatosAsistenciaHoy({ value: handler }));
        } else {
          console.warn(`No se pudo crear handler para el rol: ${rol}`);
        }
      } else {
        console.warn(`No se encontraron datos para el rol: ${rol}`);
      }
    } catch (error) {
      console.error("Error al obtener datos de asistencia:", error);
    } finally {
      dispatch(setSincronizando({ value: false }));
    }
  };

  // Sincronización inicial al montar el componente
  useEffect(() => {
    if (sincronizarAlIniciar) {
      sincronizarConAlmacenamiento();
    }
  }, [sincronizarAlIniciar, rol]);

  // Obtener datos de asistencia actual fuera del callback
  const datosAsistenciaActual = useSelector(
    (state: RootState) =>
      state.asistencia.estadoSistemaAsistencia.datosAsistenciaHoy
  );

  // Efecto para verificar si necesitamos actualizar los datos cuando cambia el día
  useEffect(() => {
    if (
      !hayDatosAsistencia ||
      !fechaHoraActual.utilidades ||
      !datosAsistenciaActual
    )
      return;

    // Obtenemos la fecha local del handler actual
    const fechaDatosAsistencia = datosAsistenciaActual.getFechaLocalPeru();
    const diaDatosAsistencia = fechaDatosAsistencia.getDate();
    const diaActual = fechaHoraActual.utilidades!.diaMes;

    if (haySincronizacionDatos && diaDatosAsistencia !== diaActual) {
      console.log(
        `Detectado cambio de día para rol ${rol}, actualizando datos...`
      );
      sincronizarConAlmacenamiento();
    }
  }, [
    haySincronizacionDatos,
    hayDatosAsistencia,
    fechaHoraActual.utilidades,
    datosAsistenciaActual,
    rol,
  ]);

  // Actualización periódica del estado
  useEffect(() => {
    // Limpiar intervalo existente si hay uno
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    // Configurar nuevo intervalo para actualizar el estado periódicamente
    updateIntervalRef.current = setInterval(() => {
      dispatch(actualizarEstadoSistema());
    }, updateInterval);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [dispatch, updateInterval]);

  // Función para iniciar el registro de asistencia
  const iniciarRegistro = () => {
    dispatch(setInicioRegistro({ value: true }));

    if (onInicioRegistro) {
      onInicioRegistro();
    }
  };

  // Función para finalizar el registro de asistencia
  const finalizarRegistro = () => {
    dispatch(setInicioRegistro({ value: false }));
  };

  // Función para restablecer el estado del sistema
  const restablecer = () => {
    dispatch(resetearEstado());
  };

  // Función para cambiar de rol y recargar los datos
  const cambiarRol = (nuevoRol: RolesSistema) => {
    if (nuevoRol === rolActual) return;

    dispatch(setRolActual({ value: nuevoRol }));

    // Reseteamos los datos actuales antes de cargar los nuevos
    dispatch(setDatosAsistenciaHoy({ value: null }));

    // Sincronizamos con el nuevo rol
    sincronizarConAlmacenamiento();
  };

  // Función para forzar una sincronización manual
  const forzarSincronizacion = () => {
    sincronizarConAlmacenamiento();
  };

  // Obtener datos brutos para casos específicos
  const datosAsistenciaRawSelector = useSelector(
    (state: RootState) => state.asistencia.estadoSistemaAsistencia
  );
  const datosAsistenciaRaw = hayDatosAsistencia
    ? datosAsistenciaRawSelector
    : null;

  return {
    // Estado actual del sistema
    estadoSistema,
    horarioAsistencia,
    hayDatosAsistencia,
    sincronizando,
    inicioRegistro,
    tiemposRestantes,
    totalPersonal,
    rolActual,
    comunicados,
    esDiaEvento,

    // Datos brutos para casos específicos
    datosAsistenciaRaw,

    // Funciones de control
    sincronizarConAlmacenamiento,
    iniciarRegistro,
    finalizarRegistro,
    restablecer,
    cambiarRol,
    forzarSincronizacion,
  };
};

export default useEstadoSistemaAsistencia;

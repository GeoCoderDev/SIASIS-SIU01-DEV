import { combineReducers } from "redux";
import estadoSistemaAsistenciaSlice from "./estadoSistemaAsistencia";

const asistencia = combineReducers({
  estadoSistemaAsistencia: estadoSistemaAsistenciaSlice,
});

export default asistencia;

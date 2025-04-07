import { combineReducers } from "redux";
import currentGoogleDriveFotoldSlice from "./currentGoogleDriveFotoId";
import fechaHoraActualRealSlice from "./fechaHoraActualReal";

const others = combineReducers({
  currentGoogleDriveFotold: currentGoogleDriveFotoldSlice,
  fechaHoraActualReal: fechaHoraActualRealSlice,
});

export default others;

import { combineReducers } from "redux";
import sidebarIsOpenSlice from './sidebarIsOpen';


const flags = combineReducers({
    sidebarIsOpen: sidebarIsOpenSlice
});

export default flags;

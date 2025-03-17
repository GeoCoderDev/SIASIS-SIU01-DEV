import { LogoutTypes } from "@/interfaces/LogoutTypes";
import userStorage from "../utils/local/db/models/UserStorage";

export const logout = async (

  logoutType:
    LogoutTypes = LogoutTypes.DECISION_USUARIO
): Promise<void> => {



  // setTimeout(async () => {
  
  try {
    await fetch("/api/auth/close", { method: "DELETE" });
    localStorage.clear();
    userStorage.clearUserData();
    window.location.href = `/login${
      typeof logoutType === "string" &&
      logoutType !== LogoutTypes.DECISION_USUARIO &&
      "?LOGOUT_TYPE=" + logoutType
    }`;
  } catch (error) {
    console.error("Error during logout:", error);
  }


  // }, 4000);
};

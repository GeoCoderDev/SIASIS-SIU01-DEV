import { LogoutTypes } from "@/interfaces/LogoutTypes";
import userStorage from "../utils/local/db/models/UserStorage";

export const logout = async (
  logoutType: LogoutTypes = LogoutTypes.DECISION_USUARIO
) => {
  console.log(logoutType);

  try {
    await fetch("/api/auth/close", { method: "POST" });
    localStorage.clear();
    userStorage.clearUserData();
    window.location.href = "/login";
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

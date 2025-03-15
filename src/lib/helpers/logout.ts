import { LogoutTypes } from "@/interfaces/LogoutTypes";
import userStorage from "../utils/local/db/models/UserStorage";

export const logout = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logoutType: LogoutTypes | any = LogoutTypes.DECISION_USUARIO
): Promise<void> => {
  console.log(logoutType);

  // setTimeout(async () => {
    try {
      await fetch("/api/auth/close", { method: "POST" });
      localStorage.clear();
      userStorage.clearUserData();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  // }, 4000);
};

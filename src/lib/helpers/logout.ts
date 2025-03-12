import userStorage from "../utils/local/db/models/UserStorage";

export const logout = async () => {
  try {
    await fetch("/api/auth/close", { method: "POST" });
    localStorage.clear();
    userStorage.clearUserData();
    window.location.href = "/login";
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

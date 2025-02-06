export const logout = async () => {
  try {
    await fetch("/api/auth/close", { method: "PUT" });
    window.location.href = "/login";
    localStorage.clear();
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

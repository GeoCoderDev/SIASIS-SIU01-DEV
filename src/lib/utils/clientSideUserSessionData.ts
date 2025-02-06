import { Role } from "@/interfaces/Role";

export interface UserSessionDataFields {
  role?: Role;
  username?: string;
  urlImage?: string;
  Nombres?: string;
  Apellidos?: string;
}

export const initializeUserSessionData = () => {
  class UserSessionData implements UserSessionDataFields {
    static set role(value: Role) {
      localStorage.setItem("role", value);
    }

    static get role(): Role | undefined {
      const roleGetted = localStorage.getItem("role");
      if (!roleGetted) return undefined;
      return roleGetted as Role;
    }

    static set username(value: string) {
      localStorage.setItem("username", value);
    }

    static get username(): string | undefined {
      const usernameGetted = localStorage.getItem("username");
      if (!usernameGetted) return undefined;
      return usernameGetted;
    }

    static set urlImage(value: string | undefined) {
      localStorage.setItem("urlImage", value ?? "");
    }

    static get urlImage(): string | undefined | null {
      const urlImageGetted = localStorage.getItem("urlImage");
      return urlImageGetted || undefined;
    }

    static set Nombres(value: string) {
      localStorage.setItem("Nombres", value);
    }

    static get Nombres(): string | undefined {
      const nombresGetted = localStorage.getItem("Nombres");
      if (!nombresGetted) return undefined;
      return nombresGetted;
    }

    static set Apellidos(value: string) {
      localStorage.setItem("Apellidos", value);
    }

    static get Apellidos(): string | undefined {
      const apellidosGetted = localStorage.getItem("Apellidos");
      if (!apellidosGetted) return undefined;
      return apellidosGetted;
    }
  }

  return { UserSessionData };
};

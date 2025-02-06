import { Role } from "@/interfaces/Role";

export interface UserData {
  username: string;
  role: Role;
  urlImage?: string | null;
}

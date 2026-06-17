export type UserRole = "Administrador" | "Vendedor" | "Veterinario";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

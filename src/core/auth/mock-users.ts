import type { AuthUser } from "../../types/auth.types";

export const MOCK_USERS: AuthUser[] = [
  {
    id: 1,
    name: "Dra. Ana García",
    email: "admin@vetcare.com",
    password: "admin123",
    role: "Administrador",
  },
  {
    id: 2,
    name: "Luis Pérez",
    email: "vendedor@vetcare.com",
    password: "vendedor123",
    role: "Vendedor",
  },
  {
    id: 3,
    name: "Dr. José Martínez",
    email: "veterinario@vetcare.com",
    password: "vet123",
    role: "Veterinario",
  },
];

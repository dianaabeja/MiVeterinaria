import type { Vendedor } from "../types/vendedor.types";

export const VENDEDORES_MOCK: Vendedor[] = [
  {
    id: 1,
    nombre: "Luis Perez",
    email: "vendedor@vetcare.com",
    telefono: "5511112233",
    ventasMes: 38,
    estado: "Activo",
  },
  {
    id: 2,
    nombre: "Sofia Hernandez",
    email: "sofia@vetcare.com",
    telefono: "5522223344",
    ventasMes: 24,
    estado: "Activo",
  },
  {
    id: 3,
    nombre: "Mario Lopez",
    email: "mario@vetcare.com",
    telefono: "5533334455",
    ventasMes: 11,
    estado: "Inactivo",
  },
];

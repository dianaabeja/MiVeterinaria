export interface Vendedor {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  ventasMes: number;
  estado: "Activo" | "Inactivo";
}

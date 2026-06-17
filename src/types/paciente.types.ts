export interface Paciente {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  peso: number;
  edad: number;
  dueño: string;
  telefono: string;
  estado: "Sano" | "En tratamiento" | "Control";
}

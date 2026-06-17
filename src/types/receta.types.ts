export interface Receta {
  id: number;
  fecha: string;
  paciente: string;
  dueño: string;
  veterinario: string;
  diagnostico: string;
  medicamentos: string[];
  estado: "Activa" | "Completada";
}

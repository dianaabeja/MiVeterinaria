import type { Receta } from "../types/receta.types";

export const RECETAS_MOCK: Receta[] = [
  {
    id: 1,
    fecha: "2026-06-15",
    paciente: "Max",
    dueño: "Carlos Méndez",
    veterinario: "Dra. Ana García",
    diagnostico: "Infección leve",
    medicamentos: ["Antibiótico", "Antiinflamatorio"],
    estado: "Activa",
  },
  {
    id: 2,
    fecha: "2026-06-14",
    paciente: "Luna",
    dueño: "María López",
    veterinario: "Dr. José Martínez",
    diagnostico: "Control rutinario",
    medicamentos: ["Vitaminas"],
    estado: "Completada",
  },
  {
    id: 3,
    fecha: "2026-06-13",
    paciente: "Rocky",
    dueño: "Juan Pérez",
    veterinario: "Dra. Ana García",
    diagnostico: "Alergia estacional",
    medicamentos: ["Antihistamínico", "Crema tópica"],
    estado: "Activa",
  },
  {
    id: 4,
    fecha: "2026-06-12",
    paciente: "Michi",
    dueño: "Ana García",
    veterinario: "Dra. Carmen Ruiz",
    diagnostico: "Desparasitación",
    medicamentos: ["Desparasitante"],
    estado: "Completada",
  },
];

export const PACIENTES_DISPONIBLES_MOCK = [
  { nombre: "Max", dueño: "Carlos Méndez" },
  { nombre: "Luna", dueño: "María López" },
  { nombre: "Rocky", dueño: "Juan Pérez" },
  { nombre: "Michi", dueño: "Ana García" },
  { nombre: "Toby", dueño: "Pedro Ramírez" },
  { nombre: "Nala", dueño: "Laura Sánchez" },
];

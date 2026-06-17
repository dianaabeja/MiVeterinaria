import type { Paciente } from "../types/paciente.types";

export const PACIENTES_MOCK: Paciente[] = [
  { id: 1, nombre: "Max", especie: "Perro", raza: "Golden Retriever", peso: 32.5, edad: 5, dueño: "Carlos Mendez", telefono: "5512345678", estado: "Sano" },
  { id: 2, nombre: "Luna", especie: "Gato", raza: "Persa", peso: 4.2, edad: 3, dueño: "Maria Lopez", telefono: "5587654321", estado: "En tratamiento" },
  { id: 3, nombre: "Rocky", especie: "Perro", raza: "Bulldog", peso: 25.0, edad: 7, dueño: "Juan Perez", telefono: "5524681357", estado: "Sano" },
  { id: 4, nombre: "Michi", especie: "Gato", raza: "Siames", peso: 3.8, edad: 2, dueño: "Ana Garcia", telefono: "5511223344", estado: "Control" },
  { id: 5, nombre: "Toby", especie: "Perro", raza: "Beagle", peso: 15.5, edad: 4, dueño: "Pedro Ramirez", telefono: "5599887766", estado: "Sano" },
  { id: 6, nombre: "Nala", especie: "Gato", raza: "Maine Coon", peso: 6.2, edad: 6, dueño: "Laura Sanchez", telefono: "5544332211", estado: "En tratamiento" },
];

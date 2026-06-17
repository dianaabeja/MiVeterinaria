import type { CategoriaKey, Producto } from "../types/producto.types";

export const PRODUCTOS_MOCK: Record<CategoriaKey, Producto[]> = {
  juguetes: [
    { id: 1, nombre: "Pelota de Goma", imagenUrl: "/productos/pelota-goma.jpg", precio: 12.99, stock: 45, categoria: "Juguetes", tipoVenta: "unidad", unidad: "pz", cantidadMinimaVenta: 1 },
    { id: 2, nombre: "Raton de Peluche", imagenUrl: "/productos/raton-peluche.jpg", precio: 8.99, stock: 32, categoria: "Juguetes", tipoVenta: "unidad", unidad: "pz", cantidadMinimaVenta: 1 },
    { id: 3, nombre: "Cuerda Dental", imagenUrl: "/productos/cuerda-dental.jpg", precio: 15.99, stock: 28, categoria: "Juguetes", tipoVenta: "unidad", unidad: "pz", cantidadMinimaVenta: 1 },
    { id: 4, nombre: "Laser Interactivo", imagenUrl: "/productos/laserinteractivo.jpg", precio: 24.99, stock: 15, categoria: "Juguetes", tipoVenta: "unidad", unidad: "pz", cantidadMinimaVenta: 1 },
  ],
  ropa: [
    { id: 5, nombre: "Sueter Rosa", imagenUrl: "/productos/sueter-rosa.jpg", precio: 29.99, stock: 18, categoria: "Ropa", tipoVenta: "unidad", unidad: "pz", cantidadMinimaVenta: 1 },
    { id: 6, nombre: "Chaleco Acolchado", imagenUrl: "/productos/chaleco-acolchado.jpg", precio: 34.99, stock: 12, categoria: "Ropa", tipoVenta: "unidad", unidad: "pz", cantidadMinimaVenta: 1 },
    { id: 7, nombre: "Collar Ajustable", imagenUrl: "/productos/collar-ajustable.jpg", precio: 14.99, stock: 40, categoria: "Ropa", tipoVenta: "unidad", unidad: "pz", cantidadMinimaVenta: 1 },
    { id: 8, nombre: "Arnes Deportivo", imagenUrl: "/productos/arnes-deportivo.jpg", precio: 22.99, stock: 25, categoria: "Ropa", tipoVenta: "unidad", unidad: "pz", cantidadMinimaVenta: 1 },
  ],
  medicina: [
    { id: 9, nombre: "Antibiotico a Granel", imagenUrl: "/productos/antibiotico-granel.jpg", precio: 0.46, stock: 1500, categoria: "Medicina", tipoVenta: "granel", unidad: "ml", cantidadMinimaVenta: 10 },
    { id: 10, nombre: "Antiinflamatorio a Granel", imagenUrl: "/productos/antiinflamatorio-granel.jpg", precio: 0.39, stock: 1200, categoria: "Medicina", tipoVenta: "granel", unidad: "ml", cantidadMinimaVenta: 10 },
    { id: 11, nombre: "Vitaminas a Granel", imagenUrl: "/productos/vitaminas-granel.jpg", precio: 0.22, stock: 2500, categoria: "Medicina", tipoVenta: "granel", unidad: "g", cantidadMinimaVenta: 50 },
    { id: 12, nombre: "Desparasitante a Granel", imagenUrl: "/productos/desparasitante-granel.jpg", precio: 0.33, stock: 1800, categoria: "Medicina", tipoVenta: "granel", unidad: "ml", cantidadMinimaVenta: 10 },
  ],
};

export type CategoriaKey = "juguetes" | "ropa" | "medicina";

export type ProductoCategoria = "Juguetes" | "Ropa" | "Medicina";

export type TipoVentaProducto = "unidad" | "granel";

export type UnidadProducto = "pz" | "ml" | "g";

export interface Producto {
  id: number;
  nombre: string;
  imagenUrl: string;
  precio: number;
  stock: number;
  categoria: ProductoCategoria;
  tipoVenta: TipoVentaProducto;
  unidad: UnidadProducto;
  cantidadMinimaVenta: number;
}

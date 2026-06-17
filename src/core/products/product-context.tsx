import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { PRODUCTOS_MOCK } from "../../mocks/productos.mock";
import type { CategoriaKey, Producto } from "../../types/producto.types";

type ProductsByCategory = Record<CategoriaKey, Producto[]>;

interface ProductContextValue {
  productos: ProductsByCategory;
  setProductos: Dispatch<SetStateAction<ProductsByCategory>>;
  allProducts: Producto[];
}

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [productos, setProductos] = useState<ProductsByCategory>(PRODUCTOS_MOCK);

  const allProducts = useMemo(() => Object.values(productos).flat(), [productos]);

  return (
    <ProductContext.Provider value={{ productos, setProductos, allProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProducts() {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProducts debe usarse dentro de ProductProvider");
  }

  return context;
}

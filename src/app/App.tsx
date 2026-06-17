import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "../core/auth/auth-context";
import { ProductProvider } from "../core/products/product-context";

export function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <RouterProvider router={router} />
      </ProductProvider>
    </AuthProvider>
  );
}

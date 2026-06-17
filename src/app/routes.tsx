import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/layout";
import { Dashboard } from "./pages/dashboard";
import { Catalogo } from "./pages/catalogo";
import { Pacientes } from "./pages/pacientes";
import { Recetas } from "./pages/recetas";
import { Login } from "./pages/login";
import { Vendedores } from "./pages/vendedores";
import { Ventas } from "./pages/ventas";
import { ProtectedRoute } from "../core/auth/protected-route";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/403",
    element: <Navigate to="/" replace />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          {
            index: true,
            Component: Dashboard,
          },
          {
            path: "catalogo",
            Component: Catalogo,
          },
          {
            path: "ventas",
            Component: Ventas,
          },
          {
            element: (
              <ProtectedRoute allowedRoles={["Administrador", "Veterinario"]} />
            ),
            children: [
              {
                path: "pacientes",
                Component: Pacientes,
              },
              {
                path: "recetas",
                Component: Recetas,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["Administrador"]} />,
            children: [
              {
                path: "vendedores",
                Component: Vendedores,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  FileText,
  Heart,
  Home,
  LogOut,
  Menu,
  ShoppingBag,
  ShoppingCart,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../core/auth/auth-context";
import type { UserRole } from "../../types/auth.types";
import { ConfirmDialog } from "./confirm-dialog";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home, permission: "dashboard:view" },
  { name: "Catálogo", href: "/catalogo", icon: ShoppingBag, permission: "catalog:view" },
  { name: "Ventas", href: "/ventas", icon: ShoppingCart, permission: "sales:view" },
  { name: "Pacientes", href: "/pacientes", icon: Heart, permission: "patients:view" },
  { name: "Recetas", href: "/recetas", icon: FileText, permission: "recipes:view" },
  { name: "Vendedores", href: "/vendedores", icon: Users, permission: "sellers:view" },
];

const roleBadgeClasses: Record<UserRole, string> = {
  Administrador: "text-violet-300 bg-violet-500/10",
  Vendedor: "text-sky-300 bg-sky-500/10",
  Veterinario: "text-emerald-300 bg-emerald-500/10",
};

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout, can } = useAuth();

  const visibleNavItems = navItems.filter((item) => can(item.permission));

  function isActive(href: string) {
    if (href === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(href);
  }

  function confirmLogout() {
    logout();
    setIsLogoutDialogOpen(false);
    toast.success("Sesión cerrada correctamente");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={`fixed inset-x-0 top-0 z-40 border-b border-sidebar-border bg-sidebar transition-all duration-300 lg:inset-y-0 lg:left-0 lg:right-auto lg:h-screen lg:border-b-0 lg:border-r ${
          isSidebarOpen ? "lg:w-64" : "lg:w-20"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/15">
              <Heart size={20} className="text-sidebar-primary" />
            </div>
            <span
              className={`font-bold text-sidebar-primary ${
                isSidebarOpen ? "lg:inline" : "lg:hidden"
              }`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              VetCare
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen((value) => !value)}
            className="hidden rounded-lg p-2 text-sidebar-foreground/45 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:inline-flex"
            title="Contraer menu"
          >
            <Menu size={20} />
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
            className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <nav
          className={`border-b border-sidebar-border px-3 py-3 shadow-lg lg:block lg:space-y-1 lg:border-b-0 lg:p-4 lg:shadow-none ${
            isMobileMenuOpen ? "block" : "hidden"
          }`}
        >
          {visibleNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <span className={isSidebarOpen ? "lg:inline" : "lg:hidden"}>
                  {item.name}
                </span>
                {isSidebarOpen && isActive(item.href) && (
                  <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-sidebar-primary lg:block" />
                )}
              </Link>
            );
          })}

          <div className="mt-3 border-t border-sidebar-border pt-3 lg:hidden">
            {user && (
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-sidebar-accent/30 px-3 py-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/20 text-sidebar-primary">
                  <User size={17} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {user.name}
                  </p>
                  <p className={`text-xs ${roleBadgeClasses[user.role]}`}>
                    {user.role}
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsLogoutDialogOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-destructive/80 hover:bg-sidebar-accent hover:text-destructive"
            >
              <LogOut size={18} />
              Cerrar sesion
            </button>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 hidden border-t border-sidebar-border p-4 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary/20 text-sidebar-primary">
              <User size={18} />
            </div>

            {isSidebarOpen && user && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {user.name}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    user.role === "Administrador" ? "bg-violet-400" :
                    user.role === "Vendedor" ? "bg-sky-400" : "bg-emerald-400"
                  }`} />
                  <span className={`text-xs ${
                    roleBadgeClasses[user.role]
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            )}

            {isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsLogoutDialogOpen(true)}
                className="rounded-lg p-2 text-destructive/70 hover:bg-sidebar-accent hover:text-destructive"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      <main
        className={`pt-16 transition-all duration-300 lg:pt-0 ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <Outlet />
      </main>

      <ConfirmDialog
        open={isLogoutDialogOpen}
        title="¿Cerrar sesión?"
        description="Se cerrará tu sesión actual y regresarás a la pantalla de inicio de sesión."
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </div>
  );
}

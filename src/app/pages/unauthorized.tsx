import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../../core/auth/auth-context";

export function Unauthorized() {
  const { user } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert size={34} />
        </div>

        <h1 className="text-3xl font-bold text-foreground">403</h1>

        <p className="mt-2 text-lg font-medium text-foreground">
          Acceso no autorizado
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          Tu rol actual no tiene permisos para entrar a esta sección.
        </p>

        {user && (
          <div className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            <p>
              Usuario:{" "}
              <span className="font-medium text-foreground">{user.name}</span>
            </p>
            <p>
              Rol:{" "}
              <span className="font-medium text-foreground">{user.role}</span>
            </p>
          </div>
        )}

        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <ArrowLeft size={18} />
          Volver al Dashboard
        </Link>
      </section>
    </main>
  );
}

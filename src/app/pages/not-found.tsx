import { ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router";

export function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <SearchX size={34} />
        </div>

        <h1 className="text-3xl font-bold text-foreground">404</h1>

        <p className="mt-2 text-lg font-medium text-foreground">
          Página no encontrada
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          La ruta que intentaste abrir no existe dentro del sistema VetCare.
        </p>

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

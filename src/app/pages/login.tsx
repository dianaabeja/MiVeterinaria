import { useState } from "react";
import { useNavigate } from "react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../core/auth/auth-context";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("admin@vetcare.com");
  const [password, setPassword] = useState("admin123");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const success = login(email, password);

    if (!success) {
      toast.error("Credenciales incorrectas");
      return;
    }

    toast.success("Sesión iniciada correctamente");
    navigate("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Heart size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">VetCare</h1>
            <p className="text-sm text-muted-foreground">
              Inicia sesión para entrar al sistema
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            placeholder="correo@vetcare.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            placeholder="********"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Entrar
        </button>

        <div className="space-y-1 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Usuarios de prueba:</p>
          <p>Admin: admin@vetcare.com / admin123</p>
          <p>Vendedor: vendedor@vetcare.com / vendedor123</p>
          <p>Veterinario: veterinario@vetcare.com / vet123</p>
        </div>
      </form>
    </main>
  );
}

import { useMemo, useState, type FormEvent } from "react";
import { Edit, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PACIENTES_MOCK } from "../../mocks/pacientes.mock";
import { useAuth } from "../../core/auth/auth-context";
import {
  formatPhoneNumber,
  isTenDigitPhone,
  normalizePhoneDigits,
} from "../../utils/phone";
import { ConfirmDialog } from "../components/confirm-dialog";
import { Button, Card, Input } from "../components/ui";
import type { Paciente } from "../../types/paciente.types";

const estadoClasses: Record<Paciente["estado"], string> = {
  Sano: "bg-emerald-500/12 text-emerald-700 border-emerald-200",
  "En tratamiento": "bg-orange-500/12 text-orange-700 border-orange-200",
  Control: "bg-sky-500/12 text-sky-700 border-sky-200",
};

const initialForm = {
  nombre: "",
  especie: "Perro",
  raza: "",
  edad: "",
  peso: "",
  dueño: "",
  telefono: "",
  estado: "Sano" as Paciente["estado"],
  observaciones: "",
};

export function Pacientes() {
  const { can } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [pacientes, setPacientes] = useState<Paciente[]>(PACIENTES_MOCK);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [pacienteToDelete, setPacienteToDelete] = useState<Paciente | null>(
    null,
  );

  const [form, setForm] = useState(initialForm);

  const filteredPacientes = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return pacientes.filter((paciente) =>
      [
        paciente.nombre,
        paciente.dueño,
        paciente.especie,
        paciente.raza,
        paciente.estado,
      ].some((field) => field.toLowerCase().includes(query)),
    );
  }, [pacientes, searchQuery]);

  function resetForm() {
    setForm(initialForm);
  }

  function getNextPacienteId() {
    return (
      pacientes.reduce((maxId, paciente) => Math.max(maxId, paciente.id), 0) + 1
    );
  }

  function openCreateModal() {
    setEditingPaciente(null);
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(paciente: Paciente) {
    if (!can("patients:edit")) {
      toast.error("No tienes permiso para editar pacientes");
      return;
    }

    setEditingPaciente(paciente);
    setForm({
      nombre: paciente.nombre,
      especie: paciente.especie,
      raza: paciente.raza,
      edad: String(paciente.edad),
      peso: String(paciente.peso),
      dueño: paciente.dueño,
      telefono: paciente.telefono,
      estado: paciente.estado,
      observaciones: "",
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingPaciente(null);
    resetForm();
  }

  function handleSavePaciente(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingPaciente && !can("patients:create")) {
      toast.error("No tienes permiso para registrar pacientes");
      return;
    }

    if (editingPaciente && !can("patients:edit")) {
      toast.error("No tienes permiso para editar pacientes");
      return;
    }

    if (
      !form.nombre.trim() ||
      !form.especie.trim() ||
      !form.raza.trim() ||
      !form.edad ||
      !form.peso ||
      !form.dueño.trim() ||
      !form.telefono.trim()
    ) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    if (!isTenDigitPhone(form.telefono)) {
      toast.error("El telefono debe tener exactamente 10 digitos");
      return;
    }

    const savedPaciente: Paciente = {
      id: editingPaciente?.id ?? getNextPacienteId(),
      nombre: form.nombre.trim(),
      especie: form.especie.trim(),
      raza: form.raza.trim(),
      edad: Number(form.edad),
      peso: Number(form.peso),
      dueño: form.dueño.trim(),
      telefono: normalizePhoneDigits(form.telefono),
      estado: form.estado,
    };

    setPacientes((current) => {
      if (editingPaciente) {
        return current.map((paciente) =>
          paciente.id === editingPaciente.id ? savedPaciente : paciente,
        );
      }

      return [savedPaciente, ...current];
    });

    closeModal();

    toast.success(
      editingPaciente
        ? "Paciente actualizado en modo mock"
        : "Paciente registrado en modo mock",
    );
  }

  function confirmDeletePaciente() {
    if (!pacienteToDelete) return;

    if (!can("patients:delete")) {
      toast.error("No tienes permiso para eliminar pacientes");
      setPacienteToDelete(null);
      return;
    }

    setPacientes((current) =>
      current.filter((paciente) => paciente.id !== pacienteToDelete.id),
    );

    toast.success("Paciente eliminado en modo mock");
    setPacienteToDelete(null);
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Pacientes</h1>
          <p className="text-muted-foreground">
            Administra el historial básico de pacientes veterinarios
          </p>
        </div>

        {can("patients:create") && (
          <Button
            onClick={openCreateModal}
            className="w-full sm:w-auto"
          >
            <Plus size={18} />
            Nuevo Paciente
          </Button>
        )}
      </header>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />

        <Input
          placeholder="Buscar por nombre, dueño, especie, raza o estado..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="rounded-xl py-2 pl-10 pr-3"
        />
      </div>

      {filteredPacientes.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No se encontraron pacientes.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPacientes.map((paciente) => (
            <Card
              key={paciente.id}
              className="p-5 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">
                      {paciente.nombre}
                    </h2>

                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        estadoClasses[paciente.estado]
                      }`}
                    >
                      {paciente.estado}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {paciente.especie} - {paciente.raza}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {can("patients:edit") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(paciente)}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </Button>
                  )}

                  {can("patients:delete") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPacienteToDelete(paciente)}
                      className="text-destructive"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Edad:</span>
                  <span className="font-medium text-foreground">
                    {paciente.edad} años
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Peso:</span>
                  <span className="font-medium text-foreground">
                    {paciente.peso} kg
                  </span>
                </div>

                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Dueño
                  </p>
                  <p className="font-medium text-foreground">{paciente.dueño}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPhoneNumber(paciente.telefono)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {editingPaciente ? "Editar Paciente" : "Registrar Nuevo Paciente"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Este registro se guarda solo en memoria mientras la app está abierta.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePaciente} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nombre
                  </label>
                  <input
                    value={form.nombre}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        nombre: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Ej. Max"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Especie
                  </label>
                  <select
                    value={form.especie}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        especie: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Reptil">Reptil</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Raza
                  </label>
                  <input
                    value={form.raza}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        raza: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Ej. Golden Retriever"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Edad
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.edad}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        edad: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Peso
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.peso}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        peso: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Estado
                  </label>
                  <select
                    value={form.estado}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        estado: event.target.value as Paciente["estado"],
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Sano">Sano</option>
                    <option value="En tratamiento">En tratamiento</option>
                    <option value="Control">Control</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Dueño
                  </label>
                  <input
                    value={form.dueño}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        dueño: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Nombre del dueño"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Teléfono
                  </label>
                  <input
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={form.telefono}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        telefono: normalizePhoneDigits(event.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                    placeholder="5512345678"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Observaciones
                </label>
                <textarea
                  value={form.observaciones}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      observaciones: event.target.value,
                    }))
                  }
                  className="min-h-[100px] w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Notas generales del paciente..."
                />
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {editingPaciente ? "Guardar Cambios" : "Guardar Paciente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pacienteToDelete)}
        title="¿Eliminar paciente?"
        description={`Se eliminará a ${
          pacienteToDelete?.nombre ?? "este paciente"
        } del listado mockeado.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeletePaciente}
        onCancel={() => setPacienteToDelete(null)}
      />
    </section>
  );
}

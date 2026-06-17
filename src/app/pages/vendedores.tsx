import { useMemo, useState, type FormEvent } from "react";
import { Edit, Plus, Search, Trash2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { VENDEDORES_MOCK } from "../../mocks/vendedores.mock";
import {
  formatPhoneNumber,
  isTenDigitPhone,
  normalizePhoneDigits,
} from "../../utils/phone";
import { ConfirmDialog } from "../components/confirm-dialog";
import { Button, Card, Field, Input, PageHeader, Select } from "../components/ui";
import type { Vendedor } from "../../types/vendedor.types";

const estadoClasses: Record<Vendedor["estado"], string> = {
  Activo: "badge-activo rounded-full border px-2 py-0.5 text-xs",
  Inactivo: "badge-inactivo rounded-full border px-2 py-0.5 text-xs",
};

const initialForm = {
  nombre: "",
  email: "",
  telefono: "",
  ventasMes: "0",
  estado: "Activo" as Vendedor["estado"],
};

export function Vendedores() {
  const [searchQuery, setSearchQuery] = useState("");
  const [vendedores, setVendedores] = useState<Vendedor[]>(VENDEDORES_MOCK);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null);
  const [vendedorToDelete, setVendedorToDelete] = useState<Vendedor | null>(
    null,
  );

  const [form, setForm] = useState(initialForm);

  const filteredVendedores = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return vendedores.filter((vendedor) =>
      [
        vendedor.nombre,
        vendedor.email,
        vendedor.telefono,
        vendedor.estado,
      ].some((field) => field.toLowerCase().includes(query)),
    );
  }, [vendedores, searchQuery]);

  function resetForm() {
    setForm(initialForm);
  }

  function getNextVendedorId() {
    return (
      vendedores.reduce((maxId, vendedor) => Math.max(maxId, vendedor.id), 0) + 1
    );
  }

  function openCreateModal() {
    setEditingVendedor(null);
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(vendedor: Vendedor) {
    setEditingVendedor(vendedor);
    setForm({
      nombre: vendedor.nombre,
      email: vendedor.email,
      telefono: vendedor.telefono,
      ventasMes: String(vendedor.ventasMes),
      estado: vendedor.estado,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingVendedor(null);
    resetForm();
  }

  function handleSaveVendedor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.nombre.trim() || !form.email.trim() || !form.telefono.trim()) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    if (!isTenDigitPhone(form.telefono)) {
      toast.error("El telefono debe tener exactamente 10 digitos");
      return;
    }

    const savedVendedor: Vendedor = {
      id: editingVendedor?.id ?? getNextVendedorId(),
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      telefono: normalizePhoneDigits(form.telefono),
      ventasMes: Number(form.ventasMes),
      estado: form.estado,
    };

    setVendedores((current) => {
      if (editingVendedor) {
        return current.map((vendedor) =>
          vendedor.id === editingVendedor.id ? savedVendedor : vendedor,
        );
      }

      return [savedVendedor, ...current];
    });

    closeModal();

    toast.success(
      editingVendedor
        ? "Vendedor actualizado en modo mock"
        : "Vendedor agregado en modo mock",
    );
  }

  function confirmDeleteVendedor() {
    if (!vendedorToDelete) return;

    setVendedores((current) =>
      current.filter((vendedor) => vendedor.id !== vendedorToDelete.id),
    );

    toast.success("Vendedor eliminado en modo mock");
    setVendedorToDelete(null);
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Vendedores"
        description="Administra usuarios vendedores del sistema"
        action={
          <Button onClick={openCreateModal}>
            <UserPlus size={18} />
            Nuevo Vendedor
          </Button>
        }
      />

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />

        <Input
          placeholder="Buscar por nombre, correo, teléfono o estado..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="rounded-xl py-2 pl-10 pr-3"
        />
      </div>

      {filteredVendedores.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No se encontraron vendedores.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVendedores.map((vendedor) => (
            <Card
              key={vendedor.id}
              className="p-5 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">
                      {vendedor.nombre}
                    </h2>

                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        estadoClasses[vendedor.estado]
                      }`}
                    >
                      {vendedor.estado}
                    </span>
                  </div>

                  <p className="break-all text-sm text-muted-foreground">
                    {vendedor.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatPhoneNumber(vendedor.telefono)}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditModal(vendedor)}
                    title="Editar vendedor"
                  >
                    <Edit size={16} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setVendedorToDelete(vendedor)}
                    className="text-destructive"
                    title="Eliminar vendedor"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <div className="rounded-xl bg-muted p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Ventas del mes
                </p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {vendedor.ventasMes}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => openEditModal(vendedor)}
                className="mt-4 w-full"
              >
                Editar vendedor
              </Button>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto p-4 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {editingVendedor ? "Editar Vendedor" : "Agregar Nuevo Vendedor"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Este usuario se guarda solo en memoria mientras la app está abierta.
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={closeModal}
              >
                <X size={18} />
              </Button>
            </div>

            <form onSubmit={handleSaveVendedor} className="space-y-4">
              <div className="space-y-2">
                <Field>
                  Nombre
                </Field>
                <Input
                  value={form.nombre}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nombre: event.target.value,
                    }))
                  }
                  placeholder="Ej. Sofía Hernández"
                />
              </div>

              <div className="space-y-2">
                <Field>
                  Correo
                </Field>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="correo@vetcare.com"
                />
              </div>

              <div className="space-y-2">
                <Field>
                  Teléfono
                </Field>
                <Input
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
                  placeholder="5512345678"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Field>
                    Ventas del mes
                  </Field>
                  <Input
                    type="number"
                    min="0"
                    value={form.ventasMes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        ventasMes: event.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Field>
                    Estado
                  </Field>
                  <Select
                    value={form.estado}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        estado: event.target.value as Vendedor["estado"],
                      }))
                    }
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={closeModal}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                >
                  <Plus size={16} />
                  {editingVendedor ? "Guardar Cambios" : "Guardar Vendedor"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(vendedorToDelete)}
        title="¿Eliminar vendedor?"
        description={`Se eliminará a ${
          vendedorToDelete?.nombre ?? "este vendedor"
        } del listado mockeado.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteVendedor}
        onCancel={() => setVendedorToDelete(null)}
      />
    </section>
  );
}

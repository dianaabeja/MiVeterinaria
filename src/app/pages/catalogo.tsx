import { useMemo, useState, type FormEvent } from "react";
import { PackagePlus, Pencil, Search, ShoppingCart, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../core/auth/auth-context";
import { useProducts } from "../../core/products/product-context";
import { ConfirmDialog } from "../components/confirm-dialog";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
} from "../components/ui";
import type {
  CategoriaKey,
  Producto,
  TipoVentaProducto,
  UnidadProducto,
} from "../../types/producto.types";

const categoriaLabels: Record<CategoriaKey, Producto["categoria"]> = {
  juguetes: "Juguetes",
  ropa: "Ropa",
  medicina: "Medicina",
};

const tabs: { key: CategoriaKey; label: string }[] = [
  { key: "juguetes", label: "Juguetes" },
  { key: "ropa", label: "Ropa" },
  { key: "medicina", label: "Medicina a Granel" },
];

interface EditingProduct {
  product: Producto;
  categoryKey: CategoriaKey;
}

export function Catalogo() {
  const { can } = useAuth();
  const { productos, setProductos } = useProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoriaKey>("juguetes");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(
    null,
  );
  const [productToDelete, setProductToDelete] = useState<EditingProduct | null>(
    null,
  );

  const [form, setForm] = useState({
    nombre: "",
    categoria: "juguetes" as CategoriaKey,
    precio: "",
    stock: "",
    tipoVenta: "unidad" as TipoVentaProducto,
    unidad: "pz" as UnidadProducto,
    cantidadMinimaVenta: "1",
  });

  const filteredProducts = useMemo(() => {
    return productos[selectedCategory].filter((producto) =>
      producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [productos, selectedCategory, searchQuery]);

  function resetForm() {
    setForm({
      nombre: "",
      categoria: "juguetes",
      precio: "",
      stock: "",
      tipoVenta: "unidad",
      unidad: "pz",
      cantidadMinimaVenta: "1",
    });
  }

  function getNextProductId() {
    return (
      Object.values(productos)
        .flat()
        .reduce((maxId, producto) => Math.max(maxId, producto.id), 0) + 1
    );
  }

  function openCreateModal() {
    setEditingProduct(null);
    resetForm();
    setIsProductModalOpen(true);
  }

  function openEditModal(product: Producto, categoryKey: CategoriaKey) {
    setEditingProduct({ product, categoryKey });
    setForm({
      nombre: product.nombre,
      categoria: categoryKey,
      precio: String(product.precio),
      stock: String(product.stock),
      tipoVenta: product.tipoVenta,
      unidad: product.unidad,
      cantidadMinimaVenta: String(product.cantidadMinimaVenta),
    });
    setIsProductModalOpen(true);
  }

  function closeProductModal() {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    resetForm();
  }

  function handleSaveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const isEditing = Boolean(editingProduct);

    if (!isEditing && !can("catalog:create")) {
      toast.error("Solo el administrador puede agregar productos");
      return;
    }

    if (isEditing && !can("catalog:edit")) {
      toast.error("No tienes permiso para editar productos");
      return;
    }

    if (!form.nombre.trim() || !form.precio || !form.stock) {
      toast.error("Completa todos los campos");
      return;
    }

    const savedProduct: Producto = {
      id: editingProduct?.product.id ?? getNextProductId(),
      nombre: form.nombre.trim(),
      imagenUrl: editingProduct?.product.imagenUrl ?? "/productos/producto-default.jpg",
      precio: Number(form.precio),
      stock: Number(form.stock),
      categoria: categoriaLabels[form.categoria],
      tipoVenta: form.tipoVenta,
      unidad: form.unidad,
      cantidadMinimaVenta: Number(form.cantidadMinimaVenta),
    };

    setProductos((current) => {
      const next = {
        juguetes: current.juguetes.filter(
          (producto) => producto.id !== savedProduct.id,
        ),
        ropa: current.ropa.filter((producto) => producto.id !== savedProduct.id),
        medicina: current.medicina.filter(
          (producto) => producto.id !== savedProduct.id,
        ),
      };

      return {
        ...next,
        [form.categoria]: [savedProduct, ...next[form.categoria]],
      };
    });

    setSelectedCategory(form.categoria);
    closeProductModal();
    toast.success(isEditing ? "Producto actualizado" : "Producto agregado");
  }

  function confirmDeleteProduct() {
    if (!productToDelete) {
      return;
    }

    if (!can("catalog:delete")) {
      toast.error("No tienes permiso para eliminar productos");
      return;
    }

    setProductos((current) => ({
      ...current,
      [productToDelete.categoryKey]: current[productToDelete.categoryKey].filter(
        (producto) => producto.id !== productToDelete.product.id,
      ),
    }));

    toast.success("Producto eliminado");
    setProductToDelete(null);
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Catalogo"
        description="Visualiza, agrega, edita y borra productos del inventario"
        action={
          can("catalog:create") ? (
            <Button onClick={openCreateModal}>
              <PackagePlus size={18} />
              Nuevo Producto
            </Button>
          ) : null
        }
      />

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          placeholder="Buscar producto..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="rounded-xl py-2 pl-10 pr-3"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedCategory(tab.key)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedCategory === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No se encontraron productos.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((producto) => (
            <Card
              key={producto.id}
              className="overflow-hidden transition-shadow hover:shadow-lg"
            >
              <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-secondary to-accent/40">
                <ShoppingCart className="text-primary/45" size={56} />
                <img
                  src={producto.imagenUrl}
                  alt={producto.nombre}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-foreground">
                    {producto.nombre}
                  </h2>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${
                      producto.stock > producto.cantidadMinimaVenta * 3
                        ? "badge-activo"
                        : "badge-inactivo"
                    }`}
                  >
                    {producto.stock} {producto.unidad}
                  </span>
                </div>

                <p className="text-2xl font-bold text-primary">
                  ${producto.precio.toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / {producto.unidad}
                  </span>
                </p>

                <p className="text-xs text-muted-foreground">
                  {producto.tipoVenta === "granel"
                    ? `Venta minima: ${producto.cantidadMinimaVenta} ${producto.unidad}`
                    : "Venta por pieza"}
                </p>

              <div className="grid gap-2 sm:grid-cols-2">
                  {can("catalog:edit") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(producto, selectedCategory)}
                    >
                      <Pencil size={14} />
                      Editar
                    </Button>
                  )}

                  {can("catalog:delete") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setProductToDelete({
                          product: producto,
                          categoryKey: selectedCategory,
                        })
                      }
                      className="text-destructive"
                    >
                      <Trash2 size={14} />
                      Borrar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto p-4 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Los cambios se guardan solo en memoria.
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={closeProductModal}
              >
                <X size={18} />
              </Button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-2">
                <Field>
                  Nombre del producto
                </Field>
                <Input
                  value={form.nombre}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, nombre: event.target.value }))
                  }
                  placeholder="Ej. Antibiotico a Granel"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Field>
                    Categoria
                  </Field>
                  <Select
                    value={form.categoria}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        categoria: event.target.value as CategoriaKey,
                      }))
                    }
                  >
                    <option value="juguetes">Juguetes</option>
                    <option value="ropa">Ropa</option>
                    <option value="medicina">Medicina</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Field>
                    Tipo de venta
                  </Field>
                  <Select
                    value={form.tipoVenta}
                    onChange={(event) => {
                      const tipoVenta = event.target.value as TipoVentaProducto;

                      setForm((current) => ({
                        ...current,
                        tipoVenta,
                        unidad: tipoVenta === "unidad" ? "pz" : current.unidad,
                        cantidadMinimaVenta:
                          tipoVenta === "unidad" ? "1" : current.cantidadMinimaVenta,
                      }));
                    }}
                  >
                    <option value="unidad">Por unidad</option>
                    <option value="granel">A granel</option>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Field>
                    Precio por unidad
                  </Field>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, precio: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Field>
                    Stock
                  </Field>
                  <Input
                    type="number"
                    min="0"
                    step={form.tipoVenta === "unidad" ? "1" : "0.1"}
                    value={form.stock}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, stock: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Field>
                    Unidad
                  </Field>
                  <Select
                    value={form.unidad}
                    disabled={form.tipoVenta === "unidad"}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        unidad: event.target.value as UnidadProducto,
                      }))
                    }
                  >
                    <option value="pz">pz</option>
                    <option value="ml">ml</option>
                    <option value="g">g</option>
                  </Select>
                </div>
              </div>

              {form.tipoVenta === "granel" && (
                <div className="space-y-2">
                  <Field>
                    Cantidad minima de venta
                  </Field>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.cantidadMinimaVenta}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        cantidadMinimaVenta: event.target.value,
                      }))
                    }
                  />
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={closeProductModal}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                >
                  {editingProduct ? "Guardar Cambios" : "Guardar Producto"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(productToDelete)}
        title="Borrar producto?"
        description={`Esta accion eliminara ${
          productToDelete?.product.nombre ?? "este producto"
        } del catalogo mockeado.`}
        confirmText="Si, borrar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </section>
  );
}

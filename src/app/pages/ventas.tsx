import { useMemo, useState, type FormEvent } from "react";
import { FileDown, Plus, ReceiptText, Search, Trash2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { useAuth } from "../../core/auth/auth-context";
import { useProducts } from "../../core/products/product-context";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Field,
  Input,
  PageHeader,
  Select,
} from "../components/ui";
import type { Producto } from "../../types/producto.types";

interface CartItem {
  productId: number;
  cantidad: number;
}

interface TicketItem {
  productId: number;
  nombre: string;
  cantidad: number;
  unidad: string;
  precio: number;
  subtotal: number;
}

interface Ticket {
  folio: string;
  cliente: string;
  vendedor: string;
  fecha: string;
  items: TicketItem[];
  total: number;
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function buildTicketFolio() {
  return `VT-${Date.now().toString().slice(-6)}`;
}

export function Ventas() {
  const { can, user } = useAuth();
  const { allProducts, setProductos } = useProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [cliente, setCliente] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const productById = useMemo(() => {
    return new Map(allProducts.map((product) => [product.id, product]));
  }, [allProducts]);

  const availableProducts = useMemo(() => {
    return allProducts
      .filter((product) => product.stock > 0)
      .filter((product) =>
        product.nombre.toLowerCase().includes(searchQuery.toLowerCase()),
      );
  }, [allProducts, searchQuery]);

  const selectedProduct = selectedProductId
    ? productById.get(Number(selectedProductId)) ?? null
    : null;

  const cartRows = cart
    .map((item) => {
      const product = productById.get(item.productId);

      if (!product) {
        return null;
      }

      return {
        ...item,
        product,
        subtotal: item.cantidad * product.precio,
      };
    })
    .filter(Boolean) as Array<CartItem & { product: Producto; subtotal: number }>;

  const total = cartRows.reduce((sum, item) => sum + item.subtotal, 0);

  function getReservedQuantity(productId: number) {
    return cart
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.cantidad, 0);
  }

  function validateQuantity(product: Producto, quantity: number) {
    if (!quantity || quantity <= 0) {
      toast.error("Ingresa una cantidad valida");
      return false;
    }

    if (quantity < product.cantidadMinimaVenta) {
      toast.error(
        `La venta minima de ${product.nombre} es ${product.cantidadMinimaVenta} ${product.unidad}`,
      );
      return false;
    }

    if (product.tipoVenta === "unidad" && !Number.isInteger(quantity)) {
      toast.error("Los productos por unidad deben venderse en cantidades enteras");
      return false;
    }

    if (quantity + getReservedQuantity(product.id) > product.stock) {
      toast.error("No hay stock suficiente para agregar ese producto");
      return false;
    }

    return true;
  }

  function handleAddProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!can("sales:create")) {
      toast.error("No tienes permiso para registrar ventas");
      return;
    }

    if (!selectedProduct) {
      toast.error("Selecciona un producto");
      return;
    }

    const quantity = Number(cantidad);

    if (!validateQuantity(selectedProduct, quantity)) {
      return;
    }

    setCart((current) => {
      const existingItem = current.find(
        (item) => item.productId === selectedProduct.id,
      );

      if (!existingItem) {
        return [...current, { productId: selectedProduct.id, cantidad: quantity }];
      }

      return current.map((item) =>
        item.productId === selectedProduct.id
          ? { ...item, cantidad: item.cantidad + quantity }
          : item,
      );
    });

    setSelectedProductId("");
    setCantidad("1");
  }

  function removeCartItem(productId: number) {
    setCart((current) => current.filter((item) => item.productId !== productId));
  }

  function confirmSale() {
    if (!can("sales:create")) {
      toast.error("No tienes permiso para registrar ventas");
      return;
    }

    if (cartRows.length === 0) {
      toast.error("Agrega al menos un producto a la venta");
      return;
    }

    const invalidItem = cartRows.find((item) => item.cantidad > item.product.stock);

    if (invalidItem) {
      toast.error(`No hay stock suficiente para ${invalidItem.product.nombre}`);
      return;
    }

    const nextTicket: Ticket = {
      folio: buildTicketFolio(),
      cliente: cliente.trim() || "Cliente general",
      vendedor: user?.name ?? "Usuario",
      fecha: new Date().toLocaleString("es-MX"),
      total,
      items: cartRows.map((item) => ({
        productId: item.product.id,
        nombre: item.product.nombre,
        cantidad: item.cantidad,
        unidad: item.product.unidad,
        precio: item.product.precio,
        subtotal: item.subtotal,
      })),
    };

    setProductos((current) => ({
      juguetes: current.juguetes.map((product) => {
        const soldItem = cart.find((item) => item.productId === product.id);
        return soldItem
          ? { ...product, stock: product.stock - soldItem.cantidad }
          : product;
      }),
      ropa: current.ropa.map((product) => {
        const soldItem = cart.find((item) => item.productId === product.id);
        return soldItem
          ? { ...product, stock: product.stock - soldItem.cantidad }
          : product;
      }),
      medicina: current.medicina.map((product) => {
        const soldItem = cart.find((item) => item.productId === product.id);
        return soldItem
          ? { ...product, stock: product.stock - soldItem.cantidad }
          : product;
      }),
    }));

    setTicket(nextTicket);
    setCart([]);
    setCliente("");
    toast.success("Venta registrada y ticket generado");
  }

  function downloadTicket() {
    if (!ticket) {
      return;
    }

    const doc = new jsPDF({ unit: "mm", format: [80, 160] });
    let y = 10;

    doc.setFontSize(14);
    doc.text("VetCare", 40, y, { align: "center" });
    y += 7;
    doc.setFontSize(10);
    doc.text("Ticket de venta", 40, y, { align: "center" });
    y += 8;
    doc.text(`Folio: ${ticket.folio}`, 6, y);
    y += 5;
    doc.text(`Fecha: ${ticket.fecha}`, 6, y);
    y += 5;
    doc.text(`Cliente: ${ticket.cliente}`, 6, y);
    y += 5;
    doc.text(`Vendedor: ${ticket.vendedor}`, 6, y);
    y += 6;
    doc.line(6, y, 74, y);
    y += 6;

    ticket.items.forEach((item) => {
      doc.text(item.nombre.slice(0, 28), 6, y);
      y += 5;
      doc.text(
        `${item.cantidad} ${item.unidad} x ${formatCurrency(item.precio)}`,
        6,
        y,
      );
      doc.text(formatCurrency(item.subtotal), 74, y, { align: "right" });
      y += 6;
    });

    doc.line(6, y, 74, y);
    y += 7;
    doc.setFontSize(12);
    doc.text("Total", 6, y);
    doc.text(formatCurrency(ticket.total), 74, y, { align: "right" });
    y += 10;
    doc.setFontSize(9);
    doc.text("Gracias por su compra", 40, y, { align: "center" });
    doc.save(`${ticket.folio}.pdf`);
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Ventas"
        description="Registra ventas con uno o varios productos y genera el ticket."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <form
            onSubmit={handleAddProduct}
            className="vet-surface space-y-4 rounded-2xl bg-card p-5"
          >
            <div className="grid gap-4 md:grid-cols-[1fr_160px]">
              <div className="space-y-2">
                <Field>Cliente</Field>
                <Input
                  value={cliente}
                  onChange={(event) => setCliente(event.target.value)}
                  placeholder="Cliente general"
                />
              </div>

              <div className="space-y-2">
                <Field>Cantidad</Field>
                <Input
                  type="number"
                  min={selectedProduct?.cantidadMinimaVenta ?? 0}
                  max={selectedProduct?.stock}
                  step={selectedProduct?.tipoVenta === "granel" ? "0.1" : "1"}
                  value={cantidad}
                  onChange={(event) => setCantidad(event.target.value)}
                />
              </div>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                placeholder="Buscar producto para vender..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="py-2 pl-10 pr-3"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Select
                value={selectedProductId}
                onChange={(event) => {
                  const product = productById.get(Number(event.target.value));
                  setSelectedProductId(event.target.value);
                  setCantidad(product ? String(product.cantidadMinimaVenta) : "1");
                }}
                className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecciona un producto</option>
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.nombre} - {formatCurrency(product.precio)} /{" "}
                    {product.unidad} - stock {product.stock}
                  </option>
                ))}
              </Select>

              <Button
                type="submit"
                className="w-full md:w-auto"
              >
                <Plus size={18} />
                Agregar
              </Button>
            </div>
          </form>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Productos de la venta</CardTitle>
            </CardHeader>

            {cartRows.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Agrega productos para iniciar una venta.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-muted text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Producto</th>
                      <th className="px-4 py-3 font-medium">Cantidad</th>
                      <th className="px-4 py-3 font-medium">Precio</th>
                      <th className="px-4 py-3 font-medium">Subtotal</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {cartRows.map((item) => (
                      <tr key={item.productId} className="border-t border-border">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {item.product.nombre}
                        </td>
                        <td className="px-4 py-3">
                          {item.cantidad} {item.product.unidad}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(item.product.precio)}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {formatCurrency(item.subtotal)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeCartItem(item.productId)}
                            className="rounded-lg p-2 text-destructive hover:bg-muted"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent>
            <h2 className="text-lg font-semibold text-foreground">Resumen</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Productos</span>
                <span className="font-medium">{cartRows.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
            <Button
              onClick={confirmSale}
              disabled={cartRows.length === 0}
              className="mt-5 w-full"
            >
              <ReceiptText size={18} />
              Generar ticket
            </Button>
            </CardContent>
          </Card>

          {ticket && (
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Ticket {ticket.folio}
                  </h2>
                  <p className="text-sm text-muted-foreground">{ticket.fecha}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={downloadTicket}
                  title="Descargar ticket"
                >
                  <FileDown size={18} />
                </Button>
              </div>

              <div className="mt-4 space-y-2 border-y border-dashed border-border py-4 text-sm">
                <p>Cliente: {ticket.cliente}</p>
                <p>Vendedor: {ticket.vendedor}</p>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                {ticket.items.map((item) => (
                  <div key={item.productId} className="flex justify-between gap-3">
                    <span>
                      {item.nombre}
                      <span className="block text-muted-foreground">
                        {item.cantidad} {item.unidad} x {formatCurrency(item.precio)}
                      </span>
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between border-t border-border pt-4 text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(ticket.total)}</span>
              </div>
            </Card>
          )}
        </aside>
      </div>
    </section>
  );
}

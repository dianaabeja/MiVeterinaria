import { useMemo, useState, type FormEvent } from "react";
import { Download, Eye, FileText, Plus, Search, X } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import {
  PACIENTES_DISPONIBLES_MOCK,
  RECETAS_MOCK,
} from "../../mocks/recetas.mock";
import { useAuth } from "../../core/auth/auth-context";
import type { Receta } from "../../types/receta.types";

const estadoClasses: Record<Receta["estado"], string> = {
  Activa: "badge-activa rounded-full border px-2 py-0.5 text-xs",
  Completada: "badge-completada rounded-full border px-2 py-0.5 text-xs",
};

export function Recetas() {
  const { can, user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [recetas, setRecetas] = useState<Receta[]>(RECETAS_MOCK);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recetaToView, setRecetaToView] = useState<Receta | null>(null);

  const [form, setForm] = useState({
    paciente: "",
    fecha: new Date().toISOString().slice(0, 10),
    diagnostico: "",
    sintomas: "",
    medicamento: "",
    cantidad: "",
    indicaciones: "",
    recomendaciones: "",
  });

  const filteredRecetas = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return recetas.filter((receta) =>
      [
        receta.paciente,
        receta.dueño,
        receta.diagnostico,
        receta.veterinario,
        receta.estado,
      ].some((field) => field.toLowerCase().includes(query)),
    );
  }, [recetas, searchQuery]);

  const recetasActivas = recetas.filter(
    (receta) => receta.estado === "Activa",
  ).length;

  const recetasCompletadas = recetas.filter(
    (receta) => receta.estado === "Completada",
  ).length;

  function resetForm() {
    setForm({
      paciente: "",
      fecha: new Date().toISOString().slice(0, 10),
      diagnostico: "",
      sintomas: "",
      medicamento: "",
      cantidad: "",
      indicaciones: "",
      recomendaciones: "",
    });
  }

  function getNextRecetaId() {
    return recetas.reduce((maxId, receta) => Math.max(maxId, receta.id), 0) + 1;
  }

  function handleCreateReceta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!can("recipes:create")) {
      toast.error("No tienes permiso para generar recetas");
      return;
    }

    if (
      !form.paciente ||
      !form.fecha ||
      !form.diagnostico.trim() ||
      !form.medicamento.trim()
    ) {
      toast.error("Completa los campos obligatorios");
      return;
    }

    const pacienteSeleccionado = PACIENTES_DISPONIBLES_MOCK.find(
      (paciente) => paciente.nombre === form.paciente,
    );

    const medicamentos = [
      `${form.medicamento.trim()}${
        form.cantidad.trim() ? ` | Cantidad: ${form.cantidad.trim()}` : ""
      }${form.indicaciones.trim() ? ` | Indicaciones: ${form.indicaciones.trim()}` : ""}`,
    ];

    const newReceta: Receta = {
      id: getNextRecetaId(),
      fecha: form.fecha,
      paciente: form.paciente,
      dueño: pacienteSeleccionado?.dueño ?? "Sin dueño registrado",
      veterinario: user?.name ?? "Veterinario mock",
      diagnostico: form.diagnostico.trim(),
      medicamentos,
      estado: "Activa",
    };

    setRecetas((current) => [newReceta, ...current]);
    setIsModalOpen(false);
    resetForm();

    toast.success("Receta generada en modo mock");
  }

  function handleDownloadReceta(receta: Receta) {
    if (!can("recipes:download")) {
      toast.error("No tienes permiso para descargar recetas");
      return;
    }

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const purple: [number, number, number] = [139, 107, 179];
    const purpleDark: [number, number, number] = [45, 36, 64];
    const purpleLight: [number, number, number] = [233, 223, 247];
    const purpleSoft: [number, number, number] = [248, 244, 252];
    const textColor: [number, number, number] = [26, 26, 26];
    const muted: [number, number, number] = [107, 93, 124];
    const border: [number, number, number] = [216, 201, 238];
    const white: [number, number, number] = [255, 255, 255];

    const marginX = 16;
    const contentWidth = pageWidth - marginX * 2;
    const footerY = pageHeight - 18;

    let y = 14;

    function fill(colorValue: [number, number, number]) {
      doc.setFillColor(colorValue[0], colorValue[1], colorValue[2]);
    }

    function draw(colorValue: [number, number, number]) {
      doc.setDrawColor(colorValue[0], colorValue[1], colorValue[2]);
    }

    function color(colorValue: [number, number, number]) {
      doc.setTextColor(colorValue[0], colorValue[1], colorValue[2]);
    }

    function addFooter() {
      draw(border);
      doc.setLineWidth(0.3);
      doc.line(marginX, footerY, pageWidth - marginX, footerY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      color(muted);
      doc.text("VetCare - Receta generada en modo mock", marginX, pageHeight - 11);
      doc.text("Documento demostrativo", pageWidth - marginX, pageHeight - 11, {
        align: "right",
      });
    }

    function addNewPage() {
      addFooter();
      doc.addPage();

      fill(white);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      fill(purple);
      doc.roundedRect(marginX, 12, contentWidth, 16, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      color(white);
      doc.text("VetCare", marginX + 6, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Continuación de receta médica", pageWidth - marginX - 6, 22, {
        align: "right",
      });

      y = 38;
    }

    function ensureSpace(requiredHeight: number) {
      if (y + requiredHeight > footerY - 8) {
        addNewPage();
      }
    }

    function label(labelText: string, value: string, x: number, labelY: number) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      color(muted);
      doc.text(labelText.toUpperCase(), x, labelY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      color(textColor);
      doc.text(value || "N/A", x, labelY + 6);
    }

    function sectionTitle(title: string) {
      ensureSpace(18);

      fill(purpleLight);
      draw(border);
      doc.roundedRect(marginX, y, contentWidth, 10, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      color(purpleDark);
      doc.text(title.toUpperCase(), marginX + 5, y + 6.8);

      y += 16;
    }

    function paragraphBox(value: string, minHeight = 24) {
      const lines = doc.splitTextToSize(value || "N/A", contentWidth - 12);
      const boxHeight = Math.max(minHeight, lines.length * 6 + 12);

      ensureSpace(boxHeight + 8);

      draw(border);
      doc.roundedRect(marginX, y, contentWidth, boxHeight, 3, 3, "D");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      color(textColor);
      doc.text(lines, marginX + 6, y + 10);

      y += boxHeight + 10;
    }

    function drawHeader() {
      fill(white);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      fill(purple);
      doc.roundedRect(marginX, y, contentWidth, 34, 4, 4, "F");

      fill(white);
      doc.circle(31, 31, 9, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      color(purple);
      doc.text("VC", 31, 34, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      color(white);
      doc.text("VetCare", 44, 28);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Clínica y administración veterinaria", 44, 37);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("RECETA MÉDICA", pageWidth - 22, 29, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Veterinaria", pageWidth - 22, 38, { align: "right" });

      y += 42;
    }

    drawHeader();

    const folio = "REC-" + String(receta.id).padStart(4, "0");
    const fecha = new Date(receta.fecha).toLocaleDateString("es-MX");

    ensureSpace(35);

    fill(purpleSoft);
    draw(border);
    doc.roundedRect(marginX, y, contentWidth, 25, 3, 3, "FD");

    label("Folio", folio, marginX + 6, y + 10);
    label("Fecha", fecha, marginX + 58, y + 10);
    label("Estado", receta.estado, marginX + 110, y + 10);

    y += 36;

    sectionTitle("Información del paciente");

    ensureSpace(42);

    draw(border);
    doc.roundedRect(marginX, y, contentWidth, 34, 3, 3, "D");

    label("Paciente", receta.paciente, marginX + 6, y + 11);
    label("Dueño / tutor", receta.dueño, marginX + 76, y + 11);
    label("Veterinario responsable", receta.veterinario, marginX + 6, y + 25);

    y += 44;

    sectionTitle("Diagnóstico");
    paragraphBox(receta.diagnostico, 24);

    sectionTitle("Prescripción e indicaciones");

    ensureSpace(22);

    fill(purple);
    doc.roundedRect(marginX, y, contentWidth, 10, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    color(white);
    doc.text("#", marginX + 6, y + 6.5);
    doc.text("MEDICAMENTO / DOSIS / INDICACIONES", marginX + 18, y + 6.5);

    y += 10;

    receta.medicamentos.forEach((medicamento, index) => {
      const lines = doc.splitTextToSize(medicamento, contentWidth - 28);
      const rowHeight = Math.max(16, lines.length * 5 + 9);

      ensureSpace(rowHeight + 4);

      fill(index % 2 === 0 ? white : purpleSoft);
      draw(border);
      doc.rect(marginX, y, contentWidth, rowHeight, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      color(purpleDark);
      doc.text(String(index + 1), marginX + 7, y + 9);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      color(textColor);
      doc.text(lines, marginX + 18, y + 9);

      y += rowHeight;
    });

    y += 12;

    sectionTitle("Recomendaciones generales");

    const recomendaciones =
      "Seguir las indicaciones del médico veterinario. No suspender el tratamiento sin autorización profesional. Mantener al paciente en observación y acudir a revisión si los síntomas persisten o empeoran.";

    const recomendacionLines = doc.splitTextToSize(recomendaciones, contentWidth - 12);
    const recomendacionHeight = recomendacionLines.length * 5 + 14;

    ensureSpace(recomendacionHeight + 12);

    fill(purpleSoft);
    draw(border);
    doc.roundedRect(marginX, y, contentWidth, recomendacionHeight, 3, 3, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    color(textColor);
    doc.text(recomendacionLines, marginX + 6, y + 10);

    y += recomendacionHeight + 14;

    const notaText =
      "Este documento fue generado como simulación dentro del sistema VetCare. No sustituye una receta oficial emitida y firmada por un médico veterinario autorizado.";

    const notaLines = doc.splitTextToSize(notaText, contentWidth - 12);
    const notaHeight = notaLines.length * 5 + 15;

    ensureSpace(notaHeight + 46);

    draw(border);
    doc.roundedRect(marginX, y, contentWidth, notaHeight, 3, 3, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    color(muted);
    doc.text("NOTA", marginX + 6, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(notaLines, marginX + 6, y + 15);

    y += notaHeight + 28;

    ensureSpace(28);

    draw(textColor);
    doc.line(pageWidth - 92, y, pageWidth - 22, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    color(muted);
    doc.text("Firma del médico veterinario", pageWidth - 57, y + 7, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    color(textColor);
    doc.text(receta.veterinario, pageWidth - 57, y + 14, {
      align: "center",
    });

    addFooter();

    doc.save("receta-profesional-" + receta.paciente.toLowerCase() + "-" + receta.id + ".pdf");

    toast.success("PDF profesional descargado: receta de " + receta.paciente);
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Recetas Médicas
          </h1>
          <p className="text-muted-foreground">
            Genera, visualiza y descarga recetas veterinarias en PDF
          </p>
        </div>

        {can("recipes:create") && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
          >
            <Plus size={18} />
            Nueva Receta
          </button>
        )}
      </header>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />

        <input
          placeholder="Buscar por paciente, dueño, diagnóstico o veterinario..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full rounded-xl border border-border bg-input-background py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Recetas Activas</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {recetasActivas}
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Recetas del Mes</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {recetas.length}
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Recetas Completadas</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {recetasCompletadas}
          </p>
        </article>
      </div>

      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-foreground">
            Historial de Recetas
          </h2>
          <p className="text-sm text-muted-foreground">
            Listado de recetas generadas
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Paciente</th>
                <th className="px-4 py-3 font-medium">Dueño</th>
                <th className="px-4 py-3 font-medium">Diagnóstico</th>
                <th className="px-4 py-3 font-medium">Veterinario</th>
                <th className="px-4 py-3 font-medium">Medicamentos</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filteredRecetas.map((receta) => (
                <tr key={receta.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-foreground">
                    {new Date(receta.fecha).toLocaleDateString("es-MX")}
                  </td>

                  <td className="px-4 py-3 font-medium text-foreground">
                    {receta.paciente}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {receta.dueño}
                  </td>

                  <td className="px-4 py-3 text-foreground">
                    {receta.diagnostico}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {receta.veterinario}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {receta.medicamentos.map((medicamento) => (
                        <span
                          key={medicamento}
                          className="pill-med"
                        >
                          {medicamento}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        estadoClasses[receta.estado]
                      }`}
                    >
                      {receta.estado}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setRecetaToView(receta)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Ver receta"
                      >
                        <Eye size={16} />
                      </button>

                      {can("recipes:download") && (
                        <button
                          type="button"
                          onClick={() => handleDownloadReceta(receta)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Descargar PDF"
                        >
                          <Download size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecetas.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No se encontraron recetas.
            </div>
          )}
        </div>
      </article>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Generar Nueva Receta
                </h2>
                <p className="text-sm text-muted-foreground">
                  Este registro se guarda solo en memoria mientras la app está abierta.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateReceta} className="space-y-6">
              <section className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Información del paciente
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <select
                    value={form.paciente}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        paciente: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Selecciona un paciente</option>
                    {PACIENTES_DISPONIBLES_MOCK.map((paciente) => (
                      <option key={paciente.nombre} value={paciente.nombre}>
                        {paciente.nombre} - {paciente.dueño}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={form.fecha}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        fecha: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Diagnóstico y observaciones
                </h3>

                <input
                  value={form.diagnostico}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      diagnostico: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Diagnóstico"
                />

                <textarea
                  value={form.sintomas}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sintomas: event.target.value,
                    }))
                  }
                  className="min-h-[80px] w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Síntomas u observaciones..."
                />
              </section>

              <section className="space-y-4 rounded-xl border border-border p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Prescripción
                </h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  <input
                    value={form.medicamento}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        medicamento: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring sm:col-span-2"
                    placeholder="Medicamento"
                  />

                  <input
                    value={form.cantidad}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        cantidad: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Cantidad"
                  />
                </div>

                <textarea
                  value={form.indicaciones}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      indicaciones: event.target.value,
                    }))
                  }
                  className="min-h-[60px] w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Dosis e indicaciones..."
                />
              </section>

              <textarea
                value={form.recomendaciones}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    recomendaciones: event.target.value,
                  }))
                }
                className="min-h-[100px] w-full rounded-lg border border-border bg-input-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                placeholder="Recomendaciones adicionales..."
              />

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <FileText size={16} />
                  Generar Receta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {recetaToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
            <div className="rounded-t-2xl bg-primary p-4 text-primary-foreground sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm opacity-80">VetCare</p>
                  <h2 className="text-xl font-bold sm:text-2xl">
                    Receta Médica Veterinaria
                  </h2>
                  <p className="text-sm opacity-80">
                    Folio REC-{String(recetaToView.id).padStart(4, "0")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setRecetaToView(null)}
                  className="rounded-lg p-2 hover:bg-white/20"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-4 sm:p-6">
              <div className="grid gap-4 rounded-xl border border-border bg-muted p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Fecha
                  </p>
                  <p className="font-medium text-foreground">
                    {new Date(recetaToView.fecha).toLocaleDateString("es-MX")}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Estado
                  </p>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                      estadoClasses[recetaToView.estado]
                    }`}
                  >
                    {recetaToView.estado}
                  </span>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Veterinario
                  </p>
                  <p className="font-medium text-foreground">
                    {recetaToView.veterinario}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Paciente
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {recetaToView.paciente}
                  </p>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Dueño
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {recetaToView.dueño}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Diagnóstico
                </p>
                <p className="mt-2 text-foreground">
                  {recetaToView.diagnostico}
                </p>
              </div>

              <div className="rounded-xl border border-border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Medicamentos / Indicaciones
                </p>

                <div className="mt-3 space-y-2">
                  {recetaToView.medicamentos.map((medicamento, index) => (
                    <div
                      key={`${medicamento}-${index}`}
                      className="rounded-lg bg-muted p-3 text-sm text-foreground"
                    >
                      {index + 1}. {medicamento}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setRecetaToView(null)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cerrar
                </button>

                {can("recipes:download") && (
                  <button
                    type="button"
                    onClick={() => handleDownloadReceta(recetaToView)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Download size={16} />
                    Descargar PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

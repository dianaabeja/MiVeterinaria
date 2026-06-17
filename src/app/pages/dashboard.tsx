import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  PRODUCT_CATEGORIES_MOCK,
  RECENT_ACTIVITY_MOCK,
  SALES_DATA_MOCK,
  STATS_MOCK,
} from "../../mocks/dashboard.mock";

export function Dashboard() {
  return (
    <section className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de administración veterinaria
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATS_MOCK.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith("+");

          return (
            <article
              key={stat.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.title}</p>

                <div className={`rounded-xl p-2 ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>

                <p
                  className={`mt-1 text-xs ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change} respecto al mes anterior
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Ventas y Consultas
            </h2>
            <p className="text-sm text-muted-foreground">
              Comparativo mensual
            </p>
          </div>

          <div className="h-[240px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SALES_DATA_MOCK}>
                <CartesianGrid stroke="rgba(155,127,212,0.12)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#7a6896" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#7a6896" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid rgba(155,127,212,0.2)",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(155,127,212,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="#9b7fd4"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="consultas"
                  stroke="#c8b5e6"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Productos por Categoría
            </h2>
            <p className="text-sm text-muted-foreground">
              Inventario agrupado por tipo
            </p>
          </div>

          <div className="h-[240px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PRODUCT_CATEGORIES_MOCK}>
                <CartesianGrid stroke="rgba(155,127,212,0.12)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#7a6896" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#7a6896" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid rgba(155,127,212,0.2)",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(155,127,212,0.1)",
                  }}
                />
                <Bar dataKey="cantidad" fill="#9b7fd4" radius={[4, 4, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Actividad Reciente
          </h2>
          <p className="text-sm text-muted-foreground">
            Últimos movimientos del sistema
          </p>
        </div>

        <div className="divide-y divide-border">
          {RECENT_ACTIVITY_MOCK.map((activity) => (
            <div
              key={`${activity.accion}-${activity.tiempo}`}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">
                  {activity.accion}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.detalle}
                </p>
              </div>

              <span className="shrink-0 text-xs text-muted-foreground">
                {activity.tiempo}
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

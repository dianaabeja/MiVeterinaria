import {
  DollarSign,
  Package,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
}

export const STATS_MOCK: StatCard[] = [
  {
    title: "Ventas del Mes",
    value: "$24,580",
    change: "+12.5%",
    icon: DollarSign,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Pacientes Activos",
    value: "342",
    change: "+8.2%",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Productos en Stock",
    value: "1,284",
    change: "-3.1%",
    icon: Package,
    color: "bg-green-500/10 text-green-600",
  },
  {
    title: "Consultas del Mes",
    value: "156",
    change: "+15.3%",
    icon: TrendingUp,
    color: "bg-orange-500/10 text-orange-600",
  },
];

export const SALES_DATA_MOCK = [
  { name: "Ene", ventas: 4000, consultas: 2400 },
  { name: "Feb", ventas: 3000, consultas: 1398 },
  { name: "Mar", ventas: 2000, consultas: 9800 },
  { name: "Abr", ventas: 2780, consultas: 3908 },
  { name: "May", ventas: 1890, consultas: 4800 },
  { name: "Jun", ventas: 2390, consultas: 3800 },
];

export const PRODUCT_CATEGORIES_MOCK = [
  { name: "Juguetes", cantidad: 45 },
  { name: "Ropa", cantidad: 32 },
  { name: "Medicina", cantidad: 78 },
  { name: "Alimentos", cantidad: 56 },
  { name: "Accesorios", cantidad: 23 },
];

export const RECENT_ACTIVITY_MOCK = [
  {
    accion: "Nueva venta",
    detalle: "Collar ajustable - $25.00",
    tiempo: "Hace 5 min",
  },
  {
    accion: "Paciente registrado",
    detalle: "Luna (Gato Persa)",
    tiempo: "Hace 15 min",
  },
  {
    accion: "Receta generada",
    detalle: "Max - Antibiótico",
    tiempo: "Hace 1 hora",
  },
  {
    accion: "Producto actualizado",
    detalle: "Stock de juguetes actualizado",
    tiempo: "Hace 2 horas",
  },
];

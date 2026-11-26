import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  Boxes,
  Briefcase,
  Building,
  Building2,
  Calendar,
  CalendarClock,
  CalendarDays,
  Car,
  CarFront,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  Clock,
  Database,
  FileCheck,
  Files,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  FolderTree,
  Fuel,
  Gauge,
  History,
  Home,
  Key,
  KeyRound,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  List,
  ListFilter,
  ListOrdered,
  ListTodo,
  Lock,
  Map as MapIcon,
  MapPin,
  Menu,
  Navigation,
  Package,
  PackageCheck,
  Paperclip,
  QrCode,
  Route,
  Ruler,
  ScrollText,
  Server,
  Settings,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  Tags,
  Truck,
  Type,
  UserCheck,
  UserCog,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react"

export const AVAILABLE_MENU_ICONS = [
  { name: "LayoutDashboard", label: "Dashboard / Inicio", icon: LayoutDashboard },
  { name: "Home", label: "Inicio", icon: Home },
  { name: "Shield", label: "Seguridad", icon: Shield },
  { name: "ShieldCheck", label: "Permisos / Aprobación", icon: ShieldCheck },
  { name: "ShieldAlert", label: "Alerta / Seguridad", icon: ShieldAlert },
  { name: "Users", label: "Usuarios / Personas", icon: Users },
  { name: "UserCheck", label: "Empleados / Verificado", icon: UserCheck },
  { name: "UserCog", label: "Configuración Usuario", icon: UserCog },
  { name: "Key", label: "Claves / Acceso", icon: Key },
  { name: "KeyRound", label: "Asignación / Llaves", icon: KeyRound },
  { name: "Lock", label: "Bloqueo", icon: Lock },
  { name: "Building2", label: "Organización", icon: Building2 },
  { name: "Building", label: "Áreas / Edificios", icon: Building },
  { name: "Briefcase", label: "Cargos", icon: Briefcase },
  { name: "Award", label: "Responsabilidades", icon: Award },
  { name: "Boxes", label: "Activos / Cajas", icon: Boxes },
  { name: "Activity", label: "Disponibilidad / Actividad", icon: Activity },
  { name: "Package", label: "Insumos / Paquetes", icon: Package },
  { name: "PackageCheck", label: "Inventario Revisado", icon: PackageCheck },
  { name: "LayoutGrid", label: "Catálogo", icon: LayoutGrid },
  { name: "FolderTree", label: "Jerarquía / Árbol", icon: FolderTree },
  { name: "Folder", label: "Carpeta", icon: Folder },
  { name: "FolderOpen", label: "Carpeta Abierta", icon: FolderOpen },
  { name: "Tags", label: "Etiquetas / Tipos", icon: Tags },
  { name: "Tag", label: "Etiqueta", icon: Tag },
  { name: "Paperclip", label: "Accesorios", icon: Paperclip },
  { name: "FileText", label: "Documentos / Informes", icon: FileText },
  { name: "FileSearch", label: "Consulta Documentos", icon: FileSearch },
  { name: "FileCheck", label: "Auditorías", icon: FileCheck },
  { name: "FileSpreadsheet", label: "Hojas de Cálculo", icon: FileSpreadsheet },
  { name: "Files", label: "Archivos Múltiples", icon: Files },
  { name: "ClipboardList", label: "Solicitudes / Registros", icon: ClipboardList },
  { name: "Settings2", label: "Parámetros", icon: Settings2 },
  { name: "Settings", label: "Ajustes", icon: Settings },
  { name: "SlidersHorizontal", label: "Gestión", icon: SlidersHorizontal },
  { name: "BookOpen", label: "Catálogos / Guías", icon: BookOpen },
  { name: "MapPin", label: "Ubicaciones", icon: MapPin },
  { name: "Map", label: "Mapa", icon: MapIcon },
  { name: "Type", label: "Tipos de Datos", icon: Type },
  { name: "Ruler", label: "Unidades de Medida", icon: Ruler },
  { name: "Wrench", label: "Mantenimientos", icon: Wrench },
  { name: "Calendar", label: "Calendario", icon: Calendar },
  { name: "CalendarDays", label: "Calendario de Reservas", icon: CalendarDays },
  { name: "CalendarClock", label: "Programaciones", icon: CalendarClock },
  { name: "Clock", label: "Horarios / Tiempos", icon: Clock },
  { name: "History", label: "Historial", icon: History },
  { name: "ListTodo", label: "Actividades", icon: ListTodo },
  { name: "CheckSquare", label: "Checklists", icon: CheckSquare },
  { name: "CheckCircle2", label: "Completado", icon: CheckCircle2 },
  { name: "AlertCircle", label: "Prioridades / Alertas", icon: AlertCircle },
  { name: "AlertTriangle", label: "Incidentes / Advertencias", icon: AlertTriangle },
  { name: "BarChart3", label: "Reportes / Gráficos", icon: BarChart3 },
  { name: "Gauge", label: "Indicadores", icon: Gauge },
  { name: "ScrollText", label: "Logs de Migración", icon: ScrollText },
  { name: "List", label: "Lista", icon: List },
  { name: "ListFilter", label: "Filtros", icon: ListFilter },
  { name: "ListOrdered", label: "Orden", icon: ListOrdered },
  { name: "Layers", label: "Módulos / Capas", icon: Layers },
  { name: "Database", label: "Base de Datos", icon: Database },
  { name: "Server", label: "Servidor", icon: Server },
  { name: "Truck", label: "Transporte / Flota", icon: Truck },
  { name: "Car", label: "Vehículo", icon: Car },
  { name: "CarFront", label: "Salidas Vehiculares", icon: CarFront },
  { name: "Route", label: "Rutas / Viajes", icon: Route },
  { name: "Navigation", label: "Navegación", icon: Navigation },
  { name: "Fuel", label: "Combustible", icon: Fuel },
  { name: "QrCode", label: "Código QR", icon: QrCode },
  { name: "Menu", label: "Menú", icon: Menu },
] as const

const ICON_REGISTRY: Record<string, LucideIcon> = Object.fromEntries(
  AVAILABLE_MENU_ICONS.map(({ name, icon }) => [name, icon]),
)

const NORMALIZED_ICON_REGISTRY: Record<string, LucideIcon> = Object.fromEntries(
  AVAILABLE_MENU_ICONS.map(({ name, icon }) => [
    name.toLowerCase().replace(/[^a-z0-9]/g, ""),
    icon,
  ]),
)

/**
 * Cache resolved icon components to avoid re-computations
 */
const resolvedIconCache = new Map<string, LucideIcon | null>()

/**
 * Converts any string format (kebab-case, camelCase, snake_case, spaces) to PascalCase.
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
}

/**
 * Resolves a Lucide icon component dynamically from any naming format
 * using the tree-shaken registry of application menu icons.
 */
export function resolveLucideIcon(name?: string | null): LucideIcon | null {
  if (!name || typeof name !== "string") return null
  const trimmed = name.trim()
  if (!trimmed) return null

  if (resolvedIconCache.has(trimmed)) {
    return resolvedIconCache.get(trimmed) ?? null
  }

  // 1. Direct exact lookup (e.g. "LayoutDashboard", "Building2")
  const direct = ICON_REGISTRY[trimmed]
  if (direct) {
    resolvedIconCache.set(trimmed, direct)
    return direct
  }

  // 2. PascalCase conversion (e.g. "layout-dashboard" -> "LayoutDashboard")
  const pascal = toPascalCase(trimmed)
  const fromPascal = ICON_REGISTRY[pascal]
  if (fromPascal) {
    resolvedIconCache.set(trimmed, fromPascal)
    return fromPascal
  }

  // 3. Normalized alphanumeric lowercase match (e.g. "layoutdashboard", "foldertree")
  const cleanTarget = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "")
  const normalized = NORMALIZED_ICON_REGISTRY[cleanTarget] ?? null
  resolvedIconCache.set(trimmed, normalized)
  return normalized
}

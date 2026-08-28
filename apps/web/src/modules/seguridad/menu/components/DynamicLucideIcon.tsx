import type { LucideIcon, LucideProps } from "lucide-react"
import * as LucideIcons from "lucide-react"

export const AVAILABLE_MENU_ICONS = [
  { name: "LayoutDashboard", label: "Dashboard / Inicio", icon: LucideIcons.LayoutDashboard },
  { name: "Shield", label: "Seguridad", icon: LucideIcons.Shield },
  { name: "ShieldCheck", label: "Permisos / Aprobación", icon: LucideIcons.ShieldCheck },
  { name: "ShieldAlert", label: "Alerta / Seguridad", icon: LucideIcons.ShieldAlert },
  { name: "Users", label: "Usuarios / Personas", icon: LucideIcons.Users },
  { name: "UserCheck", label: "Empleados / Verificado", icon: LucideIcons.UserCheck },
  { name: "UserCog", label: "Configuración Usuario", icon: LucideIcons.UserCog },
  { name: "Key", label: "Claves / Acceso", icon: LucideIcons.Key },
  { name: "Lock", label: "Bloqueo", icon: LucideIcons.Lock },
  { name: "Building2", label: "Organización", icon: LucideIcons.Building2 },
  { name: "Building", label: "Áreas / Edificios", icon: LucideIcons.Building },
  { name: "Briefcase", label: "Cargos", icon: LucideIcons.Briefcase },
  { name: "Award", label: "Responsabilidades", icon: LucideIcons.Award },
  { name: "Boxes", label: "Activos / Cajas", icon: LucideIcons.Boxes },
  { name: "Package", label: "Insumos / Paquetes", icon: LucideIcons.Package },
  { name: "PackageCheck", label: "Inventario Revisado", icon: LucideIcons.PackageCheck },
  { name: "LayoutGrid", label: "Catálogo", icon: LucideIcons.LayoutGrid },
  { name: "FolderTree", label: "Jerarquía / Árbol", icon: LucideIcons.FolderTree },
  { name: "Folder", label: "Carpeta", icon: LucideIcons.Folder },
  { name: "FolderOpen", label: "Carpeta Abierta", icon: LucideIcons.FolderOpen },
  { name: "Tags", label: "Etiquetas / Tipos", icon: LucideIcons.Tags },
  { name: "Tag", label: "Etiqueta", icon: LucideIcons.Tag },
  { name: "Paperclip", label: "Accesorios", icon: LucideIcons.Paperclip },
  { name: "FileText", label: "Documentos / Informes", icon: LucideIcons.FileText },
  { name: "FileSearch", label: "Consulta Documentos", icon: LucideIcons.FileSearch },
  { name: "FileCheck", label: "Auditorías", icon: LucideIcons.FileCheck },
  { name: "FileSpreadsheet", label: "Hojas de Cálculo", icon: LucideIcons.FileSpreadsheet },
  { name: "Files", label: "Archivos Múltiples", icon: LucideIcons.Files },
  { name: "Settings2", label: "Parámetros", icon: LucideIcons.Settings2 },
  { name: "Settings", label: "Ajustes", icon: LucideIcons.Settings },
  { name: "SlidersHorizontal", label: "Gestión", icon: LucideIcons.SlidersHorizontal },
  { name: "BookOpen", label: "Catálogos / Guías", icon: LucideIcons.BookOpen },
  { name: "MapPin", label: "Ubicaciones", icon: LucideIcons.MapPin },
  { name: "Type", label: "Tipos de Datos", icon: LucideIcons.Type },
  { name: "Ruler", label: "Unidades de Medida", icon: LucideIcons.Ruler },
  { name: "Wrench", label: "Mantenimientos", icon: LucideIcons.Wrench },
  { name: "ListTodo", label: "Actividades", icon: LucideIcons.ListTodo },
  { name: "CheckSquare", label: "Checklists", icon: LucideIcons.CheckSquare },
  { name: "AlertCircle", label: "Prioridades / Alertas", icon: LucideIcons.AlertCircle },
  { name: "ScrollText", label: "Logs de Migración", icon: LucideIcons.ScrollText },
  { name: "List", label: "Lista", icon: LucideIcons.List },
  { name: "ListFilter", label: "Filtros", icon: LucideIcons.ListFilter },
  { name: "ListOrdered", label: "Orden", icon: LucideIcons.ListOrdered },
  { name: "Layers", label: "Módulos / Capas", icon: LucideIcons.Layers },
  { name: "Database", label: "Base de Datos", icon: LucideIcons.Database },
  { name: "Server", label: "Servidor", icon: LucideIcons.Server },
  { name: "Truck", label: "Transporte", icon: LucideIcons.Truck },
  { name: "QrCode", label: "Código QR", icon: LucideIcons.QrCode },
  { name: "Menu", label: "Menú", icon: LucideIcons.Menu },
] as const

/**
 * Cache resolved icon components to avoid re-computations
 */
const resolvedIconCache = new Map<string, LucideIcon | null>()

/**
 * Converts any string format (kebab-case, camelCase, snake_case, spaces) to PascalCase.
 * Example:
 * - "layout-dashboard" -> "LayoutDashboard"
 * - "building-2" -> "Building2"
 * - "settings_2" -> "Settings2"
 * - "user check" -> "UserCheck"
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
}

/**
 * Resolves a Lucide icon component dynamically from any naming format.
 */
export function resolveLucideIcon(name?: string | null): LucideIcon | null {
  if (!name || typeof name !== "string") return null
  const trimmed = name.trim()
  if (!trimmed) return null

  if (resolvedIconCache.has(trimmed)) {
    return resolvedIconCache.get(trimmed) ?? null
  }

  const iconsRecord = LucideIcons as unknown as Record<string, unknown>

  // 1. Direct exact lookup (e.g. "LayoutDashboard", "Building2")
  if (isLucideIcon(iconsRecord[trimmed])) {
    const icon = iconsRecord[trimmed] as LucideIcon
    resolvedIconCache.set(trimmed, icon)
    return icon
  }

  // 2. PascalCase conversion (e.g. "layout-dashboard" -> "LayoutDashboard", "building-2" -> "Building2")
  const pascal = toPascalCase(trimmed)
  if (isLucideIcon(iconsRecord[pascal])) {
    const icon = iconsRecord[pascal] as LucideIcon
    resolvedIconCache.set(trimmed, icon)
    return icon
  }

  // 3. Normalized alphanumeric lowercase match (fallback for cases like "layoutdashboard", "foldertree")
  const cleanTarget = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "")
  for (const [key, value] of Object.entries(iconsRecord)) {
    if (key === "default" || key === "icons" || key === "createLucideIcon") continue
    if (key.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanTarget) {
      if (isLucideIcon(value)) {
        const icon = value as LucideIcon
        resolvedIconCache.set(trimmed, icon)
        return icon
      }
    }
  }

  resolvedIconCache.set(trimmed, null)
  return null
}

function isLucideIcon(val: unknown): val is LucideIcon {
  return typeof val === "function" || (typeof val === "object" && val !== null && "$$typeof" in val)
}

type DynamicLucideIconProps = LucideProps & {
  name?: string | null
  fallback?: React.ComponentType<LucideProps> | null
}

export function DynamicLucideIcon({
  name,
  fallback = null,
  ...props
}: DynamicLucideIconProps) {
  const IconComponent = resolveLucideIcon(name)

  if (!IconComponent) {
    if (!fallback) return null
    const FallbackIcon = fallback
    return <FallbackIcon {...props} />
  }

  return <IconComponent {...props} />
}

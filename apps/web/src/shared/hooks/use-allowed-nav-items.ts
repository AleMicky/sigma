import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Boxes,
  Briefcase,
  Building2,
  CheckSquare,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderTree,
  Key,
  LayoutDashboard,
  LayoutGrid,
  ListTodo,
  MapPin,
  Package,
  Ruler,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Tags,
  Truck,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react"

import { routes } from "@/app/config/routes"
import { useAuthStore } from "@/app/store/auth.store"
import { menuQueries } from "@/modules/seguridad/menu/api/menu.queries"
import type { MenuTreeNode } from "@/modules/seguridad/menu/api/menu.service"
import { resolveLucideIcon } from "@/modules/seguridad/menu/components/DynamicLucideIcon"
import type { NavNode, NavSection } from "@/shared/types/nav.types"

/**
 * Limpia y formatea títulos de módulos para que sean concisos y corporativos.
 * Ejemplo: "MÓDULO DE ACTIVOS" -> "Activos"
 */
function cleanModuleTitle(rawTitle: string): string {
  if (!rawTitle) return ""
  let title = rawTitle.trim()

  // Eliminar prefijos repetitivos comunes
  const prefixes = [
    /^m[oó]dulo\s+de\s+/i,
    /^m[oó]dulo\s+/i,
    /^gesti[oó]n\s+de\s+/i,
    /^sistema\s+de\s+/i,
    /^administraci[oó]n\s+de\s+/i,
  ]

  for (const prefix of prefixes) {
    title = title.replace(prefix, "")
  }

  // Capitalización en formato título
  return title.charAt(0).toUpperCase() + title.slice(1)
}

/**
 * Asigna un peso de orden prioritario a los módulos para una secuencia lógica empresarial.
 */
function getModulePriority(code?: string, title?: string): number {
  const target = `${code ?? ""} ${title ?? ""}`.toLowerCase()

  if (target.includes("inicio") || target.includes("dashboard") || target.includes("home")) return 0
  if (target.includes("mantenimiento") || target.includes("orden") || target.includes("solicitud") || target.includes("ots") || target.includes("operacion")) return 10
  if (target.includes("activo") || target.includes("equipo") || target.includes("bien")) return 20
  if (target.includes("inventario") || target.includes("insumo") || target.includes("almacen") || target.includes("stock")) return 30
  if (target.includes("organizacion") || target.includes("area") || target.includes("empleado") || target.includes("persona") || target.includes("cargo") || target.includes("personal")) return 40
  if (target.includes("catalogo") || target.includes("parametro") || target.includes("ubicacion") || target.includes("maestro")) return 50
  if (target.includes("reporte") || target.includes("informe") || target.includes("estadistica") || target.includes("consulta")) return 60
  if (target.includes("seguridad") || target.includes("usuario") || target.includes("rol") || target.includes("permiso") || target.includes("auditoria")) return 70
  if (target.includes("config") || target.includes("sistema") || target.includes("ajuste")) return 80

  return 55 // fallback intermedio
}

/**
 * Infiere un icono Lucide contextual exacto según la ruta, título o código
 */
function inferFallbackIcon(route?: string | null, title?: string, code?: string) {
  const target = `${route ?? ""} ${title ?? ""} ${code ?? ""}`.toLowerCase()

  if (target.includes("dashboard") || target.includes("inicio") || target.includes("home")) return LayoutDashboard
  if (target.includes("aprobacion") || target.includes("supervisor")) return ShieldCheck
  if (target.includes("encargado")) return UserCheck
  if (target.includes("solicitud")) return FileText
  if (target.includes("orden") || target.includes("ots") || target.includes("trabajo")) return CheckSquare
  if (target.includes("actividad") || target.includes("plan") || target.includes("programa")) return ListTodo
  if (target.includes("mantenimiento") || target.includes("tipo-mantenimiento")) return Wrench
  if (target.includes("control") || target.includes("auditoria")) return FileCheck
  if (target.includes("prioridad") || target.includes("alerta")) return ShieldAlert
  if (target.includes("tipo-activo") || target.includes("activo") || target.includes("equipo")) return Boxes
  if (target.includes("insumo") || target.includes("inventario") || target.includes("paquete")) return Package
  if (target.includes("accesorio") || target.includes("categoria") || target.includes("etiqueta")) return Tags
  if (target.includes("empleado")) return UserCheck
  if (target.includes("persona")) return Users
  if (target.includes("cargo")) return Briefcase
  if (target.includes("area") || target.includes("organizacion") || target.includes("departamento")) return Building2
  if (target.includes("ubicacion") || target.includes("planta")) return MapPin
  if (target.includes("unidad") || target.includes("medida") || target.includes("ruler")) return Ruler
  if (target.includes("usuario")) return Users
  if (target.includes("rol") || target.includes("perfil")) return Shield
  if (target.includes("permiso") || target.includes("acceso")) return Key
  if (target.includes("menu")) return FolderTree
  if (target.includes("parametro") || target.includes("config") || target.includes("gestion")) return Settings2
  if (target.includes("catalogo")) return LayoutGrid
  if (target.includes("reporte") || target.includes("consulta") || target.includes("documento")) return FileSpreadsheet
  if (target.includes("vehicul") || target.includes("conductor") || target.includes("flota") || target.includes("auto")) return Truck

  return null
}

/**
 * Convierte un nodo de árbol de menú a NavNode con iconos y resolución limpia.
 */
/**
 * Deduplica una lista de NavNode eliminando items con la misma ruta o mismo id
 */
function deduplicateNavNodes(nodes: NavNode[]): NavNode[] {
  const seen = new Set<string>()
  const result: NavNode[] = []

  for (const node of nodes) {
    const key = node.to
      ? `to:${node.to}`
      : node.id
        ? `id:${node.id}`
        : `title:${node.title.toLowerCase()}`

    if (seen.has(key)) continue
    seen.add(key)

    result.push({
      ...node,
      children: node.children ? deduplicateNavNodes(node.children) : undefined,
    })
  }

  return result
}

/**
 * Convierte un nodo de árbol de menú a NavNode con iconos y resolución limpia.
 */
function mapTreeNodeToNavNode(node: MenuTreeNode, currentDepth = 1): NavNode {
  const isLeaf = !node.hijos || node.hijos.length === 0
  const defaultIcon = isLeaf ? FileText : Folder
  const Icon =
    resolveLucideIcon(node.icono) ||
    inferFallbackIcon(node.ruta, node.nombre, node.codigo) ||
    defaultIcon

  const rawActiveChildren = (node.hijos || [])
    .filter((child) => child && child.activo !== false)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

  const mappedChildren =
    rawActiveChildren.length > 0
      ? rawActiveChildren.map((child) => mapTreeNodeToNavNode(child, currentDepth + 1))
      : undefined

  return {
    id: node.id,
    title: node.nombre.trim(),
    to: node.ruta || undefined,
    icon: Icon,
    badge: node.badge || undefined,
    order: node.orden,
    children: mappedChildren ? deduplicateNavNodes(mappedChildren) : undefined,
  }
}

/**
 * Aplana niveles redundantes de 1 solo hijo intermedio sin ruta y deduplica.
 */
function simplifyChildren(nodes: MenuTreeNode[]): NavNode[] {
  const uniqueMap = new Map<string, MenuTreeNode>()
  for (const child of nodes) {
    if (!child || child.activo === false) continue
    const key = child.codigo
      ? `code:${child.codigo}`
      : child.id
        ? `id:${child.id}`
        : `name:${child.nombre}`
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, child)
    }
  }

  const activeChildren = Array.from(uniqueMap.values())
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

  // Si tiene exactamente 1 hijo que es una carpeta agrupada (sin ruta propia) y tiene sus propios hijos,
  // desenvolvemos ese nivel para evitar anidamientos redundantes.
  if (
    activeChildren.length === 1 &&
    activeChildren[0] &&
    !activeChildren[0].ruta &&
    activeChildren[0].hijos &&
    activeChildren[0].hijos.length > 0
  ) {
    return simplifyChildren(activeChildren[0].hijos)
  }

  const mapped = activeChildren.map((child) => mapTreeNodeToNavNode(child, 1))
  return deduplicateNavNodes(mapped)
}

/**
 * Transforma el árbol de menús dinámico entregado por la API (GET /menus/mis-menus)
 * a secciones y nodos de navegación optimizados para el Sidebar empresarial sin duplicados.
 */
function convertTreeToNavSections(nodes: MenuTreeNode[] | unknown): NavSection[] {
  const rawList: MenuTreeNode[] = Array.isArray(nodes)
    ? nodes
    : typeof nodes === "object" &&
        nodes !== null &&
        "data" in nodes &&
        Array.isArray((nodes as { data: unknown }).data)
      ? ((nodes as { data: MenuTreeNode[] }).data)
      : []

  if (!rawList || rawList.length === 0) return []

  // Deduplicar nodos raíz por ID o código
  const uniqueRootsMap = new Map<string, MenuTreeNode>()
  for (const root of rawList) {
    if (!root || root.activo === false) continue
    const key = root.codigo
      ? `code:${root.codigo}`
      : root.id
        ? `id:${root.id}`
        : `name:${root.nombre}`
    if (!uniqueRootsMap.has(key)) {
      uniqueRootsMap.set(key, root)
    }
  }

  const activeRoots = Array.from(uniqueRootsMap.values())
    .sort((a, b) => {
      const priorityA = getModulePriority(a.codigo, a.nombre)
      const priorityB = getModulePriority(b.codigo, b.nombre)
      if (priorityA !== priorityB) return priorityA - priorityB
      return (a.orden ?? 0) - (b.orden ?? 0)
    })

  const sections: NavSection[] = []
  const seenTitles = new Set<string>()

  for (const root of activeRoots) {
    const isHome =
      root.codigo === "MENU_INICIO" ||
      root.codigo === "MOD_INICIO" ||
      (!root.hijos?.length && (root.ruta === "/" || !root.ruta))

    const title = isHome ? "Inicio" : cleanModuleTitle(root.nombre)
    const titleKey = title.toLowerCase()

    const defaultIcon = isHome ? LayoutDashboard : Folder
    const Icon =
      resolveLucideIcon(root.icono) ||
      inferFallbackIcon(root.ruta, root.nombre, root.codigo) ||
      defaultIcon

    const rawSimplified = root.hijos && root.hijos.length > 0
      ? simplifyChildren(root.hijos)
      : undefined

    const simplifiedChildren = rawSimplified ? deduplicateNavNodes(rawSimplified) : undefined

    // Si ya existe una sección con el mismo título, unificar hijos sin duplicar
    if (seenTitles.has(titleKey)) {
      const existing = sections.find((s) => s.title.toLowerCase() === titleKey)
      if (existing && simplifiedChildren && simplifiedChildren.length > 0) {
        existing.children = deduplicateNavNodes([
          ...(existing.children || []),
          ...simplifiedChildren,
        ])
      }
      continue
    }

    seenTitles.add(titleKey)

    sections.push({
      id: root.id,
      title,
      code: root.codigo,
      to: isHome ? (root.ruta || routes.home) : root.ruta || undefined,
      icon: Icon,
      order: root.orden,
      children: simplifiedChildren && simplifiedChildren.length > 0 ? simplifiedChildren : undefined,
    })
  }

  return sections
}

export function useAllowedNavItems() {
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const isEnabled = Boolean(isAuthenticated || accessToken || user)

  const misMenusQuery = useQuery({
    ...menuQueries.misMenus(),
    enabled: isEnabled,
  })

  const dynamicNavSections = useMemo(() => {
    const data = misMenusQuery.data
    if (data) {
      return convertTreeToNavSections(data)
    }
    return []
  }, [misMenusQuery.data])

  return {
    navItems: dynamicNavSections,
    isLoading: misMenusQuery.isLoading,
    isFetched: misMenusQuery.isFetched,
    refetch: misMenusQuery.refetch,
  }
}

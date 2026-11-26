import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, Folder } from "lucide-react"

import { routes } from "@/app/config/routes"
import { useAuthStore } from "@/app/store/auth.store"
import { menuQueries } from "@/modules/seguridad/menu/api/menu.queries"
import type { MenuTreeNode } from "@/modules/seguridad/menu/api/menu.service"
import { resolveLucideIcon } from "@/modules/seguridad/menu/lib/menu-icons"
import type { NavNode, NavSection } from "@/shared/types/nav.types"

export function isAdminUser(roles?: string[] | null): boolean {
  if (!Array.isArray(roles)) return false
  return roles.some((role) => {
    const normalized = role.trim().toUpperCase()
    return normalized === "ADMIN" || normalized === "ROLE_ADMIN"
  })
}

export function normalizeRoutePath(path: string): string {
  const withoutQueryOrHash = path.split(/[?#]/)[0]?.trim() ?? ""
  if (!withoutQueryOrHash) return ""

  const withLeadingSlash = withoutQueryOrHash.startsWith("/")
    ? withoutQueryOrHash
    : `/${withoutQueryOrHash}`

  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith("/")) {
    return withLeadingSlash.replace(/\/+$/, "")
  }

  return withLeadingSlash
}

export function isAlwaysAllowedDashboardPath(pathname: string): boolean {
  const normalized = normalizeRoutePath(pathname)
  return (
    normalized === routes.home ||
    normalized === routes.perfil ||
    normalized.startsWith(`${routes.perfil}/`)
  )
}

/**
 * Extrae la lista de nodos del árbol a partir de un arreglo o una respuesta envuelta en { data: [...] }.
 */
function extractMenuTreeNodes(nodes: unknown): MenuTreeNode[] {
  if (Array.isArray(nodes)) {
    return nodes
  }

  if (
    typeof nodes === "object" &&
    nodes !== null &&
    "data" in nodes &&
    Array.isArray((nodes as { data: unknown }).data)
  ) {
    return (nodes as { data: MenuTreeNode[] }).data
  }

  return []
}

export function collectAllowedMenuRoutes(nodes: unknown): string[] {
  const roots = extractMenuTreeNodes(nodes)
  const collected = new Set<string>()

  const visit = (items: MenuTreeNode[]) => {
    for (const node of items) {
      if (!node || node.activo === false) continue

      if (node.ruta) {
        const normalized = normalizeRoutePath(node.ruta)
        if (normalized) {
          collected.add(normalized)
        }
      }

      if (Array.isArray(node.hijos) && node.hijos.length > 0) {
        visit(node.hijos)
      }
    }
  }

  visit(roots)
  return Array.from(collected)
}

interface DerivedRouteRule {
  matches: (normalizedPath: string) => boolean
  requiredAnyOf: string[]
}

const DERIVED_OPERATIONAL_ROUTE_RULES: DerivedRouteRule[] = [
  {
    // Controles vehiculares abiertos desde Mis Viajes, Solicitudes, Asignaciones, Salidas o Vehículos
    matches: (path) =>
      path === "/gestion-vehicular/controles-activos" ||
      path.startsWith("/gestion-vehicular/controles-activos/"),
    requiredAnyOf: [
      "/gestion-vehicular/mis-viajes",
      "/gestion-vehicular/solicitudes",
      "/gestion-vehicular/asignaciones",
      "/gestion-vehicular/salidas",
      "/gestion-vehicular/vehiculos",
    ],
  },
  {
    // Ficha de detalle de activo (/activos/catalogo/$activoId) abierta desde otras vistas de activos
    matches: (path) => path.startsWith("/activos/catalogo/") && path.length > "/activos/catalogo/".length,
    requiredAnyOf: [
      "/activos/catalogo",
      "/activos/registro-activo",
      "/activos/disponibilidad",
      "/activos/consulta-documentos",
    ],
  },
  {
    // Formularios operativos de órdenes y controles abiertos desde bandejas de mantenimiento
    matches: (path) =>
      path === "/mantenimientos/ordenes-trabajo/nuevo" ||
      path.startsWith("/mantenimientos/ordenes-trabajo/nuevo/") ||
      path === "/mantenimientos/controles-activos/nuevo" ||
      path.startsWith("/mantenimientos/controles-activos/nuevo/"),
    requiredAnyOf: [
      "/mantenimientos/ordenes-trabajo",
      "/mantenimientos/controles-activos",
      "/mantenimientos/encargado",
      "/mantenimientos/supervisor",
      "/mantenimientos/solicitudes",
    ],
  },
]

function matchesAllowedPrefix(normalizedPath: string, normalizedAllowedRoutes: string[]): boolean {
  return normalizedAllowedRoutes.some((allowed) => {
    if (!allowed || allowed === routes.home) {
      return false
    }

    return (
      normalizedPath === allowed ||
      normalizedPath.startsWith(`${allowed}/`)
    )
  })
}

export function isRouteAuthorized(
  pathname: string,
  allowedRoutes: string[],
  userRoles?: string[] | null,
): boolean {
  if (isAdminUser(userRoles)) {
    return true
  }

  const normalizedPath = normalizeRoutePath(pathname)
  if (!normalizedPath || isAlwaysAllowedDashboardPath(normalizedPath)) {
    return true
  }

  const normalizedAllowedRoutes = allowedRoutes
    .map((rawAllowed) => normalizeRoutePath(rawAllowed))
    .filter(Boolean)

  if (matchesAllowedPrefix(normalizedPath, normalizedAllowedRoutes)) {
    return true
  }

  return DERIVED_OPERATIONAL_ROUTE_RULES.some(
    (rule) =>
      rule.matches(normalizedPath) &&
      rule.requiredAnyOf.some((parentRoute) =>
        matchesAllowedPrefix(parentRoute, normalizedAllowedRoutes),
      ),
  )
}

/**
 * Convierte un nodo de árbol de menú a NavNode respetando fielmente los datos de la base de datos:
 * - Nombre tal cual fue guardado (sin recortes ni prefijos alterados)
 * - Icono configurado (resuelto dinámicamente) o fallback neutro
 * - Orden y jerarquía exactos
 */
function mapTreeNodeToNavNode(node: MenuTreeNode): NavNode {
  const hasChildren = Boolean(node.hijos && node.hijos.length > 0)
  const defaultIcon = hasChildren ? Folder : FileText
  const Icon = resolveLucideIcon(node.icono) || defaultIcon

  const activeChildren = (node.hijos || [])
    .filter((child) => child && child.activo !== false)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

  return {
    id: node.id,
    title: node.nombre.trim(),
    to: node.ruta || undefined,
    icon: Icon,
    color: node.color || undefined,
    badge: node.badge || undefined,
    order: node.orden,
    children:
      activeChildren.length > 0
        ? activeChildren.map((child) => mapTreeNodeToNavNode(child))
        : undefined,
  }
}

/**
 * Transforma el árbol de menús dinámico entregado por la API (GET /menus/mis-menus)
 * a secciones del Sidebar respetando la configuración de la BD sin valores quemados.
 */
function convertTreeToNavSections(nodes: unknown): NavSection[] {
  const rawList = extractMenuTreeNodes(nodes)

  if (!rawList || rawList.length === 0) return []

  const activeRoots = rawList
    .filter((root) => root && root.activo !== false)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

  return activeRoots.map((root) => {
    const hasChildren = Boolean(root.hijos && root.hijos.length > 0)
    const defaultIcon = hasChildren ? Folder : FileText
    const Icon = resolveLucideIcon(root.icono) || defaultIcon

    const activeChildren = (root.hijos || [])
      .filter((child) => child && child.activo !== false)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

    return {
      id: root.id,
      title: root.nombre.trim(),
      code: root.codigo,
      to: root.ruta || undefined,
      icon: Icon,
      color: root.color || undefined,
      badge: root.badge || undefined,
      order: root.orden,
      children:
        activeChildren.length > 0
          ? activeChildren.map((child) => mapTreeNodeToNavNode(child))
          : undefined,
    }
  })
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

  const allowedRoutes = useMemo(() => {
    if (!misMenusQuery.data) return []
    return collectAllowedMenuRoutes(misMenusQuery.data)
  }, [misMenusQuery.data])

  return {
    navItems: dynamicNavSections,
    allowedRoutes,
    isLoading: misMenusQuery.isLoading,
    isFetched: misMenusQuery.isFetched,
    isError: misMenusQuery.isError,
    refetch: misMenusQuery.refetch,
  }
}

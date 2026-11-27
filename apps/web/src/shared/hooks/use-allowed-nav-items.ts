import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, Folder } from "lucide-react"

import { routes } from "@/app/config/routes"
import { useAuthStore } from "@/app/store/auth.store"
import { menuQueries } from "@/modules/seguridad/menu/api/menu.queries"
import type { MenuTreeNode } from "@/modules/seguridad/menu/api/menu.service"
import { resolveLucideIcon } from "@/modules/seguridad/menu/lib/menu-icons"
import type { NavNode, NavSection } from "@/shared/types/nav.types"

/** Allowlist exacta de roles administradores emitidos por el cliente SIGMA. */
export const ADMIN_ROLE_ALLOWLIST = new Set(["ADMIN", "ROLE_ADMIN"])

export function isAdminUser(roles?: string[] | null): boolean {
  if (!Array.isArray(roles)) return false
  return roles.some(
    (role) =>
      typeof role === "string" &&
      ADMIN_ROLE_ALLOWLIST.has(role.trim().toUpperCase()),
  )
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

/**
 * Submódulos documentados (padre → hijos). Cualquier otra ruta se compara
 * de forma exacta: poseer `solicitudes` NO habilita `salidas` ni
 * `asignaciones`, y poseer `ordenes-trabajo` NO habilita `encargado`.
 * `:parametro` representa un segmento dinámico de la ruta TanStack.
 */
export const DOCUMENTED_SUBMODULE_ROUTES: Readonly<
  Record<string, readonly string[]>
> = {
  "/activos/catalogo": ["/activos/catalogo/:activoId"],
  "/activos/registro-activo": [
    "/activos/registro-activo/nuevo",
    "/activos/registro-activo/:activoId/editar",
  ],
  "/activos/incidentes": ["/activos/incidentes/:id"],
  "/activos/configuraciones": [
    "/activos/configuraciones/tipos-activo",
    "/activos/configuraciones/categorias-activos",
    "/activos/configuraciones/accesorios",
    "/activos/configuraciones/tipos-documento",
    "/activos/configuraciones/estados-operativos",
  ],
  "/inventarios": [
    "/inventarios/nuevo",
    "/inventarios/:insumoId/editar",
    "/inventarios/categorias",
    "/inventarios/tipos-insumo",
  ],
  "/inventarios/tipos-insumo": [
    "/inventarios/tipos-insumo/:tipoInsumoId",
    "/inventarios/tipos-insumo/:tipoInsumoId/atributos",
  ],
  "/mantenimientos/solicitudes": [
    "/mantenimientos/solicitudes/nueva",
    "/mantenimientos/solicitudes/:solicitudId/editar",
  ],
  "/mantenimientos/ordenes-trabajo": ["/mantenimientos/ordenes-trabajo/nuevo"],
  "/mantenimientos/controles-activos": [
    "/mantenimientos/controles-activos/nuevo",
  ],
  "/gestion-vehicular/solicitudes": [
    "/gestion-vehicular/solicitudes/nueva",
    "/gestion-vehicular/solicitudes/:solicitudId/editar",
  ],
  "/gestion-vehicular/salidas": ["/gestion-vehicular/salidas/:salidaId"],
  "/gestion-vehicular/vehiculos": ["/gestion-vehicular/vehiculos/:vehiculoId"],
  "/gestion-vehicular/configuraciones": [
    "/gestion-vehicular/configuraciones/conductores",
    "/gestion-vehicular/configuraciones/flotas",
    "/gestion-vehicular/configuraciones/tipos-solicitud",
  ],
  "/gestion-vehicular/reportes": [
    "/gestion-vehicular/reportes/bitacora",
    "/gestion-vehicular/reportes/porteria",
    "/gestion-vehicular/reportes/consumo-combustible",
    "/gestion-vehicular/reportes/historial-viajes",
    "/gestion-vehicular/reportes/salidas-vehiculares",
    "/gestion-vehicular/reportes/solicitudes-vehiculares",
  ],
  "/parametros": [
    "/parametros/gestion",
    "/parametros/catalogos",
    "/parametros/tipos-dato",
    "/parametros/ubicaciones",
    "/parametros/unidades-medida",
  ],
  "/organizacion": [
    "/organizacion/empleados",
    "/organizacion/areas",
    "/organizacion/cargos",
    "/organizacion/personas",
    "/organizacion/responsabilidades",
    "/organizacion/grupos-aprobadores",
    "/organizacion/migraciones",
  ],
  "/seguridad": [
    "/seguridad/usuarios",
    "/seguridad/roles",
    "/seguridad/menus",
  ],
} as const

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Coincidencia exacta de hoja, con soporte para segmentos `:param`. */
function matchesRoutePattern(path: string, allowedRoute: string): boolean {
  if (!allowedRoute.includes(":")) {
    return path === allowedRoute
  }

  const pattern = allowedRoute
    .split("/")
    .map((segment) =>
      segment.startsWith(":") ? "[^/]+" : escapeRegExp(segment),
    )
    .join("/")

  return new RegExp(`^${pattern}$`).test(path)
}

function flattenMenuNodes(
  nodes: MenuTreeNode[],
  collected: MenuTreeNode[] = [],
): MenuTreeNode[] {
  for (const node of nodes) {
    if (!node || node.activo === false) continue
    collected.push(node)
    if (Array.isArray(node.hijos)) {
      flattenMenuNodes(node.hijos, collected)
    }
  }
  return collected
}

/** Descendientes con ruta propia, siguiendo `menuPadreId` del árbol de menús. */
function collectMenuDescendantRoutes(
  parentRoute: string,
  nodes: MenuTreeNode[],
): string[] {
  const flatNodes = flattenMenuNodes(nodes)
  const descendants: string[] = []
  const visited = new Set<string>()
  const queue = flatNodes
    .filter(
      (node) =>
        node.ruta && normalizeRoutePath(node.ruta) === parentRoute,
    )
    .map((node) => node.id)

  while (queue.length > 0) {
    const parentId = queue.shift()
    if (!parentId) continue

    for (const node of flatNodes) {
      if (
        node.menuPadreId === parentId &&
        node.ruta &&
        !visited.has(node.id)
      ) {
        descendants.push(normalizeRoutePath(node.ruta))
        visited.add(node.id)
        queue.push(node.id)
      }
    }
  }

  return descendants
}

function getAuthorizedChildRoutes(
  parentRoute: string,
  menuTree: unknown,
): string[] {
  const documented = DOCUMENTED_SUBMODULE_ROUTES[parentRoute] ?? []
  const fromMenu = collectMenuDescendantRoutes(
    parentRoute,
    extractMenuTreeNodes(menuTree),
  )
  return Array.from(new Set([...documented, ...fromMenu]))
}

export function isRouteAuthorized(
  pathname: string,
  allowedRoutes: string[],
  userRoles?: string[] | null,
  menuTree: unknown = null,
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
    .filter((allowed) => allowed && allowed !== routes.home)

  if (
    normalizedAllowedRoutes.some((allowed) =>
      matchesRoutePattern(normalizedPath, allowed),
    )
  ) {
    return true
  }

  return normalizedAllowedRoutes.some((allowed) =>
    getAuthorizedChildRoutes(allowed, menuTree).some((child) =>
      matchesRoutePattern(normalizedPath, child),
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

  const menuTree = useMemo(
    () => extractMenuTreeNodes(misMenusQuery.data),
    [misMenusQuery.data],
  )

  return {
    navItems: dynamicNavSections,
    allowedRoutes,
    menuTree,
    isLoading: misMenusQuery.isLoading,
    isFetched: misMenusQuery.isFetched,
    isError: misMenusQuery.isError,
    refetch: misMenusQuery.refetch,
  }
}

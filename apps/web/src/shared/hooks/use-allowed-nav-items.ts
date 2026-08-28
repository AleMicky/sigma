import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, Folder, LayoutDashboard } from "lucide-react"

import { routes } from "@/app/config/routes"
import { useAuthStore } from "@/app/store/auth.store"
import { menuQueries } from "@/modules/seguridad/menu/api/menu.queries"
import type { MenuTreeNode } from "@/modules/seguridad/menu/api/menu.service"
import { resolveLucideIcon } from "@/modules/seguridad/menu/components/DynamicLucideIcon"
import type { NavNode, NavSection } from "@/shared/types/nav.types"

/**
 * Convierte un nodo de árbol de menú de forma recursiva a NavNode
 */
function mapTreeNodeToNavNode(node: MenuTreeNode): NavNode {
  const isLeaf = !node.hijos || node.hijos.length === 0
  const defaultIcon = isLeaf ? FileText : Folder
  const Icon = resolveLucideIcon(node.icono) || defaultIcon

  const activeChildren = (node.hijos || [])
    .filter((child) => child && child.activo !== false)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

  return {
    id: node.id,
    title: node.nombre,
    to: node.ruta || undefined,
    icon: Icon,
    order: node.orden,
    children:
      activeChildren.length > 0
        ? activeChildren.map(mapTreeNodeToNavNode)
        : undefined,
  }
}

/**
 * Transforma el árbol de menús dinámico entregado por la API (GET /menus/mis-menus)
 * a secciones y nodos de navegación recursivos para el Sidebar.
 *
 * El primer nivel (raíces) siempre corresponde al TÍTULO del Módulo/Sección
 * (por ejemplo: "Módulo de Activos", "Módulo de Seguridad", "Inicio").
 * Los niveles inferiores se renderizan recursivamente como agrupadores o menús directos.
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

  const activeRoots = rawList
    .filter((n) => n && n.activo !== false)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

  return activeRoots.map((root): NavSection => {
    const isHome =
      root.codigo === "MENU_INICIO" ||
      root.codigo === "MOD_INICIO" ||
      (!root.hijos?.length && (root.ruta === "/" || !root.ruta))

    const defaultIcon = isHome ? LayoutDashboard : LayoutDashboard
    const Icon = resolveLucideIcon(root.icono) || defaultIcon

    const activeChildren = (root.hijos || [])
      .filter((child) => child && child.activo !== false)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

    return {
      id: root.id,
      title: root.nombre,
      code: root.codigo,
      to: isHome ? (root.ruta || routes.home) : root.ruta || undefined,
      icon: Icon,
      order: root.orden,
      children:
        activeChildren.length > 0
          ? activeChildren.map(mapTreeNodeToNavNode)
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

  return {
    navItems: dynamicNavSections,
    isLoading: misMenusQuery.isLoading,
    isFetched: misMenusQuery.isFetched,
    refetch: misMenusQuery.refetch,
  }
}

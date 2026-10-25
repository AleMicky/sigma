import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, Folder } from "lucide-react"

import { useAuthStore } from "@/app/store/auth.store"
import { menuQueries } from "@/modules/seguridad/menu/api/menu.queries"
import type { MenuTreeNode } from "@/modules/seguridad/menu/api/menu.service"
import { resolveLucideIcon } from "@/modules/seguridad/menu/components/DynamicLucideIcon"
import type { NavNode, NavSection } from "@/shared/types/nav.types"

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

  return {
    navItems: dynamicNavSections,
    isLoading: misMenusQuery.isLoading,
    isFetched: misMenusQuery.isFetched,
    refetch: misMenusQuery.refetch,
  }
}

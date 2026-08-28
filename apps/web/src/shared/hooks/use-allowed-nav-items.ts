import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, FolderTree, LayoutDashboard } from "lucide-react"

import { routes } from "@/app/config/routes"
import { useAuthStore } from "@/app/store/auth.store"
import { menuQueries } from "@/modules/seguridad/menu/api/menu.queries"
import type { MenuTreeNode } from "@/modules/seguridad/menu/api/menu.service"
import { resolveLucideIcon } from "@/modules/seguridad/menu/components/DynamicLucideIcon"
import type {
  AppPath,
  NavChild,
  NavItem,
  NavLeaf,
  NavSubGroup,
} from "@/shared/types/nav.types"

const fallbackHomeItem: NavItem = {
  title: "Inicio",
  to: routes.home,
  icon: LayoutDashboard,
}

/**
 * Transforma la jerarquía dinámica de MenuTreeNode obtenida de la base de datos (API)
 * a la estructura NavItem que requiere la interfaz de navegación y sidebar.
 */
function convertTreeToNavItems(nodes: MenuTreeNode[] | unknown): NavItem[] {
  const rawList: MenuTreeNode[] = Array.isArray(nodes)
    ? nodes
    : Array.isArray((nodes as any)?.data)
      ? (nodes as any).data
      : []

  if (!rawList || rawList.length === 0) return []

  const rootItems: MenuTreeNode[] = []

  for (const node of rawList) {
    if (!node || node.activo === false) continue

    // Si es un contenedor de módulo superior (ej. MOD_ORGANIZACION o contenedor sin ruta ni icono directo)
    if (
      (node.codigo?.startsWith("MOD_") || (!node.ruta && !node.icono)) &&
      node.hijos &&
      node.hijos.length > 0
    ) {
      for (const child of node.hijos) {
        if (child && child.activo !== false) {
          rootItems.push(child)
        }
      }
    } else {
      rootItems.push(node)
    }
  }

  rootItems.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

  return rootItems.map((item): NavItem => {
    const Icon = resolveLucideIcon(item.icono) || LayoutDashboard

    // Identificar Inicio
    if (
      item.codigo === "MENU_INICIO" ||
      item.codigo === "MOD_INICIO" ||
      (item.ruta === routes.home && (!item.hijos || item.hijos.length === 0))
    ) {
      return {
        title: item.nombre,
        to: routes.home,
        icon: Icon,
      }
    }

    // Elemento hoja directo sin hijos (Nivel 1 hoja)
    if (!item.hijos || item.hijos.length === 0) {
      return {
        title: item.nombre,
        to: (item.ruta || routes.home) as AppPath,
        icon: Icon,
      }
    }

    // Submenús (Nivel 2 hijos y Nivel 3 subgrupos)
    const children: NavChild[] = []
    const sortedChildren = [...item.hijos]
      .filter((h) => h && h.activo !== false)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

    for (const child of sortedChildren) {
      const childIcon = resolveLucideIcon(child.icono) || FolderTree

      if (child.hijos && child.hijos.length > 0) {
        // Nivel 2 es un subgrupo con hijos en Nivel 3 (ej. "Configuraciones", "Mantenimiento")
        const subItems: NavLeaf[] = child.hijos
          .filter((sub) => sub && sub.activo !== false && sub.ruta)
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
          .map((sub) => ({
            title: sub.nombre,
            to: sub.ruta as AppPath,
            icon: resolveLucideIcon(sub.icono) || FileText,
          }))

        if (subItems.length > 0) {
          children.push({
            title: child.nombre,
            icon: childIcon,
            items: subItems,
          } as NavSubGroup)
        }
      } else if (child.ruta) {
        // Nivel 2 es un enlace hoja directo
        children.push({
          title: child.nombre,
          to: child.ruta as AppPath,
          icon: childIcon,
        } as NavLeaf)
      }
    }

    const defaultRoute = (item.ruta ||
      (children[0] && "to" in children[0] ? children[0].to : undefined) ||
      (children[0] && "items" in children[0]
        ? children[0].items[0]?.to
        : undefined) ||
      routes.home) as AppPath

    return {
      title: item.nombre,
      to: defaultRoute,
      icon: Icon,
      children: children.length > 0 ? children : undefined,
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

  const dynamicNavItems = useMemo(() => {
    const data = misMenusQuery.data

    if (data) {
      const converted = convertTreeToNavItems(data)
      if (converted.length > 0) {
        return converted
      }
    }

    if (!isEnabled) return []

    // Mientras carga o si aún no hay respuesta
    return [fallbackHomeItem]
  }, [isEnabled, misMenusQuery.data])

  return {
    navItems: dynamicNavItems,
    isLoading: misMenusQuery.isLoading,
    isFetched: misMenusQuery.isFetched,
    refetch: misMenusQuery.refetch,
  }
}


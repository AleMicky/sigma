import {
  BookOpen,
  Boxes,
  LayoutDashboard,
  List,
  Settings2,
  SlidersHorizontal,
  Tags,
  Type,
  type LucideIcon,
} from "lucide-react"

import { routes } from "@/app/config/routes"

/**
 * Convención de navegación (máx. 2 niveles en sidebar):
 * 1) Menú principal → módulos (Activos, Parámetros…)
 * 2) Submenú del módulo → pantallas (Gestión, Catálogos, Tipos de datos…)
 * 3+) No van en el sidebar: usar tabs / subrutas dentro de la página.
 */
export type NavLeaf = {
  title: string
  to:
    | typeof routes.home
    | typeof routes.activos.root
    | typeof routes.tiposActivo.root
    | typeof routes.parametros.root
    | typeof routes.parametros.gestion
    | typeof routes.parametros.catalogos
    | typeof routes.parametros.tiposDato
  icon: LucideIcon
}

export type NavItem = NavLeaf & {
  children?: NavLeaf[]
}

export const navItems: NavItem[] = [
  {
    title: "Inicio",
    to: routes.home,
    icon: LayoutDashboard,
  },
  {
    title: "Activos",
    to: routes.activos.root,
    icon: Boxes,
    children: [
      {
        title: "Listado",
        to: routes.activos.root,
        icon: List,
      },
      {
        title: "Tipos de activo",
        to: routes.tiposActivo.root,
        icon: Tags,
      },
    ],
  },
  {
    title: "Parámetros",
    to: routes.parametros.root,
    icon: Settings2,
    children: [
      {
        title: "Gestión",
        to: routes.parametros.gestion,
        icon: SlidersHorizontal,
      },
      {
        title: "Catálogos",
        to: routes.parametros.catalogos,
        icon: BookOpen,
      },
      {
        title: "Tipos de datos",
        to: routes.parametros.tiposDato,
        icon: Type,
      },
    ],
  },
]

export function isPathActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/"
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function findActiveNavItem(pathname: string) {
  return (
    navItems.find(
      (item) =>
        item.children?.some((child) => isPathActive(pathname, child.to)) ||
        (item.children && isPathActive(pathname, item.to)),
    ) ?? null
  )
}

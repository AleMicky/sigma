import type { LucideIcon } from "lucide-react"

import type { routes } from "@/app/config/routes"

type DeepStringValues<T> = T extends string
  ? T
  : { [K in keyof T]: DeepStringValues<T[K]> }[keyof T]

export type AppPath = DeepStringValues<typeof routes>

/**
 * Convención de navegación (máx. 2 niveles en sidebar):
 * 1) Menú principal → módulos (Activos, Parámetros…)
 * 2) Submenú del módulo → pantallas (Gestión, Catálogos, Tipos de datos…)
 * 3+) No van en el sidebar: usar tabs / subrutas dentro de la página.
 */
export type NavLeaf = {
  title: string
  to: AppPath
  icon: LucideIcon
}

export type NavItem = NavLeaf & {
  children?: NavLeaf[]
}

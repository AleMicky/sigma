import type { NavItem } from "@/shared/types/nav.types"

/**
 * Navegación base por defecto vacía.
 * La navegación del sistema se carga 100% dinámicamente desde el backend
 * según los roles y permisos del usuario autenticado (hook `useAllowedNavItems`).
 */
export const defaultNavItems: NavItem[] = []

export const navItems = defaultNavItems

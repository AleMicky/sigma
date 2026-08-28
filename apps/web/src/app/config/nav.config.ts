import { LayoutDashboard } from "lucide-react"

import type { NavItem } from "@/shared/types/nav.types"

import { routes } from "./routes"

/**
 * Navegación base / fallback por defecto (la navegación real se obtiene dinámicamente
 * desde la API de roles y menús mediante el hook `useAllowedNavItems`).
 */
export const defaultNavItems: NavItem[] = [
  {
    title: "Inicio",
    to: routes.home,
    icon: LayoutDashboard,
  },
]

export const navItems = defaultNavItems

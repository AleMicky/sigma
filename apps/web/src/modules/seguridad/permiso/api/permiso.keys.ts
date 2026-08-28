import type { PermisoFilters } from "./permiso.service"

export const permisoKeys = {
  all: ["permisos"] as const,
  lists: () => [...permisoKeys.all, "list"] as const,
  list: (filters?: PermisoFilters) => [...permisoKeys.lists(), filters] as const,
  allList: () => [...permisoKeys.all, "all-list"] as const,
  byMenu: (menuId: string) => [...permisoKeys.all, "by-menu", menuId] as const,
  details: () => [...permisoKeys.all, "detail"] as const,
  detail: (id: string) => [...permisoKeys.details(), id] as const,
}

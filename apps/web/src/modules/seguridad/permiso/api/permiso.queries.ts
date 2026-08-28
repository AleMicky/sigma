import { queryOptions } from "@tanstack/react-query"

import { permisoKeys } from "./permiso.keys"
import {
  getPermiso,
  listAllPermisos,
  listPermisos,
  listPermisosByMenu,
  type PermisoFilters,
} from "./permiso.service"

export const permisoQueries = {
  list: (filters?: PermisoFilters) =>
    queryOptions({
      queryKey: permisoKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listPermisos(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  allList: () =>
    queryOptions({
      queryKey: permisoKeys.allList(),
      queryFn: () => listAllPermisos(),
    }),

  byMenu: (menuId: string) =>
    queryOptions({
      queryKey: permisoKeys.byMenu(menuId),
      queryFn: () => listPermisosByMenu(menuId),
      enabled: Boolean(menuId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: permisoKeys.detail(id),
      queryFn: () => getPermiso(id),
      enabled: Boolean(id),
    }),
}

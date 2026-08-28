import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { rolKeys } from "./rol.keys"
import {
  getRol,
  getRolMenuArbol,
  getRolMenuIds,
  getRolMenus,
  listAllRoles,
  listRoles,
} from "./rol.service"

export const rolQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: rolKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listRoles(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  allList: () =>
    queryOptions({
      queryKey: rolKeys.allList(),
      queryFn: () => listAllRoles(),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: rolKeys.detail(id),
      queryFn: () => getRol(id),
      enabled: Boolean(id),
    }),

  menus: (id: string) =>
    queryOptions({
      queryKey: rolKeys.menus(id),
      queryFn: () => getRolMenus(id),
      enabled: Boolean(id),
    }),

  menuIds: (id: string) =>
    queryOptions({
      queryKey: rolKeys.menuIds(id),
      queryFn: () => getRolMenuIds(id),
      enabled: Boolean(id),
    }),

  menuArbol: (id: string) =>
    queryOptions({
      queryKey: rolKeys.menuArbol(id),
      queryFn: () => getRolMenuArbol(id),
      enabled: Boolean(id),
    }),
}

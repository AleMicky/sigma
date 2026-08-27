import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { menuKeys } from "./menu.keys"
import {
  getMenu,
  getMenuArbol,
  listAllMenus,
  listMenus,
} from "./menu.service"

export const menuQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: menuKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listMenus(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  allList: () =>
    queryOptions({
      queryKey: menuKeys.allList(),
      queryFn: () => listAllMenus(),
    }),

  arbol: () =>
    queryOptions({
      queryKey: menuKeys.arbol(),
      queryFn: () => getMenuArbol(),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: menuKeys.detail(id),
      queryFn: () => getMenu(id),
      enabled: Boolean(id),
    }),
}

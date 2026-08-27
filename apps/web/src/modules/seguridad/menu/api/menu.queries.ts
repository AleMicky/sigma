import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { menuKeys } from "./menu.keys"
import {
  getMenu,
  getMenuArbol,
  getMenuArbolById,
  getMenuHijos,
  getMenuRaices,
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

  raices: () =>
    queryOptions({
      queryKey: menuKeys.raices(),
      queryFn: () => getMenuRaices(),
    }),

  arbol: () =>
    queryOptions({
      queryKey: menuKeys.arbol(),
      queryFn: () => getMenuArbol(),
    }),

  arbolById: (id: string) =>
    queryOptions({
      queryKey: menuKeys.arbolById(id),
      queryFn: () => getMenuArbolById(id),
      enabled: Boolean(id),
    }),

  hijos: (id: string) =>
    queryOptions({
      queryKey: menuKeys.hijos(id),
      queryFn: () => getMenuHijos(id),
      enabled: Boolean(id),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: menuKeys.detail(id),
      queryFn: () => getMenu(id),
      enabled: Boolean(id),
    }),
}

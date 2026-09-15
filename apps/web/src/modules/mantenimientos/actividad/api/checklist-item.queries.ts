import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { checklistItemKeys } from "./checklist-item.keys"
import {
  getChecklistItem,
  getChecklistItemsByAplicacion,
  listChecklistItems,
  listItemsByAplicacion,
} from "./checklist-item.service"

export const checklistItemQueries = {
  all: () =>
    queryOptions({
      queryKey: checklistItemKeys.all,
    }),

  list: (params?: PageParams) =>
    queryOptions({
      queryKey: checklistItemKeys.list(params as Record<string, unknown>),
      queryFn: () => listChecklistItems(params),
    }),

  byAplicacion: (aplicacionId: string, params?: PageParams) =>
    queryOptions({
      queryKey: checklistItemKeys.byAplicacion(aplicacionId, params as Record<string, unknown>),
      queryFn: () => listItemsByAplicacion(aplicacionId, params),
      enabled: Boolean(aplicacionId),
    }),

  byAplicacionList: (aplicacionId: string) =>
    queryOptions({
      queryKey: [...checklistItemKeys.byAplicacion(aplicacionId), "full-list"],
      queryFn: () => getChecklistItemsByAplicacion(aplicacionId),
      enabled: Boolean(aplicacionId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: checklistItemKeys.detail(id),
      queryFn: () => getChecklistItem(id),
      enabled: Boolean(id),
    }),
}

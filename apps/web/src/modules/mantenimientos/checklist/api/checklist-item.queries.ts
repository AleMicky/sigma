import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { checklistItemKeys } from "./checklist-item.keys"
import {
  getChecklistItem,
  listChecklistItems,
  listItemsByChecklist,
} from "./checklist-item.service"

export const checklistItemQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: checklistItemKeys.list(filters),
      queryFn: () => listChecklistItems(filters),
    }),

  byChecklist: (checklistId: string, filters?: PageParams) =>
    queryOptions({
      queryKey: checklistItemKeys.byChecklist(checklistId),
      queryFn: () => listItemsByChecklist(checklistId, filters),
      enabled: Boolean(checklistId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: checklistItemKeys.detail(id),
      queryFn: () => getChecklistItem(id),
      enabled: Boolean(id),
    }),
}

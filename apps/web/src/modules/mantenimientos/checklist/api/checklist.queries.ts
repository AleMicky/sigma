import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { checklistKeys } from "./checklist.keys"
import { getChecklist, listChecklists } from "./checklist.service"

export const checklistQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: checklistKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listChecklists(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: checklistKeys.detail(id),
      queryFn: () => getChecklist(id),
      enabled: Boolean(id),
    }),
}

import type { PageParams } from "@/shared/types/api.types"

export const catalogoKeys = {
  all: ["catalogos"] as const,
  lists: () => [...catalogoKeys.all, "list"] as const,
  list: (filters?: PageParams) =>
    [...catalogoKeys.lists(), filters] as const,
  details: () => [...catalogoKeys.all, "detail"] as const,
  detail: (id: string) => [...catalogoKeys.details(), id] as const,
}

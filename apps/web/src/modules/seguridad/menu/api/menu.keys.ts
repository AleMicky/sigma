import type { PageParams } from "@/shared/types/api.types"

export const menuKeys = {
  all: ["menus"] as const,
  lists: () => [...menuKeys.all, "list"] as const,
  list: (filters?: PageParams) => [...menuKeys.lists(), filters] as const,
  allList: () => [...menuKeys.all, "all-list"] as const,
  arbol: () => [...menuKeys.all, "arbol"] as const,
  misMenus: () => [...menuKeys.all, "mis-menus"] as const,
  details: () => [...menuKeys.all, "detail"] as const,
  detail: (id: string) => [...menuKeys.details(), id] as const,
}

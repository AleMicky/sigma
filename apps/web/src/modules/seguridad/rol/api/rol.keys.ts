import { createResourceKeys } from "@/shared/api"

export const rolKeys = {
  ...createResourceKeys("roles"),
  allList: () => ["roles", "all-list"] as const,
  sync: () => ["roles", "sync"] as const,
  menus: (id: string) => ["roles", id, "menus"] as const,
  menuIds: (id: string) => ["roles", id, "menus", "ids"] as const,
  menuArbol: (id: string) => ["roles", id, "menus", "arbol"] as const,
}

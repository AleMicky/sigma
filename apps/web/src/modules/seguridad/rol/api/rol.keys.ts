import { createResourceKeys } from "@/shared/api"

export const rolKeys = {
  ...createResourceKeys("roles"),
  allList: () => ["roles", "all-list"] as const,
  sync: () => ["roles", "sync"] as const,
}

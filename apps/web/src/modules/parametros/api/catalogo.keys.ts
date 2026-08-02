import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export const catalogoKeys = createResourceKeys<
  "catalogos",
  PageParams
>("catalogos")

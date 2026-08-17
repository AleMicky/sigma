import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type AccesorioListFilters = PageParams & {
  categoriaId?: string
  q?: string
}

export const accesorioKeys = createResourceKeys<
  "accesorios",
  AccesorioListFilters
>("accesorios")

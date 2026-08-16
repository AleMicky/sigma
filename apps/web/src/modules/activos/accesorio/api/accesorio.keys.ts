import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type AccesorioListFilters = PageParams & {
  tipoActivoId?: string
  q?: string
}

export const accesorioKeys = createResourceKeys<
  "accesorios",
  AccesorioListFilters
>("accesorios")

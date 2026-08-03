import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type ActivoListFilters = PageParams & {
  tipoActivoId?: string
  q?: string
}

export const activoKeys = createResourceKeys<"activos", ActivoListFilters>(
  "activos",
)

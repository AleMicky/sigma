import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type ComponenteListFilters = PageParams & {
  tipoActivoId?: string
  q?: string
}

export const componenteKeys = createResourceKeys<
  "componentes",
  ComponenteListFilters
>("componentes")

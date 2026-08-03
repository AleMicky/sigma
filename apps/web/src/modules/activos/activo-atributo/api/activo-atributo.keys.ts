import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type ActivoAtributoListFilters = PageParams & {
  tipoActivoId?: string
  q?: string
}

export const activoAtributoKeys = createResourceKeys<
  "activo-atributos",
  ActivoAtributoListFilters
>("activo-atributos")

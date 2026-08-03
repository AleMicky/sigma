import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type ActivoAtributoValorListFilters = PageParams & {
  activoId?: string
}

export const activoAtributoValorKeys = createResourceKeys<
  "activo-atributo-valores",
  ActivoAtributoValorListFilters
>("activo-atributo-valores")

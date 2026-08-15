import { createResourceKeys } from "@/shared/api"

import type { InsumoAtributoValorFilters } from "./insumo-atributo-valor.service"

export const insumoAtributoValorKeys = createResourceKeys<
  "insumo-atributo-valores",
  InsumoAtributoValorFilters
>("insumo-atributo-valores")

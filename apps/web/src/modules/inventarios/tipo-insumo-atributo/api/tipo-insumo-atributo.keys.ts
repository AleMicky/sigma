import { createResourceKeys } from "@/shared/api"

import type { TipoInsumoAtributoFilters } from "./tipo-insumo-atributo.service"

export const tipoInsumoAtributoKeys = createResourceKeys<
  "tipos-insumo-atributos",
  TipoInsumoAtributoFilters
>("tipos-insumo-atributos")

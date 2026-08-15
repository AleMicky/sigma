import { createCrudService } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { insumoAtributoValorEndpoints } from "./insumo-atributo-valor.endpoints"

export type InsumoAtributoValor = AuditableEntity & {
  insumoId: string
  tipoInsumoAtributoId: string
  valor: string
}

export type InsumoAtributoValorPayload = {
  insumoId: string
  tipoInsumoAtributoId: string
  valor: string
}

export type InsumoAtributoValorFilters = PageParams & {
  insumoId?: string
}

const crud = createCrudService<
  InsumoAtributoValor,
  InsumoAtributoValorPayload,
  InsumoAtributoValorFilters
>(insumoAtributoValorEndpoints)

export const listInsumosAtributoValor = crud.list
export const getInsumoAtributoValor = crud.get
export const createInsumoAtributoValor = crud.create
export const updateInsumoAtributoValor = crud.update
export const deleteInsumoAtributoValor = crud.remove

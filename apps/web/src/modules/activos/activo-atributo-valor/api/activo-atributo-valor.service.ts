import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"
import type { PageParams } from "@/shared/types/api.types"

import { activoAtributoValorEndpoints } from "./activo-atributo-valor.endpoints"

export type ActivoAtributoValor = AuditableEntity & {
  activoId: string
  activoAtributoId: string
  valor: string | null
}

export type ActivoAtributoValorPayload = {
  activoId: string
  activoAtributoId: string
  valor?: string | null
}

export type ActivoAtributoValorListParams = PageParams & {
  activoId?: string
}

const crud = createCrudService<
  ActivoAtributoValor,
  ActivoAtributoValorPayload,
  ActivoAtributoValorListParams
>(activoAtributoValorEndpoints)

export const listActivoAtributoValores = crud.list
export const getActivoAtributoValor = crud.get
export const createActivoAtributoValor = crud.create
export const updateActivoAtributoValor = crud.update
export const deleteActivoAtributoValor = crud.remove

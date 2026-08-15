import { createCrudService } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { tipoInsumoAtributoEndpoints } from "./tipo-insumo-atributo.endpoints"

export type TipoInsumoAtributo = AuditableEntity & {
  tipoDatoId: string
  tipoInsumoId: string
  codigo: string
  nombre: string
  requerido: boolean
  orden: number
}

export type TipoInsumoAtributoPayload = {
  tipoDatoId: string
  tipoInsumoId: string
  codigo: string
  nombre: string
  requerido?: boolean
  orden?: number
}

export type TipoInsumoAtributoFilters = PageParams & {
  tipoInsumoId?: string
}

const crud = createCrudService<
  TipoInsumoAtributo,
  TipoInsumoAtributoPayload,
  TipoInsumoAtributoFilters
>(tipoInsumoAtributoEndpoints)

export const listTiposInsumoAtributo = crud.list
export const getTipoInsumoAtributo = crud.get
export const createTipoInsumoAtributo = crud.create
export const updateTipoInsumoAtributo = crud.update
export const deleteTipoInsumoAtributo = crud.remove

import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { tipoInsumoEndpoints } from "./tipo-insumo.endpoints"

export type TipoInsumo = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
}

export type TipoInsumoPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
}

const crud = createCrudService<TipoInsumo, TipoInsumoPayload>(
  tipoInsumoEndpoints,
)

export const listTiposInsumo = crud.list
export const getTipoInsumo = crud.get
export const createTipoInsumo = crud.create
export const updateTipoInsumo = crud.update
export const deleteTipoInsumo = crud.remove

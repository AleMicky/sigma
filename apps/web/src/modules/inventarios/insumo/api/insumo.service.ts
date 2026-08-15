import { createCrudService } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { insumoEndpoints } from "./insumo.endpoints"

export type Insumo = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
  tipoInsumoId: string
  categoriaInsumoId: string
  unidadMedidaId: string
  marca: string | null
}

export type InsumoPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
  tipoInsumoId: string
  categoriaInsumoId: string
  unidadMedidaId: string
  marca?: string | null
}

export type InsumoFilters = PageParams & {
  tipoInsumoId?: string
  categoriaInsumoId?: string
}

const crud = createCrudService<Insumo, InsumoPayload, InsumoFilters>(
  insumoEndpoints,
)

export const listInsumos = crud.list
export const getInsumo = crud.get
export const createInsumo = crud.create
export const updateInsumo = crud.update
export const deleteInsumo = crud.remove

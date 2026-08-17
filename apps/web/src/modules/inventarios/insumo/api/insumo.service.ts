import { createCrudService } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"
import type { AuditableEntity, AuditableFields } from "@/shared/types/audit.types"

import { insumoEndpoints } from "./insumo.endpoints"

export type BaseInfo = {
  id: string
  codigo: string
  nombre: string
}

export type Insumo = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
  categoriaInsumo?: BaseInfo | null
  categoriaInsumoId?: string
  unidadMedida?: BaseInfo | null
  unidadMedidaId?: string
  marca: string | null
  auditoria?: AuditableFields
}

export type InsumoPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
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

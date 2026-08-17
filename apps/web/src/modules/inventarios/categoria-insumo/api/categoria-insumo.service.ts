import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import type { PageParams } from "@/shared/types/api.types"

import { categoriaInsumoEndpoints } from "./categoria-insumo.endpoints"

export type CategoriaInsumo = AuditableEntity & {
  tipoInsumoId: string
  codigo: string
  nombre: string
  descripcion: string | null
}

export type CategoriaInsumoPayload = {
  tipoInsumoId: string
  codigo: string
  nombre: string
  descripcion?: string | null
}

export type CategoriaInsumoFilters = PageParams & {
  tipoInsumoId?: string
}

const crud = createCrudService<
  CategoriaInsumo,
  CategoriaInsumoPayload,
  CategoriaInsumoFilters
>(categoriaInsumoEndpoints)

export const listCategoriasInsumo = crud.list
export const getCategoriaInsumo = crud.get
export const createCategoriaInsumo = crud.create
export const updateCategoriaInsumo = crud.update
export const deleteCategoriaInsumo = crud.remove

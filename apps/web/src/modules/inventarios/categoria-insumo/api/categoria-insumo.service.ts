import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { categoriaInsumoEndpoints } from "./categoria-insumo.endpoints"

export type CategoriaInsumo = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
}

export type CategoriaInsumoPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
}

const crud = createCrudService<CategoriaInsumo, CategoriaInsumoPayload>(
  categoriaInsumoEndpoints,
)

export const listCategoriasInsumo = crud.list
export const getCategoriaInsumo = crud.get
export const createCategoriaInsumo = crud.create
export const updateCategoriaInsumo = crud.update
export const deleteCategoriaInsumo = crud.remove

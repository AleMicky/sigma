import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { categoriaEndpoints } from "./categoria.endpoints"

export type Categoria = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
  orden: number
}

export type CategoriaPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
  orden?: number | null
}

const crud = createCrudService<Categoria, CategoriaPayload>(categoriaEndpoints)

export const listCategorias = crud.list
export const getCategoria = crud.get
export const createCategoria = crud.create
export const updateCategoria = crud.update
export const deleteCategoria = crud.remove

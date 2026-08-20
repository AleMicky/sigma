import { createCrudService, http } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"
import type { PageParams, PageResponse } from "@/shared/types/api.types"

import { catalogoItemEndpoints } from "./catalogo-item.endpoints"

export type CatalogoItem = AuditableEntity & {
  catalogoId: string
  nombre: string
  valor: string
  orden: number
}

export type CatalogoItemPayload = {
  catalogoId: string
  nombre: string
  valor: string
  orden?: number | null
}

export type CatalogoItemListParams = PageParams & {
  catalogoId?: string
  q?: string
}

const crud = createCrudService<
  CatalogoItem,
  CatalogoItemPayload,
  CatalogoItemListParams
>(catalogoItemEndpoints)

export const listCatalogoItems = crud.list
export const getCatalogoItem = crud.get
export const createCatalogoItem = crud.create
export const updateCatalogoItem = crud.update
export const deleteCatalogoItem = crud.remove

export const listCatalogoItemsByCodigo = (
  codigo: string,
  params?: PageParams & { q?: string },
): Promise<PageResponse<CatalogoItem>> => {
  return http.get<PageResponse<CatalogoItem>>(
    catalogoItemEndpoints.byCodigo(codigo),
    { params },
  )
}

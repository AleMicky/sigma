import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"

import { catalogoItemEndpoints } from "./catalogo-item.endpoints"

export type CatalogoItem = {
  id: string
  catalogoId: string
  nombre: string
  valor: string
  orden: number
  createdAt: string
  updatedAt: string | null
  createdBy: string | null
  updatedBy: string | null
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

export async function listCatalogoItems(
  params?: CatalogoItemListParams,
): Promise<PageResponse<CatalogoItem>> {
  return http.get<PageResponse<CatalogoItem>>(catalogoItemEndpoints.root, {
    params,
  })
}

export async function getCatalogoItem(id: string): Promise<CatalogoItem> {
  return http.get<CatalogoItem>(catalogoItemEndpoints.byId(id))
}

export async function createCatalogoItem(
  payload: CatalogoItemPayload,
): Promise<CatalogoItem> {
  return http.post<CatalogoItem, CatalogoItemPayload>(
    catalogoItemEndpoints.root,
    payload,
  )
}

export async function updateCatalogoItem(
  id: string,
  payload: CatalogoItemPayload,
): Promise<CatalogoItem> {
  return http.put<CatalogoItem, CatalogoItemPayload>(
    catalogoItemEndpoints.byId(id),
    payload,
  )
}

export async function deleteCatalogoItem(id: string): Promise<void> {
  await http.delete<void>(catalogoItemEndpoints.byId(id))
}

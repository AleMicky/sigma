import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"

import { catalogoEndpoints } from "./catalogo.endpoints"

export type Catalogo = {
  id: string
  codigo: string
  nombre: string
  createdAt: string
  updatedAt: string | null
  createdBy: string | null
  updatedBy: string | null
}

export type CatalogoPayload = {
  codigo: string
  nombre: string
}

export async function listCatalogos(
  params?: PageParams,
): Promise<PageResponse<Catalogo>> {
  return http.get<PageResponse<Catalogo>>(catalogoEndpoints.root, {
    params,
  })
}

export async function getCatalogo(id: string): Promise<Catalogo> {
  return http.get<Catalogo>(catalogoEndpoints.byId(id))
}

export async function createCatalogo(
  payload: CatalogoPayload,
): Promise<Catalogo> {
  return http.post<Catalogo, CatalogoPayload>(
    catalogoEndpoints.root,
    payload,
  )
}

export async function updateCatalogo(
  id: string,
  payload: CatalogoPayload,
): Promise<Catalogo> {
  return http.put<Catalogo, CatalogoPayload>(
    catalogoEndpoints.byId(id),
    payload,
  )
}

export async function deleteCatalogo(id: string): Promise<void> {
  await http.delete<void>(catalogoEndpoints.byId(id))
}

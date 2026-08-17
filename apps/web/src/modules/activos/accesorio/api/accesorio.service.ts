import { createCrudService } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"
import type { AuditableFields } from "@/shared/types/audit.types"

import { accesorioEndpoints } from "./accesorio.endpoints"

export type AccesorioCatalogoInfo = {
  id: string
  codigo: string | null
  nombre: string
}

export type Accesorio = {
  id: string
  catalogo?: AccesorioCatalogoInfo | null
  codigo: string
  nombre: string
  descripcion: string | null
  auditoria?: AuditableFields | null
}

export type AccesorioPayload = {
  categoriaId: string
  codigo: string
  nombre: string
  descripcion?: string | null
}

export type AccesorioListParams = PageParams & {
  categoriaId?: string
  q?: string
}

const crud = createCrudService<
  Accesorio,
  AccesorioPayload,
  AccesorioListParams
>(accesorioEndpoints)

export const listAccesorios = crud.list
export const getAccesorio = crud.get
export const createAccesorio = crud.create
export const updateAccesorio = crud.update
export const deleteAccesorio = crud.remove

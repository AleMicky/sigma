import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { catalogoEndpoints } from "./catalogo.endpoints"

export type Catalogo = AuditableEntity & {
  codigo: string
  nombre: string
}

export type CatalogoPayload = {
  codigo: string
  nombre: string
}

const crud = createCrudService<Catalogo, CatalogoPayload>(catalogoEndpoints)

export const listCatalogos = crud.list
export const getCatalogo = crud.get
export const createCatalogo = crud.create
export const updateCatalogo = crud.update
export const deleteCatalogo = crud.remove

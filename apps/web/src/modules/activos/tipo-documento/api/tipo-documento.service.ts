import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { tipoDocumentoEndpoints } from "./tipo-documento.endpoints"

export type TipoDocumento = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
  requiereVencimiento: boolean
}

export type TipoDocumentoPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
  requiereVencimiento?: boolean
}

const crud = createCrudService<TipoDocumento, TipoDocumentoPayload>(tipoDocumentoEndpoints)

export const listTiposDocumento = crud.list
export const getTipoDocumento = crud.get
export const createTipoDocumento = crud.create
export const updateTipoDocumento = crud.update
export const deleteTipoDocumento = crud.remove

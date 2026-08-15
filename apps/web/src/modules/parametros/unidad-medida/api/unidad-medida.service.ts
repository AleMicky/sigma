import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { unidadMedidaEndpoints } from "./unidad-medida.endpoints"

export type UnidadMedida = AuditableEntity & {
  codigo: string
  nombre: string
  simbolo: string
  permiteDecimal: boolean
}

export type UnidadMedidaPayload = {
  codigo: string
  nombre: string
  simbolo: string
  permiteDecimal: boolean
}

const crud = createCrudService<UnidadMedida, UnidadMedidaPayload>(
  unidadMedidaEndpoints,
)

export const listUnidadesMedida = crud.list
export const getUnidadMedida = crud.get
export const createUnidadMedida = crud.create
export const updateUnidadMedida = crud.update
export const deleteUnidadMedida = crud.remove

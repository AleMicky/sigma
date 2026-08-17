import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { tipoMantenimientoEndpoints } from "./tipo-mantenimiento.endpoints"

export type TipoMantenimiento = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
}

export type TipoMantenimientoPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
}

const crud = createCrudService<TipoMantenimiento, TipoMantenimientoPayload>(tipoMantenimientoEndpoints)

export const listTiposMantenimiento = crud.list
export const getTipoMantenimiento = crud.get
export const createTipoMantenimiento = crud.create
export const updateTipoMantenimiento = crud.update
export const deleteTipoMantenimiento = crud.remove

import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { tipoActivoEndpoints } from "./tipo-activo.endpoints"

export type TipoActivo = AuditableEntity & {
  nombre: string
  descripcion: string | null
  color: string | null
  icono: string | null
}

export type TipoActivoPayload = {
  nombre: string
  descripcion?: string | null
  color?: string | null
  icono?: string | null
}

const crud = createCrudService<TipoActivo, TipoActivoPayload>(
  tipoActivoEndpoints,
)

export const listTiposActivo = crud.list
export const getTipoActivo = crud.get
export const createTipoActivo = crud.create
export const updateTipoActivo = crud.update
export const deleteTipoActivo = crud.remove

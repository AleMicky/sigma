import { createCrudService } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { tipoActivoEstadoEndpoints } from "./tipo-activo-estado.endpoints"

export type TipoActivoEstado = AuditableEntity & {
  tipoActivoId: string
  estadoOperativoId: string
  predeterminado: boolean
}

export type TipoActivoEstadoPayload = {
  tipoActivoId: string
  estadoOperativoId: string
  predeterminado?: boolean
}

export type TipoActivoEstadoFilters = PageParams & {
  tipoActivoId?: string
  estadoOperativoId?: string
}

const crud = createCrudService<
  TipoActivoEstado,
  TipoActivoEstadoPayload,
  TipoActivoEstadoFilters
>(tipoActivoEstadoEndpoints)

export const listTiposActivoEstados = crud.list
export const getTipoActivoEstado = crud.get
export const createTipoActivoEstado = crud.create
export const updateTipoActivoEstado = crud.update
export const deleteTipoActivoEstado = crud.remove

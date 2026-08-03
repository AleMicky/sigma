import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"
import type { PageParams } from "@/shared/types/api.types"

import { componenteEndpoints } from "./componente.endpoints"

export type Componente = AuditableEntity & {
  tipoActivoId: string
  codigo: string
  nombre: string
  descripcion: string | null
}

export type ComponentePayload = {
  tipoActivoId: string
  codigo: string
  nombre: string
  descripcion?: string | null
}

export type ComponenteListParams = PageParams & {
  tipoActivoId?: string
  q?: string
}

const crud = createCrudService<
  Componente,
  ComponentePayload,
  ComponenteListParams
>(componenteEndpoints)

export const listComponentes = crud.list
export const getComponente = crud.get
export const createComponente = crud.create
export const updateComponente = crud.update
export const deleteComponente = crud.remove

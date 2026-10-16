import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { estadoOperativoEndpoints } from "./estado-operativo.endpoints"

export type EstadoOperativo = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
  color: string | null
}

export type EstadoOperativoPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
  color?: string | null
}

const crud = createCrudService<EstadoOperativo, EstadoOperativoPayload>(estadoOperativoEndpoints)

export const listEstadosOperativos = crud.list
export const getEstadoOperativo = crud.get
export const createEstadoOperativo = crud.create
export const updateEstadoOperativo = crud.update
export const deleteEstadoOperativo = crud.remove

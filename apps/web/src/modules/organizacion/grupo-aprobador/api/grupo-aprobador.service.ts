import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { grupoAprobadorEndpoints } from "./grupo-aprobador.endpoints"

export type GrupoAprobador = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
}

export type GrupoAprobadorPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
}

const crud = createCrudService<GrupoAprobador, GrupoAprobadorPayload>(
  grupoAprobadorEndpoints,
)

export const listGruposAprobadores = crud.list
export const getGrupoAprobador = crud.get
export const createGrupoAprobador = crud.create
export const updateGrupoAprobador = crud.update
export const deleteGrupoAprobador = crud.remove

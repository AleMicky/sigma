import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { actividadEndpoints } from "./actividad.endpoints"

export type ActividadMantenimiento = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
  aplicaTodosTiposActivo: boolean
  requiereChecklist: boolean
}

export type ActividadMantenimientoPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
  aplicaTodosTiposActivo?: boolean
  requiereChecklist?: boolean
}

const crud = createCrudService<
  ActividadMantenimiento,
  ActividadMantenimientoPayload
>(actividadEndpoints)

export const listActividades = crud.list
export const getActividad = crud.get
export const createActividad = crud.create
export const updateActividad = crud.update
export const deleteActividad = crud.remove

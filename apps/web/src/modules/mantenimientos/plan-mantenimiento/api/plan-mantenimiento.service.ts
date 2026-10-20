import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { planMantenimientoEndpoints } from "./plan-mantenimiento.endpoints"

export type PlanMantenimiento = AuditableEntity & {
  tipoActivoId: string
  tipoActivoNombre?: string | null
  codigo: string
  nombre: string
  descripcion: string | null
  totalActividades?: number
}

export type PlanMantenimientoPayload = {
  tipoActivoId: string
  codigo: string
  nombre: string
  descripcion?: string | null
}

const crud = createCrudService<PlanMantenimiento, PlanMantenimientoPayload>(planMantenimientoEndpoints)

export const listPlanesMantenimiento = crud.list
export const getPlanMantenimiento = crud.get
export const createPlanMantenimiento = crud.create
export const updatePlanMantenimiento = crud.update
export const deletePlanMantenimiento = crud.remove

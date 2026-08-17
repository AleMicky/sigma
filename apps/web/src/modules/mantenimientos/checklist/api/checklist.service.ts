import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { checklistEndpoints } from "./checklist.endpoints"

export type ChecklistMantenimiento = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
  actividadMantenimiento?: {
    id: string
    codigo: string
    nombre: string
  } | null
}

export type ChecklistMantenimientoPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
  actividadMantenimientoId: string
}

const crud = createCrudService<
  ChecklistMantenimiento,
  ChecklistMantenimientoPayload
>(checklistEndpoints)

export const listChecklists = crud.list
export const getChecklist = crud.get
export const createChecklist = crud.create
export const updateChecklist = crud.update
export const deleteChecklist = crud.remove

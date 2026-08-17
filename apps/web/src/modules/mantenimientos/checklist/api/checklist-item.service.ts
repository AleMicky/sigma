import { createCrudService, http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { checklistItemEndpoints } from "./checklist-item.endpoints"

export type ChecklistItem = AuditableEntity & {
  checklistMantenimiento?: {
    id: string
    codigo: string
    nombre: string
  } | null
  codigo: string
  nombre: string
  descripcion: string | null
  tipoDato?: {
    id: string
    codigo: string
    nombre: string
  } | null
  orden: number
  obligatorio: boolean
  opciones?: string | null
}

export type ChecklistItemPayload = {
  checklistMantenimientoId: string
  codigo: string
  nombre: string
  descripcion?: string | null
  tipoDatoId: string
  orden: number
  obligatorio?: boolean
  opciones?: string | null
}

const crud = createCrudService<ChecklistItem, ChecklistItemPayload>(
  checklistItemEndpoints
)

export const listChecklistItems = crud.list
export const getChecklistItem = crud.get
export const createChecklistItem = crud.create
export const updateChecklistItem = crud.update
export const deleteChecklistItem = crud.remove

export async function listItemsByChecklist(
  checklistMantenimientoId: string,
  params?: PageParams
) {
  return http.get<PageResponse<ChecklistItem>>(
    checklistItemEndpoints.root,
    {
      params: {
        checklistMantenimientoId,
        sortBy: "orden",
        direction: "ASC",
        ...params,
      },
    }
  )
}

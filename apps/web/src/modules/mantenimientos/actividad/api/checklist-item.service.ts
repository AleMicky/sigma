import { createCrudService, http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { checklistItemEndpoints } from "./checklist-item.endpoints"

export type ChecklistItem = AuditableEntity & {
  actividadMantenimientoAplicacionId: string
  nombre: string
  descripcion: string | null
  orden: number
}

export type ChecklistItemPayload = {
  actividadMantenimientoAplicacionId: string
  nombre: string
  descripcion?: string | null
  orden: number
}

const crud = createCrudService<
  ChecklistItem,
  ChecklistItemPayload
>(checklistItemEndpoints)

export const listChecklistItems = crud.list
export const getChecklistItem = crud.get
export const createChecklistItem = crud.create
export const updateChecklistItem = crud.update
export const deleteChecklistItem = crud.remove

export async function listItemsByAplicacion(
  actividadMantenimientoAplicacionId: string,
  params?: PageParams
) {
  return http.get<PageResponse<ChecklistItem>>(
    checklistItemEndpoints.root,
    {
      params: {
        actividadMantenimientoAplicacionId,
        ...params,
      },
    }
  )
}

export async function getChecklistItemsByAplicacion(
  actividadMantenimientoAplicacionId: string
) {
  return http.get<ChecklistItem[]>(
    `${checklistItemEndpoints.root}/aplicacion/${actividadMantenimientoAplicacionId}`
  )
}

import { createCrudService, http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { actividadAplicacionEndpoints } from "./actividad-aplicacion.endpoints"

export type ActividadAplicacion = AuditableEntity & {
  actividadMantenimiento: {
    id: string
    codigo: string
    nombre: string
  }
  tipoActivo: {
    id: string
    nombre: string
  }
  componente?: {
    id: string
    nombre: string
  } | null
}

export type ActividadAplicacionPayload = {
  actividadMantenimientoId: string
  tipoActivoId: string
  componenteId?: string | null
}

const crud = createCrudService<
  ActividadAplicacion,
  ActividadAplicacionPayload
>(actividadAplicacionEndpoints)

export const listActividadAplicaciones = crud.list
export const getActividadAplicacion = crud.get
export const createActividadAplicacion = crud.create
export const updateActividadAplicacion = crud.update
export const deleteActividadAplicacion = crud.remove

export async function listAplicacionesByActividad(
  actividadMantenimientoId: string,
  params?: PageParams
) {
  return http.get<PageResponse<ActividadAplicacion>>(
    actividadAplicacionEndpoints.root,
    {
      params: {
        actividadMantenimientoId,
        ...params,
      },
    }
  )
}

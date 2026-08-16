import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { createCrudService, http, uploadImage } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { activoEndpoints } from "./activo.endpoints"

export type Activo = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
  tipoActivoId: string
  tipoActivo?: TipoActivo | null
  ubicacionId: string | null
  ubicacion?: Ubicacion | null
  fechaAdquisicion: string | null
  urlImagen: string | null
  activo: boolean
}

export type ActivoPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
  tipoActivoId: string
  ubicacionId?: string | null
  fechaAdquisicion?: string | null
  activo?: boolean
}

export type ActivoListParams = PageParams & {
  tipoActivoId?: string
  q?: string
}

const crud = createCrudService<Activo, ActivoPayload, ActivoListParams>(
  activoEndpoints,
)

export const listActivos = crud.list
export const getActivo = crud.get
export const createActivo = crud.create
export const updateActivo = crud.update
export const deleteActivo = crud.remove

export function uploadActivoImagen(id: string, file: File) {
  return uploadImage<Activo>(`${activoEndpoints.byId(id)}/imagen`, file)
}

export function deleteActivoImagen(id: string) {
  return http.delete<Activo>(`${activoEndpoints.byId(id)}/imagen`)
}

export async function setActivoActivo(
  id: string,
  activo: boolean,
): Promise<Activo> {
  return http.patch<Activo>(`${activoEndpoints.byId(id)}/activo`, {
    activo,
  })
}

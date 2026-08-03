import { createCrudService, http, uploadImage } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"
import type { PageParams } from "@/shared/types/api.types"

import { activoAtributoEndpoints } from "./activo-atributo.endpoints"

export type ActivoAtributoOpcion = {
  value: string
  label: string
}

export type ActivoAtributo = AuditableEntity & {
  tipoActivoId: string
  codigo: string
  etiqueta: string
  descripcion: string | null
  tipoDatoId: string
  orden: number
  requerido: boolean
  visible: boolean
  editable: boolean
  valorDefecto: string | null
  opciones: ActivoAtributoOpcion[] | null
  urlImagen: string | null
}

export type ActivoAtributoPayload = {
  tipoActivoId: string
  codigo: string
  etiqueta: string
  descripcion?: string | null
  tipoDatoId: string
  orden?: number | null
  requerido?: boolean | null
  visible?: boolean | null
  editable?: boolean | null
  valorDefecto?: string | null
  opciones?: ActivoAtributoOpcion[] | null
}

export type ActivoAtributoListParams = PageParams & {
  tipoActivoId?: string
  q?: string
}

const crud = createCrudService<
  ActivoAtributo,
  ActivoAtributoPayload,
  ActivoAtributoListParams
>(activoAtributoEndpoints)

export const listActivoAtributos = crud.list
export const getActivoAtributo = crud.get
export const createActivoAtributo = crud.create
export const updateActivoAtributo = crud.update
export const deleteActivoAtributo = crud.remove

export function uploadActivoAtributoImagen(id: string, file: File) {
  return uploadImage<ActivoAtributo>(
    `${activoAtributoEndpoints.byId(id)}/imagen`,
    file,
  )
}

export function deleteActivoAtributoImagen(id: string) {
  return http.delete<ActivoAtributo>(
    `${activoAtributoEndpoints.byId(id)}/imagen`,
  )
}

import { createCrudService, http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { solicitudEndpoints } from "./solicitud.endpoints"

export type ActivoInfo = {
  id: string
  codigo: string
  nombre: string
}

export type TipoMantenimientoInfo = {
  id: string
  codigo: string
  nombre: string
}

export type PrioridadInfo = {
  id: string
  codigo: string
  nombre: string
  nivel: number
}

export type UserInfo = {
  id: string
  nombre: string
}

export type SolicitudMantenimientoAdjunto = {
  id: string
  solicitudMantenimientoId: string
  nombreArchivo: string
  tipoContenido: string
  size: number
  url: string
  descripcion?: string | null
  auditoria?: AuditableEntity
}

export type SolicitudMantenimiento = AuditableEntity & {
  numero: string
  activo: ActivoInfo | null
  tipoMantenimiento: TipoMantenimientoInfo | null
  motivoMantenimiento?: string | null
  prioridad: PrioridadInfo | null
  solicitante?: UserInfo | null
  titulo: string
  descripcion: string
  fechaSolicitud?: string | null
  aprobadoPor?: UserInfo | null
  fechaAprobacion?: string | null
  observacionAprobacion?: string | null
  responsable?: UserInfo | null
  fechaAsignacion?: string | null
  fechaInicioMantenimiento?: string | null
  fechaFinMantenimiento?: string | null
  supervisor?: UserInfo | null
  fechaValidacion?: string | null
  observacionValidacion?: string | null
  fechaFinalizacion?: string | null
  recibidoPor?: UserInfo | null
  observacionCierre?: string | null
  estado: string
  processInstanceId?: string | null
  adjuntos?: SolicitudMantenimientoAdjunto[]
}

export type SolicitudPayload = {
  activoId: string
  tipoMantenimientoId: string
  motivoMantenimiento?: string | null
  prioridadId: string
  solicitanteId: string
  titulo: string
  descripcion: string
  fechaSolicitud?: string | null
}

export type SolicitudListParams = PageParams & {
  activoId?: string
  estado?: string
  solicitanteId?: string
  responsableId?: string
}

const crud = createCrudService<SolicitudMantenimiento, SolicitudPayload, SolicitudListParams>(solicitudEndpoints)

export const listSolicitudes = crud.list
export const getSolicitud = crud.get
export const createSolicitud = crud.create
export const updateSolicitud = crud.update
export const deleteSolicitud = crud.remove

export async function createSolicitudWithFiles(
  payload: SolicitudPayload,
  files?: File[] | null,
): Promise<SolicitudMantenimiento> {
  if (!files || files.length === 0) {
    return createSolicitud(payload)
  }

  const formData = new FormData()
  const jsonBlob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  })
  formData.append("data", jsonBlob)

  for (const file of files) {
    formData.append("files", file)
  }

  return http.post<SolicitudMantenimiento, FormData>(solicitudEndpoints.root, formData)
}

export async function listAdjuntos(
  solicitudId: string,
  params?: PageParams,
): Promise<PageResponse<SolicitudMantenimientoAdjunto>> {
  return http.get<PageResponse<SolicitudMantenimientoAdjunto>>(
    solicitudEndpoints.adjuntos.list(solicitudId),
    { params },
  )
}

export async function createAdjunto(
  solicitudId: string,
  file: File,
  descripcion?: string,
): Promise<SolicitudMantenimientoAdjunto> {
  const formData = new FormData()
  formData.append("file", file)
  if (descripcion) {
    const jsonBlob = new Blob([JSON.stringify({ descripcion })], {
      type: "application/json",
    })
    formData.append("data", jsonBlob)
  }

  return http.post<SolicitudMantenimientoAdjunto, FormData>(
    solicitudEndpoints.adjuntos.create(solicitudId),
    formData,
  )
}

export async function deleteAdjunto(
  solicitudId: string,
  adjuntoId: string,
): Promise<void> {
  await http.delete<void>(solicitudEndpoints.adjuntos.byId(solicitudId, adjuntoId))
}

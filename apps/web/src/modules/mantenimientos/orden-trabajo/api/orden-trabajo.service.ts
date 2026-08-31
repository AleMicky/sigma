import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { ORDEN_TRABAJO_ENDPOINTS } from "./orden-trabajo.endpoints"

export type ActivoInfo = {
  id: string
  codigo: string
  nombre: string
}

export type ResponsableInfo = {
  id: string
  nombre: string
}

export type ActividadMantenimientoInfo = {
  id: string
  codigo: string
  nombre: string
}

export type OrdenTrabajoInfo = {
  id: string
  numero: string
}

export type OrdenTrabajoActividadInfo = {
  id: string
  descripcion: string
}

export type OrdenTrabajo = AuditableEntity & {
  id: string
  numero: string
  solicitudMantenimientoId: string
  activo?: ActivoInfo | null
  responsable?: ResponsableInfo | null
  fechaInicio?: string | null
  fechaFin?: string | null
  diagnostico?: string | null
  trabajoRealizado?: string | null
  observacion?: string | null
}

export type OrdenTrabajoPayload = {
  solicitudMantenimientoId: string
  activoId: string
  responsableId: string
  fechaInicio?: string | null
  fechaFin?: string | null
  diagnostico?: string | null
  trabajoRealizado?: string | null
  observacion?: string | null
}

export type OrdenTrabajoFilters = PageParams & {
  q?: string
  solicitudMantenimientoId?: string
}

export type OrdenTrabajoAdjunto = AuditableEntity & {
  id: string
  ordenTrabajo?: OrdenTrabajoInfo | null
  nombreArchivo: string
  tipoMime?: string | null
  tamanio?: number | null
  url: string
  descripcion?: string | null
}

export type OrdenTrabajoAdjuntoPayload = {
  descripcion?: string | null
}

export type OrdenTrabajoActividad = AuditableEntity & {
  id: string
  ordenTrabajo?: OrdenTrabajoInfo | null
  actividadMantenimiento?: ActividadMantenimientoInfo | null
  descripcion: string
  realizado: boolean
  observacion?: string | null
  fechaRealizacion?: string | null
}

export type OrdenTrabajoActividadPayload = {
  ordenTrabajoId: string
  actividadMantenimientoId?: string | null
  descripcion: string
  realizado: boolean
  observacion?: string | null
  fechaRealizacion?: string | null
}

export type OrdenTrabajoActividadEvidencia = AuditableEntity & {
  id: string
  ordenTrabajoActividad?: OrdenTrabajoActividadInfo | null
  nombreArchivo: string
  tipoMime?: string | null
  tamanio?: number | null
  url: string
}

// ----------------------------------------------------
// 1. Orden de Trabajo Service Methods
// ----------------------------------------------------

export async function listOrdenesTrabajo(
  filters?: OrdenTrabajoFilters,
): Promise<PageResponse<OrdenTrabajo>> {
  return http.get<PageResponse<OrdenTrabajo>>(ORDEN_TRABAJO_ENDPOINTS.root, {
    params: filters,
  })
}

export async function getOrdenTrabajo(id: string): Promise<OrdenTrabajo> {
  return http.get<OrdenTrabajo>(ORDEN_TRABAJO_ENDPOINTS.detail(id))
}

export async function createOrdenTrabajo(
  payload: OrdenTrabajoPayload,
): Promise<OrdenTrabajo> {
  return http.post<OrdenTrabajo>(ORDEN_TRABAJO_ENDPOINTS.root, payload)
}

export async function updateOrdenTrabajo(
  id: string,
  payload: OrdenTrabajoPayload,
): Promise<OrdenTrabajo> {
  return http.put<OrdenTrabajo>(ORDEN_TRABAJO_ENDPOINTS.detail(id), payload)
}

export async function deleteOrdenTrabajo(id: string): Promise<void> {
  return http.delete<void>(ORDEN_TRABAJO_ENDPOINTS.detail(id))
}

// ----------------------------------------------------
// 2. Orden de Trabajo Adjuntos Service Methods
// ----------------------------------------------------

export async function listOrdenTrabajoAdjuntos(
  ordenTrabajoId: string,
  filters?: PageParams,
): Promise<PageResponse<OrdenTrabajoAdjunto>> {
  return http.get<PageResponse<OrdenTrabajoAdjunto>>(
    ORDEN_TRABAJO_ENDPOINTS.adjuntos.root(ordenTrabajoId),
    { params: filters },
  )
}

export async function getOrdenTrabajoAdjunto(
  ordenTrabajoId: string,
  id: string,
): Promise<OrdenTrabajoAdjunto> {
  return http.get<OrdenTrabajoAdjunto>(
    ORDEN_TRABAJO_ENDPOINTS.adjuntos.detail(ordenTrabajoId, id),
  )
}

export async function createOrdenTrabajoAdjuntoWithFile(
  ordenTrabajoId: string,
  payload: OrdenTrabajoAdjuntoPayload | undefined,
  file: File,
): Promise<OrdenTrabajoAdjunto> {
  const formData = new FormData()
  formData.append("file", file)
  if (payload) {
    const jsonBlob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    })
    formData.append("data", jsonBlob)
  }
  return http.post<OrdenTrabajoAdjunto>(
    ORDEN_TRABAJO_ENDPOINTS.adjuntos.root(ordenTrabajoId),
    formData,
  )
}

export async function replaceOrdenTrabajoAdjuntoFile(
  ordenTrabajoId: string,
  id: string,
  file: File,
): Promise<OrdenTrabajoAdjunto> {
  const formData = new FormData()
  formData.append("file", file)
  return http.post<OrdenTrabajoAdjunto>(
    ORDEN_TRABAJO_ENDPOINTS.adjuntos.replaceFile(ordenTrabajoId, id),
    formData,
  )
}

export async function deleteOrdenTrabajoAdjunto(
  ordenTrabajoId: string,
  id: string,
): Promise<void> {
  return http.delete<void>(
    ORDEN_TRABAJO_ENDPOINTS.adjuntos.detail(ordenTrabajoId, id),
  )
}

// ----------------------------------------------------
// 3. Orden de Trabajo Actividades Service Methods
// ----------------------------------------------------

export async function listOrdenTrabajoActividades(
  filters?: PageParams,
): Promise<PageResponse<OrdenTrabajoActividad>> {
  return http.get<PageResponse<OrdenTrabajoActividad>>(
    ORDEN_TRABAJO_ENDPOINTS.actividades.root,
    { params: filters },
  )
}

export async function listOrdenTrabajoActividadesByOrdenTrabajoId(
  ordenTrabajoId: string,
  filters?: PageParams,
): Promise<PageResponse<OrdenTrabajoActividad>> {
  return http.get<PageResponse<OrdenTrabajoActividad>>(
    ORDEN_TRABAJO_ENDPOINTS.actividades.root,
    {
      params: {
        ...filters,
        ordenTrabajoId,
      },
    },
  )
}

export async function getOrdenTrabajoActividad(
  id: string,
): Promise<OrdenTrabajoActividad> {
  return http.get<OrdenTrabajoActividad>(
    ORDEN_TRABAJO_ENDPOINTS.actividades.detail(id),
  )
}

export async function createOrdenTrabajoActividad(
  payload: OrdenTrabajoActividadPayload,
): Promise<OrdenTrabajoActividad> {
  return http.post<OrdenTrabajoActividad>(
    ORDEN_TRABAJO_ENDPOINTS.actividades.root,
    payload,
  )
}

export async function updateOrdenTrabajoActividad(
  id: string,
  payload: OrdenTrabajoActividadPayload,
): Promise<OrdenTrabajoActividad> {
  return http.put<OrdenTrabajoActividad>(
    ORDEN_TRABAJO_ENDPOINTS.actividades.detail(id),
    payload,
  )
}

export async function deleteOrdenTrabajoActividad(id: string): Promise<void> {
  return http.delete<void>(ORDEN_TRABAJO_ENDPOINTS.actividades.detail(id))
}

// ----------------------------------------------------
// 4. Actividad Evidencias Service Methods
// ----------------------------------------------------

export async function listOrdenTrabajoActividadEvidencias(
  actividadId: string,
  filters?: PageParams,
): Promise<PageResponse<OrdenTrabajoActividadEvidencia>> {
  return http.get<PageResponse<OrdenTrabajoActividadEvidencia>>(
    ORDEN_TRABAJO_ENDPOINTS.actividades.evidencias.root(actividadId),
    { params: filters },
  )
}

export async function getOrdenTrabajoActividadEvidencia(
  actividadId: string,
  id: string,
): Promise<OrdenTrabajoActividadEvidencia> {
  return http.get<OrdenTrabajoActividadEvidencia>(
    ORDEN_TRABAJO_ENDPOINTS.actividades.evidencias.detail(actividadId, id),
  )
}

export async function createOrdenTrabajoActividadEvidenciaWithFile(
  actividadId: string,
  file: File,
): Promise<OrdenTrabajoActividadEvidencia> {
  const formData = new FormData()
  formData.append("file", file)
  return http.post<OrdenTrabajoActividadEvidencia>(
    ORDEN_TRABAJO_ENDPOINTS.actividades.evidencias.root(actividadId),
    formData,
  )
}

export async function replaceOrdenTrabajoActividadEvidenciaFile(
  actividadId: string,
  id: string,
  file: File,
): Promise<OrdenTrabajoActividadEvidencia> {
  const formData = new FormData()
  formData.append("file", file)
  return http.post<OrdenTrabajoActividadEvidencia>(
    ORDEN_TRABAJO_ENDPOINTS.actividades.evidencias.replaceFile(actividadId, id),
    formData,
  )
}

export async function deleteOrdenTrabajoActividadEvidencia(
  actividadId: string,
  id: string,
): Promise<void> {
  return http.delete<void>(
    ORDEN_TRABAJO_ENDPOINTS.actividades.evidencias.detail(actividadId, id),
  )
}

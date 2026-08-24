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
  tipoFallas?: string | null
  prioridad: PrioridadInfo | null
  solicitante?: UserInfo | null
  titulo: string
  descripcion: string
  fechaSolicitud?: string | null
  aprobadoPor?: UserInfo | null
  fechaAprobacion?: string | null
  fechaEstimadaOt?: string | null
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
  tipoFallas?: string | null
  prioridadId: string
  solicitanteId: string
  titulo: string
  descripcion: string
  fechaSolicitud?: string | null
  fechaEstimadaOt?: string | null
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

export type EnviarSolicitudPayload = {
  aprobadoPorId: string
  supervisorId?: string | null
}

export async function enviarSolicitud(
  id: string,
  payload: EnviarSolicitudPayload,
): Promise<SolicitudMantenimiento> {
  return http.post<SolicitudMantenimiento, EnviarSolicitudPayload>(
    solicitudEndpoints.enviar(id),
    payload,
  )
}


export type WorkflowAction = {
  name: string
  variable: string
  value: string
}

export type WorkflowFieldOption = {
  value: string
  label: string
}

export type WorkflowField = {
  id: string
  name: string
  type: string
  required: boolean
  readable: boolean
  writable: boolean
  options?: WorkflowFieldOption[]
}

export type WorkflowTaskActionsResponse = {
  taskId: string
  taskName: string
  taskDefinitionKey: string
  processInstanceId: string
  status?: string
  fields?: WorkflowField[]
  actions: WorkflowAction[]
}

export type CompleteWorkflowTaskPayload = {
  variables: Record<string, unknown>
}

export async function getWorkflowActions(
  processInstanceId: string,
): Promise<WorkflowTaskActionsResponse> {
  return http.get<WorkflowTaskActionsResponse>(
    solicitudEndpoints.workflow.actions(processInstanceId),
  )
}

export async function completeWorkflowTask(
  solicitudId: string,
  payload: CompleteWorkflowTaskPayload,
): Promise<SolicitudMantenimiento> {
  return http.post<SolicitudMantenimiento, CompleteWorkflowTaskPayload>(
    solicitudEndpoints.workflow.complete(solicitudId),
    payload,
  )
}

export type WorkflowHistoryItem = {
  taskId: string
  taskDefinitionKey: string
  taskName: string
  assignee?: string | null
  startTime?: string | null
  endTime?: string | null
  status: "COMPLETADA" | "ACTIVA" | string
}

export type WorkflowHistoryResponse = {
  processInstanceId: string
  items: WorkflowHistoryItem[]
}

export async function getWorkflowHistory(
  processInstanceId: string,
): Promise<WorkflowHistoryResponse> {
  return http.get<WorkflowHistoryResponse>(
    solicitudEndpoints.workflow.history(processInstanceId),
  )
}


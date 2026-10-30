import type { PageParams } from "@/shared/types/api.types"
import type { AuditoriaResponse } from "@/shared/types/audit.types"

export type EstadoIncidente =
  | "REGISTRADO"
  | "REVISION"
  | "EN_ATENCION"
  | "VALIDACION"
  | "EN_CIERRE"
  | "CERRADO"
  | "RECHAZADO"
  | "CANCELADO"
  | string

export type PrioridadIncidente = "BAJA" | "MEDIA" | "ALTA" | "CRITICA" | string

export interface IncidenteInvolucrado {
  id: string
  incidenteActivoId: string
  tipoInvolucrado: string
  empleadoId?: string | null
  nombre?: string | null
  documentoIdentidad?: string | null
  descripcion?: string | null
  auditoria?: AuditoriaResponse
}

export interface IncidenteEvidencia {
  id: string
  incidenteActivoId: string
  nombreArchivo: string
  url: string
  mimeType: string
  size: number
  auditoria?: AuditoriaResponse
}

export interface IncidenteActivo {
  id: string
  activoId: string
  tipoIncidente: string
  prioridad: PrioridadIncidente
  estado: EstadoIncidente
  fechaHora: string
  ubicacion?: string | null
  latitud?: number | null
  longitud?: number | null
  descripcion: string
  empleadoReportaId: string
  processInstanceId?: string | null
  involucrados?: IncidenteInvolucrado[]
  evidencias?: IncidenteEvidencia[]
  auditoria?: AuditoriaResponse
}

export interface IncidenteFiltros extends PageParams {
  search?: string
  tipoIncidente?: string
  prioridad?: string
  estado?: string
  activoId?: string
}

export interface RegistrarIncidenteRequest {
  activoId: string
  tipoIncidente: string
  prioridad: string
  estado?: string
  fechaHora: string
  ubicacion?: string
  latitud?: number
  longitud?: number
  descripcion: string
  empleadoReportaId: string
}

export interface ActualizarIncidenteRequest {
  activoId?: string
  tipoIncidente?: string
  prioridad?: string
  estado?: string
  fechaHora?: string
  ubicacion?: string
  latitud?: number
  longitud?: number
  descripcion?: string
  empleadoReportaId?: string
}

export interface CancelarIncidenteRequest {
  motivo?: string
}

export interface EjecutarAccionIncidenteRequest {
  aprobado?: boolean
  observacionRevision?: string
  detalleAtencion?: string
  solucionAprobada?: boolean
  observacionValidacion?: string
  observacionCierre?: string
  observacion?: string
  variables?: Record<string, unknown>
}

export interface RegistrarInvolucradoRequest {
  tipoInvolucrado: string
  empleadoId?: string
  nombre?: string
  documentoIdentidad?: string
  descripcion?: string
}

export interface ActualizarInvolucradoRequest {
  tipoInvolucrado?: string
  empleadoId?: string
  nombre?: string
  documentoIdentidad?: string
  descripcion?: string
}

export interface WorkflowAction {
  name: string
  variable: string
  value: string
}

export interface WorkflowField {
  id: string
  name: string
  type: string
  required: boolean
  readable: boolean
  writable: boolean
  component?: string | null
  source?: string | null
  url?: string | null
}

export interface WorkflowTask {
  taskId: string
  taskName: string
  taskDefinitionKey: string
  processInstanceId: string
  assignee?: string | null
  candidateGroups?: string[]
  createTime?: string
  fields?: WorkflowField[]
}

export interface WorkflowTaskActions {
  taskId?: string | null
  taskName?: string | null
  taskDefinitionKey?: string | null
  processInstanceId?: string | null
  actions?: WorkflowAction[]
  fields?: WorkflowField[]
}

export interface WorkflowHistoryItem {
  activityId?: string
  activityName?: string
  activityType?: string
  taskId?: string
  assignee?: string
  startTime?: string
  endTime?: string
  durationInMillis?: number
  completed?: boolean
}

export interface WorkflowHistory {
  processInstanceId: string
  businessKey?: string
  startTime?: string
  endTime?: string
  items?: WorkflowHistoryItem[]
}


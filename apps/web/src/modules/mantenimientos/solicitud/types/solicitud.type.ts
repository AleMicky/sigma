import type { PageParams } from "@/shared/types/api.types"
import type { AuditableFields } from "@/shared/types/audit.types"

export type SolicitudActivoInfo = {
  id: string
  codigo: string
  nombre: string
}

export type SolicitudTipoMantenimientoInfo = {
  id: string
  codigo: string
  nombre: string
}

export type SolicitudPrioridadInfo = {
  id: string
  codigo: string
  nombre: string
  nivel: number
}

export type SolicitudEmpleadoInfo = {
  id: string
  nombreCompleto: string
  nombre?: string
  cargo?: string | null
}

export type SolicitudAdjunto = {
  id: string
  nombreArchivo: string
  url: string
  tipoContenido: string
  size: number
  descripcion?: string | null
}

export type SolicitudAuditoria = AuditableFields

export type SolicitudMantenimiento = {
  id: string
  numero: string
  activo: SolicitudActivoInfo
  tipoMantenimiento: SolicitudTipoMantenimientoInfo
  tipoFallas?: string | null
  prioridad: SolicitudPrioridadInfo
  solicitante: SolicitudEmpleadoInfo
  titulo: string
  descripcion: string
  fechaSolicitud: string
  aprobador?: SolicitudEmpleadoInfo | null
  responsable?: SolicitudEmpleadoInfo | null
  supervisor?: SolicitudEmpleadoInfo | null
  fechaInicioMantenimiento?: string | null
  fechaFinMantenimiento?: string | null
  fechaCierre?: string | null
  processInstanceId?: string | null
  estado: string,
  adjuntos: SolicitudAdjunto[]
  auditoria?: SolicitudAuditoria | null
}

export type SolicitudMantenimientoFilters = PageParams & {
  q?: string
  estado?: string
  solicitanteId?: string
  interfaz?: string
}

export type SolicitudMantenimientoResumen = {
  total: number
  borradores: number
  enRevision: number
  enProceso: number
  finalizadas: number
  // AprobacionesPage
  porAprobar?: number
  observadas?: number
  enObservadas?: number
  asignadas?: number
  // EncargadoMantenimientoPage
  porIniciar?: number
  enEjecucion?: number
  // SupervisorMantenimientoPage
  porRevisar?: number
  observadasMantenimiento?: number
  validadas?: number
  trabajoConcluido?: number
}

export type SolicitudMantenimientoTrazabilidad = {
  id: string
  solicitudMantenimientoId: string
  estadoAnterior?: string | null
  estadoNuevo: string
  comentario?: string | null
  empleadoId?: string | null
  empleado?: SolicitudEmpleadoInfo | null
  fecha: string
}

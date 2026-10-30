import { createCrudService, http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { solicitudVehicularEndpoints } from "./solicitud-vehicular.endpoints"
import type { ReporteSolicitudesFilters, SolicitudVehicularListFilters } from "./solicitud-vehicular.keys"

export type SolicitudVehicularTipoInfo = {
  id: string
  codigo: string
  nombre: string
  diasAnticipacion: number
  requiereRespaldo: boolean
  requiereJustificacion: boolean
}

export type SolicitudVehicularSolicitanteInfo = {
  id: string
  codigo: string
  nombreCompleto: string
  cargo: string
  area: string
}

export type SolicitudVehicularResponsableInfo = {
  id: string
  codigo: string
  nombreCompleto: string
  cargo: string
  area: string
}

export type SolicitudVehicularConductorInfo = {
  id: string
  empleadoId?: string | null
  nombreCompleto?: string | null
  numeroLicencia?: string | null
  categoriaLicencia?: string | null
  urlImagen?: string | null
}

export type SolicitudVehicularAdjunto = {
  id: string
  solicitudVehicularId: string
  nombreArchivo: string
  nombreOriginal: string
  url: string
  mimeType: string
  size: number
  descripcion?: string | null
  auditoria?: AuditableEntity["auditoria"]
}

export type SolicitudVehicular = AuditableEntity & {
  id: string
  numero: string
  tipoSolicitudVehicularId: string
  tipoSolicitudVehicular?: SolicitudVehicularTipoInfo | null
  solicitanteId: string
  solicitante?: SolicitudVehicularSolicitanteInfo | null
  responsableAsignacionId?: string | null
  responsableAsignacion?: SolicitudVehicularResponsableInfo | null
  conductorAsignadoId?: string | null
  conductorAsignado?: SolicitudVehicularConductorInfo | null
  motivo: string
  justificacion?: string | null
  destino: string
  fechaSalida: string
  fechaRetornoEstimada: string
  cantidadPasajeros: number
  observacion?: string | null
  estado: string
  processInstanceId?: string | null
  adjuntos?: SolicitudVehicularAdjunto[]
}

export type SolicitudVehicularPayload = {
  numero?: string
  tipoSolicitudVehicularId: string
  solicitanteId: string
  responsableAsignacionId?: string | null
  conductorAsignadoId?: string | null
  motivo: string
  justificacion?: string | null
  destino: string
  fechaSalida: string
  fechaRetornoEstimada: string
  cantidadPasajeros: number
  observacion?: string | null
  estado?: string | null
  processInstanceId?: string | null
}

export type SolicitudVehicularUpdatePayload = {
  numero?: string
  tipoSolicitudVehicularId: string
  solicitanteId: string
  responsableAsignacionId?: string | null
  conductorAsignadoId?: string | null
  motivo: string
  justificacion?: string | null
  destino: string
  fechaSalida: string
  fechaRetornoEstimada: string
  cantidadPasajeros: number
  observacion?: string | null
  estado?: string | null
  processInstanceId?: string | null
}

const crud = createCrudService<SolicitudVehicular, SolicitudVehicularPayload>(
  solicitudVehicularEndpoints
)

export type SolicitudVehicularCalendarioFilters = {
  fechaInicio?: string
  fechaFin?: string
}

export const listSolicitudesVehiculares = (
  filters?: SolicitudVehicularListFilters
): Promise<PageResponse<SolicitudVehicular>> => {
  return http.get<PageResponse<SolicitudVehicular>>(
    solicitudVehicularEndpoints.root,
    { params: filters }
  )
}

export const listSolicitudesVehicularesCalendario = (
  filters?: SolicitudVehicularCalendarioFilters
): Promise<SolicitudVehicular[]> => {
  return http.get<SolicitudVehicular[]>(
    solicitudVehicularEndpoints.calendario,
    { params: filters }
  )
}

export const getSolicitudVehicular = crud.get
export const createSolicitudVehicular = crud.create

export const createSolicitudVehicularWithFiles = (
  payload: SolicitudVehicularPayload,
  files?: File[]
): Promise<SolicitudVehicular> => {
  if (!files || files.length === 0) {
    return createSolicitudVehicular(payload)
  }

  const formData = new FormData()
  const dataBlob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  })
  formData.append("data", dataBlob)

  for (const file of files) {
    formData.append("files", file)
  }

  return http.post<SolicitudVehicular>(
    solicitudVehicularEndpoints.conAdjuntos,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )
}

export const updateSolicitudVehicular = (
  id: string,
  payload: SolicitudVehicularUpdatePayload
): Promise<SolicitudVehicular> => {
  return http.put<SolicitudVehicular>(
    solicitudVehicularEndpoints.byId(id),
    payload
  )
}

export const deleteSolicitudVehicular = crud.remove

export type CompleteWorkflowTaskPayload = {
  variables: Record<string, unknown>
}

export type EnviarSolicitudVehicularPayload = {
  aprobadorId: string
  comentario?: string
}

export const enviarSolicitudVehicular = (
  id: string,
  payload: EnviarSolicitudVehicularPayload
): Promise<SolicitudVehicular> => {
  return http.post<SolicitudVehicular>(
    solicitudVehicularEndpoints.enviar(id),
    payload
  )
}

export const completarWorkflowSolicitudVehicular = (
  id: string,
  payload: CompleteWorkflowTaskPayload
): Promise<SolicitudVehicular> => {
  return http.post<SolicitudVehicular>(
    solicitudVehicularEndpoints.workflowComplete(id),
    payload
  )
}

export type ReporteSolicitudItem = {
  id: string
  numero: string
  fechaSolicitud?: string | null
  fechaSalida: string
  fechaRetornoEstimada: string
  cantidadPasajeros: number
  motivo: string
  justificacion?: string | null
  destino: string
  observacion?: string | null
  estado: string
  solicitanteId?: string | null
  solicitanteCodigo?: string | null
  solicitanteNombre?: string | null
  solicitanteCargo?: string | null
  solicitanteArea?: string | null
  tipoSolicitudId?: string | null
  tipoSolicitudCodigo?: string | null
  tipoSolicitudNombre?: string | null
  asignacionId?: string | null
  fechaAsignacion?: string | null
  asignadoPorNombre?: string | null
  observacionAsignacion?: string | null
  activoId?: string | null
  activoCodigo?: string | null
  activoNombre?: string | null
  activoPlaca?: string | null
  activoMarca?: string | null
  activoModelo?: string | null
  activoTipo?: string | null
  conductorId?: string | null
  conductorEmpleadoId?: string | null
  conductorNombre?: string | null
  conductorLicencia?: string | null
  conductorCategoria?: string | null
}

export type ReporteSolicitudesGeneralResponse = {
  totalSolicitudes: number
  solicitudesBorrador: number
  solicitudesPendientes: number
  solicitudesAsignadas: number
  solicitudesEnCurso: number
  solicitudesFinalizadas: number
  solicitudesRechazadas: number
  totalPasajeros: number
  items: ReporteSolicitudItem[]
}

export type DescargarReporteSolicitudesPdfParams = {
  fechaDesde?: string
  fechaHasta?: string
  activoId?: string
  solicitanteId?: string
  conductorId?: string
  tipoSolicitudVehicularId?: string
  estado?: string
  search?: string
}

export const getReporteSolicitudesVehiculares = (
  params?: ReporteSolicitudesFilters
): Promise<ReporteSolicitudesGeneralResponse> => {
  return http.get<ReporteSolicitudesGeneralResponse>(
    solicitudVehicularEndpoints.reportes.general,
    { params }
  )
}

export const descargarReporteSolicitudesPdf = async (
  params: DescargarReporteSolicitudesPdfParams
): Promise<void> => {
  const queryParams: Record<string, string> = {}
  if (params.fechaDesde) queryParams.fechaDesde = `${params.fechaDesde}T00:00:00`
  if (params.fechaHasta) queryParams.fechaHasta = `${params.fechaHasta}T23:59:59`
  if (params.activoId?.trim()) queryParams.activoId = params.activoId.trim()
  if (params.solicitanteId?.trim()) queryParams.solicitanteId = params.solicitanteId.trim()
  if (params.conductorId?.trim()) queryParams.conductorId = params.conductorId.trim()
  if (params.tipoSolicitudVehicularId?.trim()) queryParams.tipoSolicitudVehicularId = params.tipoSolicitudVehicularId.trim()
  if (params.estado?.trim()) queryParams.estado = params.estado.trim()
  if (params.search?.trim()) queryParams.search = params.search.trim()

  const blob = await http.get<Blob>(solicitudVehicularEndpoints.reportes.pdf, {
    params: queryParams,
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  })

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `reporte-solicitudes-${params.fechaDesde ?? "inicio"}_${params.fechaHasta ?? "fin"}.pdf`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export const abrirReporteSolicitudesPdf = async (
  params: DescargarReporteSolicitudesPdfParams
): Promise<void> => {
  const queryParams: Record<string, string> = {}
  if (params.fechaDesde) queryParams.fechaDesde = `${params.fechaDesde}T00:00:00`
  if (params.fechaHasta) queryParams.fechaHasta = `${params.fechaHasta}T23:59:59`
  if (params.activoId?.trim()) queryParams.activoId = params.activoId.trim()
  if (params.solicitanteId?.trim()) queryParams.solicitanteId = params.solicitanteId.trim()
  if (params.conductorId?.trim()) queryParams.conductorId = params.conductorId.trim()
  if (params.tipoSolicitudVehicularId?.trim()) queryParams.tipoSolicitudVehicularId = params.tipoSolicitudVehicularId.trim()
  if (params.estado?.trim()) queryParams.estado = params.estado.trim()
  if (params.search?.trim()) queryParams.search = params.search.trim()

  const blob = await http.get<Blob>(solicitudVehicularEndpoints.reportes.pdf, {
    params: queryParams,
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  })

  const url = window.URL.createObjectURL(blob)
  window.open(url, "_blank")
}

import { createCrudService, http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { solicitudVehicularEndpoints } from "./solicitud-vehicular.endpoints"
import type { SolicitudVehicularListFilters } from "./solicitud-vehicular.keys"

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

export const listSolicitudesVehiculares = (
  filters?: SolicitudVehicularListFilters
): Promise<PageResponse<SolicitudVehicular>> => {
  return http.get<PageResponse<SolicitudVehicular>>(
    solicitudVehicularEndpoints.root,
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

import { http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"

import { incidenteEndpoints } from "./incidente.endpoints"
import type {
  ActualizarIncidenteRequest,
  ActualizarInvolucradoRequest,
  CancelarIncidenteRequest,
  EjecutarAccionIncidenteRequest,
  IncidenteActivo,
  IncidenteEvidencia,
  IncidenteFiltros,
  IncidenteInvolucrado,
  RegistrarIncidenteRequest,
  RegistrarInvolucradoRequest,
  WorkflowHistory,
  WorkflowTask,
  WorkflowTaskActions,
} from "./incidente.types"

export const listIncidentes = (
  params?: IncidenteFiltros
): Promise<PageResponse<IncidenteActivo>> => {
  return http.get<PageResponse<IncidenteActivo>>(incidenteEndpoints.root, {
    params,
  })
}

export const getIncidenteById = (id: string): Promise<IncidenteActivo> => {
  return http.get<IncidenteActivo>(incidenteEndpoints.byId(id))
}

export const listIncidentesPorActivo = (
  activoId: string
): Promise<IncidenteActivo[]> => {
  return http.get<IncidenteActivo[]>(incidenteEndpoints.byActivoId(activoId))
}

export const registrarIncidente = (
  data: RegistrarIncidenteRequest
): Promise<IncidenteActivo> => {
  return http.post<IncidenteActivo>(incidenteEndpoints.root, data)
}

export const actualizarIncidente = (
  id: string,
  data: ActualizarIncidenteRequest
): Promise<IncidenteActivo> => {
  return http.put<IncidenteActivo>(incidenteEndpoints.byId(id), data)
}

export const cancelarIncidente = (
  id: string,
  data?: CancelarIncidenteRequest
): Promise<IncidenteActivo> => {
  return http.post<IncidenteActivo>(incidenteEndpoints.cancelar(id), data ?? {})
}

// ==========================================
// Integración Flowable BPMN
// ==========================================

export const getIncidenteTareaActual = (id: string): Promise<WorkflowTask> => {
  return http.get<WorkflowTask>(incidenteEndpoints.tareaActual(id))
}

export const getIncidenteAcciones = (
  id: string
): Promise<WorkflowTaskActions> => {
  return http.get<WorkflowTaskActions>(incidenteEndpoints.acciones(id))
}

export const ejecutarAccionIncidente = (
  id: string,
  accionId: string,
  data?: EjecutarAccionIncidenteRequest
): Promise<IncidenteActivo> => {
  return http.post<IncidenteActivo>(
    incidenteEndpoints.ejecutarAccion(id, accionId),
    data ?? {}
  )
}

export const getIncidenteHistorial = (
  id: string
): Promise<WorkflowHistory> => {
  return http.get<WorkflowHistory>(incidenteEndpoints.historialProceso(id))
}

// ==========================================
// Involucrados
// ==========================================

export const listInvolucrados = (
  incidenteId: string
): Promise<IncidenteInvolucrado[]> => {
  return http.get<IncidenteInvolucrado[]>(
    incidenteEndpoints.involucrados(incidenteId)
  )
}

export const registrarInvolucrado = (
  incidenteId: string,
  data: RegistrarInvolucradoRequest
): Promise<IncidenteInvolucrado> => {
  return http.post<IncidenteInvolucrado>(
    incidenteEndpoints.involucrados(incidenteId),
    data
  )
}

export const actualizarInvolucrado = (
  incidenteId: string,
  involucradoId: string,
  data: ActualizarInvolucradoRequest
): Promise<IncidenteInvolucrado> => {
  return http.put<IncidenteInvolucrado>(
    incidenteEndpoints.involucradoById(incidenteId, involucradoId),
    data
  )
}

export const eliminarInvolucrado = (
  incidenteId: string,
  involucradoId: string
): Promise<void> => {
  return http.delete<void>(
    incidenteEndpoints.involucradoById(incidenteId, involucradoId)
  )
}

// ==========================================
// Evidencias
// ==========================================

export const listEvidencias = (
  incidenteId: string
): Promise<IncidenteEvidencia[]> => {
  return http.get<IncidenteEvidencia[]>(
    incidenteEndpoints.evidencias(incidenteId)
  )
}

export const getEvidenciaById = (
  incidenteId: string,
  evidenciaId: string
): Promise<IncidenteEvidencia> => {
  return http.get<IncidenteEvidencia>(
    incidenteEndpoints.evidenciaById(incidenteId, evidenciaId)
  )
}

export const subirEvidencia = (
  incidenteId: string,
  file: File
): Promise<IncidenteEvidencia> => {
  const formData = new FormData()
  formData.append("file", file)

  return http.post<IncidenteEvidencia>(
    incidenteEndpoints.evidencias(incidenteId),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )
}

export const eliminarEvidencia = (
  incidenteId: string,
  evidenciaId: string
): Promise<void> => {
  return http.delete<void>(
    incidenteEndpoints.evidenciaById(incidenteId, evidenciaId)
  )
}


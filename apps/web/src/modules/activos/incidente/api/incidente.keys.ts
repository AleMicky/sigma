import type { IncidenteFiltros } from "./incidente.types"

export const incidenteKeys = {
  all: ["incidentes"] as const,
  lists: () => [...incidenteKeys.all, "list"] as const,
  list: (filters?: IncidenteFiltros) => [...incidenteKeys.lists(), filters] as const,
  details: () => [...incidenteKeys.all, "detail"] as const,
  detail: (id: string) => [...incidenteKeys.details(), id] as const,
  byActivo: (activoId: string) => [...incidenteKeys.all, "by-activo", activoId] as const,

  // Flowable
  tareaActual: (id: string) => [...incidenteKeys.detail(id), "tarea-actual"] as const,
  acciones: (id: string) => [...incidenteKeys.detail(id), "acciones"] as const,
  historial: (id: string) => [...incidenteKeys.detail(id), "historial"] as const,

  // Involucrados
  involucrados: (id: string) => [...incidenteKeys.detail(id), "involucrados"] as const,

  // Evidencias
  evidencias: (id: string) => [...incidenteKeys.detail(id), "evidencias"] as const,
  evidencia: (id: string, evidenciaId: string) =>
    [...incidenteKeys.evidencias(id), evidenciaId] as const,
}


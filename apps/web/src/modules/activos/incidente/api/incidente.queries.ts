import { useQuery } from "@tanstack/react-query"

import { incidenteKeys } from "./incidente.keys"
import {
  getEvidenciaById,
  getIncidenteAcciones,
  getIncidenteById,
  getIncidenteHistorial,
  getIncidenteTareaActual,
  listEvidencias,
  listIncidentes,
  listIncidentesPorActivo,
  listInvolucrados,
} from "./incidente.service"
import type { IncidenteFiltros } from "./incidente.types"

export const useIncidentesQuery = (filters?: IncidenteFiltros) => {
  return useQuery({
    queryKey: incidenteKeys.list(filters),
    queryFn: () => listIncidentes(filters),
  })
}

export const useIncidenteDetailQuery = (id: string, enabled = true) => {
  return useQuery({
    queryKey: incidenteKeys.detail(id),
    queryFn: () => getIncidenteById(id),
    enabled: Boolean(id) && enabled,
  })
}

export const useIncidentesPorActivoQuery = (activoId: string, enabled = true) => {
  return useQuery({
    queryKey: incidenteKeys.byActivo(activoId),
    queryFn: () => listIncidentesPorActivo(activoId),
    enabled: Boolean(activoId) && enabled,
  })
}

export const useIncidenteTareaActualQuery = (id: string, enabled = true) => {
  return useQuery({
    queryKey: incidenteKeys.tareaActual(id),
    queryFn: () => getIncidenteTareaActual(id),
    enabled: Boolean(id) && enabled,
    retry: false,
  })
}

export const useIncidenteAccionesQuery = (id: string, enabled = true) => {
  return useQuery({
    queryKey: incidenteKeys.acciones(id),
    queryFn: () => getIncidenteAcciones(id),
    enabled: Boolean(id) && enabled,
    retry: false,
  })
}

export const useIncidenteHistorialQuery = (id: string, enabled = true) => {
  return useQuery({
    queryKey: incidenteKeys.historial(id),
    queryFn: () => getIncidenteHistorial(id),
    enabled: Boolean(id) && enabled,
    retry: false,
  })
}

export const useIncidenteInvolucradosQuery = (id: string, enabled = true) => {
  return useQuery({
    queryKey: incidenteKeys.involucrados(id),
    queryFn: () => listInvolucrados(id),
    enabled: Boolean(id) && enabled,
  })
}

export const useIncidenteEvidenciasQuery = (id: string, enabled = true) => {
  return useQuery({
    queryKey: incidenteKeys.evidencias(id),
    queryFn: () => listEvidencias(id),
    enabled: Boolean(id) && enabled,
  })
}

export const useIncidenteEvidenciaDetailQuery = (
  id: string,
  evidenciaId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: incidenteKeys.evidencia(id, evidenciaId),
    queryFn: () => getEvidenciaById(id, evidenciaId),
    enabled: Boolean(id) && Boolean(evidenciaId) && enabled,
  })
}


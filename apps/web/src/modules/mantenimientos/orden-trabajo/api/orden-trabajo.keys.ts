import type { PageParams } from "@/shared/types/api.types"

import type { OrdenTrabajoFilters } from "./orden-trabajo.service"

export const ordenTrabajoKeys = {
  all: ["ordenes-trabajo"] as const,
  lists: () => [...ordenTrabajoKeys.all, "list"] as const,
  list: (filters?: OrdenTrabajoFilters) =>
    [...ordenTrabajoKeys.lists(), filters ?? {}] as const,
  details: () => [...ordenTrabajoKeys.all, "detail"] as const,
  detail: (id: string) => [...ordenTrabajoKeys.details(), id] as const,
  // Adjuntos
  adjuntosAll: () => [...ordenTrabajoKeys.all, "adjuntos"] as const,
  adjuntosList: (ordenTrabajoId: string, filters?: PageParams) =>
    [...ordenTrabajoKeys.adjuntosAll(), ordenTrabajoId, filters ?? {}] as const,
  adjuntoDetail: (ordenTrabajoId: string, id: string) =>
    [...ordenTrabajoKeys.adjuntosAll(), ordenTrabajoId, id] as const,
  // Actividades
  actividadesAll: ["ordenes-trabajo-actividades"] as const,
  actividadesLists: () => [...ordenTrabajoKeys.actividadesAll, "list"] as const,
  actividadesByOT: (ordenTrabajoId: string, filters?: PageParams) =>
    [...ordenTrabajoKeys.actividadesLists(), "by-ot", ordenTrabajoId, filters ?? {}] as const,
  actividadDetail: (id: string) =>
    [...ordenTrabajoKeys.actividadesAll, "detail", id] as const,
  // Evidencias
  evidenciasAll: () => [...ordenTrabajoKeys.actividadesAll, "evidencias"] as const,
  evidenciasList: (actividadId: string, filters?: PageParams) =>
    [...ordenTrabajoKeys.evidenciasAll(), actividadId, filters ?? {}] as const,
  evidenciaDetail: (actividadId: string, id: string) =>
    [...ordenTrabajoKeys.evidenciasAll(), actividadId, id] as const,
}

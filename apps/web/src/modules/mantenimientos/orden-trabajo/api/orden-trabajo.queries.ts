import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { ordenTrabajoKeys } from "./orden-trabajo.keys"
import {
  getOrdenTrabajo,
  getOrdenTrabajoActividad,
  getOrdenTrabajoActividadEvidencia,
  getOrdenTrabajoAdjunto,
  listOrdenesTrabajo,
  listOrdenTrabajoActividades,
  listOrdenTrabajoActividadesByOrdenTrabajoId,
  listOrdenTrabajoActividadEvidencias,
  listOrdenTrabajoAdjuntos,
  type OrdenTrabajoFilters,
} from "./orden-trabajo.service"

export const ordenTrabajoQueries = {
  // Ordenes de Trabajo
  list: (filters?: OrdenTrabajoFilters) =>
    queryOptions({
      queryKey: ordenTrabajoKeys.list(filters),
      queryFn: () => listOrdenesTrabajo(filters),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: ordenTrabajoKeys.detail(id),
      queryFn: () => getOrdenTrabajo(id),
      enabled: Boolean(id),
    }),

  // Adjuntos
  adjuntosList: (ordenTrabajoId: string, filters?: PageParams) =>
    queryOptions({
      queryKey: ordenTrabajoKeys.adjuntosList(ordenTrabajoId, filters),
      queryFn: () => listOrdenTrabajoAdjuntos(ordenTrabajoId, filters),
      enabled: Boolean(ordenTrabajoId),
    }),

  adjuntoDetail: (ordenTrabajoId: string, id: string) =>
    queryOptions({
      queryKey: ordenTrabajoKeys.adjuntoDetail(ordenTrabajoId, id),
      queryFn: () => getOrdenTrabajoAdjunto(ordenTrabajoId, id),
      enabled: Boolean(ordenTrabajoId && id),
    }),

  // Actividades
  actividadesList: (filters?: PageParams) =>
    queryOptions({
      queryKey: ordenTrabajoKeys.actividadesLists(),
      queryFn: () => listOrdenTrabajoActividades(filters),
    }),

  actividadesByOT: (ordenTrabajoId: string, filters?: PageParams) =>
    queryOptions({
      queryKey: ordenTrabajoKeys.actividadesByOT(ordenTrabajoId, filters),
      queryFn: () =>
        listOrdenTrabajoActividadesByOrdenTrabajoId(ordenTrabajoId, filters),
      enabled: Boolean(ordenTrabajoId),
    }),

  actividadDetail: (id: string) =>
    queryOptions({
      queryKey: ordenTrabajoKeys.actividadDetail(id),
      queryFn: () => getOrdenTrabajoActividad(id),
      enabled: Boolean(id),
    }),

  // Evidencias
  evidenciasList: (actividadId: string, filters?: PageParams) =>
    queryOptions({
      queryKey: ordenTrabajoKeys.evidenciasList(actividadId, filters),
      queryFn: () => listOrdenTrabajoActividadEvidencias(actividadId, filters),
      enabled: Boolean(actividadId),
    }),

  evidenciaDetail: (actividadId: string, id: string) =>
    queryOptions({
      queryKey: ordenTrabajoKeys.evidenciaDetail(actividadId, id),
      queryFn: () => getOrdenTrabajoActividadEvidencia(actividadId, id),
      enabled: Boolean(actividadId && id),
    }),
}

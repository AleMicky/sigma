import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { solicitudKeys } from "./solicitud.keys"
import {
  getSolicitud,
  getWorkflowActions,
  listAdjuntos,
  listSolicitudes,
  type SolicitudListParams,
} from "./solicitud.service"

export const solicitudQueries = {
  list: (filters?: SolicitudListParams) =>
    queryOptions({
      queryKey: solicitudKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listSolicitudes(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: solicitudKeys.detail(id),
      queryFn: () => getSolicitud(id),
      enabled: Boolean(id),
    }),

  adjuntos: (solicitudId: string, params?: PageParams) =>
    queryOptions({
      queryKey: solicitudKeys.adjuntosList(solicitudId, params ?? {}),
      queryFn: () => listAdjuntos(solicitudId, params),
      enabled: Boolean(solicitudId),
    }),

  workflowActions: (processInstanceId?: string | null) =>
    queryOptions({
      queryKey: solicitudKeys.workflowActions(processInstanceId ?? ""),
      queryFn: () => getWorkflowActions(processInstanceId!),
      enabled: Boolean(processInstanceId),
      staleTime: 1000 * 30,
    }),
}


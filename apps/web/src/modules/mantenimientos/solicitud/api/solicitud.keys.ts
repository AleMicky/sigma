export const solicitudKeys = {
  all: ["mantenimientos", "solicitudes"] as const,
  lists: () => [...solicitudKeys.all, "list"] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...solicitudKeys.lists(), filters] as const,
  details: () => [...solicitudKeys.all, "detail"] as const,
  detail: (id: string) => [...solicitudKeys.details(), id] as const,
  adjuntos: (id: string) => [...solicitudKeys.detail(id), "adjuntos"] as const,
  adjuntosList: (id: string, filters: Record<string, unknown> = {}) =>
    [...solicitudKeys.adjuntos(id), filters] as const,
  workflowActions: (processInstanceId: string) =>
    [...solicitudKeys.all, "workflow", processInstanceId] as const,
}


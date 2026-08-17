export const solicitudKeys = {
  all: ["mantenimientos", "solicitudes"] as const,
  lists: () => [...solicitudKeys.all, "list"] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...solicitudKeys.lists(), filters] as const,
  details: () => [...solicitudKeys.all, "detail"] as const,
  detail: (id: string) => [...solicitudKeys.details(), id] as const,
}

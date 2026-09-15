export const checklistItemKeys = {
  all: ["mantenimientos", "checklist-items"] as const,
  lists: () => [...checklistItemKeys.all, "list"] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...checklistItemKeys.lists(), filters] as const,
  byAplicacion: (aplicacionId: string, filters: Record<string, unknown> = {}) =>
    [
      ...checklistItemKeys.lists(),
      "by-aplicacion",
      aplicacionId,
      filters,
    ] as const,
  details: () => [...checklistItemKeys.all, "detail"] as const,
  detail: (id: string) => [...checklistItemKeys.details(), id] as const,
}

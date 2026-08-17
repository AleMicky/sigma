export const actividadKeys = {
  all: ["mantenimientos", "actividades"] as const,
  lists: () => [...actividadKeys.all, "list"] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...actividadKeys.lists(), filters] as const,
  details: () => [...actividadKeys.all, "detail"] as const,
  detail: (id: string) => [...actividadKeys.details(), id] as const,
}

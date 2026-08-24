export const actividadAplicacionKeys = {
  all: ["mantenimientos", "actividad-aplicaciones"] as const,
  lists: () => [...actividadAplicacionKeys.all, "list"] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...actividadAplicacionKeys.lists(), filters] as const,
  byActividad: (actividadId: string, filters: Record<string, unknown> = {}) =>
    [
      ...actividadAplicacionKeys.lists(),
      "by-actividad",
      actividadId,
      filters,
    ] as const,
  details: () => [...actividadAplicacionKeys.all, "detail"] as const,
  detail: (id: string) => [...actividadAplicacionKeys.details(), id] as const,
}


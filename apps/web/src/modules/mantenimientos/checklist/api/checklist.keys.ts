export const checklistKeys = {
  all: ["mantenimientos", "checklists"] as const,
  lists: () => [...checklistKeys.all, "list"] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...checklistKeys.lists(), filters] as const,
  details: () => [...checklistKeys.all, "detail"] as const,
  detail: (id: string) => [...checklistKeys.details(), id] as const,
}

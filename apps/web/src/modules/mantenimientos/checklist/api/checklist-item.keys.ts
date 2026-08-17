export const checklistItemKeys = {
  all: ["mantenimientos", "checklist-items"] as const,
  lists: () => [...checklistItemKeys.all, "list"] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...checklistItemKeys.lists(), filters] as const,
  byChecklist: (checklistId: string) =>
    [...checklistItemKeys.all, "by-checklist", checklistId] as const,
  details: () => [...checklistItemKeys.all, "detail"] as const,
  detail: (id: string) => [...checklistItemKeys.details(), id] as const,
}

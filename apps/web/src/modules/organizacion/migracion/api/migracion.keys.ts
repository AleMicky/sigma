import type { MigracionFilters } from "./migracion.service"

export const migracionKeys = {
  all: ["registros-migracion"] as const,
  lists: () => [...migracionKeys.all, "list"] as const,
  list: (filters?: MigracionFilters) =>
    [...migracionKeys.all, "list", filters] as const,
  details: () => [...migracionKeys.all, "detail"] as const,
  detail: (id: string) => [...migracionKeys.all, "detail", id] as const,
}

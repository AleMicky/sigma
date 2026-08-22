import type { PageParams } from "@/shared/types/api.types"

export const grupoAprobadorDependienteKeys = {
  all: ["grupo-aprobador-dependientes"] as const,
  lists: () => [...grupoAprobadorDependienteKeys.all, "list"] as const,
  list: (grupoAprobadorId: string, params?: PageParams) =>
    [...grupoAprobadorDependienteKeys.lists(), grupoAprobadorId, params] as const,
  details: () => [...grupoAprobadorDependienteKeys.all, "detail"] as const,
  detail: (grupoAprobadorId: string, id: string) =>
    [...grupoAprobadorDependienteKeys.details(), grupoAprobadorId, id] as const,
}

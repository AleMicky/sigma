import type { PageParams } from "@/shared/types/api.types"

export const grupoAprobadorDetalleKeys = {
  all: ["grupos-aprobadores", "detalles"] as const,
  lists: () => [...grupoAprobadorDetalleKeys.all, "list"] as const,
  list: (grupoAprobadorId: string, filters?: PageParams) =>
    [...grupoAprobadorDetalleKeys.lists(), grupoAprobadorId, filters] as const,
  details: () => [...grupoAprobadorDetalleKeys.all, "detail"] as const,
  detail: (grupoAprobadorId: string, id: string) =>
    [...grupoAprobadorDetalleKeys.details(), grupoAprobadorId, id] as const,
}

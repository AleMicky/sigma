import type {
  ControlActivoDetalleFilters,
  ControlActivoFilters,
} from "./control-activo.service"

export const controlActivoKeys = {
  all: ["controles-activos"] as const,
  lists: () => [...controlActivoKeys.all, "list"] as const,
  list: (filters?: ControlActivoFilters) =>
    [...controlActivoKeys.lists(), filters] as const,
  details: () => [...controlActivoKeys.all, "detail"] as const,
  detail: (id: string) => [...controlActivoKeys.details(), id] as const,

  detalles: {
    all: ["controles-activos-detalles"] as const,
    lists: () => [...controlActivoKeys.detalles.all, "list"] as const,
    list: (filters?: ControlActivoDetalleFilters) =>
      [...controlActivoKeys.detalles.lists(), filters] as const,
    detail: (id: string) => [...controlActivoKeys.detalles.all, "detail", id] as const,
  },
}

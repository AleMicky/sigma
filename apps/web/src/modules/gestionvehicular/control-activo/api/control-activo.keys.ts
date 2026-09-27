import type {
  ControlActivoVehicularDetalleFilters,
  ControlActivoVehicularFilters,
} from "./control-activo.service"

export const controlActivoVehicularKeys = {
  all: ["gestionvehicular-controles-activos"] as const,

  lists: () => [...controlActivoVehicularKeys.all, "list"] as const,
  list: (filters?: ControlActivoVehicularFilters) =>
    [...controlActivoVehicularKeys.lists(), filters] as const,

  bySolicitud: (solicitudId?: string | null) =>
    [...controlActivoVehicularKeys.all, "solicitud", solicitudId] as const,
  byAsignacion: (asignacionId?: string | null) =>
    [...controlActivoVehicularKeys.all, "asignacion", asignacionId] as const,
  byActivo: (activoId?: string | null) =>
    [...controlActivoVehicularKeys.all, "activo", activoId] as const,

  details: () => [...controlActivoVehicularKeys.all, "detail"] as const,
  detail: (id: string) => [...controlActivoVehicularKeys.details(), id] as const,

  detalles: {
    all: ["gestionvehicular-controles-activos-detalles"] as const,
    lists: () => [...controlActivoVehicularKeys.detalles.all, "list"] as const,
    list: (filters?: ControlActivoVehicularDetalleFilters) =>
      [...controlActivoVehicularKeys.detalles.lists(), filters] as const,
    detail: (id: string) =>
      [...controlActivoVehicularKeys.detalles.all, "detail", id] as const,
  },
} as const

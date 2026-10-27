import type { SalidaVehicularFiltros } from "./salida-vehicular.types"

export const salidaVehicularKeys = {
  all: ["salidas-vehiculares"] as const,
  lists: () => [...salidaVehicularKeys.all, "list"] as const,
  list: (filters?: SalidaVehicularFiltros) =>
    [...salidaVehicularKeys.lists(), filters] as const,
  activas: () => [...salidaVehicularKeys.all, "activas"] as const,
  misSalidas: (params?: Record<string, unknown>) =>
    [...salidaVehicularKeys.all, "mis-salidas", params] as const,
  details: () => [...salidaVehicularKeys.all, "detail"] as const,
  detail: (id: string) => [...salidaVehicularKeys.details(), id] as const,

  // Flowable
  tareaActual: (id: string) => [...salidaVehicularKeys.detail(id), "tarea-actual"] as const,
  acciones: (id: string) => [...salidaVehicularKeys.detail(id), "acciones"] as const,
  historial: (id: string) => [...salidaVehicularKeys.detail(id), "historial"] as const,

  // Eventos
  eventos: (id: string) => [...salidaVehicularKeys.detail(id), "eventos"] as const,
  evento: (id: string, eventoId: string) =>
    [...salidaVehicularKeys.eventos(id), eventoId] as const,

  // Bitácoras
  bitacoras: (id: string) => [...salidaVehicularKeys.detail(id), "bitacoras"] as const,
  bitacora: (id: string, bitacoraId: string) =>
    [...salidaVehicularKeys.bitacoras(id), bitacoraId] as const,

  // Reportes
  reportes: {
    all: ["reportes-salidas-vehiculares"] as const,
    general: (params?: Record<string, unknown>) =>
      [...salidaVehicularKeys.reportes.all, "general", params] as const,
    vehiculos: (params?: Record<string, unknown>) =>
      [...salidaVehicularKeys.reportes.all, "vehiculos", params] as const,
    empleados: (params?: Record<string, unknown>) =>
      [...salidaVehicularKeys.reportes.all, "empleados", params] as const,
    tiempos: (params?: Record<string, unknown>) =>
      [...salidaVehicularKeys.reportes.all, "tiempos", params] as const,
    bitacoras: (params?: Record<string, unknown>) =>
      [...salidaVehicularKeys.reportes.all, "bitacoras", params] as const,
  },
}

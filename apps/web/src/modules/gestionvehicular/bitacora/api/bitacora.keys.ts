import type { BitacoraVehicularFiltros } from "./bitacora.service"

export const bitacoraKeys = {
  all: ["bitacora-vehicular"] as const,
  reporte: (filtros?: BitacoraVehicularFiltros | null) =>
    [...bitacoraKeys.all, "reporte", filtros] as const,
}

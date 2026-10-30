import type {
  BitacoraConsolidadaFiltros,
  BitacoraVehicularFiltros,
} from "./bitacora.service"

export const bitacoraKeys = {
  all: ["bitacora-vehicular"] as const,
  reporte: (filtros?: BitacoraVehicularFiltros | null) =>
    [...bitacoraKeys.all, "reporte", filtros] as const,
  consolidado: (filtros?: BitacoraConsolidadaFiltros | null) =>
    [...bitacoraKeys.all, "consolidado", filtros] as const,
}

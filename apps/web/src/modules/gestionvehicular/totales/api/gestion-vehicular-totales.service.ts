import { http } from "@/shared/api"

import { gestionVehicularTotalesEndpoints } from "./gestion-vehicular-totales.endpoints"

export type ModuloTotalesGestionVehicular = "combustible" | "viajes"

/** Filtros de los listados, sin paginación ni orden (REQ-VEH-009). */
export type GestionVehicularTotalesFiltros = {
  search?: string
  activoId?: string
  viajeVehicularId?: string
  salidaVehicularId?: string
  insumoId?: string
  empleadoId?: string
  asignacionVehicularId?: string
  solicitudVehicularId?: string
  conductorId?: string
  estado?: string
  fechaDesde?: string
  fechaHasta?: string
}

/** `data` de `ApiResponse<TotalesGestionVehicularResponse>`; el interceptor HTTP ya desenvuelve `data`. */
export type TotalesGestionVehicularResponse = {
  totalRegistros: number
  totalLitros: number
  totalImporte: number
  totalKm: number
  fechaDesde: string | null
  fechaHasta: string | null
}

/** Misma normalización que los listados: `YYYY-MM-DD` → rango `LocalDateTime`. */
function normalizeFechaFiltros(params: Record<string, string>): void {
  if (
    typeof params.fechaDesde === "string" &&
    params.fechaDesde.trim() &&
    !params.fechaDesde.includes("T")
  ) {
    params.fechaDesde = `${params.fechaDesde.trim()}T00:00:00`
  }
  if (
    typeof params.fechaHasta === "string" &&
    params.fechaHasta.trim() &&
    !params.fechaHasta.includes("T")
  ) {
    params.fechaHasta = `${params.fechaHasta.trim()}T23:59:59`
  }
}

export const getGestionVehicularTotales = (
  modulo: ModuloTotalesGestionVehicular,
  filtros?: GestionVehicularTotalesFiltros
): Promise<TotalesGestionVehicularResponse> => {
  const params: Record<string, string> = { modulo }

  const filtrosActivos: Array<
    [keyof GestionVehicularTotalesFiltros, string | undefined]
  > = [
    ["search", filtros?.search],
    ["activoId", filtros?.activoId],
    ["viajeVehicularId", filtros?.viajeVehicularId],
    ["salidaVehicularId", filtros?.salidaVehicularId],
    ["insumoId", filtros?.insumoId],
    ["empleadoId", filtros?.empleadoId],
    ["asignacionVehicularId", filtros?.asignacionVehicularId],
    ["solicitudVehicularId", filtros?.solicitudVehicularId],
    ["conductorId", filtros?.conductorId],
    ["estado", filtros?.estado],
    ["fechaDesde", filtros?.fechaDesde],
    ["fechaHasta", filtros?.fechaHasta],
  ]

  for (const [clave, valor] of filtrosActivos) {
    if (valor) {
      params[clave] = valor
    }
  }
  normalizeFechaFiltros(params)

  return http.get<TotalesGestionVehicularResponse>(
    gestionVehicularTotalesEndpoints.totales,
    { params }
  )
}

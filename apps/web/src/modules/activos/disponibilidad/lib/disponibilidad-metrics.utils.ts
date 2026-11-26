import type { ActivoResumen } from "@/modules/activos/activo/api/activo.service"

export type DisponibilidadMetricId =
  | "total"
  | "disponibilidad"
  | "operativos"
  | "mantenimiento"
  | "fueraServicio"
  | "reservaBaja"

export type DisponibilidadMetricCard = {
  id: DisponibilidadMetricId
  label: string
  value: string
  detail: string
}

/**
 * `tasaDisponibilidad` ya llega como porcentaje del backend: solo se formatea.
 */
export function formatTasaDisponibilidad(tasa: number): string {
  return `${(Number.isFinite(tasa) ? tasa : 0).toFixed(1)}%`
}

/** Mapea los agregados del servidor a las tarjetas visibles del reporte. */
export function buildDisponibilidadMetricCards(
  metrics: ActivoResumen,
): DisponibilidadMetricCard[] {
  return [
    {
      id: "total",
      label: "Total Activos",
      value: metrics.total.toLocaleString(),
      detail: "En catálogo general",
    },
    {
      id: "disponibilidad",
      label: "Disponibilidad",
      value: formatTasaDisponibilidad(metrics.tasaDisponibilidad),
      detail: `${metrics.disponibles} activos listos para uso`,
    },
    {
      id: "operativos",
      label: "Operativos",
      value: String(metrics.operativos),
      detail: `${metrics.operativo} en estado operativo`,
    },
    {
      id: "mantenimiento",
      label: "Mantenimiento",
      value: String(metrics.enMantenimiento),
      detail: "Preventivo / Correctivo",
    },
    {
      id: "fueraServicio",
      label: "Fuera de Serv.",
      value: String(metrics.fueraServicio),
      detail: "Averías o paradas técnicas",
    },
    {
      id: "reservaBaja",
      label: "Reserva / Baja",
      value: String(metrics.reserva + metrics.deBaja),
      detail: `${metrics.reserva} reserva | ${metrics.enViaje} en viaje | ${metrics.deBaja} baja`,
    },
  ]
}

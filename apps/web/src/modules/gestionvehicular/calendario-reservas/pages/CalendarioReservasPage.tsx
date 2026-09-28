import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Car, User, Users } from "lucide-react"

import { routes } from "@/app/config/routes"
import { PageShell } from "@/shared/components/page-shell"
import {
  CalendarView,
  type CalendarEvent,
  type CalendarFilterOption,
  type CalendarLegendItem,
} from "@/shared/components/calendar/calendar-view"
import { solicitudVehicularQueries } from "@/modules/gestionvehicular/solicitud/api/solicitud-vehicular.queries"
import type { SolicitudVehicular } from "@/modules/gestionvehicular/solicitud/api/solicitud-vehicular.service"
import { resolveStatusVariant } from "@/shared/components/status-badge"

const VEHICULAR_FILTERS: CalendarFilterOption[] = [
  { label: "Todos", value: "TODOS" },
  {
    label: "Aprobados",
    value: "APROBADO",
    filterFn: (e) => (e.estado || "").toUpperCase().includes("APROB"),
  },
  {
    label: "En Ruta",
    value: "EN_RUTA",
    filterFn: (e) => {
      const est = (e.estado || "").toUpperCase()
      return est.includes("RUTA") || est.includes("CURSO") || est.includes("RETORNO")
    },
  },
  {
    label: "Pendientes",
    value: "PENDIENTE",
    filterFn: (e) => {
      const est = (e.estado || "").toUpperCase()
      return est.includes("PEND") || est.includes("SOLIC") || est.includes("OBSERV")
    },
  },
  {
    label: "Finalizados",
    value: "FINALIZADA",
    filterFn: (e) => {
      const est = (e.estado || "").toUpperCase()
      return est.includes("FINAL") || est.includes("COMPLET")
    },
  },
]

const VEHICULAR_LEGEND: CalendarLegendItem[] = [
  { label: "Aprobado", color: "bg-emerald-500" },
  { label: "En Ruta", color: "bg-sky-500" },
  { label: "Pendiente", color: "bg-amber-500" },
  { label: "Finalizado", color: "bg-zinc-400" },
]

export function CalendarioReservasPage() {
  const {
    data: solicitudesData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery(solicitudVehicularQueries.list({ size: 200 }))

  const events: CalendarEvent[] = useMemo(() => {
    const list = solicitudesData?.content ?? []
    if (!list.length) return []

    return list.map((sol: SolicitudVehicular) => {
      const variant = resolveStatusVariant(sol.estado)
      const numeroTxt = sol.numero || "SOL"
      const destinoTxt = sol.destino || sol.motivo || "Solicitud de Transporte"

      const conductorLic = sol.conductorAsignado?.numeroLicencia
        ? `${sol.conductorAsignado.numeroLicencia}${
            sol.conductorAsignado.categoriaLicencia
              ? ` (Cat. ${sol.conductorAsignado.categoriaLicencia})`
              : ""
          }`
        : undefined

      const details = []

      if (sol.solicitante?.nombreCompleto) {
        details.push({
          label: "Solicitante",
          value: `${sol.solicitante.nombreCompleto}${sol.solicitante.area ? ` - ${sol.solicitante.area}` : ""}`,
          icon: User,
        })
      }

      if (sol.conductorAsignado?.nombreCompleto) {
        details.push({
          label: "Conductor Asignado",
          value: `${sol.conductorAsignado.nombreCompleto}${conductorLic ? ` (${conductorLic})` : ""}`,
          icon: Car,
        })
      }

      if (sol.cantidadPasajeros && sol.cantidadPasajeros > 0) {
        details.push({
          label: "Pasajeros",
          value: `${sol.cantidadPasajeros} personas`,
          icon: Users,
        })
      }

      return {
        id: sol.id,
        title: destinoTxt,
        subtitle: numeroTxt,
        start: sol.fechaSalida,
        end: sol.fechaRetornoEstimada || undefined,
        estado: sol.estado,
        variant,
        location: sol.destino,
        description: sol.motivo || sol.justificacion || undefined,
        details,
        url: routes.gestionVehicular.editarSolicitud(sol.id),
      }
    })
  }, [solicitudesData])

  return (
    <PageShell size="full" padding="none" layout="fill" className="h-full min-h-0">
      <CalendarView
        title="Reporte de Calendario y Reservas"
        description="Tablero de consulta integral de itinerarios, asignaciones y solicitudes de transporte vehicular"
        events={events}
        filterOptions={VEHICULAR_FILTERS}
        legendItems={VEHICULAR_LEGEND}
        isLoading={isLoading || isRefetching}
        onRefresh={() => void refetch()}
      />
    </PageShell>
  )
}

import { useMemo } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ListFilter } from "lucide-react"

import { routes } from "@/app/config/routes"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import {
  CalendarView,
  type CalendarEvent,
} from "@/shared/components/calendar/calendar-view"
import { solicitudVehicularQueries } from "@/modules/gestionvehicular/solicitud/api/solicitud-vehicular.queries"
import type { SolicitudVehicular } from "@/modules/gestionvehicular/solicitud/api/solicitud-vehicular.service"
import { resolveStatusVariant } from "@/shared/components/status-badge"

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
      const destinoTxt = sol.destino || "Sin destino especificado"
      const title = `${numeroTxt} • ${destinoTxt}`

      const conductorLic = sol.conductorAsignado?.numeroLicencia
        ? `${sol.conductorAsignado.numeroLicencia}${
            sol.conductorAsignado.categoriaLicencia
              ? ` (Cat. ${sol.conductorAsignado.categoriaLicencia})`
              : ""
          }`
        : undefined

      return {
        id: sol.id,
        numero: sol.numero,
        title,
        start: sol.fechaSalida,
        end: sol.fechaRetornoEstimada || undefined,
        estado: sol.estado,
        variant,
        location: sol.destino,
        solicitante: sol.solicitante?.nombreCompleto || undefined,
        cargoSolicitante: sol.solicitante?.cargo || undefined,
        areaSolicitante: sol.solicitante?.area || undefined,
        conductor: sol.conductorAsignado?.nombreCompleto || undefined,
        licenciaConductor: conductorLic,
        pasajeros: sol.cantidadPasajeros,
        description: sol.motivo || sol.justificacion || undefined,
        observacion: sol.observacion || undefined,
        tipoSolicitud: sol.tipoSolicitudVehicular?.nombre || undefined,
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
        isLoading={isLoading || isRefetching}
        onRefresh={() => void refetch()}
        headerActions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              render={<Link to={routes.gestionVehicular.solicitudes} />}
              className="gap-1.5 h-8.5 rounded-lg text-xs"
            >
              <ListFilter className="size-3.5 text-muted-foreground" />
              <span>Ver Solicitudes</span>
            </Button>
          </div>
        }
      />
    </PageShell>
  )
}


import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, RefreshCw } from "lucide-react"

import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"

import { gestionVehicularDashboardQueries } from "../api/gestion-vehicular-dashboard.queries"
import { GestionVehicularDashboardHeader } from "../components/GestionVehicularDashboardHeader"
import { DashboardKpiCards } from "../components/DashboardKpiCards"
import { TendenciaViajesKmChart } from "../components/TendenciaViajesKmChart"
import { TendenciaCombustibleChart } from "../components/TendenciaCombustibleChart"
import { FlotaStatusDonutChart } from "../components/FlotaStatusDonutChart"
import { SolicitudesStatusChart } from "../components/SolicitudesStatusChart"
import { TopVehiculosSection } from "../components/TopVehiculosSection"
import { ViajesActivosLiveList } from "../components/ViajesActivosLiveList"
import { AlertasLicenciasCard } from "../components/AlertasLicenciasCard"

export const GestionVehicularDashboardPage = () => {
  const [meses, setMeses] = useState<number>(6)

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery(gestionVehicularDashboardQueries.data(meses))

  return (
    <PageShell layout="scroll" padding="default">
      <div className="space-y-6 pb-10">
        {/* Header con selectores de periodo y acciones rápidas */}
        <GestionVehicularDashboardHeader
          meses={meses}
          onMesesChange={setMeses}
          onRefresh={() => refetch()}
          isFetching={isFetching}
        />

        {/* Manejo de Error */}
        {isError && (
          <Card className="border-rose-500/30 bg-rose-500/10">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>
                  Ocurrió un error al cargar los indicadores del dashboard:{" "}
                  {error instanceof Error ? error.message : "Error desconocido"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-1.5 border-rose-500/30 text-rose-700 dark:text-rose-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 1. KPIs Principales */}
        {data?.kpis ? (
          <DashboardKpiCards kpis={data.kpis} isLoading={isLoading} />
        ) : (
          <DashboardKpiCards
            kpis={{
              totalVehiculosFlota: 0,
              vehiculosDisponibles: 0,
              vehiculosEnViaje: 0,
              vehiculosEnMantenimiento: 0,
              vehiculosAsignados: 0,
              totalConductores: 0,
              conductoresActivos: 0,
              licenciasPorVencer: 0,
              solicitudesPendientes: 0,
              solicitudesAprobadas: 0,
              solicitudesEnCurso: 0,
              viajesMesActual: 0,
              viajesEnCurso: 0,
              kmRecorridosMesActual: 0,
              combustibleLitrosMesActual: 0,
              combustibleCostoMesActual: 0,
            }}
            isLoading={isLoading}
          />
        )}

        {/* 2. Tendencias Temporales (Viajes/Km y Combustible) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TendenciaViajesKmChart
            data={data?.tendenciaViajesYKm ?? []}
            isLoading={isLoading}
          />
          <TendenciaCombustibleChart
            data={data?.tendenciaCombustible ?? []}
            isLoading={isLoading}
          />
        </div>

        {/* 3. Distribución de Estados (Flota y Solicitudes) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FlotaStatusDonutChart
            data={data?.distribucionFlota ?? []}
            totalVehiculos={data?.kpis.totalVehiculosFlota ?? 0}
            vehiculosDisponibles={data?.kpis.vehiculosDisponibles ?? 0}
            isLoading={isLoading}
          />
          <SolicitudesStatusChart
            data={data?.distribucionSolicitudes ?? []}
            totalSolicitudes={
              data?.distribucionSolicitudes.reduce((acc, curr) => acc + curr.cantidad, 0) ?? 0
            }
            isLoading={isLoading}
          />
        </div>

        {/* 4. Top Vehículos y Alertas de Licencias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopVehiculosSection
            topKm={data?.topVehiculosRecorrido ?? []}
            topCombustible={data?.topVehiculosCombustible ?? []}
            isLoading={isLoading}
          />
          <AlertasLicenciasCard
            alertas={data?.alertasLicencias ?? []}
            isLoading={isLoading}
          />
        </div>

        {/* 5. Monitoreo en Vivo de Viajes Activos y Recientes */}
        <ViajesActivosLiveList
          viajes={data?.viajesActivosRecientes ?? []}
          isLoading={isLoading}
        />
      </div>
    </PageShell>
  )
}
export default GestionVehicularDashboardPage

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Activity,
  AlertCircle,
  CarFront,
  Fuel,
  LayoutGrid,
  Navigation,
  RefreshCw,
} from "lucide-react"

import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

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
  const [flotaId, setFlotaId] = useState<string | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<string>("todo")

  // Consulta reactiva a la API con parámetros de filtro (meses y flotaId)
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useQuery(gestionVehicularDashboardQueries.data({ meses, flotaId }))

  // Fecha de última actualización calculada de forma derivada
  const lastUpdated = useMemo(
    () => (dataUpdatedAt ? new Date(dataUpdatedAt) : undefined),
    [dataUpdatedAt]
  )

  const handleResetFilters = () => {
    setMeses(6)
    setFlotaId(undefined)
  }

  const defaultKpis = {
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
  }

  return (
    <PageShell layout="scroll" padding="default">
      <div className="space-y-4 pb-8 max-w-[1600px] mx-auto">
        {/* Header con selectores funcionales de flota, periodo y acciones rápidas */}
        <GestionVehicularDashboardHeader
          meses={meses}
          flotaId={flotaId}
          onMesesChange={setMeses}
          onFlotaChange={setFlotaId}
          onRefresh={() => refetch()}
          onResetFilters={handleResetFilters}
          isFetching={isFetching}
          lastUpdated={lastUpdated}
        />

        {/* Manejo de Error en caso de falla de API */}
        {isError && (
          <Card className="border-rose-500/30 bg-rose-500/10 shadow-xs">
            <CardContent className="p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  Error al cargar indicadores de gestión vehicular:{" "}
                  {error instanceof Error ? error.message : "Error del servidor"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="h-7 px-2.5 gap-1 border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs"
              >
                <RefreshCw className="h-3 w-3" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 1. KPIs Principales en formato compacto y moderno */}
        <DashboardKpiCards
          kpis={data?.kpis ?? defaultKpis}
          isLoading={isLoading}
        />

        {/* 2. Barra de Vistas y Enfoque Temático */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-b border-border/40 pb-2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-auto"
          >
            <TabsList className="h-8 p-0.5 bg-muted/60">
              <TabsTrigger value="todo" className="h-7 px-2.5 text-xs gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Tablero General</span>
              </TabsTrigger>
              <TabsTrigger value="viajes" className="h-7 px-2.5 text-xs gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-blue-500" />
                <span>Viajes & Rutas</span>
              </TabsTrigger>
              <TabsTrigger value="combustible" className="h-7 px-2.5 text-xs gap-1.5">
                <Fuel className="h-3.5 w-3.5 text-amber-500" />
                <span>Combustible</span>
              </TabsTrigger>
              <TabsTrigger value="flota" className="h-7 px-2.5 text-xs gap-1.5">
                <CarFront className="h-3.5 w-3.5 text-emerald-500" />
                <span>Flota & Personal</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground self-end sm:self-auto">
            <Activity className="h-3 w-3 text-cyan-500 animate-pulse" />
            <span>
              {data?.viajesActivosRecientes.filter((v) => v.estado === "EN_CURSO").length ?? 0}{" "}
              vehículos operando en este momento
            </span>
          </div>
        </div>

        {/* 3. Secciones dinámicas según la pestaña activa */}

        {/* VISTA GENERAL: Muestra todos los bloques organizados */}
        {activeTab === "todo" && (
          <div className="space-y-4">
            {/* Monitoreo en Vivo de Viajes Activos y Recientes */}
            <ViajesActivosLiveList
              viajes={data?.viajesActivosRecientes ?? []}
              isLoading={isLoading}
            />

            {/* Tendencias Temporales (Viajes/Km y Combustible) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TendenciaViajesKmChart
                data={data?.tendenciaViajesYKm ?? []}
                isLoading={isLoading}
              />
              <TendenciaCombustibleChart
                data={data?.tendenciaCombustible ?? []}
                isLoading={isLoading}
              />
            </div>

            {/* Distribución de Estados (Flota y Solicitudes) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

            {/* Top Vehículos y Alertas de Licencias */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          </div>
        )}

        {/* VISTA VIAJES & RUTAS */}
        {activeTab === "viajes" && (
          <div className="space-y-4">
            <ViajesActivosLiveList
              viajes={data?.viajesActivosRecientes ?? []}
              isLoading={isLoading}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TendenciaViajesKmChart
                data={data?.tendenciaViajesYKm ?? []}
                isLoading={isLoading}
              />
              <TopVehiculosSection
                topKm={data?.topVehiculosRecorrido ?? []}
                topCombustible={data?.topVehiculosCombustible ?? []}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {/* VISTA COMBUSTIBLE */}
        {activeTab === "combustible" && (
          <div className="space-y-4">
            <TendenciaCombustibleChart
              data={data?.tendenciaCombustible ?? []}
              isLoading={isLoading}
            />
            <TopVehiculosSection
              topKm={data?.topVehiculosRecorrido ?? []}
              topCombustible={data?.topVehiculosCombustible ?? []}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* VISTA FLOTA & PERSONAL */}
        {activeTab === "flota" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <AlertasLicenciasCard
              alertas={data?.alertasLicencias ?? []}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </PageShell>
  )
}

export default GestionVehicularDashboardPage


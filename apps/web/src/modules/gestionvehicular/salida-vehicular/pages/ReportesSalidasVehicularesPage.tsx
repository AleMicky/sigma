import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Car,
  Clock,
  Compass,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Gauge,
  RotateCw,
  Search,
  ShieldCheck,
  TrendingUp,
  User,
  Users,
} from "lucide-react"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { toast } from "sonner"

import { PageShell } from "@/shared/components/page-shell"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { cn } from "@/shared/lib/utils"

import { salidaVehicularQueries } from "../api/salida-vehicular.queries"
import type {
  BitacoraVehicular,
  ItemTiempoRecorrido,
  ReporteEmpleadoSalidas,
  ReporteVehiculoKilometraje,
  SalidaVehicular,
} from "../api/salida-vehicular.types"
import { SalidaVehicularStatusBadge } from "../components/SalidaVehicularStatusBadge"

function exportToCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows || rows.length === 0) {
    toast.error("No hay datos disponibles para exportar")
    return
  }
  const headers = Object.keys(rows[0])
  const csvContent = [
    headers.join(";"),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const val = row[header]
          if (val == null) return '""'
          const str = String(val).replace(/"/g, '""')
          return `"${str}"`
        })
        .join(";")
    ),
  ].join("\n")

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  toast.success(`Reporte ${filename}.csv descargado con éxito`)
}

export function ReportesSalidasVehicularesPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>("general")

  // Search filters per tab
  const [searchGeneral, setSearchGeneral] = useState("")
  const [searchVehiculos, setSearchVehiculos] = useState("")
  const [searchEmpleados, setSearchEmpleados] = useState("")
  const [searchTiempos, setSearchTiempos] = useState("")
  const [searchBitacoras, setSearchBitacoras] = useState("")
  const [filterTipoBitacora, setFilterTipoBitacora] = useState<string>("ALL")

  // Report Queries
  const generalQuery = useQuery(salidaVehicularQueries.reporteGeneral())
  const vehiculosQuery = useQuery(salidaVehicularQueries.reporteVehiculos())
  const empleadosQuery = useQuery(salidaVehicularQueries.reporteEmpleados())
  const tiemposQuery = useQuery(salidaVehicularQueries.reporteTiempos())
  const bitacorasQuery = useQuery(salidaVehicularQueries.reporteBitacoras())

  const isFetchingAny =
    generalQuery.isFetching ||
    vehiculosQuery.isFetching ||
    empleadosQuery.isFetching ||
    tiemposQuery.isFetching ||
    bitacorasQuery.isFetching

  const handleRefreshAll = async () => {
    await Promise.all([
      generalQuery.refetch(),
      vehiculosQuery.refetch(),
      empleadosQuery.refetch(),
      tiemposQuery.refetch(),
      bitacorasQuery.refetch(),
    ])
    toast.success("Métricas y reportes actualizados")
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-"
    try {
      return new Date(dateStr).toLocaleString("es-BO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  // Raw data memoization
  const generalData = generalQuery.data
  const vehiculosData = useMemo(() => vehiculosQuery.data ?? [], [vehiculosQuery.data])
  const empleadosData = useMemo(() => empleadosQuery.data ?? [], [empleadosQuery.data])
  const tiemposData = tiemposQuery.data
  const bitacorasData = bitacorasQuery.data

  // KPI Calculations
  const totalSalidas = generalData?.totalSalidas ?? 0
  const salidasActivas = generalData?.salidasActivas ?? 0
  const salidasFinalizadas = generalData?.salidasFinalizadas ?? 0
  const salidasCanceladas = generalData?.salidasCanceladas ?? 0

  const tasaCompletado =
    totalSalidas > 0 ? Math.round((salidasFinalizadas / totalSalidas) * 100) : 0

  const totalKmFlota = useMemo(() => {
    return vehiculosData.reduce((acc, curr) => acc + (curr.kilometrajeTotalRecorrido || 0), 0)
  }, [vehiculosData])

  const totalIncidentes = bitacorasData?.totalIncidentes ?? 0

  // Chart data: Distribution of status
  const statusChartData = useMemo(() => {
    return [
      { name: "Finalizadas", value: salidasFinalizadas, color: "#10b981" },
      { name: "En Tránsito / Activas", value: salidasActivas, color: "#f59e0b" },
      { name: "Canceladas", value: salidasCanceladas, color: "#f43f5e" },
    ].filter((item) => item.value > 0)
  }, [salidasFinalizadas, salidasActivas, salidasCanceladas])

  // Chart data: Top 5 vehicles by Km
  const topVehiculosKm = useMemo(() => {
    return [...vehiculosData]
      .sort((a, b) => (b.kilometrajeTotalRecorrido || 0) - (a.kilometrajeTotalRecorrido || 0))
      .slice(0, 5)
      .map((v) => ({
        placa: v.placa ?? v.activoCodigo ?? "S/P",
        km: v.kilometrajeTotalRecorrido || 0,
        nombre: v.marca ? `${v.marca} ${v.modelo ?? ""}` : v.activoDescripcion ?? "Vehículo",
      }))
  }, [vehiculosData])

  // Filtered lists
  const filteredGeneralItems = useMemo(() => {
    const items = generalData?.items ?? []
    if (!searchGeneral.trim()) return items
    const q = searchGeneral.toLowerCase().trim()
    return items.filter(
      (item) =>
        item.numero?.toLowerCase().includes(q) ||
        item.placa?.toLowerCase().includes(q) ||
        item.activoDescripcion?.toLowerCase().includes(q) ||
        item.empleadoNombre?.toLowerCase().includes(q) ||
        item.descripcionActividad?.toLowerCase().includes(q) ||
        item.observaciones?.toLowerCase().includes(q) ||
        item.estado?.toLowerCase().includes(q)
    )
  }, [generalData?.items, searchGeneral])

  const filteredVehiculos = useMemo(() => {
    if (!searchVehiculos.trim()) return vehiculosData
    const q = searchVehiculos.toLowerCase().trim()
    return vehiculosData.filter(
      (v) =>
        v.placa?.toLowerCase().includes(q) ||
        v.activoCodigo?.toLowerCase().includes(q) ||
        v.marca?.toLowerCase().includes(q) ||
        v.modelo?.toLowerCase().includes(q) ||
        v.activoDescripcion?.toLowerCase().includes(q)
    )
  }, [vehiculosData, searchVehiculos])

  const filteredEmpleados = useMemo(() => {
    if (!searchEmpleados.trim()) return empleadosData
    const q = searchEmpleados.toLowerCase().trim()
    return empleadosData.filter(
      (e) =>
        e.empleadoNombre?.toLowerCase().includes(q) ||
        e.empleadoCodigo?.toLowerCase().includes(q) ||
        e.cargo?.toLowerCase().includes(q) ||
        e.area?.toLowerCase().includes(q)
    )
  }, [empleadosData, searchEmpleados])

  const filteredTiemposItems = useMemo(() => {
    const items = tiemposData?.items ?? []
    if (!searchTiempos.trim()) return items
    const q = searchTiempos.toLowerCase().trim()
    return items.filter(
      (t) =>
        t.numero?.toLowerCase().includes(q) ||
        t.placa?.toLowerCase().includes(q) ||
        t.vehiculoDescripcion?.toLowerCase().includes(q) ||
        t.empleadoNombre?.toLowerCase().includes(q) ||
        t.descripcionActividad?.toLowerCase().includes(q) ||
        t.observaciones?.toLowerCase().includes(q)
    )
  }, [tiemposData?.items, searchTiempos])

  const filteredBitacoras = useMemo(() => {
    const items = bitacorasData?.items ?? []
    return items.filter((b) => {
      const matchesTipo = filterTipoBitacora === "ALL" || b.tipo === filterTipoBitacora
      if (!matchesTipo) return false
      if (!searchBitacoras.trim()) return true
      const q = searchBitacoras.toLowerCase().trim()
      return (
        b.descripcion?.toLowerCase().includes(q) ||
        b.empleadoNombre?.toLowerCase().includes(q) ||
        b.tipo?.toLowerCase().includes(q)
      )
    })
  }, [bitacorasData?.items, filterTipoBitacora, searchBitacoras])

  // CSV Export dispatcher
  const handleExportCurrent = () => {
    switch (activeTab) {
      case "general":
        exportToCsv(
          "reporte_salidas_general",
          filteredGeneralItems.map((s: SalidaVehicular) => ({
            Numero: s.numero,
            Placa: s.placa ?? s.activoCodigo,
            Vehiculo: s.marca ? `${s.marca} ${s.modelo ?? ""}` : s.activoDescripcion,
            Conductor: s.empleadoNombre ?? "N/A",
            Actividad: s.descripcionActividad,
            Observaciones: s.observaciones ?? "-",
            Estado: s.estado,
            FechaCreacion: s.createdAt,
          }))
        )
        break
      case "vehiculos":
        exportToCsv(
          "reporte_vehiculos_kilometraje",
          filteredVehiculos.map((v: ReporteVehiculoKilometraje) => ({
            Placa: v.placa ?? v.activoCodigo,
            MarcaModelo: v.marca ? `${v.marca} ${v.modelo ?? ""}` : v.activoDescripcion,
            CantidadSalidas: v.cantidadSalidas,
            KmInicial: v.kilometrajeInicial ?? "-",
            KmFinal: v.kilometrajeFinal ?? "-",
            KmTotalRecorrido: v.kilometrajeTotalRecorrido,
          }))
        )
        break
      case "empleados":
        exportToCsv(
          "reporte_conductores_salidas",
          filteredEmpleados.map((e: ReporteEmpleadoSalidas) => ({
            Empleado: e.empleadoNombre,
            Codigo: e.empleadoCodigo,
            CargoArea: e.cargo ?? e.area ?? "-",
            TotalSalidas: e.totalSalidas,
            SalidasActivas: e.salidasActivas,
            SalidasFinalizadas: e.salidasFinalizadas,
            TotalIncidentes: e.totalIncidentes,
          }))
        )
        break
      case "tiempos":
        exportToCsv(
          "reporte_tiempos_recorrido",
          filteredTiemposItems.map((t: ItemTiempoRecorrido) => ({
            Numero: t.numero,
            Vehiculo: t.placa ?? t.vehiculoDescripcion,
            Conductor: t.empleadoNombre ?? "N/A",
            Actividad: t.descripcionActividad,
            Observaciones: t.observaciones ?? "-",
            FechaInicio: t.fechaInicio,
            FechaFin: t.fechaFin,
            DuracionHoras: t.duracionHoras,
          }))
        )
        break
      case "bitacoras":
        exportToCsv(
          "reporte_bitacoras_incidencias",
          filteredBitacoras.map((b: BitacoraVehicular) => ({
            Fecha: b.fechaHora || b.createdAt,
            Tipo: b.tipo,
            Descripcion: b.descripcion,
            Empleado: b.empleadoNombre ?? "N/A",
            Latitud: b.latitud ?? "-",
            Longitud: b.longitud ?? "-",
          }))
        )
        break
    }
  }

  const handleNavigateDetail = (salidaId: string) => {
    void navigate({
      to: "/gestion-vehicular/salidas/$salidaId",
      params: { salidaId },
    })
  }

  return (
    <PageShell size="full" padding="none" layout="auto" className="w-full space-y-3.5 pb-8">
      {/* 1. COMPACT TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void navigate({ to: "/gestion-vehicular/salidas" })}
            className="size-7.5 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Volver a Salidas"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <div className="size-6.5 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                <BarChart3 className="size-4" />
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground whitespace-nowrap">
                Reportes y Métricas Operativas
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              Consolidado de salidas, rendimiento de flota, tiempos y bitácoras.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="outline"
            size="xs"
            onClick={handleExportCurrent}
            className="h-7 text-[11px] gap-1 px-2.5 cursor-pointer font-medium shadow-2xs hover:bg-muted"
            title="Exportar datos de la tabla actual a CSV"
          >
            <Download className="size-3 text-primary" />
            <span>Exportar CSV</span>
          </Button>

          <Button
            variant="outline"
            size="xs"
            onClick={handleRefreshAll}
            disabled={isFetchingAny}
            className="h-7 text-[11px] gap-1 px-2.5 cursor-pointer shadow-2xs"
            title="Actualizar reportes"
          >
            <RotateCw className={cn("size-3", isFetchingAny && "animate-spin text-primary")} />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* 2. COMPACT GLOBAL EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Total Salidas */}
        <Card className="border-border/70 bg-gradient-to-br from-card via-card to-blue-500/5 shadow-2xs">
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Total Salidas
              </span>
              <div className="size-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BarChart3 className="size-3" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-1.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-extrabold text-foreground font-mono">
                {totalSalidas}
              </span>
              <Badge
                variant="outline"
                className="text-[9.5px] px-1.5 py-0 font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 whitespace-nowrap"
              >
                {tasaCompletado}% completadas
              </Badge>
            </div>
            <div className="text-[10.5px] text-muted-foreground flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis pt-0.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{salidasFinalizadas} cerradas</span>
              <span>&bull;</span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">{salidasCanceladas} anuladas</span>
            </div>
          </CardContent>
        </Card>

        {/* Salidas Activas */}
        <Card className="border-border/70 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-2xs">
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                En Tránsito / Activas
              </span>
              <div className="size-6 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Car className="size-3" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-1.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                {salidasActivas}
              </span>
              {salidasActivas > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0 rounded-full text-[9.5px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 whitespace-nowrap">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  En ruta
                </span>
              )}
            </div>
            <p className="text-[10.5px] text-muted-foreground truncate pt-0.5">
              Vehículos en trayecto hacia destino o base
            </p>
          </CardContent>
        </Card>

        {/* Flota & Kilometraje */}
        <Card className="border-border/70 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-2xs">
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Km Flota Total
              </span>
              <div className="size-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Gauge className="size-3" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-1.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {totalKmFlota.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">km</span>
            </div>
            <p className="text-[10.5px] text-muted-foreground truncate pt-0.5">
              {vehiculosData.length} vehículo{vehiculosData.length === 1 ? "" : "s"} activos monitoreados
            </p>
          </CardContent>
        </Card>

        {/* Incidentes & Seguridad */}
        <Card className="border-border/70 bg-gradient-to-br from-card via-card to-rose-500/5 shadow-2xs">
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Seguridad & Bitácora
              </span>
              <div className="size-6 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ShieldCheck className="size-3" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-1.5 flex-wrap">
              <span
                className={cn(
                  "text-xl sm:text-2xl font-extrabold font-mono",
                  totalIncidentes > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {totalIncidentes}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9.5px] px-1.5 py-0 font-semibold whitespace-nowrap",
                  totalIncidentes > 0
                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                )}
              >
                {totalIncidentes === 0 ? "Sin incidentes" : "Incidentes"}
              </Badge>
            </div>
            <p className="text-[10.5px] text-muted-foreground truncate pt-0.5">
              {bitacorasData?.totalBitacoras ?? 0} registros georreferenciados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. COMPACT TABS NAVIGATION */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-3">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full max-w-3xl h-8.5 p-0.5 bg-muted/60">
          <TabsTrigger value="general" className="text-[11.5px] py-1 gap-1 cursor-pointer">
            <BarChart3 className="size-3 text-blue-500" />
            General ({totalSalidas})
          </TabsTrigger>
          <TabsTrigger value="vehiculos" className="text-[11.5px] py-1 gap-1 cursor-pointer">
            <Gauge className="size-3 text-emerald-500" />
            Vehículos & Km ({vehiculosData.length})
          </TabsTrigger>
          <TabsTrigger value="empleados" className="text-[11.5px] py-1 gap-1 cursor-pointer">
            <Users className="size-3 text-indigo-500" />
            Conductores ({empleadosData.length})
          </TabsTrigger>
          <TabsTrigger value="tiempos" className="text-[11.5px] py-1 gap-1 cursor-pointer">
            <Clock className="size-3 text-amber-500" />
            Tiempos
          </TabsTrigger>
          <TabsTrigger value="bitacoras" className="text-[11.5px] py-1 gap-1 cursor-pointer">
            <Activity className="size-3 text-purple-500" />
            Bitácoras ({bitacorasData?.totalBitacoras ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* 1. GENERAL TAB */}
        <TabsContent value="general" className="space-y-3 pt-0">
          {/* Charts Row - Compact Height */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Donut Chart: Estados */}
            <Card className="border-border/70 shadow-2xs">
              <CardHeader className="p-3 pb-1 border-b border-border/50">
                <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                  <BarChart3 className="size-3.5 text-blue-500" />
                  Distribución por Estado
                </CardTitle>
                <CardDescription className="text-[10.5px]">
                  Proporción del ciclo de vida de salidas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3">
                {totalSalidas === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
                    Sin salidas registradas
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="size-32 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={34}
                            outerRadius={50}
                            paddingAngle={3}
                          >
                            {statusChartData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-1.5 w-full text-[11px] min-w-0">
                      <div className="flex items-center justify-between p-1.5 rounded-md bg-emerald-500/5 border border-emerald-500/20">
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                          Finalizadas
                        </span>
                        <span className="font-bold font-mono ml-1">{salidasFinalizadas}</span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded-md bg-amber-500/5 border border-amber-500/20">
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                          En Tránsito
                        </span>
                        <span className="font-bold font-mono ml-1">{salidasActivas}</span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded-md bg-rose-500/5 border border-rose-500/20">
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                          Canceladas
                        </span>
                        <span className="font-bold font-mono ml-1">{salidasCanceladas}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Vehicles Chart */}
            <Card className="border-border/70 shadow-2xs lg:col-span-2">
              <CardHeader className="p-3 pb-1 border-b border-border/50">
                <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                  <TrendingUp className="size-3.5 text-emerald-500" />
                  Top Vehículos con Mayor Recorrido (km)
                </CardTitle>
                <CardDescription className="text-[10.5px]">
                  Flota vehicular con mayor distancia acumulada
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-2">
                {topVehiculosKm.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
                    Sin registros de kilometraje
                  </div>
                ) : (
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topVehiculosKm} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <XAxis dataKey="placa" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <RechartsTooltip />
                        <Bar dataKey="km" name="Km Recorridos" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Table Container - Auto-scrolling and non-deforming */}
          <Card className="border-border/70 shadow-2xs">
            <CardHeader className="p-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                  <FileText className="size-3.5 text-primary" />
                  Listado Detallado de Salidas
                </CardTitle>
                <CardDescription className="text-[10.5px] mt-0.5">
                  Mostrando {filteredGeneralItems.length} de {totalSalidas} salidas registradas
                </CardDescription>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="size-3.5 absolute left-2.5 top-2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar folio, placa, chofer..."
                  value={searchGeneral}
                  onChange={(e) => setSearchGeneral(e.target.value)}
                  className="h-7.5 pl-8 text-xs rounded-lg"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[760px]">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="text-xs h-8">
                      <TableHead className="w-24 font-semibold whitespace-nowrap">N° Salida</TableHead>
                      <TableHead className="w-44 font-semibold whitespace-nowrap">Vehículo / Placa</TableHead>
                      <TableHead className="w-44 font-semibold whitespace-nowrap">Conductor</TableHead>
                      <TableHead className="min-w-[180px] font-semibold whitespace-nowrap">Actividad</TableHead>
                      <TableHead className="w-36 font-semibold whitespace-nowrap">Fecha Registro</TableHead>
                      <TableHead className="w-28 font-semibold whitespace-nowrap">Estado</TableHead>
                      <TableHead className="w-16 font-semibold text-right whitespace-nowrap">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGeneralItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-28 text-center text-xs text-muted-foreground">
                          No se encontraron salidas vehiculares coincidentes con la búsqueda.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredGeneralItems.map((item: SalidaVehicular) => (
                        <TableRow key={item.id} className="text-xs hover:bg-muted/30 h-10">
                          <TableCell className="whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleNavigateDetail(item.id)}
                              className="font-mono font-bold text-primary hover:underline px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 cursor-pointer text-xs"
                            >
                              {item.numero}
                            </button>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="space-y-0.5 max-w-[170px]">
                              <span className="font-mono font-semibold text-foreground">
                                {item.placa ?? item.activoCodigo ?? "S/P"}
                              </span>
                              <p className="text-[10.5px] text-muted-foreground truncate" title={item.marca ? `${item.marca} ${item.modelo ?? ""}` : item.activoDescripcion || ""}>
                                {item.marca ? `${item.marca} ${item.modelo ?? ""}` : item.activoDescripcion}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className="font-medium text-foreground truncate max-w-[170px] inline-block" title={item.empleadoNombre ?? ""}>
                              {item.empleadoNombre ?? "Sin asignar"}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className="font-medium text-foreground text-xs truncate max-w-[200px] inline-block" title={item.descripcionActividad}>
                              {item.descripcionActividad}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground whitespace-nowrap text-[11px]">
                            {formatDate(item.createdAt)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <SalidaVehicularStatusBadge status={item.estado} />
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => handleNavigateDetail(item.id)}
                              className="h-6.5 text-[11px] gap-1 px-2 cursor-pointer hover:bg-primary/10 text-primary"
                            >
                              <Eye className="size-3" />
                              <span>Ver</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. VEHICULOS & KM TAB */}
        <TabsContent value="vehiculos" className="space-y-3 pt-0">
          <Card className="border-border/70 shadow-2xs">
            <CardHeader className="p-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                  <Gauge className="size-3.5 text-emerald-500" />
                  Rendimiento y Kilometraje por Vehículo
                </CardTitle>
                <CardDescription className="text-[10.5px] mt-0.5">
                  Consolidado de lecturas de odómetro inicial, final y recorrido de flota
                </CardDescription>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="size-3.5 absolute left-2.5 top-2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar placa, marca, modelo..."
                  value={searchVehiculos}
                  onChange={(e) => setSearchVehiculos(e.target.value)}
                  className="h-7.5 pl-8 text-xs rounded-lg"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[720px]">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="text-xs h-8">
                      <TableHead className="w-28 font-semibold whitespace-nowrap">Placa / Código</TableHead>
                      <TableHead className="min-w-[200px] font-semibold whitespace-nowrap">Marca / Modelo / Descripción</TableHead>
                      <TableHead className="w-24 font-semibold text-center whitespace-nowrap">N° Salidas</TableHead>
                      <TableHead className="w-28 font-semibold text-right whitespace-nowrap">Km Inicial</TableHead>
                      <TableHead className="w-28 font-semibold text-right whitespace-nowrap">Km Final</TableHead>
                      <TableHead className="w-32 font-semibold text-right whitespace-nowrap">Km Total Recorrido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehiculos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                          No se encontraron registros de vehículos coincidentes.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVehiculos.map((v: ReporteVehiculoKilometraje) => (
                        <TableRow key={v.activoId} className="text-xs hover:bg-muted/30 h-10">
                          <TableCell className="whitespace-nowrap">
                            <span className="font-mono font-bold text-foreground px-1.5 py-0.5 rounded bg-muted/60 border border-border/70 text-xs">
                              {v.placa ?? v.activoCodigo ?? "S/P"}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="space-y-0.5 max-w-[280px]">
                              <span className="font-medium text-foreground truncate block" title={v.marca ? `${v.marca} ${v.modelo ?? ""}` : v.activoDescripcion || ""}>
                                {v.marca ? `${v.marca} ${v.modelo ?? ""}` : v.activoDescripcion}
                              </span>
                              {v.activoCodigo && (
                                <p className="text-[10.5px] text-muted-foreground font-mono">
                                  Activo: {v.activoCodigo}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-mono font-semibold whitespace-nowrap">
                            <Badge variant="secondary" className="font-mono text-xs px-2 py-0">
                              {v.cantidadSalidas}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground text-right whitespace-nowrap">
                            {v.kilometrajeInicial != null
                              ? `${v.kilometrajeInicial.toLocaleString()} km`
                              : "-"}
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground text-right whitespace-nowrap">
                            {v.kilometrajeFinal != null
                              ? `${v.kilometrajeFinal.toLocaleString()} km`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                              {v.kilometrajeTotalRecorrido != null
                                ? `${v.kilometrajeTotalRecorrido.toLocaleString()} km`
                                : "0 km"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. CONDUCTORES TAB */}
        <TabsContent value="empleados" className="space-y-3 pt-0">
          <Card className="border-border/70 shadow-2xs">
            <CardHeader className="p-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                  <Users className="size-3.5 text-indigo-500" />
                  Desempeño y Salidas por Conductor
                </CardTitle>
                <CardDescription className="text-[10.5px] mt-0.5">
                  Estadísticas de viajes, salidas activas y récord de seguridad por chofer
                </CardDescription>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="size-3.5 absolute left-2.5 top-2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar conductor, código..."
                  value={searchEmpleados}
                  onChange={(e) => setSearchEmpleados(e.target.value)}
                  className="h-7.5 pl-8 text-xs rounded-lg"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[720px]">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="text-xs h-8">
                      <TableHead className="min-w-[180px] font-semibold whitespace-nowrap">Conductor</TableHead>
                      <TableHead className="w-28 font-semibold whitespace-nowrap">Código</TableHead>
                      <TableHead className="min-w-[140px] font-semibold whitespace-nowrap">Cargo / Área</TableHead>
                      <TableHead className="w-24 font-semibold text-center whitespace-nowrap">Total Salidas</TableHead>
                      <TableHead className="w-20 font-semibold text-center whitespace-nowrap">Activas</TableHead>
                      <TableHead className="w-24 font-semibold text-center whitespace-nowrap">Finalizadas</TableHead>
                      <TableHead className="w-28 font-semibold text-right whitespace-nowrap">Incidentes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmpleados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-28 text-center text-xs text-muted-foreground">
                          No se encontraron conductores coincidentes.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmpleados.map((e: ReporteEmpleadoSalidas) => (
                        <TableRow key={e.empleadoId} className="text-xs hover:bg-muted/30 h-10">
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2 max-w-[220px]">
                              <div className="size-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                                <User className="size-3" />
                              </div>
                              <span className="font-semibold text-foreground truncate" title={e.empleadoNombre ?? ""}>
                                {e.empleadoNombre}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground whitespace-nowrap text-[11px]">
                            {e.empleadoCodigo ?? "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            <span className="truncate max-w-[160px] inline-block" title={e.cargo ?? e.area ?? "Operativo"}>
                              {e.cargo ?? e.area ?? "Operativo"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-mono font-bold whitespace-nowrap">
                            {e.totalSalidas}
                          </TableCell>
                          <TableCell className="text-center whitespace-nowrap">
                            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                              {e.salidasActivas}
                            </span>
                          </TableCell>
                          <TableCell className="text-center whitespace-nowrap">
                            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                              {e.salidasFinalizadas}
                            </span>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {e.totalIncidentes > 0 ? (
                              <Badge
                                variant="outline"
                                className="font-mono font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10.5px] px-1.5 py-0"
                              >
                                {e.totalIncidentes} incidente{e.totalIncidentes > 1 ? "s" : ""}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="font-mono text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 px-1.5 py-0"
                              >
                                0 incidentes
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. TIEMPOS DE RECORRIDO TAB */}
        <TabsContent value="tiempos" className="space-y-3 pt-0">
          {/* Sub-cards de Tiempos Compactas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="border-border/70 shadow-2xs">
              <CardContent className="p-3 space-y-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Salidas Analizadas
                </span>
                <p className="text-lg sm:text-xl font-bold font-mono text-foreground">
                  {tiemposData?.totalSalidasAnalizadas ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-2xs">
              <CardContent className="p-3 space-y-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Duración Promedio
                </span>
                <p className="text-lg sm:text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                  {tiemposData?.duracionPromedioHoras != null
                    ? `${tiemposData.duracionPromedioHoras} hrs`
                    : "-"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-2xs">
              <CardContent className="p-3 space-y-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Duración Mínima
                </span>
                <p className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {tiemposData?.duracionMinimaMinutos != null
                    ? `${tiemposData.duracionMinimaMinutos} min`
                    : "-"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-2xs">
              <CardContent className="p-3 space-y-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Duración Máxima
                </span>
                <p className="text-lg sm:text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {tiemposData?.duracionMaximaMinutos != null
                    ? `${tiemposData.duracionMaximaMinutos} min`
                    : "-"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70 shadow-2xs">
            <CardHeader className="p-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                  <Clock className="size-3.5 text-amber-500" />
                  Tiempos de Viaje por Salida
                </CardTitle>
                <CardDescription className="text-[10.5px] mt-0.5">
                  Intervalo entre inicio de trayecto y llegada a destino o cierre
                </CardDescription>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="size-3.5 absolute left-2.5 top-2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar salida, vehículo, ruta..."
                  value={searchTiempos}
                  onChange={(e) => setSearchTiempos(e.target.value)}
                  className="h-7.5 pl-8 text-xs rounded-lg"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[740px]">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="text-xs h-8">
                      <TableHead className="w-24 font-semibold whitespace-nowrap">N° Salida</TableHead>
                      <TableHead className="w-40 font-semibold whitespace-nowrap">Vehículo</TableHead>
                      <TableHead className="min-w-[180px] font-semibold whitespace-nowrap">Actividad</TableHead>
                      <TableHead className="w-36 font-semibold whitespace-nowrap">Partida (Inicio)</TableHead>
                      <TableHead className="w-36 font-semibold whitespace-nowrap">Llegada / Cierre</TableHead>
                      <TableHead className="w-28 font-semibold text-right whitespace-nowrap">Duración Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTiemposItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                          No se encontraron registros de tiempos coincidentes.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTiemposItems.map((t: ItemTiempoRecorrido) => (
                        <TableRow key={t.salidaId} className="text-xs hover:bg-muted/30 h-10">
                          <TableCell className="whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleNavigateDetail(t.salidaId)}
                              className="font-mono font-bold text-primary hover:underline px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 cursor-pointer text-xs"
                            >
                              {t.numero}
                            </button>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className="font-medium text-foreground truncate max-w-[150px] inline-block" title={t.placa ?? t.vehiculoDescripcion ?? "S/P"}>
                              {t.placa ?? t.vehiculoDescripcion ?? "S/P"}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className="font-medium text-xs truncate max-w-[200px] inline-block" title={t.descripcionActividad}>
                              {t.descripcionActividad}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground whitespace-nowrap text-[11px]">
                            {formatDate(t.fechaInicio)}
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground whitespace-nowrap text-[11px]">
                            {formatDate(t.fechaFin)}
                          </TableCell>
                          <TableCell className="font-mono font-bold text-right text-amber-600 dark:text-amber-400 whitespace-nowrap">
                            {t.duracionHoras != null ? `${t.duracionHoras} hrs` : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. BITACORAS & INCIDENCIAS TAB */}
        <TabsContent value="bitacoras" className="space-y-3 pt-0">
          {/* Sub-cards Bitácoras Compactas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="border-border/70 shadow-2xs">
              <CardContent className="p-3 space-y-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Total Registros
                </span>
                <p className="text-lg sm:text-xl font-bold font-mono text-foreground">
                  {bitacorasData?.totalBitacoras ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-2xs">
              <CardContent className="p-3 space-y-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Actividades
                </span>
                <p className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {bitacorasData?.totalActividades ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-2xs">
              <CardContent className="p-3 space-y-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Novedades
                </span>
                <p className="text-lg sm:text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                  {bitacorasData?.totalNovedades ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-2xs">
              <CardContent className="p-3 space-y-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Incidentes Críticos
                </span>
                <p className="text-lg sm:text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                  {bitacorasData?.totalIncidentes ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70 shadow-2xs">
            <CardHeader className="p-3 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div>
                <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                  <Activity className="size-3.5 text-purple-500" />
                  Consolidado de Bitácoras y Geolocalización GPS
                </CardTitle>
                <CardDescription className="text-[10.5px] mt-0.5">
                  Registros generados en tiempo real durante los trayectos de salida
                </CardDescription>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Tipo Filter Buttons */}
                <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border/60">
                  {["ALL", "ACTIVIDAD", "NOVEDAD", "INCIDENTE"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFilterTipoBitacora(t)}
                      className={cn(
                        "px-2 py-0.5 text-[10.5px] rounded-md font-medium transition-all cursor-pointer whitespace-nowrap",
                        filterTipoBitacora === t
                          ? "bg-card text-foreground font-semibold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t === "ALL" ? "Todos" : t}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-52">
                  <Search className="size-3.5 absolute left-2.5 top-2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar descripción o chofer..."
                    value={searchBitacoras}
                    onChange={(e) => setSearchBitacoras(e.target.value)}
                    className="h-7.5 pl-8 text-xs rounded-lg"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[760px]">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="text-xs h-8">
                      <TableHead className="w-36 font-semibold whitespace-nowrap">Fecha y Hora</TableHead>
                      <TableHead className="w-28 font-semibold whitespace-nowrap">Tipo</TableHead>
                      <TableHead className="min-w-[220px] max-w-[340px] font-semibold whitespace-nowrap">Descripción del Evento</TableHead>
                      <TableHead className="w-40 font-semibold whitespace-nowrap">Conductor</TableHead>
                      <TableHead className="w-36 font-semibold whitespace-nowrap">Ubicación GPS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBitacoras.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-28 text-center text-xs text-muted-foreground">
                          No se encontraron registros de bitácoras coincidentes con los filtros.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBitacoras.map((b: BitacoraVehicular) => {
                        const isIncidente = b.tipo === "INCIDENTE"
                        const isNovedad = b.tipo === "NOVEDAD"
                        const hasGps = b.latitud != null && b.longitud != null

                        return (
                          <TableRow key={b.id} className="text-xs hover:bg-muted/30 h-10">
                            <TableCell className="font-mono text-muted-foreground whitespace-nowrap text-[11px]">
                              {formatDate(b.fechaHora || b.createdAt)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-[10px] font-semibold border px-1.5 py-0 whitespace-nowrap",
                                  isIncidente &&
                                    "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
                                  isNovedad &&
                                    "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
                                  !isIncidente &&
                                    !isNovedad &&
                                    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                )}
                              >
                                {b.tipo}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <span className="font-medium text-foreground truncate max-w-[320px] block" title={b.descripcion}>
                                {b.descripcion}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground font-medium whitespace-nowrap">
                              <span className="truncate max-w-[150px] inline-block" title={b.empleadoNombre ?? "N/A"}>
                                {b.empleadoNombre ?? "N/A"}
                              </span>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {hasGps ? (
                                <a
                                  href={`https://maps.google.com/?q=${b.latitud},${b.longitud}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline font-semibold bg-primary/5 hover:bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 transition-colors"
                                  title="Abrir ubicación en Google Maps"
                                >
                                  <Compass className="size-3" />
                                  <span>
                                    {Number(b.latitud).toFixed(4)}, {Number(b.longitud).toFixed(4)}
                                  </span>
                                  <ExternalLink className="size-2.5 opacity-70" />
                                </a>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}

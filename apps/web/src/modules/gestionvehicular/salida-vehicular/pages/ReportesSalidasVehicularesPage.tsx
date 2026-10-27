import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Clock,
  Compass,
  Gauge,
  RotateCw,
  Users,
} from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

import { salidaVehicularQueries } from "../api/salida-vehicular.queries"
import { SalidaVehicularStatusBadge } from "../components/SalidaVehicularStatusBadge"

export function ReportesSalidasVehicularesPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("general")

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

  const handleRefreshAll = () => {
    void generalQuery.refetch()
    void vehiculosQuery.refetch()
    void empleadosQuery.refetch()
    void tiemposQuery.refetch()
    void bitacorasQuery.refetch()
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-"
    try {
      return new Date(dateStr).toLocaleString("es-ES", {
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

  return (
    <PageShell size="full" padding="none" layout="auto" className="w-full space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void navigate({ to: "/gestion-vehicular/salidas" })}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Reportes y Métricas de Salidas Vehiculares
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Estadísticas consolidadas de recorridos, flota, consumo de tiempos y bitácoras operativas.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          disabled={isFetchingAny}
          className="text-xs gap-1.5 self-start md:self-auto"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isFetchingAny ? "animate-spin" : ""}`} />
          Actualizar Reportes
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full max-w-4xl h-9 p-0.5 bg-muted/60">
          <TabsTrigger value="general" className="text-xs gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
            General
          </TabsTrigger>
          <TabsTrigger value="vehiculos" className="text-xs gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-emerald-500" />
            Vehículos & Km
          </TabsTrigger>
          <TabsTrigger value="empleados" className="text-xs gap-1.5">
            <Users className="h-3.5 w-3.5 text-indigo-500" />
            Conductores
          </TabsTrigger>
          <TabsTrigger value="tiempos" className="text-xs gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            Tiempos
          </TabsTrigger>
          <TabsTrigger value="bitacoras" className="text-xs gap-1.5">
            <Activity className="h-3.5 w-3.5 text-purple-500" />
            Bitácoras
          </TabsTrigger>
        </TabsList>

        {/* 1. GENERAL */}
        <TabsContent value="general" className="space-y-4 pt-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-blue-500/20 shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Total Salidas</p>
                <div className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                  {generalQuery.data?.totalSalidas ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20 shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Salidas Activas</p>
                <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                  {generalQuery.data?.salidasActivas ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20 shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Finalizadas</p>
                <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                  {generalQuery.data?.salidasFinalizadas ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card className="border-rose-500/20 shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Canceladas</p>
                <div className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">
                  {generalQuery.data?.salidasCanceladas ?? 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold">Listado General de Salidas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="font-semibold">N° Salida</TableHead>
                    <TableHead className="font-semibold">Vehículo</TableHead>
                    <TableHead className="font-semibold">Conductor</TableHead>
                    <TableHead className="font-semibold">Ruta</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(generalQuery.data?.items ?? []).map((item) => (
                    <TableRow key={item.id} className="text-xs">
                      <TableCell className="font-mono font-semibold text-primary">
                        {item.numero}
                      </TableCell>
                      <TableCell>{item.placa ?? item.activoCodigo}</TableCell>
                      <TableCell>{item.empleadoNombre ?? "N/A"}</TableCell>
                      <TableCell>{item.origen} &rarr; {item.destino}</TableCell>
                      <TableCell>
                        <SalidaVehicularStatusBadge status={item.estado} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. VEHICULOS & KILOMETRAJE */}
        <TabsContent value="vehiculos" className="space-y-4 pt-3">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Gauge className="h-4 w-4 text-emerald-500" />
                Kilometraje y Recorridos por Vehículo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="font-semibold">Vehículo / Placa</TableHead>
                    <TableHead className="font-semibold">Modelo / Marca</TableHead>
                    <TableHead className="font-semibold">N° Salidas</TableHead>
                    <TableHead className="font-semibold">Km Inicial</TableHead>
                    <TableHead className="font-semibold">Km Final</TableHead>
                    <TableHead className="font-semibold text-right">Km Recorridos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(vehiculosQuery.data ?? []).map((v) => (
                    <TableRow key={v.activoId} className="text-xs">
                      <TableCell className="font-semibold font-mono">
                        {v.placa ?? v.activoCodigo}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {v.marca ? `${v.marca} ${v.modelo ?? ""}` : v.activoDescripcion}
                      </TableCell>
                      <TableCell className="font-mono">{v.cantidadSalidas}</TableCell>
                      <TableCell className="font-mono">
                        {v.kilometrajeInicial != null ? `${v.kilometrajeInicial.toLocaleString()} km` : "-"}
                      </TableCell>
                      <TableCell className="font-mono">
                        {v.kilometrajeFinal != null ? `${v.kilometrajeFinal.toLocaleString()} km` : "-"}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right">
                        {v.kilometrajeTotalRecorrido != null ? `${v.kilometrajeTotalRecorrido.toLocaleString()} km` : "0 km"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. CONDUCTORES */}
        <TabsContent value="empleados" className="space-y-4 pt-3">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-500" />
                Salidas y Desempeño por Conductor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="font-semibold">Empleado</TableHead>
                    <TableHead className="font-semibold">Código</TableHead>
                    <TableHead className="font-semibold">Cargo / Área</TableHead>
                    <TableHead className="font-semibold">Total Salidas</TableHead>
                    <TableHead className="font-semibold">Activas</TableHead>
                    <TableHead className="font-semibold">Finalizadas</TableHead>
                    <TableHead className="font-semibold text-right">Incidentes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(empleadosQuery.data ?? []).map((e) => (
                    <TableRow key={e.empleadoId} className="text-xs">
                      <TableCell className="font-semibold">{e.empleadoNombre}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{e.empleadoCodigo}</TableCell>
                      <TableCell className="text-muted-foreground">{e.cargo ?? e.area ?? "-"}</TableCell>
                      <TableCell className="font-mono">{e.totalSalidas}</TableCell>
                      <TableCell className="font-mono text-amber-600">{e.salidasActivas}</TableCell>
                      <TableCell className="font-mono text-emerald-600">{e.salidasFinalizadas}</TableCell>
                      <TableCell className="font-mono font-bold text-rose-600 text-right">{e.totalIncidentes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. TIEMPOS DE RECORRIDO */}
        <TabsContent value="tiempos" className="space-y-4 pt-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-amber-500/20 shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Salidas Analizadas</p>
                <div className="text-2xl font-bold mt-1 text-foreground">
                  {tiemposQuery.data?.totalSalidasAnalizadas ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20 shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Duración Promedio</p>
                <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                  {tiemposQuery.data?.duracionPromedioHoras != null
                    ? `${tiemposQuery.data.duracionPromedioHoras} hrs`
                    : "-"}
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20 shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Duración Mínima</p>
                <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                  {tiemposQuery.data?.duracionMinimaMinutos != null
                    ? `${tiemposQuery.data.duracionMinimaMinutos} min`
                    : "-"}
                </div>
              </CardContent>
            </Card>
            <Card className="border-indigo-500/20 shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Duración Máxima</p>
                <div className="text-2xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">
                  {tiemposQuery.data?.duracionMaximaMinutos != null
                    ? `${tiemposQuery.data.duracionMaximaMinutos} min`
                    : "-"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Detalle de Tiempos por Salida
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="font-semibold">N° Salida</TableHead>
                    <TableHead className="font-semibold">Vehículo</TableHead>
                    <TableHead className="font-semibold">Ruta</TableHead>
                    <TableHead className="font-semibold">Inicio</TableHead>
                    <TableHead className="font-semibold">Fin</TableHead>
                    <TableHead className="font-semibold text-right">Duración (Horas)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(tiemposQuery.data?.items ?? []).map((t) => (
                    <TableRow key={t.salidaId} className="text-xs">
                      <TableCell className="font-mono font-semibold text-primary">{t.numero}</TableCell>
                      <TableCell>{t.placa ?? t.vehiculoDescripcion}</TableCell>
                      <TableCell>{t.origen} &rarr; {t.destino}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{formatDate(t.fechaInicio)}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{formatDate(t.fechaFin)}</TableCell>
                      <TableCell className="font-mono font-bold text-right">
                        {t.duracionHoras != null ? `${t.duracionHoras} hrs` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. BITACORAS */}
        <TabsContent value="bitacoras" className="space-y-4 pt-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Total Bitácoras</p>
                <div className="text-2xl font-bold mt-1 text-foreground">
                  {bitacorasQuery.data?.totalBitacoras ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Actividades Normales</p>
                <div className="text-2xl font-bold mt-1 text-emerald-600">
                  {bitacorasQuery.data?.totalActividades ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Novedades</p>
                <div className="text-2xl font-bold mt-1 text-amber-600">
                  {bitacorasQuery.data?.totalNovedades ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-xs">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Incidentes</p>
                <div className="text-2xl font-bold mt-1 text-rose-600">
                  {bitacorasQuery.data?.totalIncidentes ?? 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                Listado Consolidado de Bitácoras
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold">Tipo</TableHead>
                    <TableHead className="font-semibold">Descripción</TableHead>
                    <TableHead className="font-semibold">Empleado</TableHead>
                    <TableHead className="font-semibold">GPS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(bitacorasQuery.data?.items ?? []).map((b) => (
                    <TableRow key={b.id} className="text-xs">
                      <TableCell className="font-mono text-muted-foreground">{formatDate(b.fechaHora || b.createdAt)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            b.tipo === "INCIDENTE"
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                              : b.tipo === "NOVEDAD"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {b.tipo}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[280px]">{b.descripcion}</TableCell>
                      <TableCell>{b.empleadoNombre ?? "N/A"}</TableCell>
                      <TableCell>
                        {b.latitud != null && b.longitud != null ? (
                          <a
                            href={`https://maps.google.com/?q=${b.latitud},${b.longitud}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                          >
                            <Compass className="h-3 w-3" />
                            {b.latitud.toFixed(4)}, {b.longitud.toFixed(4)}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}

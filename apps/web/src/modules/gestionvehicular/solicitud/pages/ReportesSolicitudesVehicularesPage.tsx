import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Car,
  CheckCircle2,
  FileCheck,
  FileText,
  RefreshCw,
  Route,
  Users,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { PageShell } from "@/shared/components/page-shell"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

import { solicitudVehicularQueries } from "../api/solicitud-vehicular.queries"
import {
  abrirReporteSolicitudesPdf,
  descargarReporteSolicitudesPdf,
  type ReporteSolicitudItem,
} from "../api/solicitud-vehicular.service"
import {
  ReporteSolicitudesFiltrosBar,
  type VehiculoMetaInfo,
} from "../components/ReporteSolicitudesFiltrosBar"
import { ReporteSolicitudesVehicularesTable } from "../components/ReporteSolicitudesVehicularesTable"

function getPrimerDiaMes(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}-01`
}

function getFechaActual(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const ReportesSolicitudesVehicularesPage = () => {
  // Filtros de entrada
  const [activoId, setActivoId] = useState<string>("")
  const [placaSeleccionada, setPlacaSeleccionada] = useState<string | null>(null)
  const [vehiculoMeta, setVehiculoMeta] = useState<VehiculoMetaInfo | null>(null)
  const [fechaDesde, setFechaDesde] = useState<string>(getPrimerDiaMes())
  const [fechaHasta, setFechaHasta] = useState<string>(getFechaActual())
  const [estado, setEstado] = useState<string>("TODOS")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Filtros activos aplicados a la consulta
  const [filtrosActivos, setFiltrosActivos] = useState<{
    activoId: string
    fechaDesde: string
    fechaHasta: string
    estado: string
  } | null>(() => ({
    activoId: "",
    fechaDesde: getPrimerDiaMes(),
    fechaHasta: getFechaActual(),
    estado: "TODOS",
  }))

  // Consulta al backend API
  const reporteQuery = useQuery({
    ...solicitudVehicularQueries.reporteGeneral({
      activoId: filtrosActivos?.activoId || undefined,
      estado: filtrosActivos?.estado !== "TODOS" ? filtrosActivos?.estado : undefined,
      fechaDesde: filtrosActivos?.fechaDesde ? `${filtrosActivos.fechaDesde}T00:00:00` : undefined,
      fechaHasta: filtrosActivos?.fechaHasta ? `${filtrosActivos.fechaHasta}T23:59:59` : undefined,
    }),
    enabled: Boolean(filtrosActivos?.fechaDesde && filtrosActivos?.fechaHasta),
  })

  // Manejo de cambio de vehículo
  const handleActivoChange = (
    id: string,
    placa?: string | null,
    meta?: VehiculoMetaInfo | null
  ) => {
    setActivoId(id)
    setPlacaSeleccionada(placa ?? null)
    setVehiculoMeta(meta ?? null)

    if (fechaDesde && fechaHasta && fechaDesde <= fechaHasta) {
      setFiltrosActivos((prev) => ({
        activoId: id,
        fechaDesde: prev?.fechaDesde ?? fechaDesde,
        fechaHasta: prev?.fechaHasta ?? fechaHasta,
        estado: prev?.estado ?? estado,
      }))
    }
  }

  // Filtrado y métricas en memoria
  const { filas, metricas } = useMemo(() => {
    const rawItems: ReporteSolicitudItem[] = reporteQuery.data?.items ?? []

    // Filtrado textual
    const q = searchQuery.trim().toLowerCase()
    const filtered = q
      ? rawItems.filter((item) => {
          return (
            (item.numero && item.numero.toLowerCase().includes(q)) ||
            (item.solicitanteNombre && item.solicitanteNombre.toLowerCase().includes(q)) ||
            (item.solicitanteArea && item.solicitanteArea.toLowerCase().includes(q)) ||
            (item.destino && item.destino.toLowerCase().includes(q)) ||
            (item.motivo && item.motivo.toLowerCase().includes(q)) ||
            (item.tipoSolicitudNombre && item.tipoSolicitudNombre.toLowerCase().includes(q)) ||
            (item.activoPlaca && item.activoPlaca.toLowerCase().includes(q)) ||
            (item.activoModelo && item.activoModelo.toLowerCase().includes(q)) ||
            (item.activoCodigo && item.activoCodigo.toLowerCase().includes(q)) ||
            (item.conductorNombre && item.conductorNombre.toLowerCase().includes(q)) ||
            (item.conductorLicencia && item.conductorLicencia.toLowerCase().includes(q)) ||
            (item.estado && item.estado.toLowerCase().includes(q)) ||
            (item.observacion && item.observacion.toLowerCase().includes(q))
          )
        })
      : rawItems

    let pendientes = 0
    let asignadas = 0
    let finalizadas = 0
    let rechazadas = 0
    let totalPasajeros = 0

    for (const item of filtered) {
      const est = (item.estado ?? "").toUpperCase()
      if (est.includes("SOLICITAD") || est.includes("PENDIENTE")) {
        pendientes++
      } else if (est.includes("ASIGNAD") || est.includes("CURSO") || est.includes("VIAJE")) {
        asignadas++
      } else if (est.includes("FINALIZ")) {
        finalizadas++
      } else if (est.includes("RECHAZ") || est.includes("CANCEL") || est.includes("OBSERV")) {
        rechazadas++
      }

      if (item.cantidadPasajeros != null && item.cantidadPasajeros > 0) {
        totalPasajeros += item.cantidadPasajeros
      }
    }

    return {
      filas: filtered,
      metricas: {
        total: filtered.length,
        pendientes,
        asignadas,
        finalizadas,
        rechazadas,
        totalPasajeros,
      },
    }
  }, [reporteQuery.data?.items, searchQuery])

  // Consultar manualmente
  const handleConsultar = () => {
    if (!fechaDesde || !fechaHasta) {
      toast.error("Debe especificar las fechas de inicio y fin.")
      return
    }
    if (fechaDesde > fechaHasta) {
      toast.error("La fecha de inicio no puede ser posterior a la fecha de fin.")
      return
    }

    setFiltrosActivos({
      activoId,
      fechaDesde,
      fechaHasta,
      estado,
    })
    void reporteQuery.refetch()
    toast.success("Reporte de solicitudes vehiculares actualizado.")
  }

  // Estado de carga del PDF generado en el Backend API
  const [isPdfLoading, setIsPdfLoading] = useState(false)

  // Descargar PDF generado por el Backend (JasperReports)
  const handleDescargarPdf = async () => {
    if (!filtrosActivos?.fechaDesde || !filtrosActivos?.fechaHasta) {
      toast.error("Seleccione un rango de fechas para generar el reporte.")
      return
    }

    try {
      setIsPdfLoading(true)
      toast.info("Generando reporte oficial en PDF desde el servidor...")
      await descargarReporteSolicitudesPdf({
        activoId: filtrosActivos.activoId || undefined,
        estado: filtrosActivos.estado !== "TODOS" ? filtrosActivos.estado : undefined,
        fechaDesde: filtrosActivos.fechaDesde,
        fechaHasta: filtrosActivos.fechaHasta,
        search: searchQuery || undefined,
      })
      toast.success("Reporte oficial en PDF generado y descargado exitosamente.")
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al generar el PDF en el servidor"
      toast.error(`No se pudo generar el PDF: ${message}`)
    } finally {
      setIsPdfLoading(false)
    }
  }

  // Abrir PDF oficial en nueva pestaña
  const handleAbrirPdf = async () => {
    if (!filtrosActivos?.fechaDesde || !filtrosActivos?.fechaHasta) {
      toast.error("Seleccione un rango de fechas.")
      return
    }

    try {
      setIsPdfLoading(true)
      toast.info("Abriendo reporte en PDF desde el servidor...")
      await abrirReporteSolicitudesPdf({
        activoId: filtrosActivos.activoId || undefined,
        estado: filtrosActivos.estado !== "TODOS" ? filtrosActivos.estado : undefined,
        fechaDesde: filtrosActivos.fechaDesde,
        fechaHasta: filtrosActivos.fechaHasta,
        search: searchQuery || undefined,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al abrir el PDF"
      toast.error(`No se pudo abrir el PDF: ${message}`)
    } finally {
      setIsPdfLoading(false)
    }
  }

  // Imprimir formulario oficial
  const handleImprimir = () => {
    if (filas.length === 0) {
      toast.info("No hay registros en el reporte para imprimir.")
      return
    }
    window.print()
  }

  // Exportar a Excel (CSV con UTF-8 BOM)
  const handleExportarCsv = () => {
    if (filas.length === 0) {
      toast.info("No hay datos para exportar.")
      return
    }

    const headers = [
      "NRO_SOLICITUD",
      "FECHA_SALIDA",
      "FECHA_RETORNO_ESTIMADA",
      "SOLICITANTE",
      "AREA_SOLICITANTE",
      "TIPO_SOLICITUD",
      "DESTINO",
      "MOTIVO",
      "CANTIDAD_PASAJEROS",
      "VEHICULO_PLACA",
      "VEHICULO_MODELO",
      "CONDUCTOR",
      "CONDUCTOR_LICENCIA",
      "ESTADO",
      "FECHA_ASIGNACION",
      "ASIGNADO_POR",
      "OBSERVACIONES",
    ]

    const csvRows = filas.map((f) => [
      `"${f.numero}"`,
      `"${f.fechaSalida || ""}"`,
      `"${f.fechaRetornoEstimada || ""}"`,
      `"${(f.solicitanteNombre || "").replace(/"/g, '""')}"`,
      `"${(f.solicitanteArea || "").replace(/"/g, '""')}"`,
      `"${(f.tipoSolicitudNombre || "").replace(/"/g, '""')}"`,
      `"${(f.destino || "").replace(/"/g, '""')}"`,
      `"${(f.motivo || "").replace(/"/g, '""')}"`,
      f.cantidadPasajeros ?? 1,
      `"${f.activoPlaca || ""}"`,
      `"${f.activoModelo || ""}"`,
      `"${(f.conductorNombre || "").replace(/"/g, '""')}"`,
      `"${f.conductorLicencia || ""}"`,
      `"${f.estado || ""}"`,
      `"${f.fechaAsignacion || ""}"`,
      `"${(f.asignadoPorNombre || "").replace(/"/g, '""')}"`,
      `"${(f.observacion || f.observacionAsignacion || "").replace(/"/g, '""')}"`,
    ])

    const csvContent =
      "\uFEFF" +
      [
        headers.join(";"),
        ...csvRows.map((r) => r.join(";")),
        "",
        `"TOTALES";"";"";"";"";"";"";"";"${metricas.totalPasajeros} pasajeros";"";"";"";"";"${metricas.total} solicitudes";"";"";""`,
      ].join("\r\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `reporte-solicitudes-vehiculares-${fechaDesde}_${fechaHasta}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Archivo Excel (CSV) descargado.")
  }

  const vehiculoTexto = useMemo(() => {
    if (!filtrosActivos?.activoId) {
      return "TODOS LOS VEHÍCULOS (CONSOLIDADO)"
    }
    if (placaSeleccionada) {
      return `PLACA: ${placaSeleccionada} ${vehiculoMeta?.modelo ? `(${vehiculoMeta.modelo})` : ""}`
    }
    return vehiculoMeta?.nombre || "VEHÍCULO ESPECÍFICO"
  }, [filtrosActivos?.activoId, placaSeleccionada, vehiculoMeta])

  const isLoading = reporteQuery.isLoading || reporteQuery.isFetching

  return (
    <PageShell size="full" padding="compact" layout="scroll" className="space-y-3 pb-10">
      {/* ========================================================= */}
      {/* 1. ENCABEZADO DE LA PÁGINA (Oculto al imprimir)           */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5 print:hidden">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-2xs">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Reporte de Solicitudes y Asignaciones Vehiculares
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 font-semibold py-0"
              >
                Formulario Oficial GV-REP-01
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              ENDE CORANI • Registro histórico de requerimientos de movilidad, asignación de flota, conductores y pasajeros
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BARRA DE FILTROS (Vehículo + Fechas + Estado) (Oculto print) */}
      {/* ========================================================= */}
      <ReporteSolicitudesFiltrosBar
        activoId={activoId}
        onActivoChange={handleActivoChange}
        fechaDesde={fechaDesde}
        onFechaDesdeChange={setFechaDesde}
        fechaHasta={fechaHasta}
        onFechaHastaChange={setFechaHasta}
        estado={estado}
        onEstadoChange={setEstado}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onConsultar={handleConsultar}
        onDescargarPdf={handleDescargarPdf}
        onAbrirPdf={handleAbrirPdf}
        onImprimir={handleImprimir}
        onExportarCsv={handleExportarCsv}
        isLoading={isLoading}
        isPdfLoading={isPdfLoading}
        hasData={filas.length > 0}
        totalItems={metricas.total}
        placaSeleccionada={placaSeleccionada}
      />

      {/* ========================================================= */}
      {/* 3. RESUMEN DE MÉTRICAS RÁPIDAS (Oculto print)             */}
      {/* ========================================================= */}
      {filtrosActivos && !isLoading && filas.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 print:hidden">
          {/* Total Solicitudes */}
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border/60 bg-card shadow-2xs">
            <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
              <FileCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider leading-none">
                Total Solicitudes
              </span>
              <p className="text-base font-bold text-foreground leading-tight mt-0.5">
                {metricas.total}
              </p>
            </div>
          </div>

          {/* Asignadas / En Viaje */}
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border/60 bg-card shadow-2xs">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <Car className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider leading-none">
                Asignadas / En Viaje
              </span>
              <p className="text-base font-bold text-blue-600 dark:text-blue-400 leading-tight mt-0.5">
                {metricas.asignadas}
              </p>
            </div>
          </div>

          {/* Finalizadas */}
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border/60 bg-card shadow-2xs">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider leading-none">
                Finalizadas
              </span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">
                {metricas.finalizadas}
              </p>
            </div>
          </div>

          {/* Pasajeros Totales */}
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border/60 bg-card shadow-2xs">
            <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider leading-none">
                Pasajeros Totales
              </span>
              <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 leading-tight mt-0.5">
                {metricas.totalPasajeros}
              </p>
            </div>
          </div>

          {/* Rechazadas / Observadas */}
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border/60 bg-card shadow-2xs">
            <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
              <XCircle className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider leading-none">
                Rechazadas
              </span>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400 leading-tight mt-0.5">
                {metricas.rechazadas}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ESTADO DE ERROR                                        */}
      {/* ========================================================= */}
      {reporteQuery.error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive print:hidden flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                Error al consultar los datos del reporte
              </p>
              <p className="text-xs text-destructive/90">
                {reporteQuery.error instanceof Error
                  ? reporteQuery.error.message
                  : "No se pudo obtener la información desde el servidor."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void reporteQuery.refetch()}
            className="gap-1.5 ml-4 text-xs h-8 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </Button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ESTADO DE CARGA                                        */}
      {/* ========================================================= */}
      {isLoading && (
        <div className="space-y-3 print:hidden">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ESTADO INICIAL (Sin filtros aplicados)                 */}
      {/* ========================================================= */}
      {!filtrosActivos && !isLoading && (
        <Card className="border-dashed border-2 border-border/80 bg-muted/10 print:hidden">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="p-3.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Route className="h-8 w-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="font-bold text-sm text-foreground">
                Seleccione Rango de Fechas y Filtros
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Utilice la barra superior para elegir el período de salida a consultar, estado de la solicitud o un vehículo específico. A continuación presione <strong>Consultar</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* 7. PLANILLA OFICIAL DE REPORTE (Imprimible y visible)     */}
      {/* ========================================================= */}
      {filtrosActivos && !isLoading && (
        <div id="solicitudes-reporte-imprimible" className="space-y-4">
          <ReporteSolicitudesVehicularesTable
            filas={filas}
            vehiculoTexto={vehiculoTexto}
            estadoTexto={filtrosActivos.estado}
            periodoTexto={`${filtrosActivos.fechaDesde} al ${filtrosActivos.fechaHasta}`}
            totalPasajeros={metricas.totalPasajeros}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* ESTILOS DE IMPRESIÓN OFICIAL LANDSCAPE                    */}
      {/* ========================================================= */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 6mm 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Ocultar elementos auxiliares de navegación y UI */
          aside,
          nav,
          header,
          .print\\:hidden {
            display: none !important;
          }
          /* Formulario / Planilla */
          .bitacora-reporte-hoja {
            border: 1px solid #1e293b !important;
            box-shadow: none !important;
            width: 100% !important;
            page-break-after: avoid;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border-color: #334155 !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </PageShell>
  )
}

export default ReportesSolicitudesVehicularesPage


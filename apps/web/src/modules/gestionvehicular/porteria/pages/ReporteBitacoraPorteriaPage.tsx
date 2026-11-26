import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  FileDown,
  FileSpreadsheet,
  Loader2,
  Package,
  Printer,
  RefreshCw,
  Timer,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api/errors"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"

import { porteriaQueries } from "../api/porteria.queries"
import {
  abrirReporteBitacoraPorteriaPdf,
  descargarReporteBitacoraPorteriaPdf,
} from "../api/porteria.service"
import type {
  EstadoRegistroPorteria,
  ReporteBitacoraPorteriaFiltros,
} from "../api/porteria.types"
import { ReporteBitacoraPorteriaFiltrosBar } from "../components/ReporteBitacoraPorteriaFiltrosBar"
import { ReporteBitacoraPorteriaTable } from "../components/ReporteBitacoraPorteriaTable"

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

const PAGE_SIZE = 20

export function ReporteBitacoraPorteriaPage() {
  // Filtros interactivos en tiempo real
  const [searchQuery, setSearchQuery] = useState<string>("")
  const debouncedSearch = useDebouncedValue(searchQuery, 300)
  const [empleadoId, setEmpleadoId] = useState<string>("")
  const [activoId, setActivoId] = useState<string>("")
  const [fechaDesde, setFechaDesde] = useState<string>(getPrimerDiaMes())
  const [fechaHasta, setFechaHasta] = useState<string>(getFechaActual())
  const [estado, setEstado] = useState<string>("TODOS")
  const [tipoPase, setTipoPase] = useState<string>("TODOS")
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(PAGE_SIZE)

  const apiParams = useMemo<ReporteBitacoraPorteriaFiltros>(() => {
    return {
      // La búsqueda se resuelve en el servidor; no se filtra el contenido local.
      search: debouncedSearch.trim() || undefined,
      empleadoId: empleadoId || undefined,
      activoId: activoId || undefined,
      estado:
        estado !== "TODOS" ? (estado as EstadoRegistroPorteria) : undefined,
      esExterno:
        tipoPase === "EXTERNO"
          ? true
          : tipoPase === "INTERNO"
            ? false
            : undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
    }
  }, [debouncedSearch, empleadoId, activoId, estado, tipoPase, fechaDesde, fechaHasta])

  // La tabla consume SOLO la página devuelta por el servidor.
  const reportePaginadoQuery = useQuery(
    porteriaQueries.reportePaginado({ ...apiParams, page, size })
  )

  // Los agregados globales siguen viniendo exclusivamente de `/reporte`.
  const reporteQuery = useQuery(porteriaQueries.reporte(apiParams))

  const handleBusquedaChange = (value: string) => {
    setSearchQuery(value)
    setPage(0)
  }
  const handleEmpleadoChange = (value: string) => {
    setEmpleadoId(value)
    setPage(0)
  }
  const handleActivoChange = (value: string) => {
    setActivoId(value)
    setPage(0)
  }
  const handleFechaDesdeChange = (value: string) => {
    setFechaDesde(value)
    setPage(0)
  }
  const handleFechaHastaChange = (value: string) => {
    setFechaHasta(value)
    setPage(0)
  }
  const handleEstadoChange = (value: string) => {
    setEstado(value)
    setPage(0)
  }
  const handleTipoPaseChange = (value: string) => {
    setTipoPase(value)
    setPage(0)
  }
  const handleSizeChange = (value: number) => {
    setSize(value)
    setPage(0)
  }

  const handleLimpiarFiltros = () => {
    setSearchQuery("")
    setEmpleadoId("")
    setActivoId("")
    setEstado("TODOS")
    setTipoPase("TODOS")
    setFechaDesde(getPrimerDiaMes())
    setFechaHasta(getFechaActual())
    setPage(0)
  }

  // Un fallo de /reporte nunca se pinta como ceros: se anuncia con «—».
  const agregados = reporteQuery.data
  const metricas = agregados && !reporteQuery.isError ? agregados : null
  const valorMetrica = (value: number | undefined) =>
    metricas && value !== undefined ? value : "—"

  // CSV y PDFs continúan alimentándose de /reporte (no de `content`).
  const filasExportar = reporteQuery.data?.items ?? []

  const [isPdfLoading, setIsPdfLoading] = useState(false)

  // Imprimir Reporte Oficial en PDF (abre en nueva pestaña listo para imprimir)
  const handleImprimirReporte = async () => {
    try {
      setIsPdfLoading(true)
      toast.info("Generando reporte de bitácora para imprimir...")
      await abrirReporteBitacoraPorteriaPdf({
        ...apiParams,
        search: searchQuery.trim() || undefined,
      })
    } catch (err: unknown) {
      toast.error(`No se pudo abrir el reporte: ${getErrorMessage(err)}`)
    } finally {
      setIsPdfLoading(false)
    }
  }

  // Descargar PDF Oficial
  const handleDescargarPdf = async () => {
    try {
      setIsPdfLoading(true)
      toast.info("Descargando reporte PDF...")
      await descargarReporteBitacoraPorteriaPdf({
        ...apiParams,
        search: searchQuery.trim() || undefined,
      })
      toast.success("Reporte PDF descargado correctamente.")
    } catch (err: unknown) {
      toast.error(`No se pudo descargar el PDF: ${getErrorMessage(err)}`)
    } finally {
      setIsPdfLoading(false)
    }
  }

  // Exportar a Excel (CSV UTF-8): filas y totales globales desde /reporte
  const handleExportarCsv = () => {
    if (filasExportar.length === 0) {
      toast.info("No hay datos para exportar.")
      return
    }

    const headers = [
      "DIA",
      "DIA_SEMANA",
      "FECHA",
      "NRO_FOLIO",
      "TIPO_PASE",
      "HORA_SALIDA",
      "HORA_LLEGADA",
      "DURACION",
      "FUNCIONARIO_PERSONA",
      "CODIGO_EMPLEADO",
      "AREA",
      "CARGO",
      "PLACA_VEHICULO",
      "ACTIVOS_RETIRADOS",
      "CANTIDAD_ACTIVOS",
      "ORIGEN",
      "DESTINO",
      "RUTA",
      "GUARDIA_SALIDA",
      "GUARDIA_LLEGADA",
      "ESTADO",
      "OBSERVACIONES",
    ]

    const csvRows = filasExportar.map((f) => [
      f.dia ?? "",
      `"${f.diaSemana || ""}"`,
      `"${f.fechaFormateada || ""}"`,
      `"${f.numero || ""}"`,
      `"${f.tipoRegistro || (f.esExterno ? "EXTERNO" : "INTERNO")}"`,
      `"${f.horaSalidaFormateada || ""}"`,
      `"${f.horaLlegadaFormateada || ""}"`,
      `"${f.duracionTexto || ""}"`,
      `"${(f.empleadoNombre || f.personaExterna || "").replace(/"/g, '""')}"`,
      `"${f.empleadoCodigo || ""}"`,
      `"${(f.empleadoArea || "").replace(/"/g, '""')}"`,
      `"${(f.empleadoCargo || "").replace(/"/g, '""')}"`,
      `"${f.vehiculoPlaca || f.placaExterna || ""}"`,
      `"${(f.activosResumen || "").replace(/"/g, '""')}"`,
      f.totalActivos ?? 0,
      `"${(f.origenUbicacionNombre || "").replace(/"/g, '""')}"`,
      `"${(f.destinoUbicacionNombre || f.destinoOtro || "").replace(/"/g, '""')}"`,
      `"${(f.rutaTexto || "").replace(/"/g, '""')}"`,
      `"${(f.guardiaSalidaNombre || "").replace(/"/g, '""')}"`,
      `"${(f.guardiaLlegadaNombre || "").replace(/"/g, '""')}"`,
      `"${f.estado}"`,
      `"${(f.observacionesConsolidadas || "").replace(/"/g, '""')}"`,
    ])

    const csvContent =
      "\uFEFF" +
      [
        headers.join(";"),
        ...csvRows.map((r) => r.join(";")),
        "",
        `"TOTALES";"";"";"${valorMetrica(agregados?.totalRegistros)} registros";"Int: ${valorMetrica(agregados?.totalInternos)} / Ext: ${valorMetrica(agregados?.totalExternos)}";"";"";"";"";"";"";"";"";"";"${valorMetrica(agregados?.totalActivosMovilizados)} activos (${valorMetrica(agregados?.totalActivosNoRetornados)} sin retorno)";"";"";"";"";"";"Completados: ${valorMetrica(agregados?.totalCompletados)} / Afuera: ${valorMetrica(agregados?.totalAfuera)} / Anulados: ${valorMetrica(agregados?.totalAnulados)} / Promedio: ${valorMetrica(agregados?.duracionPromedioMinutos)} min";""`,
      ].join("\r\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `bitacora-porteria-${fechaDesde || "inicio"}_${fechaHasta || "fin"}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Archivo Excel (CSV) descargado.")
  }

  const isLoading =
    reportePaginadoQuery.isLoading || reportePaginadoQuery.isFetching
  const isLoadingMetricas = reporteQuery.isLoading || reporteQuery.isFetching

  return (
    <PageShell
      size="full"
      padding="compact"
      layout="scroll"
      className="gap-4 pb-8 [&>*]:shrink-0"
    >
      {/* 1. Encabezado de la Interfaz con Botón de Imprimir Reporte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-xs">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Bitácora de Portería
            </h1>
            <p className="text-xs text-muted-foreground">
              Consulta interactiva y filtrado de salidas, llegadas, personal interno, visitas externas, rutas y activos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              void reportePaginadoQuery.refetch()
              void reporteQuery.refetch()
            }}
            disabled={isLoading || isLoadingMetricas}
            className="h-9 text-xs gap-1.5 cursor-pointer"
            title="Volver a consultar los datos"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportarCsv}
            disabled={filasExportar.length === 0}
            className="h-9 text-xs gap-1.5 cursor-pointer"
            title="Exportar la tabla filtrada a Excel (CSV)"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            Excel
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDescargarPdf}
            disabled={isPdfLoading}
            className="h-9 text-xs gap-1.5 cursor-pointer"
            title="Descargar el reporte en PDF"
          >
            <FileDown className="h-3.5 w-3.5 text-rose-600" />
            PDF
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleImprimirReporte}
            disabled={isPdfLoading}
            className="h-9 text-xs gap-1.5 font-medium cursor-pointer"
            title="Abrir el reporte oficial listo para imprimir"
          >
            {isPdfLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Printer className="h-3.5 w-3.5" />
            )}
            Imprimir
          </Button>
        </div>
      </div>

      {/* 2. Tarjetas de Métricas Resumen — exclusivamente agregados de /reporte */}
      <div
        data-testid="metricas-bitacora-porteria"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        aria-busy={isLoadingMetricas}
      >
        <Card className="border-border/60 shadow-2xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                Total Registros
              </span>
              <p className="text-lg font-bold text-foreground leading-tight">
                {valorMetrica(agregados?.totalRegistros)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-2xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                Internos / Externos
              </span>
              <p className="text-lg font-bold text-foreground leading-tight">
                {valorMetrica(agregados?.totalInternos)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  /
                </span>{" "}
                <span className="text-purple-600 dark:text-purple-400">
                  {valorMetrica(agregados?.totalExternos)}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-2xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                Afuera Ahora
              </span>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400 leading-tight">
                {valorMetrica(agregados?.totalAfuera)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-2xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                Completados
              </span>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                {valorMetrica(agregados?.totalCompletados)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Anulados: {valorMetrica(agregados?.totalAnulados)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-2xs col-span-2 sm:col-span-1">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              {metricas && metricas.duracionPromedioMinutos > 0 ? (
                <Timer className="h-4 w-4" />
              ) : (
                <Package className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                Activos Movilizados
              </span>
              <p className="text-lg font-bold text-foreground leading-tight">
                {valorMetrica(agregados?.totalActivosMovilizados)}
                {metricas && metricas.totalActivosNoRetornados > 0 && (
                  <span className="ml-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    ({valorMetrica(agregados?.totalActivosNoRetornados)} pend.)
                  </span>
                )}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Duración promedio: {valorMetrica(agregados?.duracionPromedioMinutos)} min
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Barra Interactiva de Filtros */}
      <ReporteBitacoraPorteriaFiltrosBar
        searchQuery={searchQuery}
        onSearchQueryChange={handleBusquedaChange}
        empleadoId={empleadoId}
        onEmpleadoChange={handleEmpleadoChange}
        activoId={activoId}
        onActivoChange={handleActivoChange}
        fechaDesde={fechaDesde}
        onFechaDesdeChange={handleFechaDesdeChange}
        fechaHasta={fechaHasta}
        onFechaHastaChange={handleFechaHastaChange}
        estado={estado}
        onEstadoChange={handleEstadoChange}
        tipoPase={tipoPase}
        onTipoPaseChange={handleTipoPaseChange}
        onLimpiarFiltros={handleLimpiarFiltros}
      />

      {/* 4. Estados de Error: paginación y agregados se recuperan por separado */}
      {reportePaginadoQuery.isError && (
        <div
          role="alert"
          aria-busy="false"
          className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                Error al cargar la bitácora de portería
              </p>
              <p className="text-xs text-destructive/90">
                {getErrorMessage(reportePaginadoQuery.error)}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void reportePaginadoQuery.refetch()}
            className="gap-1.5 ml-4 text-xs h-8 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar bitácora
          </Button>
        </div>
      )}

      {reporteQuery.isError && (
        <div
          role="alert"
          aria-busy="false"
          className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                Error al cargar los agregados de la bitácora
              </p>
              <p className="text-xs text-destructive/90">
                {getErrorMessage(reporteQuery.error)}
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
            Reintentar agregados
          </Button>
        </div>
      )}

      {/* 5. Tabla Interactiva de Bitácora con Paginación y Modal de Detalle */}
      <ReporteBitacoraPorteriaTable
        filas={reportePaginadoQuery.data?.content ?? []}
        page={page}
        size={size}
        totalElements={reportePaginadoQuery.data?.totalElements ?? 0}
        totalPages={reportePaginadoQuery.data?.totalPages ?? 0}
        onPageChange={setPage}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        isError={reportePaginadoQuery.isError}
      />
    </PageShell>
  )
}

export default ReporteBitacoraPorteriaPage

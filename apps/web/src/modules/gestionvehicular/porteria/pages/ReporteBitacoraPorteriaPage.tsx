import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  Printer,
  RefreshCw,
  Timer,
  Users,
} from "lucide-react"
import { toast } from "sonner"

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
  BitacoraPorteriaItem,
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

  const apiParams = useMemo<ReporteBitacoraPorteriaFiltros>(() => {
    return {
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
  }, [empleadoId, activoId, estado, tipoPase, fechaDesde, fechaHasta])

  const reporteQuery = useQuery(porteriaQueries.reporte(apiParams))

  const handleLimpiarFiltros = () => {
    setSearchQuery("")
    setEmpleadoId("")
    setActivoId("")
    setEstado("TODOS")
    setTipoPase("TODOS")
    setFechaDesde(getPrimerDiaMes())
    setFechaHasta(getFechaActual())
  }

  // Filtrado instantáneo por texto y métricas dinámicas
  const { filas, metricas } = useMemo(() => {
    const rawItems: BitacoraPorteriaItem[] = reporteQuery.data?.items ?? []
    const q = debouncedSearch.trim().toLowerCase()

    const filtered = q
      ? rawItems.filter((item) =>
          [
            item.numero,
            item.empleadoNombre,
            item.empleadoCodigo,
            item.empleadoArea,
            item.empleadoCargo,
            item.personaExterna,
            item.placaExterna,
            item.vehiculoPlaca,
            item.vehiculoCodigo,
            item.vehiculoNombre,
            item.activosResumen,
            item.rutaTexto,
            item.origenUbicacionNombre,
            item.destinoUbicacionNombre,
            item.destinoOtro,
            item.guardiaSalidaNombre,
            item.guardiaLlegadaNombre,
            item.observacionSalida,
            item.observacionLlegada,
            item.observacionesConsolidadas,
            item.estado,
          ]
            .filter(Boolean)
            .some((val) => String(val).toLowerCase().includes(q))
        )
      : rawItems

    let internos = 0
    let externos = 0
    let afuera = 0
    let completados = 0
    let anulados = 0
    let totalActivos = 0
    let activosNoRetornados = 0
    let sumaDuracion = 0
    let conDuracion = 0

    for (const item of filtered) {
      if (item.esExterno) externos++
      else internos++

      if (item.estado === "AFUERA") afuera++
      else if (item.estado === "COMPLETADO") completados++
      else if (item.estado === "ANULADO") anulados++

      totalActivos += item.totalActivos ?? (item.activos?.length || 0)
      activosNoRetornados += item.activosPendientesRetorno ?? 0

      if (item.duracionMinutos != null && item.duracionMinutos >= 0) {
        sumaDuracion += item.duracionMinutos
        conDuracion++
      }
    }

    const promedioMin =
      conDuracion > 0 ? Math.round(sumaDuracion / conDuracion) : 0

    return {
      filas: filtered,
      metricas: {
        total: filtered.length,
        internos,
        externos,
        afuera,
        completados,
        anulados,
        totalActivos,
        activosNoRetornados,
        promedioMin,
      },
    }
  }, [reporteQuery.data?.items, debouncedSearch])

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
      const message =
        err instanceof Error ? err.message : "Error al generar el reporte PDF"
      toast.error(`No se pudo abrir el reporte: ${message}`)
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
      const message =
        err instanceof Error
          ? err.message
          : "Error al descargar el PDF en el servidor"
      toast.error(`No se pudo descargar el PDF: ${message}`)
    } finally {
      setIsPdfLoading(false)
    }
  }

  // Exportar a Excel (CSV UTF-8)
  const handleExportarCsv = () => {
    if (filas.length === 0) {
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

    const csvRows = filas.map((f) => [
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
        `"TOTALES";"";"";"${metricas.total} registros";"Int: ${metricas.internos} / Ext: ${metricas.externos}";"";"";"";"";"";"";"";"";"";"${metricas.totalActivos} activos";"";"";"";"";"";"Completados: ${metricas.completados} / Afuera: ${metricas.afuera}";""`,
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

  const isLoading = reporteQuery.isLoading || reporteQuery.isFetching

  return (
    <PageShell
      size="full"
      padding="compact"
      layout="scroll"
      className="space-y-4 pb-8"
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

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void reporteQuery.refetch()}
            disabled={isLoading}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleImprimirReporte}
            disabled={isPdfLoading}
            className="h-8 text-xs gap-1.5 font-medium cursor-pointer"
          >
            {isPdfLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Printer className="h-3.5 w-3.5" />
            )}
            Imprimir Reporte
          </Button>
        </div>
      </div>

      {/* 2. Tarjetas de Métricas Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
                {metricas.total}
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
                {metricas.internos}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  /
                </span>{" "}
                <span className="text-purple-600 dark:text-purple-400">
                  {metricas.externos}
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
                {metricas.afuera}
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
                {metricas.completados}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-2xs col-span-2 sm:col-span-1">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              {metricas.promedioMin > 0 ? (
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
                {metricas.totalActivos}
                {metricas.activosNoRetornados > 0 && (
                  <span className="ml-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    ({metricas.activosNoRetornados} pend.)
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Barra Interactiva de Filtros */}
      <ReporteBitacoraPorteriaFiltrosBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        empleadoId={empleadoId}
        onEmpleadoChange={setEmpleadoId}
        activoId={activoId}
        onActivoChange={(id) => setActivoId(id)}
        fechaDesde={fechaDesde}
        onFechaDesdeChange={setFechaDesde}
        fechaHasta={fechaHasta}
        onFechaHastaChange={setFechaHasta}
        estado={estado}
        onEstadoChange={setEstado}
        tipoPase={tipoPase}
        onTipoPaseChange={setTipoPase}
        onLimpiarFiltros={handleLimpiarFiltros}
        onImprimirReporte={handleImprimirReporte}
        onDescargarPdf={handleDescargarPdf}
        onExportarCsv={handleExportarCsv}
        isLoading={isLoading}
        isPdfLoading={isPdfLoading}
        hasData={filas.length > 0}
      />

      {/* 4. Estado de Error */}
      {reporteQuery.error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                Error al cargar la bitácora de portería
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

      {/* 5. Tabla Interactiva de Bitácora con Paginación y Modal de Detalle */}
      <ReporteBitacoraPorteriaTable filas={filas} isLoading={isLoading} />
    </PageShell>
  )
}

export default ReporteBitacoraPorteriaPage

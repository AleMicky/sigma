import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  RefreshCw,
  ShieldCheck,
  Timer,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { PageShell } from "@/shared/components/page-shell"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

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
import {
  ReporteBitacoraPorteriaFiltrosBar,
  type VehiculoPorteriaMetaInfo,
} from "../components/ReporteBitacoraPorteriaFiltrosBar"
import { ReporteBitacoraPorteriaTable } from "../components/ReporteBitacoraPorteriaTable"

const MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
]

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

function formatPeriodoMesAnio(
  fechaDesdeStr: string,
  fechaHastaStr: string
): { mes: string; anio: number } {
  try {
    const dDesde = new Date(`${fechaDesdeStr}T00:00:00`)
    const dHasta = new Date(`${fechaHastaStr}T00:00:00`)
    const anio = dDesde.getFullYear() || new Date().getFullYear()

    if (dDesde.getMonth() === dHasta.getMonth()) {
      return { mes: MESES[dDesde.getMonth()] || "ACTUAL", anio }
    }
    return {
      mes: `${MESES[dDesde.getMonth()] || ""} - ${MESES[dHasta.getMonth()] || ""}`,
      anio,
    }
  } catch {
    return { mes: "ACTUAL", anio: new Date().getFullYear() }
  }
}

export function ReporteBitacoraPorteriaPage() {
  // Filtros en barra
  const [activoId, setActivoId] = useState<string>("")
  const [placaSeleccionada, setPlacaSeleccionada] = useState<string | null>(null)
  const [vehiculoMeta, setVehiculoMeta] = useState<VehiculoPorteriaMetaInfo | null>(
    null
  )
  const [fechaDesde, setFechaDesde] = useState<string>(getPrimerDiaMes())
  const [fechaHasta, setFechaHasta] = useState<string>(getFechaActual())
  const [estado, setEstado] = useState<string>("TODOS")
  const [tipoPase, setTipoPase] = useState<string>("TODOS")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Filtros aplicados a la consulta
  const [filtrosActivos, setFiltrosActivos] = useState<{
    activoId: string
    fechaDesde: string
    fechaHasta: string
    estado: string
    tipoPase: string
  } | null>(() => ({
    activoId: "",
    fechaDesde: getPrimerDiaMes(),
    fechaHasta: getFechaActual(),
    estado: "TODOS",
    tipoPase: "TODOS",
  }))

  const apiParams = useMemo<ReporteBitacoraPorteriaFiltros | undefined>(() => {
    if (!filtrosActivos) return undefined
    return {
      activoId: filtrosActivos.activoId || undefined,
      estado:
        filtrosActivos.estado !== "TODOS"
          ? (filtrosActivos.estado as EstadoRegistroPorteria)
          : undefined,
      esExterno:
        filtrosActivos.tipoPase === "EXTERNO"
          ? true
          : filtrosActivos.tipoPase === "INTERNO"
            ? false
            : undefined,
      fechaDesde: filtrosActivos.fechaDesde || undefined,
      fechaHasta: filtrosActivos.fechaHasta || undefined,
    }
  }, [filtrosActivos])

  const reporteQuery = useQuery({
    ...porteriaQueries.reporte(apiParams),
    enabled: Boolean(filtrosActivos?.fechaDesde && filtrosActivos?.fechaHasta),
  })

  const handleActivoChange = (
    id: string,
    placa?: string | null,
    meta?: VehiculoPorteriaMetaInfo | null
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
        tipoPase: prev?.tipoPase ?? tipoPase,
      }))
    }
  }

  // Filtrado rápido en memoria y cálculo de métricas
  const { filas, metricas } = useMemo(() => {
    const rawItems: BitacoraPorteriaItem[] = reporteQuery.data?.items ?? []
    const q = searchQuery.trim().toLowerCase()

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
  }, [reporteQuery.data?.items, searchQuery])

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
      tipoPase,
    })
    void reporteQuery.refetch()
    toast.success("Bitácora de portería consultada.")
  }

  const [isPdfLoading, setIsPdfLoading] = useState(false)

  const handleDescargarPdf = async () => {
    if (!filtrosActivos?.fechaDesde || !filtrosActivos?.fechaHasta) {
      toast.error("Seleccione un rango de fechas para generar el reporte.")
      return
    }

    try {
      setIsPdfLoading(true)
      toast.info("Generando reporte oficial en PDF desde el servidor...")
      await descargarReporteBitacoraPorteriaPdf({
        ...apiParams,
        search: searchQuery.trim() || undefined,
      })
      toast.success("Reporte oficial en PDF descargado exitosamente.")
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

  const handleAbrirPdf = async () => {
    if (!filtrosActivos?.fechaDesde || !filtrosActivos?.fechaHasta) {
      toast.error("Seleccione un rango de fechas.")
      return
    }

    try {
      setIsPdfLoading(true)
      toast.info("Abriendo reporte en PDF desde el servidor...")
      await abrirReporteBitacoraPorteriaPdf({
        ...apiParams,
        search: searchQuery.trim() || undefined,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al abrir el PDF"
      toast.error(`No se pudo abrir el PDF: ${message}`)
    } finally {
      setIsPdfLoading(false)
    }
  }

  const handleImprimir = () => {
    if (filas.length === 0) {
      toast.info("No hay registros en el reporte para imprimir.")
      return
    }
    window.print()
  }

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
      "TIPO_REGISTRO",
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
    link.download = `bitacora-porteria-${fechaDesde}_${fechaHasta}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Archivo Excel (CSV) descargado.")
  }

  const activoTexto = useMemo(() => {
    if (!filtrosActivos?.activoId) {
      return "TODOS LOS VEHÍCULOS Y ACTIVOS"
    }
    if (placaSeleccionada) {
      return `PLACA: ${placaSeleccionada} ${vehiculoMeta?.modelo ? `(${vehiculoMeta.modelo})` : ""}`
    }
    return vehiculoMeta?.nombre || "ACTIVO SELECCIONADO"
  }, [filtrosActivos?.activoId, placaSeleccionada, vehiculoMeta])

  const tipoTexto = useMemo(() => {
    if (filtrosActivos?.tipoPase === "INTERNO") return "SOLO PERSONAL INTERNO"
    if (filtrosActivos?.tipoPase === "EXTERNO") return "SOLO VISITAS / EXTERNOS"
    return "INTERNOS Y EXTERNOS"
  }, [filtrosActivos?.tipoPase])

  const { mes, anio } = useMemo(
    () => formatPeriodoMesAnio(fechaDesde, fechaHasta),
    [fechaDesde, fechaHasta]
  )

  const isLoading = reporteQuery.isLoading || reporteQuery.isFetching

  return (
    <PageShell
      size="full"
      padding="compact"
      layout="scroll"
      className="space-y-3 pb-10"
    >
      {/* ========================================================= */}
      {/* 1. ENCABEZADO DE LA PÁGINA (Oculto al imprimir)           */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5 print:hidden">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-2xs">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Reporte de Bitácora de Control de Portería
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 font-semibold py-0"
              >
                Formulario Oficial GV-PRT-01
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              ENDE CORANI • Registro cronológico completo de salidas, llegadas, personal interno/externo, rutas, guardias y retorno de activos
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BARRA DE FILTROS (Oculto al imprimir)                  */}
      {/* ========================================================= */}
      <ReporteBitacoraPorteriaFiltrosBar
        activoId={activoId}
        onActivoChange={handleActivoChange}
        fechaDesde={fechaDesde}
        onFechaDesdeChange={setFechaDesde}
        fechaHasta={fechaHasta}
        onFechaHastaChange={setFechaHasta}
        estado={estado}
        onEstadoChange={setEstado}
        tipoPase={tipoPase}
        onTipoPaseChange={setTipoPase}
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
      {/* 3. RESUMEN DE MÉTRICAS RÁPIDAS (Oculto al imprimir)       */}
      {/* ========================================================= */}
      {filtrosActivos && !isLoading && filas.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 print:hidden">
          {/* Total Registros */}
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border/60 bg-card shadow-2xs">
            <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider leading-none">
                Total Movimientos
              </span>
              <p className="text-base font-bold text-foreground leading-tight mt-0.5">
                {metricas.total}
              </p>
            </div>
          </div>

          {/* Internos vs Externos */}
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border/60 bg-card shadow-2xs">
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider leading-none">
                Internos / Externos
              </span>
              <p className="text-base font-bold text-foreground leading-tight mt-0.5">
                {metricas.internos}{" "}
                <span className="text-xs font-normal text-muted-foreground">/</span>{" "}
                <span className="text-purple-600 dark:text-purple-400">
                  {metricas.externos}
                </span>
              </p>
            </div>
          </div>

          {/* Completados */}
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border/60 bg-card shadow-2xs">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider leading-none">
                Completados / Afuera
              </span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">
                {metricas.completados}{" "}
                <span className="text-xs font-normal text-muted-foreground">/</span>{" "}
                <span className="text-amber-600 dark:text-amber-400">
                  {metricas.afuera}
                </span>
              </p>
            </div>
          </div>

          {/* Activos Movilizados */}
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border/60 bg-card shadow-2xs">
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Package className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider leading-none">
                Activos / Ítems
              </span>
              <p className="text-base font-bold text-foreground leading-tight mt-0.5">
                {metricas.totalActivos}
                {metricas.activosNoRetornados > 0 && (
                  <span className="ml-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    ({metricas.activosNoRetornados} pend.)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Tiempo Promedio */}
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border/60 bg-card shadow-2xs">
            <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Timer className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider leading-none">
                Tiempo Promedio
              </span>
              <p className="text-base font-bold text-foreground leading-tight mt-0.5">
                {metricas.promedioMin > 0 ? `${metricas.promedioMin} min` : "—"}
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
                Error al consultar la bitácora de portería
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
              <Clock className="h-8 w-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="font-bold text-sm text-foreground">
                Seleccione Rango de Fechas y Filtros
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Utilice la barra superior para elegir el período a consultar y opcionalmente filtrar por vehículo, estado o tipo de pase. A continuación presione{" "}
                <strong>Consultar</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* 7. PLANILLA OFICIAL DE BITÁCORA (Imprimible y visible)    */}
      {/* ========================================================= */}
      {filtrosActivos && !isLoading && (
        <div id="bitacora-porteria-imprimible" className="space-y-4">
          <ReporteBitacoraPorteriaTable
            filas={filas}
            activoTexto={activoTexto}
            tipoTexto={tipoTexto}
            estadoTexto={filtrosActivos.estado}
            ubicacion="CORANI"
            anio={anio}
            mes={mes}
            periodoTexto={`${filtrosActivos.fechaDesde} al ${filtrosActivos.fechaHasta}`}
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
          aside,
          nav,
          header,
          .print\\:hidden {
            display: none !important;
          }
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

export default ReporteBitacoraPorteriaPage

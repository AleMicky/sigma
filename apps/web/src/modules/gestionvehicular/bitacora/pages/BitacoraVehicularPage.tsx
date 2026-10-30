import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Car,
  Fuel,
  Gauge,
  RefreshCw,
  Route,
} from "lucide-react"
import { toast } from "sonner"

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import { bitacoraQueries } from "@/modules/gestionvehicular/bitacora/api/bitacora.queries"
import {
  abrirBitacoraConsolidadaPdf,
  descargarBitacoraConsolidadaPdf,
  type BitacoraConsolidadaItem,
} from "@/modules/gestionvehicular/bitacora/api/bitacora.service"
import {
  ReporteBitacoraVehicularTable,
  type FilaReporteBitacoraSalida,
} from "@/modules/gestionvehicular/salida-vehicular/components/ReporteBitacoraVehicularTable"
import {
  ReporteSalidasFiltrosBar,
  type VehiculoMetaInfo,
} from "@/modules/gestionvehicular/salida-vehicular/components/ReporteSalidasFiltrosBar"
import { PageShell } from "@/shared/components/page-shell"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

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

function formatPeriodoMesAnio(fechaDesdeStr: string, fechaHastaStr: string): { mes: string; anio: number } {
  try {
    const dDesde = new Date(`${fechaDesdeStr}T00:00:00`)
    const dHasta = new Date(`${fechaHastaStr}T00:00:00`)
    const anio = dDesde.getFullYear() || new Date().getFullYear()

    if (dDesde.getMonth() === dHasta.getMonth()) {
      return { mes: MESES[dDesde.getMonth()] || "OCTUBRE", anio }
    }
    return {
      mes: `${MESES[dDesde.getMonth()] || ""} - ${MESES[dHasta.getMonth()] || ""}`,
      anio,
    }
  } catch {
    return { mes: "OCTUBRE", anio: 2026 }
  }
}

export function BitacoraVehicularPage() {
  // Filtros de entrada
  const [activoId, setActivoId] = useState<string>("")
  const [placaSeleccionada, setPlacaSeleccionada] = useState<string | null>(null)
  const [vehiculoMeta, setVehiculoMeta] = useState<VehiculoMetaInfo | null>(null)
  const [fechaDesde, setFechaDesde] = useState<string>(getPrimerDiaMes())
  const [fechaHasta, setFechaHasta] = useState<string>(getFechaActual())
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Filtros aplicados a las queries: inicializamos por defecto con el mes actual
  const [filtrosActivos, setFiltrosActivos] = useState<{
    activoId: string
    fechaDesde: string
    fechaHasta: string
  } | null>(() => ({
    activoId: "",
    fechaDesde: getPrimerDiaMes(),
    fechaHasta: getFechaActual(),
  }))

  // Consulta 1: Bitácora consolidada desde el backend
  //   - Fuente A: Bitácora de salidas vehiculares (SalidaVehicular + eventos de odómetro)
  //   - Fuente B: Solicitudes vehiculares (SolicitudVehicular → AsignacionVehicular → ViajeVehicular)
  //   El combustible ya viene asociado a cada fila desde la API.
  const reporteQuery = useQuery({
    ...bitacoraQueries.consolidado(
      filtrosActivos?.fechaDesde && filtrosActivos?.fechaHasta
        ? {
            activoId: filtrosActivos.activoId || undefined,
            fechaInicio: filtrosActivos.fechaDesde,
            fechaFin: filtrosActivos.fechaHasta,
          }
        : null
    ),
  })

  // Consulta 2: Datos detallados del activo/vehículo (solo si hay vehículo específico)
  const activoDetailQuery = useQuery({
    ...activoQueries.detail(filtrosActivos?.activoId ?? ""),
    enabled: Boolean(filtrosActivos?.activoId),
  })

  // Metadatos consolidados del vehículo
  const datosVehiculo = useMemo(() => {
    if (!filtrosActivos?.activoId) {
      return {
        tipoVehiculo: "TODOS LOS VEHÍCULOS (CONSOLIDADO)",
        placa: "TODAS LAS PLACAS",
        responsable: "VARIOS CONDUCTORES",
        ubicacion: "CORANI",
      }
    }

    const act = activoDetailQuery.data
    const placa =
      placaSeleccionada ||
      vehiculoMeta?.placa ||
      (act as { placa?: string })?.placa ||
      "S/P"

    const marca = vehiculoMeta?.marca || (act as { marca?: string })?.marca || ""
    const modelo = vehiculoMeta?.modelo || (act as { modelo?: string })?.modelo || ""
    const tipo =
      vehiculoMeta?.tipoVehiculo ||
      (act as { tipoActivo?: { nombre?: string } })?.tipoActivo?.nombre ||
      "CAMIONETA"

    const tipoVehiculoCompuesto = [tipo, marca, modelo].filter(Boolean).join(" ").trim() || "CAMIONETA TOYOTA HILUX"
    const responsable =
      (act as { responsable?: { nombreCompleto?: string } })?.responsable?.nombreCompleto ||
      vehiculoMeta?.nombre ||
      ""
    const ubicacion =
      (act as { ubicacion?: { nombre?: string } })?.ubicacion?.nombre || "CORANI"

    return {
      tipoVehiculo: tipoVehiculoCompuesto,
      placa,
      responsable,
      ubicacion,
    }
  }, [filtrosActivos?.activoId, activoDetailQuery.data, placaSeleccionada, vehiculoMeta])

  // Mapear filas de la API (salidas + solicitudes) al formato oficial de la planilla
  const { filas, totalesMetricas } = useMemo(() => {
    const items: BitacoraConsolidadaItem[] = reporteQuery.data?.items ?? []

    const rows: FilaReporteBitacoraSalida[] = items.map((item) => {
      const fecha = item.fecha ?? ""
      const fechaObj = new Date(fecha)
      const fechaValida = !Number.isNaN(fechaObj.getTime())
      const dia = item.dia ?? (fechaValida ? fechaObj.getDate() : 1)
      const fechaFormateada =
        item.fechaFormateada ||
        (fechaValida
          ? fechaObj.toLocaleDateString("es-BO", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "-")

      const litros =
        item.combustibleLitros != null && !Number.isNaN(Number(item.combustibleLitros))
          ? Number(item.combustibleLitros)
          : null

      return {
        id: item.id,
        numero: item.numero || "-",
        fecha,
        dia,
        fechaFormateada,
        descripcionActividad: item.descripcionActividad || "-",
        kmSalida: item.kmSalida != null ? Number(item.kmSalida) : null,
        kmLlegada: item.kmLlegada != null ? Number(item.kmLlegada) : null,
        kmRecorrido: item.kmRecorrido != null ? Number(item.kmRecorrido) : null,
        combustibleTexto: item.combustibleTexto || "-",
        combustibleLitros: litros,
        combustibleFactura: item.combustibleFactura || null,
        conductorNombre: item.conductorNombre || "-",
        observaciones: item.observaciones || "-",
        estado: item.estado || "",
        vehiculoPlaca: item.vehiculoPlaca || item.vehiculoCodigo || null,
        vehiculoCodigo: item.vehiculoCodigo || null,
      }
    })

    // Orden cronológico ascendente (por día / fecha) idéntico a la libreta física
    rows.sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    )

    // Filtro por texto si el usuario escribe en la barra de búsqueda
    const filteredRows = searchQuery.trim()
      ? rows.filter((r) => {
          const q = searchQuery.toLowerCase()
          return (
            r.descripcionActividad.toLowerCase().includes(q) ||
            r.conductorNombre.toLowerCase().includes(q) ||
            r.observaciones.toLowerCase().includes(q) ||
            r.numero.toLowerCase().includes(q) ||
            (r.vehiculoPlaca && r.vehiculoPlaca.toLowerCase().includes(q)) ||
            String(r.dia).includes(q)
          )
        })
      : rows

    // Totales calculados
    const totalKm = filteredRows.reduce((acc, r) => acc + (r.kmRecorrido ?? 0), 0)
    const totalLitros = filteredRows.reduce(
      (acc, r) => acc + (r.combustibleLitros ?? 0),
      0
    )
    const salidasConRecorrido = filteredRows.filter((r) => (r.kmRecorrido ?? 0) > 0).length
    const promedioKmPorSalida =
      salidasConRecorrido > 0 ? Math.round(totalKm / salidasConRecorrido) : 0

    return {
      filas: filteredRows,
      totalesMetricas: {
        totalSalidas: filteredRows.length,
        totalKm,
        totalLitros,
        promedioKmPorSalida,
      },
    }
  }, [reporteQuery.data?.items, searchQuery])

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
      setFiltrosActivos({
        activoId: id,
        fechaDesde,
        fechaHasta,
      })
    }
  }

  // Manejo de consulta manual
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
    })
    void reporteQuery.refetch()
    if (activoId) {
      void activoDetailQuery.refetch()
    }
    toast.success(
      activoId
        ? "Bitácora del vehículo consultada."
        : "Bitácora general de todos los vehículos consultada."
    )
  }

  // Estado de carga del PDF generado en el Backend API
  const [isPdfLoading, setIsPdfLoading] = useState(false)

  // Descargar PDF generado por el Backend (JasperReports en Spring Boot API)
  const handleDescargarPdf = async () => {
    if (!filtrosActivos?.fechaDesde || !filtrosActivos?.fechaHasta) {
      toast.error("Seleccione un rango de fechas para generar el reporte.")
      return
    }

    try {
      setIsPdfLoading(true)
      toast.info("Generando reporte oficial en PDF desde el servidor...")
      await descargarBitacoraConsolidadaPdf(
        {
          activoId: filtrosActivos.activoId || undefined,
          fechaInicio: filtrosActivos.fechaDesde,
          fechaFin: filtrosActivos.fechaHasta,
          search: searchQuery || undefined,
        },
        filtrosActivos.activoId ? datosVehiculo.placa : "todos"
      )
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

  // Abrir PDF oficial en nueva pestaña generado por el Backend API
  const handleAbrirPdf = async () => {
    if (!filtrosActivos?.fechaDesde || !filtrosActivos?.fechaHasta) {
      toast.error("Seleccione un rango de fechas.")
      return
    }

    try {
      setIsPdfLoading(true)
      toast.info("Abriendo reporte en PDF desde el servidor...")
      await abrirBitacoraConsolidadaPdf({
        activoId: filtrosActivos.activoId || undefined,
        fechaInicio: filtrosActivos.fechaDesde,
        fechaFin: filtrosActivos.fechaHasta,
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

  // Imprimir formulario oficial (window.print con estilos CSS landscape)
  const handleImprimir = () => {
    if (filas.length === 0) {
      toast.info("No hay registros en el reporte para imprimir.")
      return
    }
    window.print()
  }

  // Exportar a Excel (CSV con BOM)
  const handleExportarCsv = () => {
    if (filas.length === 0) {
      toast.info("No hay datos para exportar.")
      return
    }

    const headers = [
      "DIA",
      "FECHA",
      "FOLIO",
      "DESCRIPCION DE ACTIVIDAD",
      "KM. SALIDA",
      "KM. LLEGADA",
      "KM. RECORRIDO",
      "NRO. FACTURA / LITROS COMBUSTIBLE",
      "CONDUCTOR",
      "OBSERVACIONES / COMENTARIOS",
    ]

    const csvRows = filas.map((f) => [
      f.dia,
      `"${f.fechaFormateada}"`,
      `"${f.numero}"`,
      `"${f.descripcionActividad.replace(/"/g, '""')}"`,
      f.kmSalida ?? "",
      f.kmLlegada ?? "",
      f.kmRecorrido ?? "",
      `"${f.combustibleTexto.replace(/"/g, '""')}"`,
      `"${f.conductorNombre.replace(/"/g, '""')}"`,
      `"${f.observaciones.replace(/"/g, '""')}"`,
    ])

    const csvContent =
      "\uFEFF" +
      [
        headers.join(";"),
        ...csvRows.map((r) => r.join(";")),
        "",
        `"TOTALES";"";"${totalesMetricas.totalSalidas} salidas";"";"";"";"${totalesMetricas.totalKm} km";"${totalesMetricas.totalLitros} lts";"";""`,
      ].join("\r\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    const cleanPlaca = (datosVehiculo.placa || "vehiculo").replace(/[^a-zA-Z0-9-]/g, "")
    link.download = `bitacora-vehiculo-${cleanPlaca}-${fechaDesde}_${fechaHasta}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Archivo Excel (CSV) descargado.")
  }

  const { mes, anio } = useMemo(
    () => formatPeriodoMesAnio(fechaDesde, fechaHasta),
    [fechaDesde, fechaHasta]
  )

  const isLoading =
    reporteQuery.isLoading ||
    activoDetailQuery.isLoading ||
    reporteQuery.isFetching

  return (
    <PageShell size="full" padding="compact" layout="scroll" className="space-y-3 pb-10">
      {/* ========================================================= */}
      {/* 1. ENCABEZADO DE LA PÁGINA (Oculto al imprimir)           */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5 print:hidden">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-2xs">
            <BookOpen className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Reporte de Bitácora de Vehículos
              </h1>
              <Badge variant="outline" className="text-[10px] bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 font-semibold py-0">
                Formulario Oficial GA-IN7-04
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              ENDE CORANI • Control de actividades, kilometraje y combustible según libreta física
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BARRA DE FILTROS (Vehículo + Fechas) (Oculto print)    */}
      {/* ========================================================= */}
      <ReporteSalidasFiltrosBar
        activoId={activoId}
        onActivoChange={handleActivoChange}
        fechaDesde={fechaDesde}
        onFechaDesdeChange={setFechaDesde}
        fechaHasta={fechaHasta}
        onFechaHastaChange={setFechaHasta}
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
        totalSalidas={totalesMetricas.totalSalidas}
        placaSeleccionada={datosVehiculo.placa !== "S/P" ? datosVehiculo.placa : null}
      />

      {/* ========================================================= */}
      {/* 3. RESUMEN DE MÉTRICAS RÁPIDAS COMPACTO (Oculto print)    */}
      {/* ========================================================= */}
      {filtrosActivos && !isLoading && filas.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 print:hidden">
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border/60 bg-card shadow-2xs">
            <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
              <Route className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider leading-none">
                Salidas
              </span>
              <p className="text-base font-bold text-foreground leading-tight mt-0.5">
                {totalesMetricas.totalSalidas} viajes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border/60 bg-card shadow-2xs">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Gauge className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider leading-none">
                Recorrido Total
              </span>
              <p className="text-base font-bold text-primary leading-tight mt-0.5">
                {totalesMetricas.totalKm.toLocaleString()} km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border/60 bg-card shadow-2xs">
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Fuel className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider leading-none">
                Combustible
              </span>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400 leading-tight mt-0.5">
                {totalesMetricas.totalLitros > 0 ? `${totalesMetricas.totalLitros.toFixed(1)} L` : "0 L"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border/60 bg-card shadow-2xs">
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider leading-none">
                Promedio
              </span>
              <p className="text-base font-bold text-foreground leading-tight mt-0.5">
                {totalesMetricas.promedioKmPorSalida.toLocaleString()} km / viaje
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
              <p className="font-semibold text-sm">Error al consultar los datos del reporte</p>
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
            onClick={() => {
              void reporteQuery.refetch()
            }}
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
          <Skeleton className="h-28 w-full rounded-xl" />
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
              <Car className="h-8 w-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="font-bold text-sm text-foreground">
                Seleccione Rango de Fechas y Filtros
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Utilice la barra superior para elegir el período a consultar y opcionalmente un vehículo de la flota (o dejarlo vacío para consultar todos). A continuación presione <strong>Consultar</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* 7. PLANILLA OFICIAL DE LA BITÁCORA (Imprimible y visible) */}
      {/* ========================================================= */}
      {filtrosActivos && !isLoading && (
        <div id="bitacora-reporte-imprimible" className="space-y-4">
          <ReporteBitacoraVehicularTable
            filas={filas}
            tipoVehiculo={datosVehiculo.tipoVehiculo}
            placa={datosVehiculo.placa}
            responsableVehiculo={datosVehiculo.responsable}
            ubicacion={datosVehiculo.ubicacion}
            anio={anio}
            mes={mes}
            periodoTexto={`${fechaDesde} al ${fechaHasta}`}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* ESTILOS DE IMPRESIÓN OFICIAL LANDSCAPE                     */}
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
          /* Formulario Bitácora */
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

export default BitacoraVehicularPage

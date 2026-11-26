import { useMemo, useState } from "react"
import { useQueries, useQuery } from "@tanstack/react-query"
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

import { vehiculoQueries } from "@/modules/gestionvehicular/vehiculo/api/vehiculo.queries"
import {
  getAtributoValorByCode,
  getPlacaFromAtributos,
} from "@/modules/gestionvehicular/vehiculo/lib/vehiculo-atributos.utils"
import { cargaCombustibleQueries } from "@/modules/gestionvehicular/carga-combustible/api/carga-combustible.queries"
import type { CargaCombustible } from "@/modules/gestionvehicular/carga-combustible/api/carga-combustible.service"
import { getErrorMessage } from "@/shared/api/errors"
import type { PageResponse } from "@/shared/types/api.types"
import { PageShell } from "@/shared/components/page-shell"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

import { salidaVehicularQueries } from "../api/salida-vehicular.queries"
import {
  descargarReporteSalidasBitacoraPdf,
  abrirReporteSalidasBitacoraPdf,
} from "../api/salida-vehicular.service"
import type { SalidaVehicular } from "../api/salida-vehicular.types"
import {
  ReporteBitacoraVehicularTable,
  type FilaReporteBitacoraSalida,
} from "../components/ReporteBitacoraVehicularTable"
import {
  ReporteSalidasFiltrosBar,
  type VehiculoMetaInfo,
} from "../components/ReporteSalidasFiltrosBar"

const CARGAS_PAGE_SIZE = 500
/** Tope defensivo para no colgar la UI si el rango tiene miles de cargas. */
const MAX_CARGAS_PAGES = 20

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

function extractPlacaFromText(descripcion?: string | null): string | null {
  if (!descripcion) return null
  try {
    const match = descripcion.match(
      /PLACA(?:\s*(?:N[°o.]+|NRO\.?|NUM\.?|#))?[:\s#.-]+([0-9A-Za-z]+(?:[\s-][0-9A-Za-z]+)?)(?:\s+(?:CHASIS|MOTOR|COLOR|MARCA|MODELO|AÑO|ANIO|TIPO)|[,;.]|\s*$)/i
    )
    if (match && match[1]) {
      const clean = match[1].replace(/[,.;-]+$/, "").trim()
      if (clean.length >= 2 && clean.length <= 20 && !clean.toUpperCase().startsWith("NO") && clean.toUpperCase() !== "NRO") {
        return clean
      }
    }
    return null
  } catch {
    return null
  }
}

function toLocalDateStr(dateInput?: string | null): string {
  if (!dateInput) return ""
  try {
    const d = new Date(dateInput)
    if (Number.isNaN(d.getTime())) {
      return dateInput.slice(0, 10)
    }
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  } catch {
    return (dateInput || "").slice(0, 10)
  }
}

export const ReportesSalidasVehicularesPage = () => {
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

  // Consulta 1: Reporte general de salidas vehiculares (soporta activoId opcional para traer todo)
  const reporteQuery = useQuery({
    ...salidaVehicularQueries.reporteGeneral({
      activoId: filtrosActivos?.activoId || undefined,
      fechaDesde: filtrosActivos?.fechaDesde ? `${filtrosActivos.fechaDesde}T00:00:00` : undefined,
      fechaHasta: filtrosActivos?.fechaHasta ? `${filtrosActivos.fechaHasta}T23:59:59` : undefined,
    }),
    enabled: Boolean(filtrosActivos?.fechaDesde && filtrosActivos?.fechaHasta),
  })

  // Consulta 2: Cargas de combustible. Se recorren todas las páginas hasta
  // `totalPages`, con tope defensivo de MAX_CARGAS_PAGES para no colgar la UI.
  const filtrosCargas = {
    activoId: filtrosActivos?.activoId || undefined,
    fechaDesde: filtrosActivos?.fechaDesde ? `${filtrosActivos.fechaDesde}T00:00:00` : undefined,
    fechaHasta: filtrosActivos?.fechaHasta ? `${filtrosActivos.fechaHasta}T23:59:59` : undefined,
  }
  const cargasPrimeraPaginaQuery = useQuery({
    ...cargaCombustibleQueries.list({
      ...filtrosCargas,
      page: 0,
      size: CARGAS_PAGE_SIZE,
    }),
    enabled: Boolean(filtrosActivos?.fechaDesde && filtrosActivos?.fechaHasta),
  })

  const paginasRestantes = useMemo(() => {
    const totalPages = cargasPrimeraPaginaQuery.data?.totalPages ?? 0
    const cantidad = Math.min(totalPages, MAX_CARGAS_PAGES) - 1
    return Array.from({ length: Math.max(cantidad, 0) }, (_, index) => index + 1)
  }, [cargasPrimeraPaginaQuery.data?.totalPages])

  const cargasPaginasQueries = useQueries({
    queries: paginasRestantes.map((page) =>
      cargaCombustibleQueries.list({
        ...filtrosCargas,
        page,
        size: CARGAS_PAGE_SIZE,
      })
    ),
  })

  const {
    cargas,
    totalCargas,
    cargasTruncadas,
    cargasIsLoading,
    cargasIsError,
    cargasError,
  } = useMemo(() => {
    const paginas = [
      cargasPrimeraPaginaQuery.data,
      ...cargasPaginasQueries.map((query) => query.data),
    ].filter((pagina): pagina is PageResponse<CargaCombustible> => Boolean(pagina))
    const totalPages = cargasPrimeraPaginaQuery.data?.totalPages ?? 0
    return {
      cargas: paginas.flatMap((pagina) => pagina.content),
      totalCargas: cargasPrimeraPaginaQuery.data?.totalElements ?? 0,
      cargasTruncadas: totalPages > MAX_CARGAS_PAGES,
      cargasIsLoading:
        cargasPrimeraPaginaQuery.isLoading ||
        cargasPrimeraPaginaQuery.isFetching ||
        cargasPaginasQueries.some((query) => query.isLoading || query.isFetching),
      cargasIsError:
        cargasPrimeraPaginaQuery.isError ||
        cargasPaginasQueries.some((query) => query.isError),
      cargasError:
        cargasPrimeraPaginaQuery.error ??
        cargasPaginasQueries.find((query) => query.error)?.error,
    }
  }, [cargasPrimeraPaginaQuery, cargasPaginasQueries])

  // Consulta 3: Datos detallados del vehículo (endpoint propio gestionvehicular)
  const vehiculoDetailQuery = useQuery({
    ...vehiculoQueries.detail(filtrosActivos?.activoId ?? ""),
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

    const veh = vehiculoDetailQuery.data
    const placa =
      getPlacaFromAtributos(veh ?? { atributos: [] }).valor ||
      placaSeleccionada ||
      vehiculoMeta?.placa ||
      "S/P"

    const marca =
      getAtributoValorByCode(veh, ["MARCA"]) || vehiculoMeta?.marca || ""
    const modelo =
      getAtributoValorByCode(veh, ["MODELO"]) || vehiculoMeta?.modelo || ""
    const tipo =
      getAtributoValorByCode(veh, ["TIPO_VEHICULO", "TIPO", "CLASE"]) ||
      vehiculoMeta?.tipoVehiculo ||
      veh?.tipoActivo?.nombre ||
      "VEHÍCULO"

    const tipoVehiculoCompuesto =
      [tipo, marca, modelo].filter(Boolean).join(" ").trim() || "VEHÍCULO"
    const responsable = vehiculoMeta?.nombre || ""
    const ubicacion = veh?.ubicacion?.nombre || "CORANI"

    return {
      tipoVehiculo: tipoVehiculoCompuesto,
      placa,
      responsable,
      ubicacion,
    }
  }, [
    filtrosActivos?.activoId,
    vehiculoDetailQuery.data,
    placaSeleccionada,
    vehiculoMeta,
  ])

  // Transformar salidas y asociar odómetros y combustible
  const { filas, totalesMetricas } = useMemo(() => {
    const rawSalidas: SalidaVehicular[] = reporteQuery.data?.items ?? []
    const isMultiVehiculo = !filtrosActivos?.activoId

    // Indexar cargas por salidaVehicularId directo y agrupar cargas no vinculadas directamente
    const cargasPorSalidaId = new Map<string, CargaCombustible[]>()
    const cargasSinSalida: CargaCombustible[] = []

    for (const c of cargas) {
      const sId = c.salidaVehicularId || c.salidaVehicular?.id
      if (sId) {
        const arr = cargasPorSalidaId.get(sId) ?? []
        arr.push(c)
        cargasPorSalidaId.set(sId, arr)
      } else {
        cargasSinSalida.push(c)
      }
    }

    // Ordenar salidas cronológicamente antes de procesar
    const sortedSalidas = [...rawSalidas].sort(
      (a, b) =>
        new Date(a.fecha || a.createdAt).getTime() -
        new Date(b.fecha || b.createdAt).getTime()
    )

    // Control para no duplicar cargas sin salida asignada en múltiples salidas del mismo día
    const cargasSinSalidaUsadas = new Set<string>()

    // Formatear filas
    const rows: FilaReporteBitacoraSalida[] = sortedSalidas.map((salida) => {
      const fechaObj = new Date(salida.fecha || salida.createdAt)
      const dia = !Number.isNaN(fechaObj.getDate()) ? fechaObj.getDate() : 1
      const fechaFormateada = !Number.isNaN(fechaObj.getTime())
        ? fechaObj.toLocaleDateString("es-BO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "-"

      // Odómetro de eventos
      const kmEvents = (salida.eventos ?? [])
        .filter((e) => typeof e.kilometraje === "number" && !Number.isNaN(e.kilometraje))
        .sort(
          (a, b) =>
            new Date(a.fechaHora || a.createdAt).getTime() -
            new Date(b.fechaHora || b.createdAt).getTime()
        )

      const salidaEvent = kmEvents.find((e) =>
        (e.tipoEvento ?? "").toUpperCase().includes("SALIDA")
      )
      const llegadaEvent = [...kmEvents]
        .reverse()
        .find((e) => (e.tipoEvento ?? "").toUpperCase().includes("LLEGADA"))

      const kmSalida =
        salidaEvent?.kilometraje != null
          ? Number(salidaEvent.kilometraje)
          : kmEvents.length > 0 && kmEvents[0].kilometraje != null
            ? Number(kmEvents[0].kilometraje)
            : null

      const kmLlegada =
        llegadaEvent?.kilometraje != null
          ? Number(llegadaEvent.kilometraje)
          : kmEvents.length > 1 && kmEvents[kmEvents.length - 1].kilometraje != null
            ? Number(kmEvents[kmEvents.length - 1].kilometraje)
            : null

      const kmRecorrido =
        kmSalida != null && kmLlegada != null && kmLlegada >= kmSalida
          ? kmLlegada - kmSalida
          : null

      // Combustible relacionado a la salida:
      // 1. Cargas explícitamente vinculadas a esta salida
      let matchingCargas = [...(cargasPorSalidaId.get(salida.id) ?? [])]

      // 2. Si no tiene cargas directas, buscar cargas sin salida asignada que coincidan en vehículo y fecha local
      if (matchingCargas.length === 0) {
        const salidaDateLocal = toLocalDateStr(salida.fecha || salida.createdAt)
        const candidatas = cargasSinSalida.filter((c) => {
          if (cargasSinSalidaUsadas.has(c.id)) return false
          const cargaDateLocal = toLocalDateStr(c.fechaCarga)
          if (!salidaDateLocal || !cargaDateLocal || salidaDateLocal !== cargaDateLocal) {
            return false
          }
          if (salida.activoId && c.activoId) {
            return c.activoId === salida.activoId
          }
          return !isMultiVehiculo
        })

        if (candidatas.length > 0) {
          matchingCargas = candidatas
          for (const cand of candidatas) {
            cargasSinSalidaUsadas.add(cand.id)
          }
        }
      }

      let combustibleTexto = "-"
      let totalLitros: number | null = null
      let facturas: string[] = []

      if (matchingCargas.length > 0) {
        totalLitros = matchingCargas.reduce(
          (acc, c) => acc + (Number(c.litros) || 0),
          0
        )
        facturas = matchingCargas
          .map((c) => c.numeroFactura?.trim())
          .filter(Boolean) as string[]

        const facStr = facturas.length > 0 ? ` / ${facturas.join(", ")}` : ""
        combustibleTexto = `${totalLitros} lts${facStr}`
      }

      // Placa identificada del vehículo
      const placaVehiculo =
        extractPlacaFromText(salida.activoDescripcion) ||
        salida.activoCodigo ||
        null

      return {
        id: salida.id,
        numero: salida.numero,
        fecha: salida.fecha || salida.createdAt,
        dia,
        fechaFormateada,
        descripcionActividad: salida.descripcionActividad || "-",
        kmSalida,
        kmLlegada,
        kmRecorrido,
        combustibleTexto,
        combustibleLitros: totalLitros,
        combustibleFactura: facturas.length > 0 ? facturas.join(", ") : null,
        conductorNombre: salida.empleadoNombre || "-",
        observaciones: salida.observaciones || "-",
        estado: salida.estado,
        vehiculoPlaca: placaVehiculo,
        vehiculoCodigo: salida.activoCodigo || null,
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
  }, [cargas, filtrosActivos?.activoId, reporteQuery.data?.items, searchQuery])

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
    void cargasPrimeraPaginaQuery.refetch()
    cargasPaginasQueries.forEach((query) => void query.refetch())
    if (activoId) {
      void vehiculoDetailQuery.refetch()
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
      await descargarReporteSalidasBitacoraPdf({
        activoId: filtrosActivos.activoId || undefined,
        fechaDesde: filtrosActivos.fechaDesde,
        fechaHasta: filtrosActivos.fechaHasta,
        search: searchQuery || undefined,
        placa: filtrosActivos.activoId ? datosVehiculo.placa : "todos",
      })
      toast.success("Reporte oficial en PDF generado y descargado exitosamente.")
    } catch (err: unknown) {
      toast.error(`No se pudo generar el PDF: ${getErrorMessage(err)}`)
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
      await abrirReporteSalidasBitacoraPdf({
        activoId: filtrosActivos.activoId || undefined,
        fechaDesde: filtrosActivos.fechaDesde,
        fechaHasta: filtrosActivos.fechaHasta,
        search: searchQuery || undefined,
        placa: filtrosActivos.activoId ? datosVehiculo.placa : "todos",
      })
    } catch (err: unknown) {
      toast.error(`No se pudo abrir el PDF: ${getErrorMessage(err)}`)
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
    vehiculoDetailQuery.isLoading ||
    reporteQuery.isFetching ||
    cargasIsLoading
  const isError =
    reporteQuery.isError || cargasIsError || vehiculoDetailQuery.isError
  const reportError =
    reporteQuery.error ?? cargasError ?? vehiculoDetailQuery.error

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

      {/* Aviso explícito cuando el tope defensivo de páginas de cargas se alcanza */}
      {cargasTruncadas && !isLoading && !isError && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Reporte truncado: se mostraron {cargas.length} de {totalCargas} cargas.
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. RESUMEN DE MÉTRICAS RÁPIDAS COMPACTO (Oculto print)    */}
      {/* ========================================================= */}
      {filtrosActivos && !isLoading && !isError && filas.length > 0 && (
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
      {isError && (
        <div
          role="alert"
          aria-busy="false"
          className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive print:hidden flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Error al consultar los datos del reporte</p>
              <p className="text-xs text-destructive/90">{getErrorMessage(reportError)}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void reporteQuery.refetch()
              void cargasPrimeraPaginaQuery.refetch()
              cargasPaginasQueries.forEach((query) => void query.refetch())
              void vehiculoDetailQuery.refetch()
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
        <div role="status" aria-busy="true" className="space-y-3 print:hidden">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ESTADO INICIAL (Sin filtros aplicados)                 */}
      {/* ========================================================= */}
      {!filtrosActivos && !isLoading && !isError && (
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
      {filtrosActivos && !isLoading && !isError && (
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
export default ReportesSalidasVehicularesPage

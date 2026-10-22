import { useState, useMemo } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Filter,
  Gauge,
  Hourglass,
  Info,
  Printer,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  exportarSeguimientoExcel,
  type ProgramacionMantenimiento,
  type ProgramacionMantenimientoCriterio,
} from "../api/programacion-mantenimiento.service"

interface ProgramacionSeguimientoReportViewProps {
  programaciones: ProgramacionMantenimiento[]
  isLoading: boolean
  onEdit: (prog: ProgramacionMantenimiento) => void
  onEvaluarIndividual?: (prog: ProgramacionMantenimiento) => void
}

type NivelAlerta = "TODOS" | "CRITICO" | "PROXIMO" | "AL_DIA" | "INACTIVO"
type TipoCriterioFiltro = "TODOS" | "TIEMPO" | "KILOMETRAJE" | "HORAS_USO"

interface FilaSeguimiento {
  id: string
  programacionId: string
  programacion: ProgramacionMantenimiento
  criterioId: string
  activoCodigo: string
  activoNombre: string
  tipoActivo: string
  planCodigo: string
  planNombre: string
  tipoCriterio: "TIEMPO" | "KILOMETRAJE" | "HORAS_USO"
  frecuenciaLabel: string
  lecturaActualLabel: string
  proximoUmbralLabel: string
  porcentaje: number
  margenRestanteLabel: string
  estadoAlerta: "CRITICO" | "PROXIMO" | "AL_DIA" | "INACTIVO"
  criterioActivo: boolean
  programacionActiva: boolean
}

export function ProgramacionSeguimientoReportView({
  programaciones,
  isLoading,
  onEdit,
  onEvaluarIndividual,
}: Readonly<ProgramacionSeguimientoReportViewProps>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroAlerta, setFiltroAlerta] = useState<NivelAlerta>("TODOS")
  const [filtroCriterio, setFiltroCriterio] = useState<TipoCriterioFiltro>("TODOS")
  const [isExportingExcel, setIsExportingExcel] = useState(false)

  // Desglosar cada criterio activo de cada programación en una fila de auditoría
  const filas: FilaSeguimiento[] = useMemo(() => {
    const list: FilaSeguimiento[] = []
    const hoy = new Date()

    programaciones.forEach((prog) => {
      const activoCodigo = prog.planActivo?.activoCodigo || "N/D"
      const activoNombre = prog.planActivo?.activoNombre || "N/D"
      const tipoActivo = prog.planActivo?.tipoActivoNombre || "N/D"
      const planCodigo = prog.planActivo?.planCodigo || "N/D"
      const planNombre = prog.planActivo?.planNombre || "N/D"
      const progActiva = Boolean(prog.activo)

      const criteriosValidos = prog.criterios && prog.criterios.length > 0 ? prog.criterios : []

      if (criteriosValidos.length === 0) {
        list.push({
          id: `${prog.id}-sin-criterios`,
          programacionId: prog.id,
          programacion: prog,
          criterioId: "sin-id",
          activoCodigo,
          activoNombre,
          tipoActivo,
          planCodigo,
          planNombre,
          tipoCriterio: "TIEMPO",
          frecuenciaLabel: "Sin criterios configurados",
          lecturaActualLabel: "-",
          proximoUmbralLabel: "-",
          porcentaje: 0,
          margenRestanteLabel: "Pendiente configuración",
          estadoAlerta: "INACTIVO",
          criterioActivo: false,
          programacionActiva: progActiva,
        })
        return
      }

      criteriosValidos.forEach((c: ProgramacionMantenimientoCriterio) => {
        const cActivo = Boolean(c.activo)
        let estadoAlerta: "CRITICO" | "PROXIMO" | "AL_DIA" | "INACTIVO" = "AL_DIA"
        let frecuenciaLabel = ""
        let lecturaActualLabel = ""
        let proximoUmbralLabel = ""
        let porcentaje = 0
        let margenRestanteLabel = ""

        if (!progActiva || !cActivo) {
          estadoAlerta = "INACTIVO"
        }

        if (c.tipoCriterio === "TIEMPO") {
          const dias = c.intervaloDias ?? 0
          frecuenciaLabel = `Cada ${dias} días`
          lecturaActualLabel = hoy.toLocaleDateString("es-BO")
          proximoUmbralLabel = c.proximaFecha ? new Date(c.proximaFecha).toLocaleDateString("es-BO") : "-"

          if (c.proximaFecha && dias > 0) {
            const fechaProx = new Date(c.proximaFecha)
            const fechaBase = new Date(fechaProx)
            fechaBase.setDate(fechaBase.getDate() - dias)

            const msTranscurridos = hoy.getTime() - fechaBase.getTime()
            const msTotal = fechaProx.getTime() - fechaBase.getTime()
            const pct = msTotal > 0 ? (msTranscurridos / msTotal) * 100 : 0
            porcentaje = Math.min(Math.max(Math.round(pct), 0), 999)

            const diffDias = Math.round((fechaProx.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
            if (diffDias < 0) {
              margenRestanteLabel = `Vencido hace ${Math.abs(diffDias)} d`
              if (progActiva && cActivo) estadoAlerta = "CRITICO"
            } else {
              margenRestanteLabel = `Faltan ${diffDias} d`
              if (progActiva && cActivo) {
                if (diffDias <= 15 || porcentaje >= 85) estadoAlerta = "PROXIMO"
                else estadoAlerta = "AL_DIA"
              }
            }
          }
        } else {
          const unidad = c.tipoCriterio === "KILOMETRAJE" ? "km" : "hrs"
          const intervalo = c.intervaloUso ? Number(c.intervaloUso) : 0
          const prox = c.proximoValorUso ? Number(c.proximoValorUso) : 0
          const actual = c.valorActualUso !== undefined && c.valorActualUso !== null ? Number(c.valorActualUso) : 0
          const base = prox - intervalo

          frecuenciaLabel = `Cada ${intervalo.toLocaleString("es-BO")} ${unidad}`
          lecturaActualLabel = `${actual.toLocaleString("es-BO")} ${unidad}`
          proximoUmbralLabel = `${prox.toLocaleString("es-BO")} ${unidad}`

          if (intervalo > 0) {
            const avance = Math.max(actual - base, 0)
            porcentaje = Math.min(Math.round((avance / intervalo) * 100), 999)
          }

          const diff = prox - actual
          if (diff <= 0 && prox > 0) {
            margenRestanteLabel = `Rebasado por ${Math.abs(diff).toLocaleString("es-BO")} ${unidad}`
            if (progActiva && cActivo) estadoAlerta = "CRITICO"
          } else {
            margenRestanteLabel = `Faltan ${diff.toLocaleString("es-BO")} ${unidad}`
            if (progActiva && cActivo) {
              if (porcentaje >= 85) estadoAlerta = "PROXIMO"
              else estadoAlerta = "AL_DIA"
            }
          }
        }

        list.push({
          id: `${prog.id}-${c.id}`,
          programacionId: prog.id,
          programacion: prog,
          criterioId: c.id,
          activoCodigo,
          activoNombre,
          tipoActivo,
          planCodigo,
          planNombre,
          tipoCriterio: c.tipoCriterio,
          frecuenciaLabel,
          lecturaActualLabel,
          proximoUmbralLabel,
          porcentaje,
          margenRestanteLabel,
          estadoAlerta,
          criterioActivo: cActivo,
          programacionActiva: progActiva,
        })
      })
    })

    return list
  }, [programaciones])

  // Métricas de seguimiento
  const metrics = useMemo(() => {
    const total = filas.length
    const criticos = filas.filter((f) => f.estadoAlerta === "CRITICO").length
    const proximos = filas.filter((f) => f.estadoAlerta === "PROXIMO").length
    const alDia = filas.filter((f) => f.estadoAlerta === "AL_DIA").length
    const inactivos = filas.filter((f) => f.estadoAlerta === "INACTIVO").length

    const activosActivos = filas.filter((f) => f.estadoAlerta !== "INACTIVO").length
    const porcentajeSalud = activosActivos > 0 ? Math.round((alDia / activosActivos) * 100) : 100

    return { total, criticos, proximos, alDia, inactivos, porcentajeSalud }
  }, [filas])

  // Filtrado de filas
  const filasFiltradas = useMemo(() => {
    return filas.filter((f) => {
      // Filtro de urgencia
      if (filtroAlerta !== "TODOS" && f.estadoAlerta !== filtroAlerta) return false

      // Filtro de criterio
      if (filtroCriterio !== "TODOS" && f.tipoCriterio !== filtroCriterio) return false

      // Filtro de búsqueda
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchActivo = f.activoCodigo.toLowerCase().includes(q) || f.activoNombre.toLowerCase().includes(q)
        const matchPlan = f.planCodigo.toLowerCase().includes(q) || f.planNombre.toLowerCase().includes(q)
        const matchTipo = f.tipoActivo.toLowerCase().includes(q)
        if (!matchActivo && !matchPlan && !matchTipo) return false
      }

      return true
    })
  }, [filas, filtroAlerta, filtroCriterio, searchTerm])

  const handleExportarExcel = async () => {
    try {
      setIsExportingExcel(true)
      await exportarSeguimientoExcel({
        q: searchTerm.trim() || undefined,
      })
      toast.success("Reporte oficial de seguimiento preventivo descargado con éxito.")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al exportar el reporte a Excel.")
    } finally {
      setIsExportingExcel(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-5">
      {/* Encabezado Oficial para Modo Impresión (oculto en pantalla) */}
      <div className="hidden print:block border-b-2 border-primary/40 pb-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              ENDE CORANI S.A.
            </h1>
            <h2 className="text-sm font-semibold text-gray-700">
              REPORTE DE SEGUIMIENTO DE MANTENIMIENTO PREVENTIVO Y TELEMETRÍA
            </h2>
            <p className="text-xs text-gray-500">
              Sistema Integrado SIGMA | Emitido: {new Date().toLocaleString("es-BO")}
            </p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p><strong>Total Criterios Monitoreados:</strong> {metrics.total}</p>
            <p><strong>Requieren Servicio Urgente:</strong> {metrics.criticos}</p>
            <p><strong>Salud Preventiva:</strong> {metrics.porcentajeSalud}%</p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas de Salud Preventiva */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 print:hidden">
        {/* Salud General */}
        <div className="rounded-2xl border border-border/70 bg-card p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11.5px] font-medium">Salud Preventiva</span>
            <Sparkles className="size-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.porcentajeSalud}%
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">al día</span>
          </div>
          <div className="w-full bg-muted/60 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                metrics.porcentajeSalud >= 80 ? "bg-emerald-500" : metrics.porcentajeSalud >= 60 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${metrics.porcentajeSalud}%` }}
            />
          </div>
        </div>

        {/* Requieren Servicio Crítico */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-600 dark:text-red-400 mb-1">
            <span className="text-[11.5px] font-medium">Requieren Servicio</span>
            <AlertTriangle className="size-4" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
            {metrics.criticos}
          </div>
          <p className="text-[10.5px] text-red-600/80 dark:text-red-400/80 mt-1">
            Umbral de telemetría rebasado
          </p>
        </div>

        {/* Próximos a Vencer */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <span className="text-[11.5px] font-medium">Atención Próxima</span>
            <Clock className="size-4" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {metrics.proximos}
          </div>
          <p className="text-[10.5px] text-amber-600/80 dark:text-amber-400/80 mt-1">
            Avance ≥ 85% o ≤ 15 días
          </p>
        </div>

        {/* Al Día */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-[11.5px] font-medium">Monitoreo al Día</span>
            <CheckCircle2 className="size-4" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {metrics.alDia}
          </div>
          <p className="text-[10.5px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
            Operando dentro de norma
          </p>
        </div>

        {/* Inactivos */}
        <div className="rounded-2xl border border-border/70 bg-card p-3.5 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11.5px] font-medium">Pausados / Inactivos</span>
            <XCircle className="size-4" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-muted-foreground">
            {metrics.inactivos}
          </div>
          <p className="text-[10.5px] text-muted-foreground mt-1">
            Programaciones en pausa
          </p>
        </div>
      </div>

      {/* Barra de Filtros y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card border border-border/70 p-3 rounded-2xl shadow-xs print:hidden">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Búsqueda */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por activo, plan o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Filtro por Alerta */}
          <Select value={filtroAlerta} onValueChange={(val) => setFiltroAlerta(val as NivelAlerta)}>
            <SelectTrigger className="w-[170px] h-9 text-xs rounded-xl">
              <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Estado de Alerta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos los Estados</SelectItem>
              <SelectItem value="CRITICO">🔴 Requiere Servicio</SelectItem>
              <SelectItem value="PROXIMO">🟡 Atención Próxima</SelectItem>
              <SelectItem value="AL_DIA">🟢 Al Día</SelectItem>
              <SelectItem value="INACTIVO">⚪ Inactivos</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro por Criterio */}
          <Select value={filtroCriterio} onValueChange={(val) => setFiltroCriterio(val as TipoCriterioFiltro)}>
            <SelectTrigger className="w-[160px] h-9 text-xs rounded-xl">
              <SelectValue placeholder="Tipo de Criterio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos los Criterios</SelectItem>
              <SelectItem value="KILOMETRAJE">🚗 Odómetro (Km)</SelectItem>
              <SelectItem value="TIEMPO">📅 Tiempo (Días)</SelectItem>
              <SelectItem value="HORAS_USO">⏱️ Horómetro (Hrs)</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || filtroAlerta !== "TODOS" || filtroCriterio !== "TODOS") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("")
                setFiltroAlerta("TODOS")
                setFiltroCriterio("TODOS")
              }}
              className="h-9 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Botones de Descarga e Impresión */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarExcel}
            disabled={isExportingExcel || isLoading}
            className="h-9 gap-1.5 text-xs rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300 font-medium cursor-pointer"
            title="Descargar libro Excel con formato corporativo ENDE"
          >
            {isExportingExcel ? (
              <FileSpreadsheet className="size-4 animate-spin text-emerald-500" />
            ) : (
              <Download className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>Exportar Excel</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-9 gap-1.5 text-xs rounded-xl font-medium cursor-pointer"
            title="Imprimir informe oficial o guardar en PDF"
          >
            <Printer className="size-3.5 text-foreground/80" />
            <span>Imprimir Reporte</span>
          </Button>
        </div>
      </div>

      {/* Tabla Matriz de Seguimiento */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border/70 text-muted-foreground font-semibold">
                <th className="py-3 px-3.5 w-12 text-center">Nº</th>
                <th className="py-3 px-3.5 min-w-[200px]">Activo y Tipo</th>
                <th className="py-3 px-3.5 min-w-[200px]">Plan de Mantenimiento</th>
                <th className="py-3 px-3.5 min-w-[130px]">Criterio</th>
                <th className="py-3 px-3.5 min-w-[110px] text-right">Lectura Actual</th>
                <th className="py-3 px-3.5 min-w-[110px] text-right">Próximo Umbral</th>
                <th className="py-3 px-3.5 min-w-[140px]">Avance (% Ciclo)</th>
                <th className="py-3 px-3.5 min-w-[130px]">Margen Restante</th>
                <th className="py-3 px-3.5 min-w-[140px] text-center">Estado de Alerta</th>
                <th className="py-3 px-3.5 min-w-[100px] text-center print:hidden">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Sparkles className="size-6 animate-spin text-amber-500" />
                      <p>Cargando datos de seguimiento preventivo...</p>
                    </div>
                  </td>
                </tr>
              ) : filasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Info className="size-6 text-muted-foreground/60" />
                      <p className="font-medium text-foreground">No se encontraron registros de seguimiento</p>
                      <p className="text-[11px]">Intente cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filasFiltradas.map((fila, index) => {
                  let alertBadge = (
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      🟢 Al Día
                    </Badge>
                  )
                  if (fila.estadoAlerta === "CRITICO") {
                    alertBadge = (
                      <Badge variant="outline" className="text-[10px] border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-400 font-semibold animate-pulse">
                        🔴 Requiere Servicio
                      </Badge>
                    )
                  } else if (fila.estadoAlerta === "PROXIMO") {
                    alertBadge = (
                      <Badge variant="outline" className="text-[10px] border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold">
                        🟡 Atención Próxima
                      </Badge>
                    )
                  } else if (fila.estadoAlerta === "INACTIVO") {
                    alertBadge = (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/80 bg-muted/40">
                        ⚪ Pausado
                      </Badge>
                    )
                  }

                  let barColor = "bg-emerald-500"
                  if (fila.porcentaje >= 100) barColor = "bg-red-500"
                  else if (fila.porcentaje >= 85) barColor = "bg-amber-500"

                  return (
                    <tr
                      key={fila.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        fila.estadoAlerta === "CRITICO" ? "bg-red-500/[0.02]" : ""
                      }`}
                    >
                      {/* Nº */}
                      <td className="py-3 px-3.5 text-center text-muted-foreground font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Activo */}
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-foreground">{fila.activoNombre}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10.5px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                            {fila.activoCodigo}
                          </span>
                          <span className="text-[10.5px] text-muted-foreground">· {fila.tipoActivo}</span>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-foreground">{fila.planNombre}</div>
                        <div className="font-mono text-[10.5px] text-muted-foreground mt-0.5">
                          {fila.planCodigo}
                        </div>
                      </td>

                      {/* Criterio */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          {fila.tipoCriterio === "KILOMETRAJE" && <Gauge className="size-3.5 text-amber-500" />}
                          {fila.tipoCriterio === "TIEMPO" && <Clock className="size-3.5 text-blue-500" />}
                          {fila.tipoCriterio === "HORAS_USO" && <Hourglass className="size-3.5 text-purple-500" />}
                          <span>{fila.tipoCriterio === "KILOMETRAJE" ? "Odómetro" : fila.tipoCriterio === "TIEMPO" ? "Tiempo" : "Horómetro"}</span>
                        </div>
                        <div className="text-[10.5px] text-muted-foreground mt-0.5">
                          {fila.frecuenciaLabel}
                        </div>
                      </td>

                      {/* Lectura Actual */}
                      <td className="py-3 px-3.5 text-right font-mono text-[11.5px] text-foreground">
                        {fila.lecturaActualLabel}
                      </td>

                      {/* Próximo Umbral */}
                      <td className="py-3 px-3.5 text-right font-mono text-[11.5px] font-semibold text-foreground">
                        {fila.proximoUmbralLabel}
                      </td>

                      {/* % Avance */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                          <span className={fila.porcentaje >= 100 ? "text-red-600 font-bold" : "text-foreground"}>
                            {fila.porcentaje}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">del ciclo</span>
                        </div>
                        <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${barColor}`}
                            style={{ width: `${Math.min(fila.porcentaje, 100)}%` }}
                          />
                        </div>
                      </td>

                      {/* Margen Restante */}
                      <td className="py-3 px-3.5">
                        <span
                          className={`text-[11px] font-medium ${
                            fila.estadoAlerta === "CRITICO"
                              ? "text-red-600 dark:text-red-400 font-bold"
                              : fila.estadoAlerta === "PROXIMO"
                              ? "text-amber-600 dark:text-amber-400 font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {fila.margenRestanteLabel}
                        </span>
                      </td>

                      {/* Estado de Alerta */}
                      <td className="py-3 px-3.5 text-center">
                        {alertBadge}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-3.5 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1">
                          {onEvaluarIndividual && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEvaluarIndividual(fila.programacion)}
                              className="h-7 px-2 text-[10.5px] gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 cursor-pointer rounded-lg"
                              title="Evaluar y disparar solicitud preventiva si corresponde"
                            >
                              <Sparkles className="size-3" />
                              <span>Evaluar</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(fila.programacion)}
                            className="h-7 px-2 text-[10.5px] text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
                            title="Editar criterios de la programación"
                          >
                            Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen al pie */}
        <div className="flex items-center justify-between p-3.5 bg-muted/20 border-t border-border/70 text-xs text-muted-foreground">
          <span>
            Mostrando <strong>{filasFiltradas.length}</strong> de <strong>{filas.length}</strong> criterios monitoreados
          </span>
          <span className="text-[11px]">
            * Los criterios en rojo generan solicitudes preventivas inmediatas al evaluarse
          </span>
        </div>
      </div>

      {/* Bloque de Firmas para Modo Impresión */}
      <div className="hidden print:grid grid-cols-2 gap-12 pt-16 mt-8 border-t border-gray-300 text-center text-xs text-gray-700">
        <div>
          <div className="border-t border-gray-800 w-48 mx-auto mb-1"></div>
          <p className="font-semibold">Responsable de Mantenimiento Preventivo</p>
          <p className="text-[10px] text-gray-500">ENDE CORANI S.A.</p>
        </div>
        <div>
          <div className="border-t border-gray-800 w-48 mx-auto mb-1"></div>
          <p className="font-semibold">Jefe de Operaciones y Flota</p>
          <p className="text-[10px] text-gray-500">ENDE CORANI S.A.</p>
        </div>
      </div>
    </div>
  )
}

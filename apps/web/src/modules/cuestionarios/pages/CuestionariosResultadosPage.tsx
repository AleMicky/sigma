import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Award,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  Users,
  X,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import {
  OptionsCombobox,
  type OptionsComboboxOption,
} from "@/shared/components/options-combobox"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { StatusBadge } from "@/shared/components/status-badge"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart"
import { Input } from "@/shared/components/ui/input"
import { Progress } from "@/shared/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { useClampPage } from "@/shared/hooks/use-paginated-search"
import { toLocalDateKey } from "@/shared/lib/date"
import { formatDate } from "@/shared/lib/format-date"
import { cn } from "@/shared/lib/utils"

import { cuestionarioQueries } from "../api/cuestionario.queries"
import { ResponderCuestionarioDialog } from "../components/ResponderCuestionarioDialog"
import {
  ESTADO_ASIGNACION_LABELS,
  ESTADO_ASIGNACION_VARIANT,
  ESTADO_CUESTIONARIO_LABELS,
  formatNumero,
  formatPorcentaje,
} from "../lib/cuestionario.utils"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

const CHART_TOKENS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

const chartConfig = {
  promedio: {
    label: "Promedio",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

function getDefaultDateRange() {
  const today = new Date()
  const thirtyDaysAgo = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 30,
  )
  return {
    fechaDesde: toLocalDateKey(thirtyDaysAgo),
    fechaHasta: toLocalDateKey(today),
  }
}

export function CuestionariosResultadosPage() {
  const [selectedId, setSelectedId] = useState("")
  const [selectedEvaluadoId, setSelectedEvaluadoId] = useState("")
  const [fechaDesde, setFechaDesde] = useState(
    () => getDefaultDateRange().fechaDesde,
  )
  const [fechaHasta, setFechaHasta] = useState(
    () => getDefaultDateRange().fechaHasta,
  )
  const [page, setPage] = useState(0)
  const [viewingAsignacionId, setViewingAsignacionId] = useState<string | null>(
    null,
  )

  const cuestionariosQuery = useQuery({
    ...cuestionarioQueries.list({
      page: 0,
      size: 50,
      sortBy: "updatedAt",
      direction: "DESC",
    }),
    staleTime: 1000 * 60 * 3,
  })

  const cuestionariosList = useMemo(
    () => cuestionariosQuery.data?.content ?? [],
    [cuestionariosQuery.data?.content],
  )

  const cuestionarioOptions = useMemo<OptionsComboboxOption[]>(
    () =>
      cuestionariosList.map((c) => ({
        value: c.id,
        label: `${c.codigo} v${c.version} · ${c.nombre} (${ESTADO_CUESTIONARIO_LABELS[c.estado]})`,
        keywords: [c.codigo, c.nombre, c.moduloOrigen],
      })),
    [cuestionariosList],
  )

  const activeCuestionarioId = useMemo(() => {
    if (selectedId) return selectedId
    const published = cuestionariosList.find((c) => c.estado === "PUBLICADO")
    return published?.id ?? cuestionariosList[0]?.id ?? ""
  }, [selectedId, cuestionariosList])

  const resumenParams = useMemo(
    () => ({
      cuestionarioId: activeCuestionarioId,
      ...(selectedEvaluadoId ? { evaluadoId: selectedEvaluadoId } : {}),
      ...(fechaDesde ? { fechaDesde } : {}),
      ...(fechaHasta ? { fechaHasta } : {}),
    }),
    [activeCuestionarioId, selectedEvaluadoId, fechaDesde, fechaHasta],
  )

  const respuestasParams = useMemo(
    () => ({
      ...resumenParams,
      page,
      size: PAGE_SIZE,
      sortBy: "fechaRespuesta",
      direction: "DESC" as const,
    }),
    [resumenParams, page],
  )

  const resumenQuery = useQuery({
    ...cuestionarioQueries.reporteResumen(resumenParams),
    enabled: Boolean(activeCuestionarioId),
  })

  const respuestasQuery = useQuery({
    ...cuestionarioQueries.reporteRespuestas(respuestasParams),
    enabled: Boolean(activeCuestionarioId),
  })

  useClampPage(page, setPage, respuestasQuery.data?.totalPages)

  const resumen = resumenQuery.data
  const respuestasPage = respuestasQuery.data

  const chartData = useMemo(() => {
    if (!resumen?.porPregunta) return []
    return resumen.porPregunta
      .filter(
        (item) =>
          (item.promedioValor !== null && item.promedioValor !== undefined) ||
          (item.promedioPuntaje !== null && item.promedioPuntaje !== undefined),
      )
      .map((item, idx) => {
        const valor = item.promedioValor ?? item.promedioPuntaje ?? 0
        return {
          id: item.preguntaId,
          label: `P${item.orden ?? idx + 1}`,
          enunciado: item.enunciado,
          promedio: Number(valor.toFixed(2)),
          totalRespuestas: item.totalRespuestas,
        }
      })
  }, [resumen])

  const handleRefresh = () => {
    void cuestionariosQuery.refetch()
    if (activeCuestionarioId) {
      void resumenQuery.refetch()
      void respuestasQuery.refetch()
    }
  }

  return (
    <PageShell size="xl" padding="default" layout="scroll" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Resultados y Analítica
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Indicadores de participación, promedios por pregunta y desempeño por
            evaluado.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleRefresh}
          disabled={resumenQuery.isFetching || respuestasQuery.isFetching}
          className="h-9 gap-1.5 rounded-xl text-xs"
        >
          <RefreshCw
            className={
              resumenQuery.isFetching || respuestasQuery.isFetching
                ? "size-3.5 animate-spin"
                : "size-3.5"
            }
          />
          Actualizar
        </Button>
      </div>

      {/* Barra de filtros con altura h-9 y radio rounded-xl uniformes */}
      <div className="grid grid-cols-1 gap-2 rounded-xl border border-border/80 bg-card p-3 sm:grid-cols-12 sm:items-end">
        <div className="space-y-1 sm:col-span-5">
          <label
            htmlFor="reporte-cuestionario-select"
            className="text-[11px] font-semibold text-muted-foreground"
          >
            Cuestionario
          </label>
          <OptionsCombobox
            id="reporte-cuestionario-select"
            size="sm"
            options={cuestionarioOptions}
            value={activeCuestionarioId}
            disabled={cuestionariosQuery.isLoading}
            placeholder={
              cuestionariosQuery.isLoading
                ? "Cargando cuestionarios…"
                : "Selecciona un cuestionario…"
            }
            ariaLabel="Seleccionar cuestionario para reporte"
            onValueChange={(next) => {
              setSelectedId(next)
              setSelectedEvaluadoId("")
              setPage(0)
            }}
          />
        </div>

        <div className="space-y-1 sm:col-span-3">
          <label
            htmlFor="reporte-fecha-desde"
            className="text-[11px] font-semibold text-muted-foreground"
          >
            Desde
          </label>
          <Input
            id="reporte-fecha-desde"
            type="date"
            value={fechaDesde}
            max={fechaHasta || toLocalDateKey()}
            onChange={(event) => {
              setFechaDesde(event.target.value)
              setPage(0)
            }}
            className="h-9 rounded-xl text-xs"
          />
        </div>

        <div className="space-y-1 sm:col-span-3">
          <label
            htmlFor="reporte-fecha-hasta"
            className="text-[11px] font-semibold text-muted-foreground"
          >
            Hasta
          </label>
          <Input
            id="reporte-fecha-hasta"
            type="date"
            value={fechaHasta}
            min={fechaDesde || undefined}
            max={toLocalDateKey()}
            onChange={(event) => {
              setFechaHasta(event.target.value)
              setPage(0)
            }}
            className="h-9 rounded-xl text-xs"
          />
        </div>

        <div className="flex sm:col-span-1 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFechaDesde("")
              setFechaHasta("")
              setSelectedEvaluadoId("")
              setPage(0)
            }}
            aria-label="Limpiar filtros de fechas"
            title="Limpiar fechas y evaluado"
            className="h-9 w-full rounded-xl px-2.5 text-xs sm:w-9"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {cuestionariosQuery.isError ? (
        <EmptyState
          bordered
          icon={<AlertCircle className="size-6 text-destructive" />}
          title="Error al cargar los cuestionarios"
          description={getErrorMessage(cuestionariosQuery.error)}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void cuestionariosQuery.refetch()}
              className="gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              Reintentar
            </Button>
          }
        />
      ) : !activeCuestionarioId ? (
        <EmptyState
          bordered
          icon={<BarChart3 className="size-6 text-muted-foreground" />}
          title="No hay cuestionarios disponibles para analizar"
          description="Crea y publica un cuestionario para empezar a recopilar resultados."
        />
      ) : resumenQuery.isLoading ? (
        <div aria-busy="true">
          <ListSkeleton rows={4} rowClassName="h-24 rounded-xl" />
        </div>
      ) : resumenQuery.isError ? (
        <EmptyState
          bordered
          icon={<AlertCircle className="size-6 text-destructive" />}
          title="Error al cargar el resumen de resultados"
          description={getErrorMessage(resumenQuery.error)}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void resumenQuery.refetch()}
              className="gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              Reintentar
            </Button>
          }
        />
      ) : resumen ? (
        <div className="space-y-4">
          {/* Aviso de anonimato o filtro por evaluado activo */}
          <div className="flex flex-wrap items-center gap-2">
            {resumen.anonimoEnReportes ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-info/30 bg-info/10 px-2.5 py-1 text-xs font-medium text-info">
                <EyeOff className="size-3.5" />
                Modo anónimo activo: la identidad de los evaluadores permanece
                oculta
              </span>
            ) : null}

            {selectedEvaluadoId ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                Filtrado por evaluado
                <button
                  type="button"
                  aria-label="Quitar filtro de evaluado"
                  onClick={() => {
                    setSelectedEvaluadoId("")
                    setPage(0)
                  }}
                  className="rounded-full p-0.5 hover:bg-primary/20"
                >
                  <X className="size-3" />
                </button>
              </span>
            ) : null}
          </div>

          {/* KPIs del servidor */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="flex items-center justify-between text-xs">
                  <span>Total asignadas</span>
                  <ClipboardList className="size-4 text-primary" />
                </CardDescription>
                <CardTitle className="font-mono text-2xl font-bold tabular-nums">
                  {resumen.totalAsignadas}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Evaluaciones habilitadas en el periodo
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="flex items-center justify-between text-xs">
                  <span>Respondidas</span>
                  <CheckCircle2 className="size-4 text-success" />
                </CardDescription>
                <CardTitle className="font-mono text-2xl font-bold text-success tabular-nums">
                  {resumen.totalRespondidas}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Participación:{" "}
                <strong className="font-semibold text-foreground tabular-nums">
                  {formatPorcentaje(resumen.tasaParticipacion)}
                </strong>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="flex items-center justify-between text-xs">
                  <span>Pendientes</span>
                  <Clock className="size-4 text-warning" />
                </CardDescription>
                <CardTitle className="font-mono text-2xl font-bold text-warning tabular-nums">
                  {resumen.totalPendientes}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Aún sin respuesta registrada
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader className="pb-1">
                <CardDescription className="flex items-center justify-between text-xs">
                  <span>Promedio general</span>
                  <Award className="size-4 text-chart-4" />
                </CardDescription>
                <CardTitle className="font-mono text-2xl font-bold text-primary tabular-nums">
                  {formatPorcentaje(resumen.promedioPorcentaje)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Puntaje medio:{" "}
                <strong className="font-semibold text-foreground tabular-nums">
                  {formatNumero(resumen.promedioPuntaje, 2)}
                </strong>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico por pregunta + Tabla por evaluado */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Card className="lg:col-span-7">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <BarChart3 className="size-4 text-primary" />
                  Promedio por pregunta
                </CardTitle>
                <CardDescription className="text-xs">
                  Calificación promedio obtenida en preguntas cuantificables.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <EmptyState
                    icon={<BarChart3 className="size-5 text-muted-foreground" />}
                    title="Sin datos cuantificables todavía"
                    description="Las preguntas con calificación aparecerán aquí cuando existan respuestas."
                  />
                ) : (
                  <div className="space-y-3">
                    <ChartContainer
                      config={chartConfig}
                      className="h-64 w-full aspect-auto"
                    >
                      <BarChart
                        data={chartData}
                        margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis tickLine={false} axisLine={false} width={36} />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              labelFormatter={(_value, payload) => {
                                const first = payload?.[0]?.payload as
                                  | { enunciado?: string }
                                  | undefined
                                return first?.enunciado ?? ""
                              }}
                            />
                          }
                        />
                        <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, idx) => (
                            <Cell
                              key={entry.id}
                              fill={CHART_TOKENS[idx % CHART_TOKENS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>

                    <ul className="space-y-1 border-t border-border/60 pt-2 text-xs text-muted-foreground">
                      {chartData.map((entry) => (
                        <li
                          key={entry.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="truncate">
                            <strong className="font-mono text-foreground">
                              {entry.label}:
                            </strong>{" "}
                            {entry.enunciado}
                          </span>
                          <span className="shrink-0 font-mono font-semibold text-foreground tabular-nums">
                            {formatNumero(entry.promedio, 2)} (
                            {entry.totalRespuestas})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="size-4 text-primary" />
                  Promedio por evaluado
                </CardTitle>
                <CardDescription className="text-xs">
                  Haz clic en un evaluado para filtrar el listado de respuestas.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                {resumen.porEvaluado.length === 0 ? (
                  <div className="px-4">
                    <EmptyState
                      icon={<Users className="size-5 text-muted-foreground" />}
                      title="Sin evaluados calificados"
                      description="Aún no existen evaluaciones registradas en este rango."
                    />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Evaluado</TableHead>
                        <TableHead className="text-right">Eval.</TableHead>
                        <TableHead className="text-right">Promedio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resumen.porEvaluado.map((ev) => {
                        const isSelected = selectedEvaluadoId === ev.evaluadoId
                        const pct = ev.promedioPorcentaje ?? 0
                        const indicatorClass =
                          pct >= 80
                            ? "bg-success"
                            : pct >= 60
                              ? "bg-warning"
                              : "bg-destructive"

                        return (
                          <TableRow
                            key={ev.evaluadoId}
                            onClick={() => {
                              setSelectedEvaluadoId((prev) =>
                                prev === ev.evaluadoId ? "" : ev.evaluadoId,
                              )
                              setPage(0)
                            }}
                            className={cn(
                              "cursor-pointer",
                              isSelected && "bg-primary/10",
                            )}
                          >
                            <TableCell className="max-w-44">
                              <p className="truncate text-xs font-semibold text-foreground">
                                {ev.evaluadoNombre}
                              </p>
                              <Progress
                                value={pct}
                                max={100}
                                className="mt-1 h-1.5"
                                indicatorClassName={indicatorClass}
                              />
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs tabular-nums">
                              {ev.totalEvaluaciones}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs font-semibold tabular-nums">
                              {formatPorcentaje(ev.promedioPorcentaje)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabla paginada de respuestas individuales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Respuestas registradas
              </CardTitle>
              <CardDescription className="text-xs">
                Detalle individual paginado de las evaluaciones del periodo.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {respuestasQuery.isLoading ? (
                <div aria-busy="true">
                  <ListSkeleton rows={4} rowClassName="h-12 rounded-lg" />
                </div>
              ) : respuestasQuery.isError ? (
                <div className="px-4 pb-4">
                  <EmptyState
                    icon={<AlertCircle className="size-6 text-destructive" />}
                    title="Error al cargar el listado de respuestas"
                    description={getErrorMessage(respuestasQuery.error)}
                    action={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void respuestasQuery.refetch()}
                        className="gap-1.5"
                      >
                        <RefreshCw className="size-3.5" />
                        Reintentar
                      </Button>
                    }
                  />
                </div>
              ) : !respuestasPage || respuestasPage.content.length === 0 ? (
                <div className="px-4 pb-4">
                  <EmptyState
                    icon={
                      <ClipboardList className="size-6 text-muted-foreground" />
                    }
                    title="No hay respuestas registradas"
                    description="No se encontraron evaluaciones completadas para los filtros actuales."
                  />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Referencia</TableHead>
                        <TableHead>Evaluado</TableHead>
                        <TableHead>Evaluador</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Resultado</TableHead>
                        <TableHead className="text-right">Detalle</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {respuestasPage.content.map((row) => {
                        const isAnonymous =
                          resumen.anonimoEnReportes ||
                          row.anonimoEnReportes ||
                          !row.evaluadorNombre

                        return (
                          <TableRow key={row.id}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(
                                row.fechaRespuesta ?? row.fechaHabilitacion,
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-xs font-semibold text-foreground">
                              {row.entidadCodigoRef ?? "—"}
                            </TableCell>
                            <TableCell className="text-xs font-medium text-foreground">
                              {row.evaluadoNombre ?? "—"}
                            </TableCell>
                            <TableCell className="text-xs">
                              {isAnonymous ? (
                                <span className="inline-flex items-center gap-1 text-muted-foreground">
                                  <EyeOff className="size-3.5" />
                                  Anónimo
                                </span>
                              ) : (
                                row.evaluadorNombre
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge
                                variant={ESTADO_ASIGNACION_VARIANT[row.estado]}
                              >
                                {ESTADO_ASIGNACION_LABELS[row.estado]}
                              </StatusBadge>
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs font-semibold tabular-nums">
                              {formatPorcentaje(row.porcentaje)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={() => setViewingAsignacionId(row.id)}
                                className="gap-1"
                              >
                                <Eye className="size-3" />
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>

                  <Pagination page={respuestasPage} onPageChange={setPage} />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <ResponderCuestionarioDialog
        asignacionId={viewingAsignacionId}
        open={Boolean(viewingAsignacionId)}
        onOpenChange={(open) => {
          if (!open) setViewingAsignacionId(null)
        }}
        mode="ver"
      />
    </PageShell>
  )
}

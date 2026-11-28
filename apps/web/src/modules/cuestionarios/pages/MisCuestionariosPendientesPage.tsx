import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  Star,
  UserCheck,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import {
  SegmentedRadioGroup,
  type SegmentedRadioOption,
} from "@/shared/components/segmented-radio-group"
import { StatusBadge } from "@/shared/components/status-badge"
import { Button } from "@/shared/components/ui/button"
import { useClampPage } from "@/shared/hooks/use-paginated-search"
import { formatDate } from "@/shared/lib/format-date"

import { cuestionarioQueries } from "../api/cuestionario.queries"
import type { EstadoAsignacionCuestionario } from "../api/cuestionario.types"
import { ResponderCuestionarioDialog } from "../components/ResponderCuestionarioDialog"
import {
  ESTADO_ASIGNACION_LABELS,
  ESTADO_ASIGNACION_VARIANT,
  formatPorcentaje,
} from "../lib/cuestionario.utils"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

const ESTADO_TABS: readonly SegmentedRadioOption<
  Extract<EstadoAsignacionCuestionario, "PENDIENTE" | "RESPONDIDO">
>[] = [
  {
    value: "PENDIENTE",
    label: "Pendientes",
    icon: <Clock className="size-3.5" />,
    activeClassName: "bg-warning/15 text-warning shadow-2xs",
  },
  {
    value: "RESPONDIDO",
    label: "Respondidas",
    icon: <CheckCircle2 className="size-3.5" />,
    activeClassName: "bg-success/15 text-success shadow-2xs",
  },
]

export function MisCuestionariosPendientesPage() {
  const [estadoFiltro, setEstadoFiltro] = useState<"PENDIENTE" | "RESPONDIDO">(
    "PENDIENTE",
  )
  const [page, setPage] = useState(0)
  const [activeDialog, setActiveDialog] = useState<{
    id: string
    mode: "responder" | "ver"
  } | null>(null)

  const queryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      sortBy: "fechaHabilitacion",
      direction: "DESC" as const,
      estado: estadoFiltro,
    }),
    [page, estadoFiltro],
  )

  const listQuery = useQuery(cuestionarioQueries.misPendientes(queryParams))
  const items = listQuery.data?.content ?? []

  useClampPage(page, setPage, listQuery.data?.totalPages)

  return (
    <PageShell size="xl" padding="default" layout="scroll" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Mis Evaluaciones
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Responde los cuestionarios pendientes asignados a tus viajes y
            procesos finalizados.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => void listQuery.refetch()}
          disabled={listQuery.isFetching}
          className="h-9 gap-1.5 rounded-xl text-xs"
        >
          <RefreshCw
            className={
              listQuery.isFetching ? "size-3.5 animate-spin" : "size-3.5"
            }
          />
          Actualizar
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedRadioGroup
          name="mis-cuestionarios-estado"
          ariaLabel="Filtrar mis evaluaciones por estado"
          value={estadoFiltro}
          onValueChange={(next) => {
            setEstadoFiltro(next)
            setPage(0)
          }}
          options={ESTADO_TABS}
          className="w-full max-w-xs rounded-xl"
        />

        {listQuery.data ? (
          <p className="text-xs text-muted-foreground">
            {listQuery.data.totalElements} evaluación(es){" "}
            {estadoFiltro === "PENDIENTE" ? "pendiente(s)" : "respondida(s)"}
          </p>
        ) : null}
      </div>

      {listQuery.isLoading ? (
        <div aria-busy="true">
          <ListSkeleton rows={4} rowClassName="h-24 rounded-xl" />
        </div>
      ) : listQuery.isError ? (
        <EmptyState
          bordered
          icon={<AlertCircle className="size-6 text-destructive" />}
          title="Error al cargar tus evaluaciones"
          description={getErrorMessage(listQuery.error)}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void listQuery.refetch()}
              className="gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              Reintentar
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          bordered
          icon={<ClipboardCheck className="size-6 text-muted-foreground" />}
          title={
            estadoFiltro === "PENDIENTE"
              ? "No tienes evaluaciones pendientes"
              : "Aún no has respondido evaluaciones"
          }
          description={
            estadoFiltro === "PENDIENTE"
              ? "Cuando finalices un viaje o proceso con evaluación habilitada, aparecerá aquí."
              : "Las evaluaciones que completes quedarán disponibles para consulta en esta pestaña."
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isPendiente = item.estado === "PENDIENTE"
            return (
              <article
                key={item.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-2xs transition-colors hover:border-primary/30 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge
                      variant={ESTADO_ASIGNACION_VARIANT[item.estado]}
                    >
                      {ESTADO_ASIGNACION_LABELS[item.estado]}
                    </StatusBadge>
                    {item.entidadCodigoRef ? (
                      <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                        {item.entidadCodigoRef}
                      </span>
                    ) : null}
                    {item.obligatorio ? (
                      <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10.5px] font-medium text-warning">
                        Obligatorio
                      </span>
                    ) : null}
                    {item.anonimoEnReportes ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[10.5px] font-medium text-info">
                        <EyeOff className="size-3" />
                        Anónimo
                      </span>
                    ) : null}
                  </div>

                  <h2 className="font-heading text-sm font-semibold text-foreground sm:text-base">
                    {item.cuestionarioNombre}
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {item.evaluadoNombre ? (
                      <span className="inline-flex items-center gap-1">
                        <UserCheck className="size-3.5 text-primary" />
                        Evaluado:{" "}
                        <strong className="font-medium text-foreground">
                          {item.evaluadoNombre}
                        </strong>
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {isPendiente
                        ? `Habilitado: ${formatDate(item.fechaHabilitacion)}`
                        : `Respondido: ${formatDate(item.fechaRespuesta)}`}
                    </span>
                    {!isPendiente && item.porcentaje !== null ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-success tabular-nums">
                        <Award className="size-3.5" />
                        {formatPorcentaje(item.porcentaje)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {isPendiente ? (
                    <Button
                      type="button"
                      size="lg"
                      onClick={() =>
                        setActiveDialog({ id: item.id, mode: "responder" })
                      }
                      className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
                    >
                      <Star className="size-3.5" />
                      Responder
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() =>
                        setActiveDialog({ id: item.id, mode: "ver" })
                      }
                      className="h-9 gap-1.5 rounded-xl text-xs font-medium"
                    >
                      <Eye className="size-3.5" />
                      Ver respuesta
                    </Button>
                  )}
                </div>
              </article>
            )
          })}

          {listQuery.data && listQuery.data.totalPages > 1 ? (
            <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
              <Pagination page={listQuery.data} onPageChange={setPage} />
            </div>
          ) : null}
        </div>
      )}

      <ResponderCuestionarioDialog
        asignacionId={activeDialog?.id ?? null}
        open={Boolean(activeDialog)}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null)
        }}
        mode={activeDialog?.mode ?? "responder"}
      />
    </PageShell>
  )
}

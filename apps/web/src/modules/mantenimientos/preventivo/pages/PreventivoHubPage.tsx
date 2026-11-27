import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  History,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { OptionsCombobox } from "@/shared/components/options-combobox"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/utils"

import { planMantenimientoQueries } from "../../plan-mantenimiento/api/plan-mantenimiento.queries"
import { useProgramaciones } from "../../programacion-mantenimiento/api/programacion-mantenimiento.queries"
import { programacionMantenimientoKeys } from "../../programacion-mantenimiento/api/programacion-mantenimiento.keys"
import { evaluarTodasProgramaciones } from "../../programacion-mantenimiento/api/programacion-mantenimiento.service"
import {
  construirFilasSeguimiento,
  filtrarFilasSeguimiento,
  type FiltroAlertaSeguimiento,
  type NivelAlertaSeguimiento,
} from "../../programacion-mantenimiento/lib/seguimiento-alertas"
import {
  generarOrdenTrabajoDesdeProgramacion,
  updateConfiguracionPreventiva,
} from "../api/preventivo.service"
import { preventivoKeys, preventivoQueries } from "../api/preventivo.queries"
import { configuracionPreventivaSchema } from "../schemas/preventivo.schema"

type HubTab = "planes" | "seguimiento" | "historico" | "configurar"

const ALERTA_FILTER_OPTIONS = [
  { value: "TODOS", label: "Todas las alertas" },
  { value: "CRITICO", label: "Crítico / Vencido" },
  { value: "PROXIMO", label: "Próximo" },
  { value: "AL_DIA", label: "Al día" },
]

const HIST_FILTER_OPTIONS = [
  { value: "todos", label: "Todos los ciclos" },
  { value: "pendientes", label: "Pendientes" },
  { value: "completados", label: "Completados" },
]

const ALERTA_BADGE: Record<
  NivelAlertaSeguimiento,
  { label: string; variant: "destructive" | "secondary" | "default" | "outline" }
> = {
  CRITICO: { label: "Crítico / Vencido", variant: "destructive" },
  PROXIMO: { label: "Próximo", variant: "secondary" },
  AL_DIA: { label: "Al día", variant: "default" },
  INACTIVO: { label: "Inactivo", variant: "outline" },
}

export function PreventivoHubPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<HubTab>("planes")
  const [segSearch, setSegSearch] = useState("")
  const [segAlerta, setSegAlerta] = useState<FiltroAlertaSeguimiento>("TODOS")
  const [histPage, setHistPage] = useState(0)
  const [histQuery, setHistQuery] = useState("")
  const [histCompletado, setHistCompletado] = useState<"todos" | "pendientes" | "completados">(
    "todos",
  )

  const planesQuery = useQuery(
    planMantenimientoQueries.list({ page: 0, size: 50, sortBy: "nombre", direction: "ASC" }),
  )
  const programacionesQuery = useProgramaciones({
    activo: true,
    page: 0,
    size: 50,
    sortBy: "id",
    direction: "ASC",
  })
  const historicoQuery = useQuery(
    preventivoQueries.historico({
      page: histPage,
      size: 20,
      ...(histQuery.trim() ? { q: histQuery.trim() } : {}),
      ...(histCompletado === "todos"
        ? {}
        : { completado: histCompletado === "completados" }),
    }),
  )
  const configQuery = useQuery(preventivoQueries.configuracion())

  const todasFilas = useMemo(
    () => construirFilasSeguimiento(programacionesQuery.data?.content ?? []),
    [programacionesQuery.data?.content],
  )

  const kpis = useMemo(
    () => ({
      criticos: todasFilas.filter((f) => f.estadoAlerta === "CRITICO").length,
      proximos: todasFilas.filter((f) => f.estadoAlerta === "PROXIMO").length,
      alDia: todasFilas.filter((f) => f.estadoAlerta === "AL_DIA").length,
    }),
    [todasFilas],
  )

  const filasSeguimiento = useMemo(
    () =>
      filtrarFilasSeguimiento(todasFilas, {
        q: segSearch,
        filtroAlerta: segAlerta,
        filtroCriterio: "TODOS",
      }),
    [todasFilas, segSearch, segAlerta],
  )

  const [draftConfig, setDraftConfig] = useState<{
    dias: string
    km: string
    horas: string
    autoEval: boolean
    cron: string
  } | null>(null)

  const dias = draftConfig?.dias ?? String(configQuery.data?.diasAnticipacionAlerta ?? 15)
  const km = draftConfig?.km ?? String(configQuery.data?.kmAnticipacionAlerta ?? 500)
  const horas = draftConfig?.horas ?? String(configQuery.data?.horasAnticipacionAlerta ?? 50)
  const autoEval =
    draftConfig?.autoEval ?? (configQuery.data?.evaluacionAutomaticaHabilitada ?? true)
  const cron = draftConfig?.cron ?? (configQuery.data?.cronEvaluacion ?? "0 0 6 * * *")

  function updateDraft(
    patch: Partial<{ dias: string; km: string; horas: string; autoEval: boolean; cron: string }>,
  ) {
    setDraftConfig({ dias, km, horas, autoEval, cron, ...patch })
  }

  const saveConfigMutation = useMutation({
    mutationFn: updateConfiguracionPreventiva,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: preventivoKeys.configuracion() })
      toast.success("Configuración preventiva actualizada")
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const evaluarTodasMutation = useMutation({
    mutationFn: evaluarTodasProgramaciones,
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
      toast.success(
        `Evaluación completada: ${res.totalEvaluadas} revisadas, ${res.cumplieronCriterio} cumplieron criterio`,
      )
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const generarOtMutation = useMutation({
    mutationFn: (programacionId: string) => generarOrdenTrabajoDesdeProgramacion(programacionId),
    onSuccess: async (ot) => {
      await queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
      toast.success(`Orden de Trabajo ${ot.numero} generada`)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  function handleSaveConfig() {
    const parsed = configuracionPreventivaSchema.safeParse({
      diasAnticipacionAlerta: Number(dias),
      kmAnticipacionAlerta: Number(km),
      horasAnticipacionAlerta: Number(horas),
      evaluacionAutomaticaHabilitada: autoEval,
      cronEvaluacion: cron,
    })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revisa los valores de configuración")
      return
    }
    saveConfigMutation.mutate(parsed.data)
  }

  const planes = planesQuery.data?.content ?? []
  const historico = historicoQuery.data?.content ?? []

  const tabs: Array<{ id: HubTab; label: string; count?: number; icon: typeof ClipboardList }> = [
    { id: "planes", label: "1. Planes", count: planes.length, icon: ClipboardList },
    { id: "seguimiento", label: "2. Seguimiento", count: todasFilas.length, icon: CalendarClock },
    { id: "historico", label: "3. Histórico", count: historicoQuery.data?.totalElements, icon: History },
    { id: "configurar", label: "4. Configurar", icon: Settings },
  ]

  return (
    <PageShell>
      <div className="space-y-5 pb-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-foreground">
              Mantenimiento Preventivo
            </h1>
            <p className="text-xs text-muted-foreground">
              Gestiona planes, vencimientos por fecha/km/horas, histórico de ejecuciones y umbrales de alerta en un solo lugar.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => void navigate({ to: "/mantenimientos/planes-mantenimiento/nuevo" })}
          >
            <Plus className="mr-1.5 size-4" />
            Crear Plan Preventivo
          </Button>
        </header>

        <nav
          aria-label="Secciones de mantenimiento preventivo"
          role="tablist"
          className="flex flex-wrap gap-2"
        >
          {tabs.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium cursor-pointer transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
                {typeof item.count === "number" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px]",
                      active ? "bg-primary-foreground/20" : "bg-muted text-foreground",
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {tab === "planes" && (
          <section className="space-y-3">
            {planesQuery.isLoading ? (
              <ListSkeleton rows={4} />
            ) : planesQuery.isError ? (
              <div
                role="alert"
                className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive"
              >
                <span>{getErrorMessage(planesQuery.error)}</span>
                <Button size="sm" variant="outline" onClick={() => void planesQuery.refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : planes.length === 0 ? (
              <EmptyState
                bordered
                title="Aún no hay planes preventivos creados"
                description="Crea tu primer plan eligiendo tipo de activo, frecuencia (días, km u horas), actividades y equipos."
                action={
                  <Button
                    size="sm"
                    onClick={() => void navigate({ to: "/mantenimientos/planes-mantenimiento/nuevo" })}
                  >
                    <Plus className="mr-1.5 size-4" />
                    Crear Primer Plan
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {planes.map((plan) => (
                  <article
                    key={plan.id}
                    className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-mono text-muted-foreground">{plan.codigo}</span>
                          <h2 className="text-sm font-semibold text-foreground">{plan.nombre}</h2>
                        </div>
                        <Badge variant="outline">{plan.totalActividades ?? 0} act.</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {plan.descripcion || "Sin descripción"}
                      </p>
                      <div className="text-[11px] text-muted-foreground">
                        Tipo de activo: <strong className="text-foreground">{plan.tipoActivoNombre ?? "—"}</strong>
                      </div>
                    </div>
                    <div className="flex justify-end border-t border-border/50 pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          void navigate({
                            to: "/mantenimientos/planes-mantenimiento/$planId/editar",
                            params: { planId: plan.id },
                          })
                        }
                      >
                        <Pencil className="mr-1.5 size-3.5" />
                        Editar Plan
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "seguimiento" && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                aria-pressed={segAlerta === "CRITICO"}
                onClick={() => setSegAlerta(segAlerta === "CRITICO" ? "TODOS" : "CRITICO")}
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-4 text-left cursor-pointer transition-colors",
                  segAlerta === "CRITICO"
                    ? "border-destructive bg-destructive/10"
                    : "border-border/70 bg-card hover:bg-muted/30",
                )}
              >
                <div>
                  <div className="text-xs text-muted-foreground">Críticos / Vencidos</div>
                  <div className="text-2xl font-bold text-destructive">{kpis.criticos}</div>
                </div>
                <AlertTriangle className="size-6 text-destructive" />
              </button>
              <button
                type="button"
                aria-pressed={segAlerta === "PROXIMO"}
                onClick={() => setSegAlerta(segAlerta === "PROXIMO" ? "TODOS" : "PROXIMO")}
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-4 text-left cursor-pointer transition-colors",
                  segAlerta === "PROXIMO"
                    ? "border-primary bg-primary/10"
                    : "border-border/70 bg-card hover:bg-muted/30",
                )}
              >
                <div>
                  <div className="text-xs text-muted-foreground">Próximos a vencer</div>
                  <div className="text-2xl font-bold text-foreground">{kpis.proximos}</div>
                </div>
                <Clock className="size-6 text-muted-foreground" />
              </button>
              <button
                type="button"
                aria-pressed={segAlerta === "AL_DIA"}
                onClick={() => setSegAlerta(segAlerta === "AL_DIA" ? "TODOS" : "AL_DIA")}
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-4 text-left cursor-pointer transition-colors",
                  segAlerta === "AL_DIA"
                    ? "border-primary bg-primary/10"
                    : "border-border/70 bg-card hover:bg-muted/30",
                )}
              >
                <div>
                  <div className="text-xs text-muted-foreground">Al día</div>
                  <div className="text-2xl font-bold text-primary">{kpis.alDia}</div>
                </div>
                <CheckCircle2 className="size-6 text-primary" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="w-full max-w-xs">
                  <SearchField
                    value={segSearch}
                    onChange={setSegSearch}
                    placeholder="Filtrar por activo o plan..."
                  />
                </div>
                <div className="w-48">
                  <OptionsCombobox
                    ariaLabel="Filtrar por estado de alerta"
                    options={ALERTA_FILTER_OPTIONS}
                    value={segAlerta}
                    onValueChange={(v) => setSegAlerta((v || "TODOS") as FiltroAlertaSeguimiento)}
                    showClear={false}
                  />
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={evaluarTodasMutation.isPending}
                onClick={() => evaluarTodasMutation.mutate()}
              >
                <RefreshCw
                  className={cn("mr-1.5 size-4", evaluarTodasMutation.isPending && "animate-spin")}
                />
                Revisar Vencimientos
              </Button>
            </div>

            {programacionesQuery.isLoading ? (
              <ListSkeleton rows={4} />
            ) : programacionesQuery.isError ? (
              <div
                role="alert"
                className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive"
              >
                <span>{getErrorMessage(programacionesQuery.error)}</span>
                <Button size="sm" variant="outline" onClick={() => void programacionesQuery.refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : filasSeguimiento.length === 0 ? (
              <EmptyState
                bordered
                title="No hay programaciones para mostrar"
                description="Asigna activos a un plan preventivo desde el Wizard para ver aquí su semáforo de vencimiento."
              />
            ) : (
              <div className="space-y-2">
                {filasSeguimiento.map((fila) => {
                  const badge = ALERTA_BADGE[fila.estadoAlerta]
                  return (
                    <div
                      key={fila.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {fila.activoCodigo} — {fila.activoNombre}
                          </span>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Plan: <strong className="text-foreground">{fila.planNombre}</strong> · {fila.frecuenciaLabel} ·{" "}
                          {fila.lecturaActualLabel} → {fila.proximoUmbralLabel} ({fila.margenRestanteLabel})
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={generarOtMutation.isPending}
                        onClick={() => generarOtMutation.mutate(fila.programacionId)}
                      >
                        {generarOtMutation.isPending ? (
                          <Loader2 className="mr-1.5 size-4 animate-spin" />
                        ) : (
                          <Wrench className="mr-1.5 size-4" />
                        )}
                        Generar OT
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {tab === "historico" && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full max-w-sm">
                <SearchField
                  value={histQuery}
                  onChange={(v) => {
                    setHistQuery(v)
                    setHistPage(0)
                  }}
                  placeholder="Buscar por plan, activo o solicitud..."
                />
              </div>
              <div className="w-48">
                <OptionsCombobox
                  ariaLabel="Filtrar histórico por estado"
                  options={HIST_FILTER_OPTIONS}
                  value={histCompletado}
                  onValueChange={(v) => {
                    setHistCompletado((v || "todos") as "todos" | "pendientes" | "completados")
                    setHistPage(0)
                  }}
                  showClear={false}
                />
              </div>
            </div>

            {historicoQuery.isLoading ? (
              <ListSkeleton rows={4} />
            ) : historicoQuery.isError ? (
              <div
                role="alert"
                className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive"
              >
                <span>{getErrorMessage(historicoQuery.error)}</span>
                <Button size="sm" variant="outline" onClick={() => void historicoQuery.refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : historico.length === 0 ? (
              <EmptyState
                bordered
                title="Sin registros en el histórico todavía"
                description="Aquí aparecerá cada ciclo preventivo disparado o completado junto con su fecha, lectura y OT."
              />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">Histórico de ejecuciones de mantenimiento preventivo</caption>
                  <thead className="border-b border-border/60 bg-muted/40 text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Plan</th>
                      <th scope="col" className="px-4 py-3 font-medium">Activo</th>
                      <th scope="col" className="px-4 py-3 font-medium">Criterio</th>
                      <th scope="col" className="px-4 py-3 font-medium">Disparo</th>
                      <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {historico.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {item.planCodigo ? `${item.planCodigo} · ${item.planNombre}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {item.activoCodigo ? `${item.activoCodigo} · ${item.activoNombre}` : "—"}
                        </td>
                        <td className="px-4 py-3">{item.tipoCriterioDisparador}</td>
                        <td className="px-4 py-3">{item.valorDisparador}</td>
                        <td className="px-4 py-3">
                          <Badge variant={item.completado ? "default" : "secondary"}>
                            {item.completado ? "Completado" : "Pendiente"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {historicoQuery.data && (
              <Pagination page={historicoQuery.data} onPageChange={setHistPage} />
            )}
          </section>
        )}

        {tab === "configurar" && (
          <section className="max-w-2xl space-y-5 rounded-2xl border border-border/70 bg-card p-5">
            {configQuery.isLoading ? (
              <ListSkeleton rows={3} />
            ) : configQuery.isError ? (
              <div
                role="alert"
                className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive"
              >
                <span>{getErrorMessage(configQuery.error)}</span>
                <Button size="sm" variant="outline" onClick={() => void configQuery.refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Umbrales de Alerta Preventiva</h2>
                  <p className="text-xs text-muted-foreground">
                    Define con cuánta anticipación el sistema marca un equipo como <strong>Próximo</strong> antes de vencerse.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cfg-dias">Días antes de vencer</Label>
                    <Input
                      id="cfg-dias"
                      type="number"
                      min={1}
                      value={dias}
                      onChange={(e) => updateDraft({ dias: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cfg-km">Km antes de vencer</Label>
                    <Input
                      id="cfg-km"
                      type="number"
                      min={1}
                      value={km}
                      onChange={(e) => updateDraft({ km: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cfg-horas">Horas antes de vencer</Label>
                    <Input
                      id="cfg-horas"
                      type="number"
                      min={1}
                      value={horas}
                      onChange={(e) => updateDraft({ horas: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3 border-t border-border/60 pt-4">
                  <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary rounded border-input cursor-pointer"
                      checked={autoEval}
                      onChange={(e) => updateDraft({ autoEval: e.target.checked })}
                    />
                    <span>Evaluar vencimientos automáticamente cada día</span>
                  </label>
                  <div className="max-w-xs space-y-1.5">
                    <Label htmlFor="cfg-cron">Horario automático (Cron)</Label>
                    <Input
                      id="cfg-cron"
                      value={cron}
                      onChange={(e) => updateDraft({ cron: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    disabled={saveConfigMutation.isPending}
                    onClick={handleSaveConfig}
                  >
                    {saveConfigMutation.isPending ? "Guardando..." : "Guardar Configuración"}
                  </Button>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </PageShell>
  )
}

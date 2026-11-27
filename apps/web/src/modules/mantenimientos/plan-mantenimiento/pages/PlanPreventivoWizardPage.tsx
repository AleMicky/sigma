import { type KeyboardEvent, useMemo, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useRouter } from "@tanstack/react-router"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Hourglass,
  Info,
  Loader2,
  type LucideIcon,
  Sparkles,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { RequiredFieldLabel } from "@/shared/components/form-dialog"
import { FormSection } from "@/shared/components/form-section"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { OptionsCombobox } from "@/shared/components/options-combobox"
import { PageShell } from "@/shared/components/page-shell"
import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import { actividadAplicacionQueries } from "../../actividad/api/actividad-aplicacion.queries"
import type { TipoCriterioMantenimiento } from "../../preventivo/api/preventivo.service"
import { tipoMantenimientoQueries } from "../../tipo-mantenimiento/api/tipo-mantenimiento.queries"
import { planMantenimientoKeys } from "../api/plan-mantenimiento.keys"
import {
  createPlanPreventivoCompleto,
  getPlanPreventivoCompleto,
  updatePlanPreventivoCompleto,
  type EstadoPlanMantenimiento,
} from "../api/plan-preventivo.service"
import { planPreventivoWizardSchema } from "../schemas/plan-preventivo.schema"

type StepId = 1 | 2 | 3

type ActivoDraftConfig = {
  fechaInicio: string
  kilometrajeInicial?: string
  horasUsoInicial?: string
}

type PlanDraft = {
  codigo: string
  nombre: string
  tipoActivoId: string
  tipoMantenimientoId: string
  descripcion: string
  estado: EstadoPlanMantenimiento
  criterioDefaultTipo: TipoCriterioMantenimiento
  criterioDefaultDias: string
  criterioDefaultUso: string
  actividades: Record<string, { orden: number; obligatorio: boolean }>
  activos: Record<string, ActivoDraftConfig>
}

const ESTADO_OPTIONS = [
  { value: "ACTIVO", label: "Activo" },
  { value: "BORRADOR", label: "Borrador" },
  { value: "INACTIVO", label: "Inactivo" },
]

const PRESETS_DIAS = [
  { label: "Mensual (30 d)", value: "30" },
  { label: "Trimestral (90 d)", value: "90" },
  { label: "Semestral (180 d)", value: "180" },
  { label: "Anual (365 d)", value: "365" },
]

const PRESETS_KM = [
  { label: "5,000 km", value: "5000" },
  { label: "10,000 km", value: "10000" },
  { label: "20,000 km", value: "20000" },
]

const PRESETS_HORAS = [
  { label: "250 hrs", value: "250" },
  { label: "500 hrs", value: "500" },
  { label: "1,000 hrs", value: "1000" },
]

const CRITERIO_OPTIONS: ReadonlyArray<{
  id: TipoCriterioMantenimiento
  label: string
  desc: string
  icon: LucideIcon
}> = [
  { id: "TIEMPO", label: "Por Fecha (Días)", desc: "Ej. cada 30, 90 o 180 días", icon: CalendarClock },
  { id: "KILOMETRAJE", label: "Por Kilometraje (Km)", desc: "Ideal para vehículos", icon: Gauge },
  { id: "HORAS_USO", label: "Por Horas de Uso", desc: "Ideal para generadores/equipos", icon: Hourglass },
]

export function PlanPreventivoWizardPage({ planId }: { planId?: string }) {
  const isEditing = Boolean(planId)
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [step, setStep] = useState<StepId>(1)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState<PlanDraft | null>(null)
  const [actividadSearch, setActividadSearch] = useState("")
  const [activoSearch, setActivoSearch] = useState("")
  const criterioRadioRefs = useRef<Partial<Record<TipoCriterioMantenimiento, HTMLButtonElement | null>>>({})

  const planCompletoQuery = useQuery({
    queryKey: [...planMantenimientoKeys.all, "completo", planId ?? "new"],
    queryFn: () => getPlanPreventivoCompleto(planId!),
    enabled: Boolean(planId),
  })

  const baseDraft: PlanDraft = useMemo(() => {
    const data = planCompletoQuery.data
    if (!data) {
      return {
        codigo: "",
        nombre: "",
        tipoActivoId: "",
        tipoMantenimientoId: "",
        descripcion: "",
        estado: "ACTIVO",
        criterioDefaultTipo: "TIEMPO",
        criterioDefaultDias: "90",
        criterioDefaultUso: "5000",
        actividades: {},
        activos: {},
      }
    }
    const actMap: PlanDraft["actividades"] = {}
    for (const act of data.actividades ?? []) {
      actMap[act.actividadMantenimientoAplicacionId] = {
        orden: act.orden,
        obligatorio: act.obligatorio,
      }
    }
    const hoy = new Date().toISOString().slice(0, 10)
    const activosMap: PlanDraft["activos"] = {}
    for (const a of data.activos ?? []) {
      activosMap[a.activoId] = {
        fechaInicio: a.fechaInicio ?? hoy,
      }
    }
    return {
      codigo: data.plan.codigo,
      nombre: data.plan.nombre,
      tipoActivoId: data.plan.tipoActivoId,
      tipoMantenimientoId: data.tipoMantenimientoId ?? "",
      descripcion: data.plan.descripcion ?? "",
      estado: data.estado ?? "ACTIVO",
      criterioDefaultTipo: data.criterioDefaultTipo ?? "TIEMPO",
      criterioDefaultDias: String(data.criterioDefaultDias ?? 90),
      criterioDefaultUso: String(data.criterioDefaultUso ?? 5000),
      actividades: actMap,
      activos: activosMap,
    }
  }, [planCompletoQuery.data])

  const current = draft ?? baseDraft

  function clearFieldErrorsForPatch(patch: Partial<PlanDraft>) {
    const keysToClear: string[] = []
    if (patch.tipoActivoId !== undefined) keysToClear.push("tipoActivoId")
    if (patch.nombre !== undefined) keysToClear.push("nombre")
    if (patch.codigo !== undefined) keysToClear.push("codigo")
    if (patch.criterioDefaultDias !== undefined) keysToClear.push("criterioDefaultDias")
    if (patch.criterioDefaultUso !== undefined) keysToClear.push("criterioDefaultUso")
    if (patch.criterioDefaultTipo !== undefined) {
      keysToClear.push("criterioDefaultDias", "criterioDefaultUso")
    }
    if (keysToClear.length === 0) return
    setFieldErrors((prev) => {
      let changed = false
      const next = { ...prev }
      for (const key of keysToClear) {
        if (next[key]) {
          delete next[key]
          changed = true
        }
      }
      return changed ? next : prev
    })
  }

  function updateDraft(patch: Partial<PlanDraft>) {
    setDraft({ ...current, ...patch })
    clearFieldErrorsForPatch(patch)
  }

  function goBack() {
    if (window.history.length > 1) {
      router.history.back()
    } else {
      void navigate({ to: "/mantenimientos/preventivo" })
    }
  }

  const tiposActivoQuery = useQuery(
    tipoActivoQueries.list({ page: 0, size: 200, sortBy: "nombre", direction: "ASC" }),
  )
  const tiposMantQuery = useQuery(
    tipoMantenimientoQueries.list({ page: 0, size: 100, sortBy: "nombre", direction: "ASC" }),
  )
  const aplicacionesQuery = useQuery(
    actividadAplicacionQueries.list({ page: 0, size: 300 }),
  )
  const activosQuery = useQuery({
    ...activoQueries.list({
      page: 0,
      size: 200,
      ...(current.tipoActivoId ? { tipoActivoId: current.tipoActivoId } : {}),
    }),
    enabled: Boolean(current.tipoActivoId),
  })

  const tiposActivo = useMemo(
    () => tiposActivoQuery.data?.content ?? [],
    [tiposActivoQuery.data?.content],
  )
  const tiposMantenimiento = useMemo(
    () => tiposMantQuery.data?.content ?? [],
    [tiposMantQuery.data?.content],
  )

  const tipoActivoOptions = useMemo(
    () => tiposActivo.map((t) => ({ value: t.id, label: t.nombre })),
    [tiposActivo],
  )
  const tipoMantOptions = useMemo(
    () => tiposMantenimiento.map((tm) => ({ value: tm.id, label: tm.nombre })),
    [tiposMantenimiento],
  )

  const tipoActivoSeleccionado = tiposActivo.find((t) => t.id === current.tipoActivoId)

  const aplicaciones = useMemo(() => {
    const all = aplicacionesQuery.data?.content ?? []
    const byTipo = current.tipoActivoId
      ? all.filter((a) => a.tipoActivo?.id === current.tipoActivoId)
      : all
    const q = actividadSearch.trim().toLowerCase()
    if (!q) return byTipo
    return byTipo.filter((a) =>
      `${a.actividad?.nombre ?? ""} ${a.actividad?.codigo ?? ""}`.toLowerCase().includes(q),
    )
  }, [aplicacionesQuery.data?.content, current.tipoActivoId, actividadSearch])

  const activos = useMemo(() => {
    const all = activosQuery.data?.content ?? []
    if (!current.tipoActivoId) return []
    const byTipo = all.filter((a) => a.tipoActivoId === current.tipoActivoId)
    const q = activoSearch.trim().toLowerCase()
    if (!q) return byTipo
    return byTipo.filter((a) =>
      `${a.codigo} ${a.nombre}`.toLowerCase().includes(q),
    )
  }, [activosQuery.data?.content, current.tipoActivoId, activoSearch])

  const saveMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createPlanPreventivoCompleto>[0]) =>
      isEditing && planId
        ? updatePlanPreventivoCompleto(planId, payload)
        : createPlanPreventivoCompleto(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: planMantenimientoKeys.all })
      toast.success(
        isEditing
          ? "Plan preventivo actualizado correctamente"
          : "Plan preventivo creado y programado correctamente",
      )
      goBack()
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })

  function sugerirCodigo() {
    const prefijoTipo = (tipoActivoSeleccionado?.nombre ?? "ACT")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 4)
      .toUpperCase()
    const sufijo =
      current.criterioDefaultTipo === "TIEMPO"
        ? `${current.criterioDefaultDias || "90"}D`
        : current.criterioDefaultTipo === "KILOMETRAJE"
          ? `${current.criterioDefaultUso || "5000"}KM`
          : `${current.criterioDefaultUso || "250"}H`
    updateDraft({ codigo: `PREV-${prefijoTipo}-${sufijo}`.slice(0, 30) })
  }

  function validateStep1(): boolean {
    const diasRaw = current.criterioDefaultDias.trim()
    const usoRaw = current.criterioDefaultUso.trim()
    const parsed = planPreventivoWizardSchema.safeParse({
      tipoActivoId: current.tipoActivoId,
      tipoMantenimientoId: current.tipoMantenimientoId || undefined,
      codigo: current.codigo,
      nombre: current.nombre,
      descripcion: current.descripcion || undefined,
      estado: current.estado,
      criterioDefaultTipo: current.criterioDefaultTipo,
      criterioDefaultDias:
        current.criterioDefaultTipo === "TIEMPO"
          ? diasRaw === ""
            ? undefined
            : Number(diasRaw)
          : undefined,
      criterioDefaultUso:
        current.criterioDefaultTipo !== "TIEMPO"
          ? usoRaw === ""
            ? undefined
            : Number(usoRaw)
          : undefined,
    })

    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form")
        if (!next[key]) next[key] = issue.message
      }
      setFieldErrors(next)
      toast.error("Completa los campos obligatorios marcados en rojo")
      return false
    }
    setFieldErrors({})
    return true
  }

  function toggleActividad(appId: string) {
    const prev = current.actividades
    if (prev[appId]) {
      const copy = { ...prev }
      delete copy[appId]
      updateDraft({ actividades: copy })
      return
    }
    const nextOrden = Math.max(0, ...Object.values(prev).map((v) => v.orden)) + 1
    updateDraft({
      actividades: {
        ...prev,
        [appId]: { orden: nextOrden, obligatorio: true },
      },
    })
  }

  function selectAllActividades() {
    const next = { ...current.actividades }
    let orden = Math.max(0, ...Object.values(next).map((v) => v.orden)) + 1
    for (const app of aplicaciones) {
      if (!next[app.id]) {
        next[app.id] = { orden: orden++, obligatorio: true }
      }
    }
    updateDraft({ actividades: next })
  }

  function toggleObligatorio(appId: string) {
    const prev = current.actividades[appId]
    if (!prev) return
    updateDraft({
      actividades: {
        ...current.actividades,
        [appId]: { ...prev, obligatorio: !prev.obligatorio },
      },
    })
  }

  function toggleActivo(activoId: string) {
    const hoy = new Date().toISOString().slice(0, 10)
    const prev = current.activos
    if (prev[activoId]) {
      const copy = { ...prev }
      delete copy[activoId]
      updateDraft({ activos: copy })
      return
    }
    updateDraft({
      activos: { ...prev, [activoId]: { fechaInicio: hoy } },
    })
  }

  function updateActivoConfig(activoId: string, patch: Partial<ActivoDraftConfig>) {
    const existing = current.activos[activoId]
    if (!existing) return
    updateDraft({
      activos: {
        ...current.activos,
        [activoId]: { ...existing, ...patch },
      },
    })
  }

  function selectAllActivos() {
    const hoy = new Date().toISOString().slice(0, 10)
    const next: Record<string, ActivoDraftConfig> = { ...current.activos }
    for (const a of activos) {
      next[a.id] = next[a.id] ?? { fechaInicio: hoy }
    }
    updateDraft({ activos: next })
  }

  function handleSubmit() {
    if (!validateStep1()) {
      setStep(1)
      return
    }
    saveMutation.mutate({
      tipoActivoId: current.tipoActivoId,
      tipoMantenimientoId: current.tipoMantenimientoId || null,
      codigo: current.codigo.trim(),
      nombre: current.nombre.trim(),
      descripcion: current.descripcion.trim() || null,
      estado: current.estado,
      criterioDefaultTipo: current.criterioDefaultTipo,
      criterioDefaultDias:
        current.criterioDefaultTipo === "TIEMPO" ? Number(current.criterioDefaultDias) : null,
      criterioDefaultUso:
        current.criterioDefaultTipo !== "TIEMPO" ? Number(current.criterioDefaultUso) : null,
      actividades: Object.entries(current.actividades).map(([id, cfg]) => ({
        actividadMantenimientoAplicacionId: id,
        orden: cfg.orden,
        obligatorio: cfg.obligatorio,
      })),
      activos: Object.entries(current.activos).map(([id, cfg]) => ({
        activoId: id,
        fechaInicio: cfg.fechaInicio || null,
        activo: true,
        kilometrajeInicial: cfg.kilometrajeInicial ? Number(cfg.kilometrajeInicial) : null,
        horasUsoInicial: cfg.horasUsoInicial ? Number(cfg.horasUsoInicial) : null,
      })),
    })
  }

  function handleCriterioKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIndex = (index + 1) % CRITERIO_OPTIONS.length
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIndex = (index - 1 + CRITERIO_OPTIONS.length) % CRITERIO_OPTIONS.length
    }
    if (nextIndex === null) return
    e.preventDefault()
    const nextCrit = CRITERIO_OPTIONS[nextIndex]
    updateDraft({ criterioDefaultTipo: nextCrit.id })
    criterioRadioRefs.current[nextCrit.id]?.focus()
  }

  const totalActividadesSel = Object.keys(current.actividades).length
  const totalActivosSel = Object.keys(current.activos).length

  const frecuenciaResumen =
    current.criterioDefaultTipo === "TIEMPO"
      ? `Cada ${current.criterioDefaultDias || "?"} días`
      : current.criterioDefaultTipo === "KILOMETRAJE"
        ? `Cada ${current.criterioDefaultUso || "?"} km`
        : `Cada ${current.criterioDefaultUso || "?"} horas de uso`

  const steps: Array<{ id: StepId; label: string; hint: string; icon: LucideIcon }> = [
    { id: 1, label: "1. Qué y cada cuánto", hint: "Tipo de activo y frecuencia", icon: CalendarClock },
    { id: 2, label: "2. Qué tareas hacer", hint: `${totalActividadesSel} seleccionadas`, icon: ClipboardList },
    { id: 3, label: "3. A qué activos", hint: `${totalActivosSel} asignados`, icon: Wrench },
  ]

  return (
    <PageShell
      size="full"
      padding="none"
      layout="auto"
      className="w-full max-w-5xl mx-auto space-y-5 pb-12"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-xl"
            aria-label="Volver"
            onClick={goBack}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <CalendarClock className="size-4 sm:size-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground break-words">
                {isEditing
                  ? "Editar Plan Preventivo"
                  : "Nuevo Plan de Mantenimiento Preventivo"}
              </h1>
              {isEditing && current.codigo ? (
                <Badge variant="outline" className="font-mono text-[11px] max-w-full truncate">
                  {current.codigo}
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Completa los 3 pasos: tipo de equipo y frecuencia, tareas técnicas y activos asignados.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goBack}
          className="hidden sm:inline-flex shrink-0"
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Volver
        </Button>
      </header>

      {isEditing && planCompletoQuery.isLoading ? (
        <ListSkeleton rows={5} />
      ) : isEditing && planCompletoQuery.isError ? (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive"
        >
          <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
            <AlertTriangle className="size-4 shrink-0 mt-0.5 sm:mt-0" />
            <span className="min-w-0 break-words">{getErrorMessage(planCompletoQuery.error)}</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full sm:w-auto shrink-0"
            onClick={() => void planCompletoQuery.refetch()}
          >
            Reintentar
          </Button>
        </div>
      ) : (
        <>
          <nav aria-label="Pasos del plan preventivo" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {steps.map((item) => {
              const Icon = item.icon
              const active = step === item.id
              const completed = step > item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? "step" : undefined}
                  onClick={() => {
                    if (item.id === 1 || validateStep1()) setStep(item.id)
                  }}
                  className={cn(
                    "flex min-w-0 w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active && "border-primary bg-primary/10 text-primary shadow-2xs",
                    completed && "border-border bg-muted/40 text-foreground",
                    !active && !completed && "border-border/60 text-muted-foreground hover:bg-muted/40",
                  )}
                >
                  {completed ? (
                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                  ) : (
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg border",
                        active
                          ? "border-primary/30 bg-primary/15 text-primary"
                          : "border-border/60 bg-muted/40 text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold leading-snug break-words">{item.label}</div>
                    <div className="text-[11px] opacity-80 leading-snug break-words">{item.hint}</div>
                  </div>
                </button>
              )
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-muted/30 px-4 py-2.5 text-xs">
            <Info className="size-4 text-primary shrink-0" />
            <span className="font-medium text-foreground shrink-0">Resumen:</span>
            <span className="min-w-0 flex-1 break-words">
              <strong>{current.nombre || "Sin nombre aún"}</strong>
              {tipoActivoSeleccionado ? ` (${tipoActivoSeleccionado.nombre})` : ""}
            </span>
            <div className="flex flex-wrap items-center gap-1.5 max-w-full">
              <Badge variant="outline" className="max-w-full">{frecuenciaResumen}</Badge>
              <Badge variant="secondary" className="max-w-full">{totalActividadesSel} actividades</Badge>
              <Badge variant="secondary" className="max-w-full">{totalActivosSel} activos</Badge>
            </div>
          </div>

          {step === 1 && (
            <FormSection
              step={1}
              title="Qué y cada cuánto"
              description="Define el tipo de equipo, identifica el plan y configura el criterio de mantenimiento preventivo."
              icon={CalendarClock}
              columns={1}
              contentClassName="space-y-5"
            >
              {(tiposActivoQuery.isError || tiposMantQuery.isError) && (
                <div
                  role="alert"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive"
                >
                  <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5 sm:mt-0" />
                    <span className="min-w-0 break-words">
                      {tiposActivoQuery.isError
                        ? `Error al cargar tipos de activo: ${getErrorMessage(tiposActivoQuery.error)}`
                        : `Error al cargar tipos de mantenimiento: ${getErrorMessage(tiposMantQuery.error)}`}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto shrink-0"
                    onClick={() => {
                      if (tiposActivoQuery.isError) void tiposActivoQuery.refetch()
                      if (tiposMantQuery.isError) void tiposMantQuery.refetch()
                    }}
                  >
                    Reintentar
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  data-invalid={Boolean(fieldErrors.tipoActivoId) || undefined}
                  className="min-w-0"
                >
                  <RequiredFieldLabel htmlFor="plan-tipo-activo">Tipo de activo</RequiredFieldLabel>
                  <OptionsCombobox
                    id="plan-tipo-activo"
                    size="sm"
                    disabled={tiposActivoQuery.isLoading}
                    options={tipoActivoOptions}
                    value={current.tipoActivoId}
                    onValueChange={(val) =>
                      updateDraft({
                        tipoActivoId: val,
                        actividades: {},
                        activos: {},
                      })
                    }
                    placeholder="Buscar tipo (ej. Vehículo, Generador)..."
                    aria-invalid={Boolean(fieldErrors.tipoActivoId)}
                  />
                  <FieldError errors={[fieldErrors.tipoActivoId]} />
                </Field>

                <Field
                  data-invalid={Boolean(fieldErrors.nombre) || undefined}
                  className="min-w-0"
                >
                  <RequiredFieldLabel htmlFor="plan-nombre">Nombre del Plan</RequiredFieldLabel>
                  <Input
                    id="plan-nombre"
                    className="h-9"
                    value={current.nombre}
                    onChange={(e) => updateDraft({ nombre: e.target.value })}
                    placeholder="Ej. Servicio preventivo cada 5,000 km"
                    aria-invalid={Boolean(fieldErrors.nombre)}
                  />
                  <FieldError errors={[fieldErrors.nombre]} />
                </Field>

                <Field
                  data-invalid={Boolean(fieldErrors.codigo) || undefined}
                  className="min-w-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <RequiredFieldLabel htmlFor="plan-codigo">Código único</RequiredFieldLabel>
                    <button
                      type="button"
                      onClick={sugerirCodigo}
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <Sparkles className="size-3" />
                      Generar automático
                    </button>
                  </div>
                  <Input
                    id="plan-codigo"
                    className="h-9"
                    value={current.codigo}
                    onChange={(e) => updateDraft({ codigo: e.target.value })}
                    placeholder="Ej. PREV-VEHI-5000KM"
                    aria-invalid={Boolean(fieldErrors.codigo)}
                  />
                  <FieldError errors={[fieldErrors.codigo]} />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 min-w-0">
                  <Field className="min-w-0">
                    <FieldLabel htmlFor="plan-estado">Estado</FieldLabel>
                    <OptionsCombobox
                      id="plan-estado"
                      size="sm"
                      options={ESTADO_OPTIONS}
                      value={current.estado}
                      onValueChange={(val) =>
                        updateDraft({ estado: (val || "ACTIVO") as EstadoPlanMantenimiento })
                      }
                      showClear={false}
                    />
                  </Field>
                  <Field className="min-w-0">
                    <FieldLabel htmlFor="plan-tipo-mant">Tipo Mant. (opcional)</FieldLabel>
                    <OptionsCombobox
                      id="plan-tipo-mant"
                      size="sm"
                      disabled={tiposMantQuery.isLoading}
                      options={tipoMantOptions}
                      value={current.tipoMantenimientoId}
                      onValueChange={(val) => updateDraft({ tipoMantenimientoId: val })}
                      placeholder="Opcional..."
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    ¿Cómo se controla cuándo toca mantenimiento?
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Elige si este plan se mide por calendario (días), por odómetro (km) o por horómetro (horas de uso).
                  </p>
                </div>
                <div
                  role="radiogroup"
                  aria-label="Criterio de control"
                  className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                >
                  {CRITERIO_OPTIONS.map((crit, index) => {
                    const Icon = crit.icon
                    const active = current.criterioDefaultTipo === crit.id
                    return (
                      <button
                        key={crit.id}
                        ref={(el) => {
                          criterioRadioRefs.current[crit.id] = el
                        }}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        tabIndex={active ? 0 : -1}
                        onClick={() => updateDraft({ criterioDefaultTipo: crit.id })}
                        onKeyDown={(e) => handleCriterioKeyDown(e, index)}
                        className={cn(
                          "flex min-w-0 w-full items-start gap-2.5 rounded-xl border p-3 text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/60 bg-background text-muted-foreground hover:bg-muted/40",
                        )}
                      >
                        <Icon className="size-4 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold break-words">{crit.label}</div>
                          <div className="text-[11px] opacity-80 break-words">{crit.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {current.criterioDefaultTipo === "TIEMPO" ? (
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {PRESETS_DIAS.map((p) => (
                        <Button
                          key={p.value}
                          type="button"
                          size="sm"
                          aria-pressed={current.criterioDefaultDias === p.value}
                          variant={current.criterioDefaultDias === p.value ? "default" : "outline"}
                          onClick={() => updateDraft({ criterioDefaultDias: p.value })}
                        >
                          {p.label}
                        </Button>
                      ))}
                    </div>
                    <Field
                      data-invalid={Boolean(fieldErrors.criterioDefaultDias) || undefined}
                      className="w-full max-w-xs"
                    >
                      <RequiredFieldLabel htmlFor="plan-dias">O escribe los días exactos</RequiredFieldLabel>
                      <Input
                        id="plan-dias"
                        className="h-9"
                        type="number"
                        min={1}
                        value={current.criterioDefaultDias}
                        onChange={(e) => updateDraft({ criterioDefaultDias: e.target.value })}
                        aria-invalid={Boolean(fieldErrors.criterioDefaultDias)}
                      />
                      <FieldError errors={[fieldErrors.criterioDefaultDias]} />
                    </Field>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {(current.criterioDefaultTipo === "KILOMETRAJE" ? PRESETS_KM : PRESETS_HORAS).map((p) => (
                        <Button
                          key={p.value}
                          type="button"
                          size="sm"
                          aria-pressed={current.criterioDefaultUso === p.value}
                          variant={current.criterioDefaultUso === p.value ? "default" : "outline"}
                          onClick={() => updateDraft({ criterioDefaultUso: p.value })}
                        >
                          {p.label}
                        </Button>
                      ))}
                    </div>
                    <Field
                      data-invalid={Boolean(fieldErrors.criterioDefaultUso) || undefined}
                      className="w-full max-w-xs"
                    >
                      <RequiredFieldLabel htmlFor="plan-uso">
                        O escribe el valor exacto ({current.criterioDefaultTipo === "KILOMETRAJE" ? "km" : "horas"})
                      </RequiredFieldLabel>
                      <Input
                        id="plan-uso"
                        className="h-9"
                        type="number"
                        min={1}
                        value={current.criterioDefaultUso}
                        onChange={(e) => updateDraft({ criterioDefaultUso: e.target.value })}
                        aria-invalid={Boolean(fieldErrors.criterioDefaultUso)}
                      />
                      <FieldError errors={[fieldErrors.criterioDefaultUso]} />
                    </Field>
                  </div>
                )}
              </div>

              <Field className="min-w-0">
                <FieldLabel htmlFor="plan-desc">Notas o alcance (opcional)</FieldLabel>
                <Textarea
                  id="plan-desc"
                  rows={2}
                  value={current.descripcion}
                  onChange={(e) => updateDraft({ descripcion: e.target.value })}
                  placeholder="Ej. Incluye cambio de aceite, filtros y revisión de frenos..."
                />
              </Field>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (validateStep1()) setStep(2)
                  }}
                >
                  Siguiente: Elegir Actividades
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </div>
            </FormSection>
          )}

          {step === 2 && (
            <FormSection
              step={2}
              title="Marca las tareas que debe realizar el técnico"
              description="Estas actividades se cargarán automáticamente al generar la Orden de Trabajo."
              icon={ClipboardList}
              columns={1}
              contentClassName="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="w-full sm:max-w-sm">
                  <SearchField
                    value={actividadSearch}
                    onChange={setActividadSearch}
                    placeholder="Buscar actividad por nombre o código..."
                    inputClassName="h-9 text-xs"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {aplicaciones.length > 0 && (
                    <Button type="button" variant="outline" size="sm" onClick={selectAllActividades}>
                      Marcar todas ({aplicaciones.length})
                    </Button>
                  )}
                  {totalActividadesSel > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateDraft({ actividades: {} })}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>

              {aplicacionesQuery.isLoading ? (
                <ListSkeleton rows={4} />
              ) : aplicacionesQuery.isError ? (
                <div
                  role="alert"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive"
                >
                  <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5 sm:mt-0" />
                    <span className="min-w-0 break-words">{getErrorMessage(aplicacionesQuery.error)}</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto shrink-0"
                    onClick={() => void aplicacionesQuery.refetch()}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : aplicaciones.length === 0 && actividadSearch.trim().length > 0 ? (
                <EmptyState
                  bordered
                  title="Sin resultados para la búsqueda"
                  description={`No se encontraron actividades que coincidan con "${actividadSearch.trim()}".`}
                  action={
                    <Button type="button" variant="outline" size="sm" onClick={() => setActividadSearch("")}>
                      Limpiar búsqueda
                    </Button>
                  }
                />
              ) : aplicaciones.length === 0 ? (
                <EmptyState
                  bordered
                  title="Sin actividades para este tipo de activo"
                  description={`Puedes continuar y guardar el plan para ${tipoActivoSeleccionado?.nombre ?? "este tipo"} y agregar actividades más adelante.`}
                />
              ) : (
                <div className="space-y-2">
                  {aplicaciones.map((app) => {
                    const sel = current.actividades[app.id]
                    return (
                      <div
                        key={app.id}
                        className={cn(
                          "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-xs transition-colors",
                          sel ? "border-primary/50 bg-primary/5" : "border-border/60 hover:bg-muted/30",
                        )}
                      >
                        <label className="flex min-w-0 flex-1 items-start sm:items-center gap-3 cursor-pointer">
                          <span className="relative flex size-4 shrink-0 items-center justify-center mt-0.5 sm:mt-0">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={Boolean(sel)}
                              onChange={() => toggleActividad(app.id)}
                            />
                            <span
                              aria-hidden="true"
                              className={cn(
                                "flex size-4 items-center justify-center rounded border transition-colors",
                                "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 peer-focus-visible:border-ring",
                                sel
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-input bg-background",
                              )}
                            >
                              {sel ? <Check className="size-3 stroke-[3]" /> : null}
                            </span>
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-foreground break-words">
                              {app.actividad?.nombre ?? app.actividad?.codigo ?? app.id}
                            </div>
                            {app.actividad?.codigo && (
                              <div className="text-[11px] text-muted-foreground break-words">
                                {app.actividad.codigo}
                              </div>
                            )}
                          </div>
                        </label>
                        {sel && (
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              type="button"
                              size="sm"
                              aria-pressed={sel.obligatorio}
                              variant={sel.obligatorio ? "secondary" : "outline"}
                              className="h-7 rounded-full px-2.5 text-[11px]"
                              onClick={() => toggleObligatorio(app.id)}
                            >
                              {sel.obligatorio ? "Obligatoria" : "Opcional"}
                            </Button>
                            <Badge variant="outline">#{sel.orden}</Badge>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="mr-1.5 size-4" />
                  Anterior
                </Button>
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => setStep(3)}
                >
                  Siguiente: Elegir Activos
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </div>
            </FormSection>
          )}

          {step === 3 && (
            <FormSection
              step={3}
              title="Elige a qué activos aplicar este plan"
              description={`Al guardar, cada activo marcado quedará programado automáticamente con ${frecuenciaResumen}.`}
              icon={Wrench}
              columns={1}
              contentClassName="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="w-full sm:max-w-sm">
                  <SearchField
                    value={activoSearch}
                    onChange={setActivoSearch}
                    placeholder="Buscar activo por código o nombre..."
                    inputClassName="h-9 text-xs"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activos.length > 0 && (
                    <Button type="button" variant="outline" size="sm" onClick={selectAllActivos}>
                      Marcar todos ({activos.length})
                    </Button>
                  )}
                  {totalActivosSel > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateDraft({ activos: {} })}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>

              {activosQuery.isLoading ? (
                <ListSkeleton rows={4} />
              ) : activosQuery.isError ? (
                <div
                  role="alert"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive"
                >
                  <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5 sm:mt-0" />
                    <span className="min-w-0 break-words">{getErrorMessage(activosQuery.error)}</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto shrink-0"
                    onClick={() => void activosQuery.refetch()}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : activos.length === 0 && activoSearch.trim().length > 0 ? (
                <EmptyState
                  bordered
                  title="Sin resultados para la búsqueda"
                  description={`No se encontraron activos que coincidan con "${activoSearch.trim()}".`}
                  action={
                    <Button type="button" variant="outline" size="sm" onClick={() => setActivoSearch("")}>
                      Limpiar búsqueda
                    </Button>
                  }
                />
              ) : activos.length === 0 ? (
                <EmptyState
                  bordered
                  title="Sin activos disponibles para este tipo"
                  description="Puedes guardar el plan como plantilla y asignar activos después."
                />
              ) : (
                <div className="space-y-2">
                  {activos.map((activo) => {
                    const sel = current.activos[activo.id]
                    return (
                      <div
                        key={activo.id}
                        className={cn(
                          "flex flex-col gap-3 rounded-xl border p-3 text-xs transition-colors",
                          sel ? "border-primary/50 bg-primary/5" : "border-border/60 hover:bg-muted/30",
                        )}
                      >
                        <label className="flex min-w-0 items-start sm:items-center gap-3 cursor-pointer">
                          <span className="relative flex size-4 shrink-0 items-center justify-center mt-0.5 sm:mt-0">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={Boolean(sel)}
                              onChange={() => toggleActivo(activo.id)}
                            />
                            <span
                              aria-hidden="true"
                              className={cn(
                                "flex size-4 items-center justify-center rounded border transition-colors",
                                "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 peer-focus-visible:border-ring",
                                sel
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-input bg-background",
                              )}
                            >
                              {sel ? <Check className="size-3 stroke-[3]" /> : null}
                            </span>
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-foreground break-words">{activo.nombre}</div>
                            <div className="text-[11px] text-muted-foreground break-words">{activo.codigo}</div>
                          </div>
                        </label>

                        {sel && (
                          <div className="grid grid-cols-1 gap-3 sm:pl-6 sm:grid-cols-2">
                            <div className="min-w-0 space-y-1">
                              <Label htmlFor={`activo-${activo.id}-fecha-inicio`} className="text-[11px]">
                                Fecha de inicio
                              </Label>
                              <Input
                                id={`activo-${activo.id}-fecha-inicio`}
                                type="date"
                                className="h-9 w-full min-w-0 text-xs"
                                value={sel.fechaInicio}
                                onChange={(e) =>
                                  updateActivoConfig(activo.id, { fechaInicio: e.target.value })
                                }
                              />
                            </div>
                            {current.criterioDefaultTipo === "KILOMETRAJE" && (
                              <div className="min-w-0 space-y-1">
                                <Label htmlFor={`activo-${activo.id}-km-inicial`} className="text-[11px]">
                                  Km actual (vacío = automático)
                                </Label>
                                <Input
                                  id={`activo-${activo.id}-km-inicial`}
                                  type="number"
                                  className="h-9 w-full min-w-0 text-xs"
                                  placeholder="Usa lectura actual"
                                  value={sel.kilometrajeInicial ?? ""}
                                  onChange={(e) =>
                                    updateActivoConfig(activo.id, {
                                      kilometrajeInicial: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            )}
                            {current.criterioDefaultTipo === "HORAS_USO" && (
                              <div className="min-w-0 space-y-1">
                                <Label htmlFor={`activo-${activo.id}-horas-inicial`} className="text-[11px]">
                                  Horas actuales (vacío = automático)
                                </Label>
                                <Input
                                  id={`activo-${activo.id}-horas-inicial`}
                                  type="number"
                                  className="h-9 w-full min-w-0 text-xs"
                                  placeholder="Usa horómetro actual"
                                  value={sel.horasUsoInicial ?? ""}
                                  onChange={(e) =>
                                    updateActivoConfig(activo.id, {
                                      horasUsoInicial: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft className="mr-1.5 size-4" />
                  Anterior
                </Button>
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  disabled={saveMutation.isPending}
                  onClick={handleSubmit}
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1.5 size-4 animate-spin" />
                      Guardando Plan...
                    </>
                  ) : (
                    <>
                      <Check className="mr-1.5 size-4" />
                      {isEditing ? "Guardar Cambios del Plan" : "Guardar y Activar Plan"}
                    </>
                  )}
                </Button>
              </div>
            </FormSection>
          )}
        </>
      )}
    </PageShell>
  )
}

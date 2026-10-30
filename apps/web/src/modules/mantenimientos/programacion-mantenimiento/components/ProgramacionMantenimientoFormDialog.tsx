import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  CalendarClock,
  Clock,
  Gauge,
  Hourglass,
  Layers,
  Sparkles,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Badge } from "@/shared/components/ui/badge"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import { planMantenimientoActivoQueries } from "../../plan-mantenimiento/api/plan-mantenimiento-activo.queries"
import type { PlanMantenimientoActivo } from "../../plan-mantenimiento/api/plan-mantenimiento-activo.service"
import {
  useCreateProgramacion,
  useUpdateProgramacion,
} from "../api/programacion-mantenimiento.mutations"
import { useProgramaciones } from "../api/programacion-mantenimiento.queries"
import type {
  ProgramacionMantenimiento,
  ProgramacionMantenimientoCriterioPayload,
} from "../api/programacion-mantenimiento.service"

type ModoControl = "KILOMETRAJE" | "TIEMPO" | "HORAS_USO" | "COMBINADO"

interface ProgramacionMantenimientoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programacionToEdit?: ProgramacionMantenimiento | null
  planMantenimientoActivoId?: string
  planNombre?: string
  activoNombre?: string
  tipoActivoNombre?: string
}

export function ProgramacionMantenimientoFormDialog({
  open,
  onOpenChange,
  programacionToEdit,
  planMantenimientoActivoId,
  planNombre,
  activoNombre,
  tipoActivoNombre,
}: ProgramacionMantenimientoFormDialogProps) {
  const isEditing = Boolean(programacionToEdit)

  const createMutation = useCreateProgramacion()
  const updateMutation = useUpdateProgramacion(programacionToEdit?.id)

  const [modo, setModo] = useState<ModoControl>("KILOMETRAJE")
  const [activo, setActivo] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedAsignacion, setSelectedAsignacion] = useState<PlanMantenimientoActivo | null>(null)

  // Campos de Control y Telemetría
  const [kmInicial, setKmInicial] = useState<number | "">("")
  const [kmIntervalo, setKmIntervalo] = useState<number | "">(5000)

  const [diasIntervalo, setDiasIntervalo] = useState<number | "">(90)
  const [fechaBase, setFechaBase] = useState<string>("")

  const [horasInicial, setHorasInicial] = useState<number | "">("")
  const [horasIntervalo, setHorasIntervalo] = useState<number | "">(250)

  // Cargar asignaciones disponibles
  const asignacionesQuery = useQuery({
    ...planMantenimientoActivoQueries.listPaginado({ page: 0, size: 200, activo: true }),
    enabled: open && !isEditing && !planMantenimientoActivoId,
  })
  const asignaciones = asignacionesQuery.data?.content ?? []

  const { data: programacionesData } = useProgramaciones({ activo: true, pageSize: 200 })
  const occupiedPlanActivoIds = useMemo(
    () => new Set(programacionesData?.content?.map((p) => p.planMantenimientoActivoId) ?? []),
    [programacionesData],
  )
  const isSelectedOcupada = Boolean(
    !isEditing && selectedAsignacion && occupiedPlanActivoIds.has(selectedAsignacion.id),
  )

  // Inicialización del formulario al abrir
  useEffect(() => {
    if (open) {
      setFormError(null)
      setSelectedAsignacion(null)
      const today = new Date().toISOString().split("T")[0]
      setFechaBase(today)

      if (programacionToEdit) {
        setActivo(programacionToEdit.activo)
        const criterios = programacionToEdit.criterios ?? []
        const hasKm = criterios.some((c) => c.tipoCriterio === "KILOMETRAJE")
        const hasTiempo = criterios.some((c) => c.tipoCriterio === "TIEMPO")
        const hasHoras = criterios.some((c) => c.tipoCriterio === "HORAS_USO")

        if (hasKm && hasTiempo) {
          setModo("COMBINADO")
        } else if (hasKm) {
          setModo("KILOMETRAJE")
        } else if (hasHoras) {
          setModo("HORAS_USO")
        } else {
          setModo("TIEMPO")
        }

        const critKm = criterios.find((c) => c.tipoCriterio === "KILOMETRAJE")
        if (critKm) {
          setKmIntervalo(critKm.intervaloUso ?? 5000)
          setKmInicial(critKm.valorActualUso ?? "")
        }

        const critTiempo = criterios.find((c) => c.tipoCriterio === "TIEMPO")
        if (critTiempo) {
          setDiasIntervalo(critTiempo.intervaloDias ?? 90)
        }

        const critHoras = criterios.find((c) => c.tipoCriterio === "HORAS_USO")
        if (critHoras) {
          setHorasIntervalo(critHoras.intervaloUso ?? 250)
          setHorasInicial(critHoras.valorActualUso ?? "")
        }
      } else {
        setActivo(true)
        setModo("KILOMETRAJE")
        setKmInicial("")
        setKmIntervalo(5000)
        setDiasIntervalo(90)
        setHorasInicial("")
        setHorasIntervalo(250)
      }
    }
  }, [open, programacionToEdit])

  // Cálculos en tiempo real
  const proximoKmLimite = useMemo(() => {
    const base = Number(kmInicial) || 0
    const int = Number(kmIntervalo) || 0
    return base + int
  }, [kmInicial, kmIntervalo])

  const proximaFechaCalculada = useMemo(() => {
    const base = fechaBase ? new Date(fechaBase) : new Date()
    const dias = Number(diasIntervalo) || 0
    if (dias <= 0) return ""
    const target = new Date(base.getTime() + dias * 24 * 60 * 60 * 1000)
    return target.toISOString().split("T")[0]
  }, [fechaBase, diasIntervalo])

  const proximoHorasLimite = useMemo(() => {
    const base = Number(horasInicial) || 0
    const int = Number(horasIntervalo) || 0
    return base + int
  }, [horasInicial, horasIntervalo])

  // Identificar el planActivoId efectivo
  const effectivePlanActivoId = planMantenimientoActivoId ?? selectedAsignacion?.id

  // Identificar nombres mostrados
  const displayPlanNombre =
    planNombre ??
    programacionToEdit?.planActivo?.planNombre ??
    selectedAsignacion?.plan?.nombre ??
    "Plan de Mantenimiento"

  const displayActivoNombre =
    activoNombre ??
    programacionToEdit?.planActivo?.activoNombre ??
    selectedAsignacion?.activo?.nombre ??
    "Activo"

  const displayTipoActivo =
    tipoActivoNombre ??
    programacionToEdit?.planActivo?.tipoActivoNombre ??
    selectedAsignacion?.activo?.tipoActivoNombre ??
    selectedAsignacion?.plan?.tipoActivoNombre

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!isEditing && !effectivePlanActivoId) {
      setFormError("Debe seleccionar una asignación de activo al plan de mantenimiento.")
      return
    }

    if (isSelectedOcupada) {
      setFormError("Este activo ya cuenta con una programación preventiva activa.")
      return
    }

    const payloadCriterios: ProgramacionMantenimientoCriterioPayload[] = []

    if (modo === "KILOMETRAJE" || modo === "COMBINADO") {
      const int = Number(kmIntervalo)
      if (!int || int <= 0) {
        setFormError("El intervalo de kilometraje debe ser mayor a 0.")
        return
      }
      payloadCriterios.push({
        tipoCriterio: "KILOMETRAJE",
        intervaloUso: int,
        proximoValorUso: proximoKmLimite,
        activo: true,
      })
    }

    if (modo === "TIEMPO" || modo === "COMBINADO") {
      const d = Number(diasIntervalo)
      if (!d || d <= 0) {
        setFormError("El intervalo en días debe ser mayor a 0.")
        return
      }
      payloadCriterios.push({
        tipoCriterio: "TIEMPO",
        intervaloDias: d,
        proximaFecha: proximaFechaCalculada,
        activo: true,
      })
    }

    if (modo === "HORAS_USO") {
      const h = Number(horasIntervalo)
      if (!h || h <= 0) {
        setFormError("El intervalo de horas de uso debe ser mayor a 0.")
        return
      }
      payloadCriterios.push({
        tipoCriterio: "HORAS_USO",
        intervaloUso: h,
        proximoValorUso: proximoHorasLimite,
        activo: true,
      })
    }

    if (payloadCriterios.length === 0) {
      setFormError("Debe configurar al menos un criterio de monitoreo preventivo.")
      return
    }

    try {
      if (isEditing && programacionToEdit) {
        await updateMutation.mutateAsync({
          id: programacionToEdit.id,
          payload: {
            activo,
            kilometrajeInicial: kmInicial !== "" ? Number(kmInicial) : null,
            horasUsoInicial: horasInicial !== "" ? Number(horasInicial) : null,
            criterios: payloadCriterios,
          },
        })
      } else {
        await createMutation.mutateAsync({
          planMantenimientoActivoId: effectivePlanActivoId!,
          activo,
          kilometrajeInicial: kmInicial !== "" ? Number(kmInicial) : null,
          horasUsoInicial: horasInicial !== "" ? Number(horasInicial) : null,
          criterios: payloadCriterios,
        })
      }
      onOpenChange(false)
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message || err?.message || "Ocurrió un error al guardar la programación.",
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto border-border/80 bg-background shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <CalendarClock className="size-4.5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isEditing ? "Editar Programación Preventiva" : "Configurar Mantenimiento Preventivo"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Defina la modalidad de disparo automático por odómetro, calendario u horómetro.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {formError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{formError}</p>
            </div>
          )}

          {/* Tarjeta del Activo y Plan Asignado */}
          {planMantenimientoActivoId || isEditing ? (
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Activo Vinculado
                </span>
                <p className="font-bold text-foreground">{displayActivoNombre}</p>
                <p className="text-[11.5px] text-muted-foreground">
                  Plan: <span className="font-medium text-foreground">{displayPlanNombre}</span>
                  {displayTipoActivo && ` • ${displayTipoActivo}`}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-700 bg-emerald-500/10">
                Plan Activo
              </Badge>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-muted-foreground" />
                Seleccione el Activo y Plan de Mantenimiento <span className="text-destructive">*</span>
              </Label>
              <Combobox
                value={selectedAsignacion}
                onValueChange={(val) => setSelectedAsignacion(val)}
              >
                <ComboboxInput
                  placeholder="Buscar activo por código, nombre o plan..."
                  className="rounded-xl border-border/80 h-9 text-xs"
                />
                <ComboboxContent>
                  <ComboboxEmpty className="text-xs p-3 text-muted-foreground">
                    {asignacionesQuery.isLoading
                      ? "Cargando activos asignados a planes..."
                      : "No hay asignaciones de activos disponibles sin programación."}
                  </ComboboxEmpty>
                  <ComboboxList>
                    {asignaciones.map((asig) => {
                      const ocupada = occupiedPlanActivoIds.has(asig.id)
                      return (
                        <ComboboxItem
                          key={asig.id}
                          value={asig}
                          disabled={ocupada}
                          className="cursor-pointer text-xs py-2"
                        >
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-foreground">
                                {asig.activo?.codigo}
                              </span>
                              <span className="text-muted-foreground truncate">
                                — {asig.activo?.nombre}
                              </span>
                              {ocupada && (
                                <Badge variant="secondary" className="text-[9px] py-0 px-1 ml-auto">
                                  Ya programado
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              Plan: {asig.plan?.nombre} ({asig.plan?.codigo})
                            </span>
                          </div>
                        </ComboboxItem>
                      )
                    })}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          )}

          {/* Selector de Modalidad Visual */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-bold text-foreground">
              Modalidad de Control Preventivo
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setModo("KILOMETRAJE")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modo === "KILOMETRAJE"
                    ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-xs"
                    : "border-border/70 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Gauge className="size-4 text-amber-500" />
                <span>Por Kilometraje</span>
              </button>

              <button
                type="button"
                onClick={() => setModo("TIEMPO")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modo === "TIEMPO"
                    ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 shadow-xs"
                    : "border-border/70 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="size-4 text-blue-500" />
                <span>Por Calendario</span>
              </button>

              <button
                type="button"
                onClick={() => setModo("HORAS_USO")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modo === "HORAS_USO"
                    ? "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-xs"
                    : "border-border/70 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Hourglass className="size-4 text-purple-500" />
                <span>Por Horas Uso</span>
              </button>

              <button
                type="button"
                onClick={() => setModo("COMBINADO")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modo === "COMBINADO"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs"
                    : "border-border/70 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="size-4 text-emerald-500" />
                <span>Km + Tiempo</span>
              </button>
            </div>
          </div>

          {/* Formulario según la Modalidad Seleccionada */}
          <div className="space-y-4 rounded-2xl border border-border/70 p-4 bg-muted/10">
            {/* Sección Kilometraje */}
            {(modo === "KILOMETRAJE" || modo === "COMBINADO") && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Gauge className="size-3.5 text-amber-500" />
                  <span>Configuración por Odómetro (Kilometraje)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11.5px] font-medium text-foreground">
                      Kilometraje Inicial / Actual (km)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Ej: 45000"
                      value={kmInicial}
                      onChange={(e) => setKmInicial(e.target.value ? Number(e.target.value) : "")}
                      className="h-9 text-xs rounded-xl"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Odómetro actual registrado en el activo.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11.5px] font-medium text-foreground">
                      Intervalo de Servicio (km) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      required
                      placeholder="Ej: 5000"
                      value={kmIntervalo}
                      onChange={(e) => setKmIntervalo(e.target.value ? Number(e.target.value) : "")}
                      className="h-9 text-xs rounded-xl"
                    />
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {[5000, 10000, 15000, 20000].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setKmIntervalo(v)}
                          className="px-2 py-0.5 text-[10px] rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer font-mono"
                        >
                          +{v.toLocaleString()} km
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Banner de Cálculo en Vivo de Kilometraje */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Próximo Aviso de Mantenimiento:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-amber-700 dark:text-amber-300">
                    <span>{proximoKmLimite.toLocaleString()} km</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      ({Number(kmInicial) || 0} + {Number(kmIntervalo) || 0})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Separador si es combinado */}
            {modo === "COMBINADO" && <div className="border-t border-border/60" />}

            {/* Sección Tiempo / Calendario */}
            {(modo === "TIEMPO" || modo === "COMBINADO") && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Clock className="size-3.5 text-blue-500" />
                  <span>Configuración por Calendario (Días / Meses)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11.5px] font-medium text-foreground">
                      Fecha Base de Inicio
                    </Label>
                    <Input
                      type="date"
                      value={fechaBase}
                      onChange={(e) => setFechaBase(e.target.value)}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11.5px] font-medium text-foreground">
                      Frecuencia en Días <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      required
                      placeholder="Ej: 90"
                      value={diasIntervalo}
                      onChange={(e) => setDiasIntervalo(e.target.value ? Number(e.target.value) : "")}
                      className="h-9 text-xs rounded-xl"
                    />
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {[
                        { d: 30, label: "1 mes" },
                        { d: 90, label: "3 meses" },
                        { d: 180, label: "6 meses" },
                        { d: 365, label: "1 año" },
                      ].map((item) => (
                        <button
                          key={item.d}
                          type="button"
                          onClick={() => setDiasIntervalo(item.d)}
                          className="px-2 py-0.5 text-[10px] rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Banner de Cálculo en Vivo de Fecha */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Próxima Fecha Límite:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-blue-700 dark:text-blue-300">
                    <span>{proximaFechaCalculada || "-"}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      (+{Number(diasIntervalo) || 0} días)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Sección Horas de Uso */}
            {modo === "HORAS_USO" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Hourglass className="size-3.5 text-purple-500" />
                  <span>Configuración por Horómetro (Horas de Uso)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11.5px] font-medium text-foreground">
                      Horas Iniciales / Horómetro Actual
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Ej: 1200"
                      value={horasInicial}
                      onChange={(e) => setHorasInicial(e.target.value ? Number(e.target.value) : "")}
                      className="h-9 text-xs rounded-xl"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Lectura actual del horómetro de la máquina.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11.5px] font-medium text-foreground">
                      Intervalo de Horas <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      required
                      placeholder="Ej: 250"
                      value={horasIntervalo}
                      onChange={(e) => setHorasIntervalo(e.target.value ? Number(e.target.value) : "")}
                      className="h-9 text-xs rounded-xl"
                    />
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {[100, 250, 500, 1000].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setHorasIntervalo(v)}
                          className="px-2 py-0.5 text-[10px] rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer font-mono"
                        >
                          +{v} hrs
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Banner de Cálculo en Vivo de Horómetro */}
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Próximo Aviso por Horómetro:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-purple-700 dark:text-purple-300">
                    <span>{proximoHorasLimite.toLocaleString()} hrs</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      ({Number(horasInicial) || 0} + {Number(horasIntervalo) || 0})
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-8 text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || isSelectedOcupada}
              className="rounded-xl h-8 text-xs gap-1.5 cursor-pointer font-semibold"
            >
              <span>
                {isPending
                  ? "Guardando..."
                  : isEditing
                  ? "Actualizar Programación"
                  : "Guardar y Activar Programación"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

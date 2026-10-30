import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  Clock,
  Gauge,
  Hourglass,
  Sparkles,
  User,
} from "lucide-react"

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { cn } from "@/shared/lib/utils"

import { planMantenimientoQueries } from "../../plan-mantenimiento/api/plan-mantenimiento.queries"
import {
  useCrearPorTipoActivo,
  useCreateProgramacion,
  useUpdateProgramacion,
} from "../api/programacion-mantenimiento.mutations"
import type {
  ProgramacionMantenimiento,
  ProgramacionMantenimientoCriterioPayload,
} from "../api/programacion-mantenimiento.service"

type ModoControl = "KILOMETRAJE" | "TIEMPO" | "HORAS_USO" | "COMBINADO"
type AlcanceProgramacion = "INDIVIDUAL" | "TIPO_ACTIVO"

interface ProgramacionMantenimientoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programacionToEdit?: ProgramacionMantenimiento | null
  planMantenimientoActivoId?: string
  activoId?: string
  tipoActivoId?: string
  planNombre?: string
  activoNombre?: string
  tipoActivoNombre?: string
}

export function ProgramacionMantenimientoFormDialog({
  open,
  onOpenChange,
  programacionToEdit,
  planMantenimientoActivoId,
  activoId: propActivoId,
  tipoActivoId: propTipoActivoId,
  planNombre,
  activoNombre,
  tipoActivoNombre,
}: ProgramacionMantenimientoFormDialogProps) {
  const isEditing = Boolean(programacionToEdit)
  const isLockedToAsset = Boolean(planMantenimientoActivoId || propActivoId || isEditing)

  const createMutation = useCreateProgramacion()
  const updateMutation = useUpdateProgramacion(programacionToEdit?.id)
  const batchTipoMutation = useCrearPorTipoActivo()

  const [alcance, setAlcance] = useState<AlcanceProgramacion>("INDIVIDUAL")
  const [modo, setModo] = useState<ModoControl>("KILOMETRAJE")
  const [activo, setActivo] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)

  // Selección en modo individual
  const [selectedActivoId, setSelectedActivoId] = useState<string>("")
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")

  // Selección en modo por tipo
  const [selectedTipoActivoId, setSelectedTipoActivoId] = useState<string>("")

  // Telemetría & Intervalos
  const [kmInicial, setKmInicial] = useState<number | "">("")
  const [kmIntervalo, setKmIntervalo] = useState<number | "">(5000)
  const [diasIntervalo, setDiasIntervalo] = useState<number | "">(90)
  const [fechaBase, setFechaBase] = useState<string>("")
  const [horasInicial, setHorasInicial] = useState<number | "">("")
  const [horasIntervalo, setHorasIntervalo] = useState<number | "">(250)

  // Consultas de datos
  const activosListQuery = useQuery({
    ...activoQueries.list({ page: 0, size: 200, sortBy: "codigo", direction: "ASC" }),
    enabled: open && !isLockedToAsset && alcance === "INDIVIDUAL",
  })
  const activosDisponibles = activosListQuery.data?.content ?? []

  const tiposActivoQuery = useQuery({
    ...tipoActivoQueries.list({ page: 0, size: 100, sortBy: "nombre", direction: "ASC" }),
    enabled: open && !isLockedToAsset,
  })
  const tiposActivo = tiposActivoQuery.data?.content ?? []

  // Determinar el tipo de activo efectivo para filtrar planes
  const effectiveTipoActivoId = useMemo(() => {
    if (alcance === "TIPO_ACTIVO") return selectedTipoActivoId
    if (propTipoActivoId) return propTipoActivoId
    const foundActivo = activosDisponibles.find((a) => a.id === selectedActivoId)
    return foundActivo?.tipoActivoId ?? foundActivo?.tipoActivo?.id
  }, [alcance, selectedTipoActivoId, propTipoActivoId, activosDisponibles, selectedActivoId])

  // Planes disponibles (filtrados por tipo si aplica)
  const planesQuery = useQuery({
    ...planMantenimientoQueries.list({
      tipoActivoId: effectiveTipoActivoId || undefined,
      page: 0,
      size: 100,
    }),
    enabled: open && Boolean(effectiveTipoActivoId || isLockedToAsset),
  })
  const planesDisponibles = planesQuery.data?.content ?? []

  // Inicialización al abrir
  useEffect(() => {
    if (open) {
      setFormError(null)
      const today = new Date().toISOString().split("T")[0]
      setFechaBase(today)

      if (propActivoId) {
        setSelectedActivoId(propActivoId)
      } else {
        setSelectedActivoId("")
      }

      if (propTipoActivoId) {
        setSelectedTipoActivoId(propTipoActivoId)
      } else {
        setSelectedTipoActivoId("")
      }

      setSelectedPlanId("")
      setAlcance("INDIVIDUAL")

      if (programacionToEdit) {
        setActivo(programacionToEdit.activo)
        const criterios = programacionToEdit.criterios ?? []
        const hasKm = criterios.some((c) => c.tipoCriterio === "KILOMETRAJE")
        const hasTiempo = criterios.some((c) => c.tipoCriterio === "TIEMPO")
        const hasHoras = criterios.some((c) => c.tipoCriterio === "HORAS_USO")

        if (hasKm && hasTiempo) setModo("COMBINADO")
        else if (hasKm) setModo("KILOMETRAJE")
        else if (hasHoras) setModo("HORAS_USO")
        else setModo("TIEMPO")

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
  }, [open, programacionToEdit, propActivoId, propTipoActivoId])

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

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

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
        proximoValorUso: proximoKmLimite > 0 ? proximoKmLimite : null,
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
        proximaFecha: proximaFechaCalculada || null,
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
        proximoValorUso: proximoHorasLimite > 0 ? proximoHorasLimite : null,
        activo: true,
      })
    }

    if (payloadCriterios.length === 0) {
      setFormError("Debe configurar al menos un criterio de monitoreo preventivo.")
      return
    }

    try {
      if (alcance === "TIPO_ACTIVO") {
        if (!selectedTipoActivoId) {
          setFormError("Debe seleccionar el Tipo de Activo.")
          return
        }
        if (!selectedPlanId) {
          setFormError("Debe seleccionar el Plan de Mantenimiento base.")
          return
        }

        await batchTipoMutation.mutateAsync({
          tipoActivoId: selectedTipoActivoId,
          planMantenimientoId: selectedPlanId,
          estadoActivo: activo,
          criterios: payloadCriterios,
        })
      } else {
        // Alcance INDIVIDUAL
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
          const finalActivoId = propActivoId || selectedActivoId
          if (!planMantenimientoActivoId && !finalActivoId) {
            setFormError("Debe seleccionar un activo.")
            return
          }
          if (!planMantenimientoActivoId && !selectedPlanId) {
            setFormError("Debe seleccionar el plan de mantenimiento a aplicar.")
            return
          }

          await createMutation.mutateAsync({
            planMantenimientoActivoId: planMantenimientoActivoId || undefined,
            activoId: finalActivoId || undefined,
            planMantenimientoId: selectedPlanId || undefined,
            activo,
            kilometrajeInicial: kmInicial !== "" ? Number(kmInicial) : null,
            horasUsoInicial: horasInicial !== "" ? Number(horasInicial) : null,
            criterios: payloadCriterios,
          })
        }
      }

      onOpenChange(false)
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message || err?.message || "Ocurrió un error al guardar la programación.",
      )
    }
  }

  const isPending =
    createMutation.isPending || updateMutation.isPending || batchTipoMutation.isPending

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
                {isEditing
                  ? "Editar Programación Preventiva"
                  : "Configurar Mantenimiento Preventivo"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configure la frecuencia por odómetro, tiempo calendario o horómetro
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {formError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{formError}</p>
            </div>
          )}

          {/* Selector de Alcance: Por Tipo vs Uno por Uno (Solo si no está fijado al activo) */}
          {!isLockedToAsset && !isEditing && (
            <div className="space-y-1.5 p-1 rounded-xl bg-muted/40 border border-border/50">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setAlcance("INDIVIDUAL")}
                  className={cn(
                    "py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer",
                    alcance === "INDIVIDUAL"
                      ? "bg-card text-foreground shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <User className="size-3.5" />
                  <span>Uno por Uno (Individual)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAlcance("TIPO_ACTIVO")}
                  className={cn(
                    "py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer",
                    alcance === "TIPO_ACTIVO"
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Building2 className="size-3.5" />
                  <span>Por Tipo de Activo (En Lote)</span>
                </button>
              </div>
            </div>
          )}

          {/* Ficha fija del Activo (cuando se abre desde el detalle del activo o edición) */}
          {isLockedToAsset ? (
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Activo a Programar
                </span>
                <p className="font-bold text-foreground text-sm">{activoNombre ?? "Activo Actual"}</p>
                <p className="text-[11.5px] text-muted-foreground">
                  {planNombre ? (
                    <>
                      Plan asignado: <span className="font-medium text-foreground">{planNombre}</span>
                    </>
                  ) : (
                    "Sin plan previo (se asignará el plan seleccionado)"
                  )}
                  {tipoActivoNombre && ` • ${tipoActivoNombre}`}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5">
                {planMantenimientoActivoId ? "Asignación Activa" : "Nueva Asignación"}
              </Badge>
            </div>
          ) : null}

          {/* Formulario de selección según alcance */}
          {!isEditing && (
            <div className="space-y-3 p-3 rounded-xl border border-border/60 bg-muted/10">
              {alcance === "TIPO_ACTIVO" ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Seleccione el Tipo de Activo <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={selectedTipoActivoId}
                      onValueChange={(val) => {
                        setSelectedTipoActivoId(val ?? "")
                        setSelectedPlanId("")
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs rounded-xl">
                        <SelectValue placeholder="Seleccione una categoría o tipo de activo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposActivo.map((t) => (
                          <SelectItem key={t.id} value={t.id} className="text-xs">
                            {t.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Plan de Mantenimiento Base <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={selectedPlanId}
                      onValueChange={(val) => setSelectedPlanId(val ?? "")}
                      disabled={!selectedTipoActivoId}
                    >
                      <SelectTrigger className="h-9 text-xs rounded-xl">
                        <SelectValue
                          placeholder={
                            !selectedTipoActivoId
                              ? "Primero seleccione un tipo de activo"
                              : planesDisponibles.length === 0
                              ? "No hay planes creados para este tipo"
                              : "Seleccione el plan de mantenimiento..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {planesDisponibles.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">
                            {p.nombre} ({p.codigo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px] flex items-center gap-2">
                    <Building2 className="size-4 shrink-0" />
                    <span>
                      Esta programación se aplicará y auto-asignará a todos los vehículos/equipos
                      registrados bajo este Tipo de Activo.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Modo Individual: Selección de Activo si no está fijado */}
                  {!isLockedToAsset && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Activo / Vehículo <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={selectedActivoId}
                        onValueChange={(val) => {
                          setSelectedActivoId(val ?? "")
                          setSelectedPlanId("")
                        }}
                      >
                        <SelectTrigger className="h-9 text-xs rounded-xl">
                          <SelectValue placeholder="Seleccione un activo o vehículo..." />
                        </SelectTrigger>
                        <SelectContent>
                          {activosDisponibles.map((a) => (
                            <SelectItem key={a.id} value={a.id} className="text-xs">
                              {a.codigo} — {a.nombre}
                              {a.tipoActivo?.nombre ? ` (${a.tipoActivo.nombre})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Selección de Plan si no está asignado */}
                  {!planMantenimientoActivoId && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Plan de Mantenimiento <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={selectedPlanId}
                        onValueChange={(val) => setSelectedPlanId(val ?? "")}
                        disabled={!effectiveTipoActivoId && !isLockedToAsset}
                      >
                        <SelectTrigger className="h-9 text-xs rounded-xl">
                          <SelectValue
                            placeholder={
                              planesDisponibles.length === 0
                                ? "Cargando planes de mantenimiento disponibles..."
                                : "Seleccione el plan de mantenimiento..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {planesDisponibles.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="text-xs">
                              {p.nombre} ({p.codigo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
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
                    ? "bg-primary/10 border-primary text-primary shadow-xs"
                    : "border-border/70 hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Gauge className="size-4.5" />
                <span>Por Kilometraje</span>
              </button>

              <button
                type="button"
                onClick={() => setModo("TIEMPO")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modo === "TIEMPO"
                    ? "bg-primary/10 border-primary text-primary shadow-xs"
                    : "border-border/70 hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Clock className="size-4.5" />
                <span>Por Calendario</span>
              </button>

              <button
                type="button"
                onClick={() => setModo("HORAS_USO")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modo === "HORAS_USO"
                    ? "bg-primary/10 border-primary text-primary shadow-xs"
                    : "border-border/70 hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Hourglass className="size-4.5" />
                <span>Horas de Uso</span>
              </button>

              <button
                type="button"
                onClick={() => setModo("COMBINADO")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modo === "COMBINADO"
                    ? "bg-primary/10 border-primary text-primary shadow-xs"
                    : "border-border/70 hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Sparkles className="size-4.5" />
                <span>Km + Tiempo</span>
              </button>
            </div>
          </div>

          {/* Formulario de Criterio: Kilometraje */}
          {(modo === "KILOMETRAJE" || modo === "COMBINADO") && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Gauge className="size-3.5 text-blue-600 dark:text-blue-400" />
                  Criterio por Odómetro / Kilometraje
                </span>
                <span className="text-[11px] text-muted-foreground">Cada X kilómetros</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alcance === "INDIVIDUAL" && (
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Kilometraje Inicial / Actual
                    </Label>
                    <Input
                      type="number"
                      placeholder="Ej. 100000"
                      value={kmInicial}
                      onChange={(e) => setKmInicial(e.target.value === "" ? "" : Number(e.target.value))}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">
                    Intervalo de Mantenimiento (km) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ej. 5000"
                    value={kmIntervalo}
                    onChange={(e) => setKmIntervalo(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Botones de incremento rápido */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-muted-foreground">Frecuencia usual:</span>
                {[3000, 5000, 7500, 10000, 15000].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setKmIntervalo(km)}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer",
                      kmIntervalo === km
                        ? "bg-blue-600 text-white border-blue-600 font-bold"
                        : "bg-background border-border/70 hover:bg-muted text-muted-foreground"
                    )}
                  >
                    +{km.toLocaleString()} km
                  </button>
                ))}
              </div>

              {proximoKmLimite > 0 && alcance === "INDIVIDUAL" && (
                <div className="flex items-center justify-between text-xs pt-2 border-t border-blue-500/20 text-blue-800 dark:text-blue-300 font-medium">
                  <span>Próximo servicio calculado:</span>
                  <span className="font-mono font-bold">
                    {proximoKmLimite.toLocaleString()} km
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Formulario de Criterio: Tiempo / Calendario */}
          {(modo === "TIEMPO" || modo === "COMBINADO") && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
                  Criterio por Frecuencia de Tiempo
                </span>
                <span className="text-[11px] text-muted-foreground">Cada X días</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alcance === "INDIVIDUAL" && (
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Fecha Base de Cálculo
                    </Label>
                    <Input
                      type="date"
                      value={fechaBase}
                      onChange={(e) => setFechaBase(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">
                    Intervalo en Días <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ej. 90"
                    value={diasIntervalo}
                    onChange={(e) => setDiasIntervalo(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Botones de incremento rápido */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-muted-foreground">Frecuencia usual:</span>
                {[
                  { label: "1 Mes (30d)", val: 30 },
                  { label: "3 Meses (90d)", val: 90 },
                  { label: "6 Meses (180d)", val: 180 },
                  { label: "1 Año (365d)", val: 365 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setDiasIntervalo(item.val)}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer",
                      diasIntervalo === item.val
                        ? "bg-amber-600 text-white border-amber-600 font-bold"
                        : "bg-background border-border/70 hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {proximaFechaCalculada && alcance === "INDIVIDUAL" && (
                <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-500/20 text-amber-800 dark:text-amber-300 font-medium">
                  <span>Próximo servicio por fecha:</span>
                  <span className="font-mono font-bold">{proximaFechaCalculada}</span>
                </div>
              )}
            </div>
          )}

          {/* Formulario de Criterio: Horas de Uso */}
          {modo === "HORAS_USO" && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Hourglass className="size-3.5 text-purple-600 dark:text-purple-400" />
                  Criterio por Horómetro / Horas de Uso
                </span>
                <span className="text-[11px] text-muted-foreground">Cada X horas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alcance === "INDIVIDUAL" && (
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Horas de Uso Iniciales
                    </Label>
                    <Input
                      type="number"
                      placeholder="Ej. 1200"
                      value={horasInicial}
                      onChange={(e) => setHorasInicial(e.target.value === "" ? "" : Number(e.target.value))}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">
                    Intervalo en Horas <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ej. 250"
                    value={horasIntervalo}
                    onChange={(e) => setHorasIntervalo(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {proximoHorasLimite > 0 && alcance === "INDIVIDUAL" && (
                <div className="flex items-center justify-between text-xs pt-2 border-t border-purple-500/20 text-purple-800 dark:text-purple-300 font-medium">
                  <span>Próximo servicio calculado:</span>
                  <span className="font-mono font-bold">
                    {proximoHorasLimite.toLocaleString()} hrs
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="text-xs rounded-xl font-bold bg-primary text-primary-foreground"
            >
              {isPending
                ? "Guardando..."
                : alcance === "TIPO_ACTIVO"
                ? "Aplicar a Todo el Tipo"
                : isEditing
                ? "Actualizar Programación"
                : "Guardar Programación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

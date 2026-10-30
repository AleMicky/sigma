import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  CalendarClock,
  CheckCircle,
  Clock,
  ExternalLink,
  Gauge,
  History,
  Hourglass,
  Pencil,
  Play,
  Plus,
  RefreshCw,
} from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { planMantenimientoActivoQueries } from "@/modules/mantenimientos/plan-mantenimiento/api/plan-mantenimiento-activo.queries"
import type { PlanMantenimientoActivo } from "@/modules/mantenimientos/plan-mantenimiento/api/plan-mantenimiento-activo.service"
import {
  useProgramaciones,
  useHistorialProgramacion,
} from "@/modules/mantenimientos/programacion-mantenimiento/api/programacion-mantenimiento.queries"
import type {
  ProgramacionMantenimiento,
} from "@/modules/mantenimientos/programacion-mantenimiento/api/programacion-mantenimiento.service"
import { ProgramacionMantenimientoFormDialog } from "@/modules/mantenimientos/programacion-mantenimiento/components/ProgramacionMantenimientoFormDialog"
import { EvaluarProgramacionDialog } from "@/modules/mantenimientos/programacion-mantenimiento/components/EvaluarProgramacionDialog"
import { CompletarMantenimientoDialog } from "@/modules/mantenimientos/programacion-mantenimiento/components/CompletarMantenimientoDialog"

type ActivoMantenimientoPreventivoTabProps = {
  activo: Activo
  tipoActivo?: TipoActivo | null
}

export function ActivoMantenimientoPreventivoTab({
  activo,
  tipoActivo,
}: ActivoMantenimientoPreventivoTabProps) {
  const navigate = useNavigate()
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [evaluarDialogOpen, setEvaluarDialogOpen] = useState(false)
  const [completarDialogOpen, setCompletarDialogOpen] = useState(false)

  // 1. Consultar asignaciones de planes para este activo
  const asignacionesQuery = useQuery({
    ...planMantenimientoActivoQueries.byActivo(activo.id),
    enabled: Boolean(activo.id),
  })
  const asignacionesRaw = asignacionesQuery.data as unknown
  const asignaciones = useMemo<PlanMantenimientoActivo[]>(() => {
    if (!asignacionesRaw) return []
    if (Array.isArray(asignacionesRaw)) return asignacionesRaw
    if (typeof asignacionesRaw === "object" && asignacionesRaw !== null && "content" in asignacionesRaw) {
      return (asignacionesRaw as { content: PlanMantenimientoActivo[] }).content ?? []
    }
    return []
  }, [asignacionesRaw])

  const asignacionActiva = useMemo<PlanMantenimientoActivo | null>(
    () => asignaciones.find((a: PlanMantenimientoActivo) => a.estadoActivo) ?? null,
    [asignaciones],
  )

  // 2. Consultar programación preventiva para este activo
  const {
    data: programacionesPage,
    isLoading: isProgLoading,
    refetch: refetchProg,
    isRefetching,
  } = useProgramaciones({
    activoId: activo.id,
    pageSize: 10,
  })

  const programacion = useMemo<ProgramacionMantenimiento | null>(() => {
    if (!programacionesPage) return null
    if (Array.isArray(programacionesPage)) {
      return (programacionesPage as ProgramacionMantenimiento[])[0] ?? null
    }
    const content = (programacionesPage as any)?.content
    if (Array.isArray(content) && content.length > 0) {
      return content[0] as ProgramacionMantenimiento
    }
    return null
  }, [programacionesPage])

  // 3. Consultar historial de disparos y completados
  const { data: historialList = [], isLoading: isHistLoading } = useHistorialProgramacion(
    programacion?.id,
  )

  const todayStr = new Date().toISOString().split("T")[0]

  // Estado general de alerta
  const estadoAlerta = useMemo(() => {
    if (!programacion || !programacion.activo) return "INACTIVO"
    const criterios = (programacion.criterios ?? []).filter((c) => c.activo)
    let hasVencido = false
    let hasProximo = false

    for (const c of criterios) {
      if (c.tipoCriterio === "TIEMPO") {
        if (c.proximaFecha && c.proximaFecha <= todayStr) {
          hasVencido = true
        } else if (c.proximaFecha) {
          const diffDays = Math.ceil(
            (new Date(c.proximaFecha).getTime() - new Date(todayStr).getTime()) /
              (1000 * 60 * 60 * 24),
          )
          if (diffDays <= 7) hasProximo = true
        }
      } else {
        const actual = c.valorActualUso ?? 0
        const proximo = c.proximoValorUso ?? 0
        const intervalo = c.intervaloUso ?? 1
        if (proximo > 0 && actual >= proximo) {
          hasVencido = true
        } else if (proximo > 0) {
          const base = Math.max(0, proximo - intervalo)
          const pct = ((actual - base) / (proximo - base)) * 100
          if (pct >= 85) hasProximo = true
        }
      }
    }

    if (hasVencido) return "CRITICO"
    if (hasProximo) return "PROXIMO"
    return "AL_DIA"
  }, [programacion, todayStr])

  const isLoading = asignacionesQuery.isLoading || isProgLoading

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  // Si NO tiene plan ni programación
  if (!programacion && !asignacionActiva) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-dashed border-border/80 bg-gradient-to-b from-muted/30 to-muted/10 p-8 sm:p-12 text-center">
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
            <CalendarClock className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Sin Mantenimiento Preventivo Configurado
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
            Este activo aún no tiene un plan ni una programación de mantenimiento preventivo vinculada. 
            Configure intervalos por kilometraje, calendario u horómetro para recibir alertas y disparos automáticos.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => setFormDialogOpen(true)}
              className="gap-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Configurar Mantenimiento Preventivo</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate({ to: "/mantenimientos/planes-mantenimiento" })}
              className="gap-2 rounded-xl text-xs cursor-pointer"
            >
              <ExternalLink className="size-3.5" />
              <span>Ver Catálogo de Planes Base</span>
            </Button>
          </div>
        </div>

        {/* Diálogo para configurar */}
        <ProgramacionMantenimientoFormDialog
          open={formDialogOpen}
          onOpenChange={(open) => {
            setFormDialogOpen(open)
            if (!open) {
              refetchProg()
              asignacionesQuery.refetch()
            }
          }}
          planMantenimientoActivoId={undefined}
          activoId={activo.id}
          tipoActivoId={activo.tipoActivo?.id ?? activo.tipoActivoId}
          activoNombre={activo.nombre}
          tipoActivoNombre={tipoActivo?.nombre}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Card de Estado del Mantenimiento Preventivo */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 shadow-xs transition-all ${
          estadoAlerta === "CRITICO"
            ? "border-red-500/40 bg-red-500/5 dark:bg-red-950/15"
            : estadoAlerta === "PROXIMO"
            ? "border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/15"
            : "border-border/70 bg-card"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base text-foreground">
                {programacion?.planActivo?.planNombre ?? asignacionActiva?.plan?.nombre ?? "Plan Preventivo"}
              </span>
              {programacion?.planActivo?.planCodigo && (
                <Badge variant="outline" className="text-[10px] py-0 px-2 font-mono">
                  {programacion.planActivo.planCodigo}
                </Badge>
              )}

              {estadoAlerta === "CRITICO" ? (
                <Badge className="bg-red-600 hover:bg-red-600 text-white text-[11px] font-semibold gap-1.5 py-0.5">
                  <span className="size-1.5 rounded-full bg-white animate-pulse" />
                  <span>Requiere Mantenimiento Preventivo</span>
                </Badge>
              ) : estadoAlerta === "PROXIMO" ? (
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[11px] font-semibold gap-1.5 py-0.5">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  <span>Próximo a Disparo</span>
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px] font-semibold gap-1.5 py-0.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span>Monitoreo al Día</span>
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>Activo: <strong>{activo.codigo}</strong> — {activo.nombre}</span>
              {tipoActivo && (
                <>
                  <span>•</span>
                  <span>Tipo: {tipoActivo.nombre}</span>
                </>
              )}
            </p>
          </div>

          {/* Botones de Acción Rápida */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchProg()}
              disabled={isRefetching}
              className="h-8 gap-1 text-xs rounded-xl cursor-pointer"
            >
              <RefreshCw className={`size-3 ${isRefetching ? "animate-spin" : ""}`} />
              <span>Actualizar</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setEvaluarDialogOpen(true)}
              className="h-8 gap-1 text-xs rounded-xl border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300 cursor-pointer font-medium"
            >
              <Play className="size-3 fill-current" />
              <span>Evaluar Disparo</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompletarDialogOpen(true)}
              className="h-8 gap-1 text-xs rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300 cursor-pointer font-medium"
            >
              <CheckCircle className="size-3" />
              <span>Completar Mantenimiento</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setFormDialogOpen(true)}
              className="h-8 gap-1.5 text-xs rounded-xl cursor-pointer font-semibold shadow-xs"
            >
              <Pencil className="size-3" />
              <span>Editar Configuración</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla 1: Criterios y Telemetría de Disparo */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <div className="border-b border-border/70 p-3.5 sm:p-4 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="size-4 text-amber-500" />
            <h4 className="text-xs sm:text-sm font-bold text-foreground">
              Criterios de Monitoreo Preventivo y Telemetría
            </h4>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">
            {programacion?.criterios?.length ?? 0} criterio(s) activo(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/60">
              <tr>
                <th className="py-2.5 px-4">Tipo de Control</th>
                <th className="py-2.5 px-4">Frecuencia / Intervalo</th>
                <th className="py-2.5 px-4">Lectura Actual</th>
                <th className="py-2.5 px-4">Próximo Disparo</th>
                <th className="py-2.5 px-4">Margen Restante</th>
                <th className="py-2.5 px-4 min-w-[140px]">Avance</th>
                <th className="py-2.5 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {(programacion?.criterios ?? []).map((crit) => {
                const isKm = crit.tipoCriterio === "KILOMETRAJE"
                const isHoras = crit.tipoCriterio === "HORAS_USO"
                const isTiempo = crit.tipoCriterio === "TIEMPO"

                // Cálculos
                let lecturaActualLabel = "-"
                let proximoLabel = "-"
                let margenLabel = "-"
                let pct = 0
                let vencido = false
                let proximo = false

                if (isTiempo) {
                  proximoLabel = crit.proximaFecha ? crit.proximaFecha : "-"
                  lecturaActualLabel = `Hoy: ${todayStr}`
                  if (crit.proximaFecha) {
                    const diffDays = Math.ceil(
                      (new Date(crit.proximaFecha).getTime() - new Date(todayStr).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )
                    if (diffDays <= 0) {
                      vencido = true
                      margenLabel = `Vencido hace ${Math.abs(diffDays)} días`
                      pct = 100
                    } else {
                      if (diffDays <= 7) proximo = true
                      margenLabel = `${diffDays} días restantes`
                      const totalD = crit.intervaloDias || 90
                      pct = Math.min(100, Math.max(0, Math.round(((totalD - diffDays) / totalD) * 100)))
                    }
                  }
                } else {
                  const actual = crit.valorActualUso ?? 0
                  const objetivo = crit.proximoValorUso ?? 0
                  const intervalo = crit.intervaloUso ?? 1
                  const unit = isKm ? "km" : "hrs"

                  lecturaActualLabel = `${actual.toLocaleString()} ${unit}`
                  proximoLabel = objetivo > 0 ? `${objetivo.toLocaleString()} ${unit}` : "-"

                  if (objetivo > 0 && actual >= objetivo) {
                    vencido = true
                    pct = 100
                    margenLabel = `Superado por ${(actual - objetivo).toLocaleString()} ${unit}`
                  } else if (objetivo > 0) {
                    const diff = objetivo - actual
                    margenLabel = `Faltan ${diff.toLocaleString()} ${unit}`
                    const base = Math.max(0, objetivo - intervalo)
                    pct = Math.min(100, Math.max(0, Math.round(((actual - base) / (objetivo - base)) * 100)))
                    if (pct >= 85) proximo = true
                  }
                }

                return (
                  <tr key={crit.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        {isKm ? (
                          <Gauge className="size-4 text-amber-500" />
                        ) : isHoras ? (
                          <Hourglass className="size-4 text-purple-500" />
                        ) : (
                          <Clock className="size-4 text-blue-500" />
                        )}
                        <span>
                          {isKm
                            ? "Odómetro (Kilometraje)"
                            : isHoras
                            ? "Horómetro (Horas de Uso)"
                            : "Calendario (Tiempo)"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground">
                      {isTiempo
                        ? `Cada ${crit.intervaloDias ?? "-"} días`
                        : `Cada ${(crit.intervaloUso ?? 0).toLocaleString()} ${isKm ? "km" : "hrs"}`}
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-foreground">
                      {lecturaActualLabel}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {proximoLabel}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[11.5px] font-medium ${
                          vencido
                            ? "text-destructive font-bold"
                            : proximo
                            ? "text-amber-600 dark:text-amber-400 font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {margenLabel}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                          <span>Progreso</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              vencido
                                ? "bg-red-500"
                                : proximo
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {vencido ? (
                        <Badge variant="destructive" className="text-[10px] py-0 px-2">
                          Requiere Servicio
                        </Badge>
                      ) : proximo ? (
                        <Badge variant="outline" className="text-[10px] py-0 px-2 border-amber-500/30 text-amber-600 bg-amber-500/10">
                          Próximo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] py-0 px-2 border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                          Al Día
                        </Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla 2: Historial de Disparos y Ejecuciones */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <div className="border-b border-border/70 p-3.5 sm:p-4 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            <h4 className="text-xs sm:text-sm font-bold text-foreground">
              Historial de Ciclos Preventivos y Servicios Ejecutados
            </h4>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">
            {historialList.length} registro(s) históricos
          </span>
        </div>

        {isHistLoading ? (
          <div className="p-6">
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : historialList.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            <CheckCircle className="size-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="font-semibold text-foreground">Aún no hay ciclos de servicio registrados</p>
            <p className="text-[11px] mt-0.5">
              Cuando el motor preventivo dispare una solicitud o se registre una ejecución completada, quedará auditado aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/60">
                <tr>
                  <th className="py-2.5 px-4">Fecha Disparo</th>
                  <th className="py-2.5 px-4">Criterio</th>
                  <th className="py-2.5 px-4">Valor Disparador</th>
                  <th className="py-2.5 px-4">Solicitud Generada</th>
                  <th className="py-2.5 px-4">Estado del Ciclo</th>
                  <th className="py-2.5 px-4">Fecha Servicio</th>
                  <th className="py-2.5 px-4">Odómetro / Lectura</th>
                  <th className="py-2.5 px-4">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {historialList.map((hist) => (
                  <tr key={hist.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-foreground">
                      {hist.fechaDisparo ? hist.fechaDisparo.substring(0, 10) : "-"}
                    </td>

                    <td className="py-2.5 px-4">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                        {hist.tipoCriterioDisparador}
                      </Badge>
                    </td>

                    <td className="py-2.5 px-4 font-mono text-muted-foreground">
                      {hist.valorDisparador || "-"}
                    </td>

                    <td className="py-2.5 px-4 font-semibold text-foreground">
                      {hist.solicitudNumero ? (
                        <button
                          type="button"
                          onClick={() => navigate({ to: "/mantenimientos/solicitudes" })}
                          className="text-primary hover:underline cursor-pointer"
                        >
                          {hist.solicitudNumero}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    <td className="py-2.5 px-4">
                      {hist.completado ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] py-0 px-1.5">
                          Completado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/30 text-amber-700 bg-amber-500/10 text-[10px] py-0 px-1.5">
                          En Proceso
                        </Badge>
                      )}
                    </td>

                    <td className="py-2.5 px-4 font-mono text-muted-foreground">
                      {hist.fechaServicio || "-"}
                    </td>

                    <td className="py-2.5 px-4 font-mono font-medium text-foreground">
                      {hist.valorUsoServicio != null
                        ? `${hist.valorUsoServicio.toLocaleString()} ${
                            hist.tipoCriterioDisparador === "KILOMETRAJE" ? "km" : "hrs"
                          }`
                        : "-"}
                    </td>

                    <td className="py-2.5 px-4 text-muted-foreground max-w-xs truncate">
                      {hist.observacion || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales de Control Preventivo */}
      <ProgramacionMantenimientoFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open)
          if (!open) {
            refetchProg()
            asignacionesQuery.refetch()
          }
        }}
        programacionToEdit={programacion}
        planMantenimientoActivoId={programacion?.planMantenimientoActivoId ?? asignacionActiva?.id}
        activoId={activo.id}
        tipoActivoId={activo.tipoActivo?.id ?? activo.tipoActivoId}
        planNombre={programacion?.planActivo?.planNombre ?? asignacionActiva?.plan?.nombre}
        activoNombre={activo.nombre}
        tipoActivoNombre={tipoActivo?.nombre}
      />

      {programacion && (
        <>
          <EvaluarProgramacionDialog
            open={evaluarDialogOpen}
            onOpenChange={(open) => {
              setEvaluarDialogOpen(open)
              if (!open) refetchProg()
            }}
            programacion={programacion}
          />

          <CompletarMantenimientoDialog
            open={completarDialogOpen}
            onOpenChange={(open) => {
              setCompletarDialogOpen(open)
              if (!open) refetchProg()
            }}
            programacion={programacion}
          />
        </>
      )}
    </div>
  )
}

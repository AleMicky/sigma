import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
  CheckCheck,
  ClipboardCheck,
  Clock,
  FileCheck2,
  Loader2,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"

import { controlActivoQueries } from "@/modules/mantenimientos/control-activo/api/control-activo.queries"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import { solicitudQueries } from "../api/solicitud.queries"
import type {
  SolicitudMantenimiento,
  WorkflowAction,
  WorkflowField,
} from "../api/solicitud.service"

export type WorkflowPanelProps = {
  solicitud: SolicitudMantenimiento
  onActionSelect: (
    solicitud: SolicitudMantenimiento,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
  className?: string
}

function getActionVisuals(action: WorkflowAction) {
  const name = (action.name ?? "").toLowerCase()
  const val = (action.value ?? "").toUpperCase()

  if (val.includes("APROB") || name.includes("aprobar")) {
    return {
      variant: "emerald",
      icon: CheckCircle2,
      btnClass:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-600/30",
    }
  }
  if (val.includes("OBSERV") || name.includes("observar")) {
    return {
      variant: "amber",
      icon: AlertCircle,
      btnClass:
        "bg-amber-600 hover:bg-amber-700 text-white shadow-xs ring-1 ring-amber-600/30",
    }
  }
  if (val.includes("INIC") || name.includes("iniciar")) {
    return {
      variant: "sky",
      icon: Play,
      btnClass:
        "bg-sky-600 hover:bg-sky-700 text-white shadow-xs ring-1 ring-sky-600/30",
    }
  }
  if (
    val.includes("REVIS") ||
    name.includes("revisión") ||
    name.includes("revision")
  ) {
    return {
      variant: "indigo",
      icon: Send,
      btnClass:
        "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs ring-1 ring-indigo-600/30",
    }
  }
  if (val.includes("VALID") || name.includes("validar")) {
    return {
      variant: "teal",
      icon: ShieldCheck,
      btnClass:
        "bg-teal-600 hover:bg-teal-700 text-white shadow-xs ring-1 ring-teal-600/30",
    }
  }
  if (val.includes("CORREG") || name.includes("corregir")) {
    return {
      variant: "orange",
      icon: RotateCcw,
      btnClass:
        "bg-orange-600 hover:bg-orange-700 text-white shadow-xs ring-1 ring-orange-600/30",
    }
  }
  if (
    val.includes("CERR") ||
    val.includes("RECIB") ||
    name.includes("cerrar") ||
    name.includes("recibir")
  ) {
    return {
      variant: "green",
      icon: CheckCheck,
      btnClass:
        "bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs ring-1 ring-emerald-700/30",
    }
  }
  if (
    val.includes("RECHAZ") ||
    val.includes("CANCEL") ||
    name.includes("rechazar") ||
    name.includes("cancelar")
  ) {
    return {
      variant: "rose",
      icon: AlertOctagon,
      btnClass:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-xs ring-1 ring-rose-600/30",
    }
  }

  return {
    variant: "primary",
    icon: FileCheck2,
    btnClass: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs",
  }
}

export function WorkflowPanel({
  solicitud,
  onActionSelect,
  className,
}: WorkflowPanelProps) {
  // Fetch workflow actions and fields for the current process instance
  const actionsQuery = useQuery({
    ...solicitudQueries.workflowActions(solicitud.processInstanceId),
    enabled: Boolean(solicitud.processInstanceId),
  })

  const actions = actionsQuery.data?.actions ?? []
  const taskName = actionsQuery.data?.taskName ?? ""
  const fields = actionsQuery.data?.fields ?? []
  const currentStatus = actionsQuery.data?.status ?? solicitud.estado

  const isTrabajoRealizado =
    (currentStatus ?? "").toUpperCase() === "TRABAJO_REALIZADO" ||
    (solicitud.estado ?? "").toUpperCase() === "TRABAJO_REALIZADO"

  // Check Control de Activo for DEVOLUCION
  const controlesQuery = useQuery({
    ...controlActivoQueries.list({ size: 100 }),
    enabled: Boolean(solicitud.id && isTrabajoRealizado),
  })

  const hasDevolucion = Boolean(
    controlesQuery.data?.content?.some(
      (c) =>
        c.solicitudMantenimientoId === solicitud.id &&
        c.tipo === "DEVOLUCION",
    ),
  )

  const canAdvance = !isTrabajoRealizado || hasDevolucion

  // If no processInstanceId is present (e.g. Borrador), show initiate notice
  if (!solicitud.processInstanceId) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-border/80 bg-muted/20 p-3.5 flex items-center justify-between gap-3",
          className,
        )}
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex size-7.5 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Clock className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              Flujo no iniciado (Borrador)
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Esta solicitud está en borrador y debe ser enviada para activar el flujo de trabajo.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-primary/25 bg-card p-3.5 sm:p-4 shadow-2xs space-y-3 transition-all",
        className,
      )}
    >
      {/* Header: Current Task & Responsable Badge - Responsive Flow */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs mt-0.5">
            <ShieldCheck className="size-4.5" />
            <span className="absolute -top-0.5 -right-0.5 flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-primary" />
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Tarea Actual del Flujo
              </span>
              {currentStatus && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                  {currentStatus}
                </span>
              )}
            </div>
            <h3 className="font-heading text-xs sm:text-sm md:text-base font-bold text-foreground leading-snug">
              {taskName || "En Proceso de Evaluación"}
            </h3>
          </div>
        </div>

        {/* Responsable status pill - Dedicated row with clean margins */}
        {solicitud.responsable && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20 px-3 py-1.5 text-xs w-fit">
            <UserCheck className="size-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="text-[11.5px]">
              Técnico Responsable: <strong className="text-foreground">{solicitud.responsable.nombre}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Callout de Devolución de Activo para TRABAJO_REALIZADO */}
      {isTrabajoRealizado && (
        <div
          className={cn(
            "rounded-xl border p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5",
            hasDevolucion
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200",
          )}
        >
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            {hasDevolucion ? (
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-bold text-foreground">
                {hasDevolucion
                  ? "Control de Activo: Devolución Registrada"
                  : "Paso Obligatorio: Registrar Devolución de Activo"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {hasDevolucion
                  ? "El acta de devolución del activo fue completada. Puedes cerrar el flujo y confirmar la recepción."
                  : "Para dar por finalizado el mantenimiento y cerrar el expediente, primero debes registrar la devolución del activo."}
              </p>
            </div>
          </div>

          {!hasDevolucion ? (
            <Link
              to="/mantenimientos/controles-activos/nuevo"
              search={{ solicitudId: solicitud.id, tipo: "DEVOLUCION" }}
            >
              <Button
                type="button"
                size="sm"
                className="h-7.5 px-3 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-2xs shrink-0 cursor-pointer"
              >
                <ClipboardCheck className="size-3.5 mr-1.5" />
                <span>Registrar Devolución</span>
              </Button>
            </Link>
          ) : null}
        </div>
      )}

      {/* Action Buttons Toolbar */}
      <div className="pt-2 border-t border-border/50">
        {actionsQuery.isLoading ? (
          <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin text-primary" />
            <span>Consultando decisiones disponibles...</span>
          </div>
        ) : actions.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-0.5">
            No hay acciones manuales pendientes en esta etapa.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {actions.map((act) => {
              const visual = getActionVisuals(act)
              const IconComponent = visual.icon

              return (
                <Button
                  key={`${act.variable}-${act.value}`}
                  type="button"
                  size="sm"
                  disabled={!canAdvance}
                  onClick={() => {
                    if (!canAdvance) {
                      toast.warning(
                        "Para finalizar el flujo y cerrar la solicitud, primero debes registrar la Devolución del Activo.",
                      )
                      return
                    }
                    onActionSelect(solicitud, act, taskName, fields)
                  }}
                  className={cn(
                    "h-8.5 gap-1.5 px-3.5 text-xs font-bold transition-all rounded-xl",
                    !canAdvance
                      ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground ring-0"
                      : cn("cursor-pointer", visual.btnClass),
                  )}
                  title={
                    !canAdvance
                      ? "Bloqueado: Primero registra la Devolución del Activo"
                      : act.name
                  }
                >
                  <IconComponent className="size-3.5 shrink-0" />
                  <span>{act.name}</span>
                </Button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

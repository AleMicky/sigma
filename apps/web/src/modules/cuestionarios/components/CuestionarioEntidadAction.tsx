import { useState } from "react"
import { Eye, Star } from "lucide-react"

import { StatusBadge } from "@/shared/components/status-badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import type { AsignacionCuestionario } from "../api/cuestionario.types"
import { formatPorcentaje } from "../lib/cuestionario.utils"
import { ResponderCuestionarioDialog } from "./ResponderCuestionarioDialog"

export type CuestionarioEntidadActionProps = {
  asignacion?: AsignacionCuestionario | null
  compact?: boolean
  ctaLabel?: string
  className?: string
  onResponded?: () => void
}

export function CuestionarioEntidadAction({
  asignacion,
  compact = false,
  ctaLabel,
  className,
  onResponded,
}: Readonly<CuestionarioEntidadActionProps>) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"responder" | "ver">("responder")

  if (!asignacion) return null

  const defaultCta =
    asignacion.evaluadoTipo === "CONDUCTOR"
      ? "Evaluar conductor"
      : "Responder evaluación"

  const buttonLabel = ctaLabel || defaultCta

  if (asignacion.estado === "PENDIENTE") {
    return (
      <>
        <Button
          type="button"
          size={compact ? "xs" : "sm"}
          variant="outline"
          onClick={(event) => {
            event.stopPropagation()
            setDialogMode("responder")
            setDialogOpen(true)
          }}
          className={cn(
            "gap-1.5 border-warning/40 bg-warning/10 font-semibold text-warning hover:bg-warning/20 hover:text-warning",
            compact ? "h-6.5 px-2 text-[11px]" : "h-8 px-3 text-xs",
            className,
          )}
          title={`Pendiente: ${asignacion.cuestionarioNombre}`}
        >
          <Star className={cn(compact ? "size-3" : "size-3.5")} />
          <span>{buttonLabel}</span>
        </Button>

        <ResponderCuestionarioDialog
          asignacionId={asignacion.id}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mode={dialogMode}
          onSuccess={onResponded}
        />
      </>
    )
  }

  if (asignacion.estado === "RESPONDIDO") {
    const badgeLabel =
      asignacion.porcentaje !== null && asignacion.porcentaje !== undefined
        ? `Evaluado · ${formatPorcentaje(asignacion.porcentaje)}`
        : "Evaluado"

    return (
      <>
        <div
          className={cn("inline-flex flex-wrap items-center gap-1.5", className)}
          onClick={(event) => event.stopPropagation()}
        >
          <StatusBadge variant="success" size={compact ? "sm" : "md"}>
            {badgeLabel}
          </StatusBadge>
          <Button
            type="button"
            size={compact ? "xs" : "sm"}
            variant="outline"
            onClick={(event) => {
              event.stopPropagation()
              setDialogMode("ver")
              setDialogOpen(true)
            }}
            className={cn(
              "gap-1 font-medium",
              compact ? "h-6.5 px-2 text-[11px]" : "h-8 px-2.5 text-xs",
            )}
          >
            <Eye className={cn(compact ? "size-3" : "size-3.5")} />
            <span>Ver respuesta</span>
          </Button>
        </div>

        <ResponderCuestionarioDialog
          asignacionId={asignacion.id}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mode={dialogMode}
          onSuccess={onResponded}
        />
      </>
    )
  }

  return (
    <StatusBadge variant="neutral" size={compact ? "sm" : "md"} className={className}>
      Evaluación omitida
    </StatusBadge>
  )
}

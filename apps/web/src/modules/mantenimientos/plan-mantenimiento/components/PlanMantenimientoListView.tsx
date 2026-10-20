import React, { useState } from "react"
import {
  Boxes,
  Calendar,
  Check,
  ClipboardList,
  Clock,
  Copy,
  ListChecks,
  Pencil,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Button } from "@/shared/components/ui/button"
import { formatDateTime } from "@/shared/utils/date.utils"

import { useDeletePlanMantenimiento } from "../api/plan-mantenimiento.mutations"
import type { PlanMantenimiento } from "../api/plan-mantenimiento.service"

type PlanMantenimientoListViewProps = {
  planesMantenimiento: PlanMantenimiento[]
  onEdit: (plan: PlanMantenimiento) => void
  onSelectPlan: (plan: PlanMantenimiento, tab?: "actividades" | "activos") => void
}

export function PlanMantenimientoListView({
  planesMantenimiento,
  onEdit,
  onSelectPlan,
}: PlanMantenimientoListViewProps) {
  const [itemToDelete, setItemToDelete] = useState<PlanMantenimiento | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const deleteMutation = useDeletePlanMantenimiento()

  function copyCode(e: React.MouseEvent, item: PlanMantenimiento) {
    e.stopPropagation()
    navigator.clipboard.writeText(item.codigo)
    setCopiedId(item.id)
    toast.success(`Código "${item.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card divide-y divide-border/40 overflow-hidden shadow-2xs">
      {planesMantenimiento.map((plan) => {
        const isCopied = copiedId === plan.id

        const audit =
          "auditoria" in plan && plan.auditoria
            ? plan.auditoria
            : plan
        const createdAt = audit.createdAt ?? ""
        const updatedAt = audit.updatedAt ?? audit.createdAt ?? ""
        const createdBy = audit.createdBy ?? null
        const updatedBy = audit.updatedBy ?? audit.createdBy ?? null

        const totalActividades = plan.totalActividades ?? 0

        return (
          <div
            key={plan.id}
            onClick={() => onSelectPlan(plan, "actividades")}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-4 sm:py-3.5 transition-colors hover:bg-muted/30 cursor-pointer"
          >
            {/* Lado izquierdo: Icono y contenido principal */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs transition-transform group-hover:scale-105">
                <ClipboardList className="size-4.5" />
              </span>

              <div className="flex flex-col min-w-0 flex-1 gap-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {plan.nombre}
                  </span>

                  <div className="flex items-center gap-1">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground border border-border/40">
                      {plan.codigo}
                    </code>
                    <button
                      type="button"
                      onClick={(e) => copyCode(e, plan)}
                      className="inline-flex size-4 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                      title="Copiar código"
                    >
                      {isCopied ? (
                        <Check className="size-2.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-2.5" />
                      )}
                    </button>
                  </div>

                  {plan.tipoActivoNombre && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-0.5 text-[10.5px] font-medium text-secondary-foreground border border-border/50">
                      <Boxes className="size-3 text-muted-foreground" />
                      {plan.tipoActivoNombre}
                    </span>
                  )}
                </div>

                {plan.descripcion ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground leading-snug">
                    {plan.descripcion}
                  </p>
                ) : null}

                {/* Auditoría compacta */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground/60 font-normal">
                  {createdAt ? (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-2.5 shrink-0" />
                      Creado: {formatDateTime(createdAt)}
                      {createdBy ? ` (${createdBy})` : ""}
                    </span>
                  ) : null}
                  {updatedAt && updatedAt !== createdAt ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-2.5 shrink-0" />
                      Modificado: {formatDateTime(updatedAt)}
                      {updatedBy ? ` (${updatedBy})` : ""}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Lado derecho: Badges interactivos y acciones */}
            <div
              className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Badge interactivo con el conteo de actividades */}
              <button
                type="button"
                onClick={() => onSelectPlan(plan, "actividades")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/25 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer shadow-2xs hover:scale-102"
                title="Ver y gestionar actividades del plan"
              >
                <ListChecks className="size-3.5" />
                <span>
                  {totalActividades} {totalActividades === 1 ? "actividad" : "actividades"}
                </span>
              </button>

              {/* Badge interactivo para ver activos asignados */}
              <button
                type="button"
                onClick={() => onSelectPlan(plan, "activos")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer shadow-2xs hover:scale-102"
                title="Ver y asignar activos a este plan"
              >
                <Boxes className="size-3.5" />
                <span>Activos</span>
              </button>

              {/* Botones de acción */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Editar plan"
                  title="Editar datos del plan"
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => onEdit(plan)}
                >
                  <Pencil className="size-3.5" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Eliminar plan"
                  title="Eliminar plan"
                  disabled={deleteMutation.isPending}
                  className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  onClick={() => setItemToDelete(plan)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}

      <ConfirmDeleteDialog
        open={Boolean(itemToDelete)}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null)
        }}
        title="Eliminar plan de mantenimiento"
        description={
          itemToDelete
            ? `¿Seguro que deseas eliminar el plan de mantenimiento "${itemToDelete.nombre}"? Todas las actividades y asignaciones asociadas a este plan también serán desvinculadas.`
            : "¿Seguro que deseas eliminar este plan de mantenimiento?"
        }
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!itemToDelete) return
          await deleteMutation.mutateAsync(itemToDelete.id)
          setItemToDelete(null)
        }}
      />
    </div>
  )
}

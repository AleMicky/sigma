import React, { useState } from "react"
import { Boxes, Calendar, Check, ClipboardList, Clock, Copy } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { formatDateTime } from "@/shared/utils/date.utils"

import { useDeletePlanMantenimiento } from "../api/plan-mantenimiento.mutations"
import type { PlanMantenimiento } from "../api/plan-mantenimiento.service"

type PlanMantenimientoListViewProps = {
  planesMantenimiento: PlanMantenimiento[]
  onEdit: (plan: PlanMantenimiento) => void
}

export function PlanMantenimientoListView({
  planesMantenimiento,
  onEdit,
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

        return (
          <div
            key={plan.id}
            className="group flex items-start justify-between gap-3 p-3 sm:px-4 sm:py-3 transition-colors hover:bg-muted/30"
          >
            {/* Lado izquierdo: Icono y contenido principal */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs transition-transform group-hover:scale-105">
                <ClipboardList className="size-4" />
              </span>

              <div className="flex flex-col min-w-0 flex-1 gap-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {plan.nombre}
                  </span>

                  <div className="flex items-center gap-1">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
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

            {/* Acciones */}
            <div className="flex items-center justify-end shrink-0 pt-0.5">
              <RowActions
                editLabel="Editar plan"
                deleteLabel="Eliminar plan"
                deleteDisabled={deleteMutation.isPending}
                onEdit={() => onEdit(plan)}
                onDelete={() => setItemToDelete(plan)}
              />
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
            ? `¿Seguro que deseas eliminar el plan de mantenimiento "${itemToDelete.nombre}"?`
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

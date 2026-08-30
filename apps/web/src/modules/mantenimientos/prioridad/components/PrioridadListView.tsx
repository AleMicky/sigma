import React, { useState } from "react"
import { AlertCircle, Calendar, Check, Clock, Copy, Flame } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import { formatDateTime } from "@/shared/utils/date.utils"

import { useDeletePrioridad } from "../api/prioridad.mutations"
import type { Prioridad } from "../api/prioridad.service"

type PrioridadListViewProps = {
  prioridades: Prioridad[]
  onEdit: (prioridad: Prioridad) => void
}

function getNivelPrioridadStyles(nivel: number) {
  switch (nivel) {
    case 5:
      return {
        badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
        iconClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
      }
    case 4:
      return {
        badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25",
        iconClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25",
      }
    case 3:
      return {
        badgeClass: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/25",
        iconClass: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/25",
      }
    case 2:
      return {
        badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
        iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
      }
    default:
      return {
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
        iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
      }
  }
}

export function PrioridadListView({
  prioridades,
  onEdit,
}: PrioridadListViewProps) {
  const [prioridadToDelete, setPrioridadToDelete] = useState<Prioridad | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const deleteMutation = useDeletePrioridad()

  function copyCode(e: React.MouseEvent, prioridad: Prioridad) {
    e.stopPropagation()
    navigator.clipboard.writeText(prioridad.codigo)
    setCopiedId(prioridad.id)
    toast.success(`Código "${prioridad.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card divide-y divide-border/40 overflow-hidden shadow-2xs">
      {prioridades.map((prioridad) => {
        const nivelStyles = getNivelPrioridadStyles(prioridad.nivel)
        const isCopied = copiedId === prioridad.id

        const audit =
          "auditoria" in prioridad && prioridad.auditoria
            ? prioridad.auditoria
            : prioridad
        const createdAt = audit.createdAt ?? ""
        const updatedAt = audit.updatedAt ?? audit.createdAt ?? ""
        const createdBy = audit.createdBy ?? null
        const updatedBy = audit.updatedBy ?? audit.createdBy ?? null

        return (
          <div
            key={prioridad.id}
            className="group flex items-start justify-between gap-3 p-3 sm:px-4 sm:py-3 transition-colors hover:bg-muted/30"
          >
            {/* Lado izquierdo: Icono y contenido principal */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg border shadow-2xs transition-transform group-hover:scale-105 ${nivelStyles.iconClass}`}
              >
                {prioridad.nivel >= 4 ? (
                  <Flame className="size-4" />
                ) : (
                  <AlertCircle className="size-4" />
                )}
              </span>

              <div className="flex flex-col min-w-0 flex-1 gap-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {prioridad.nombre}
                  </span>

                  <div className="flex items-center gap-1">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                      {prioridad.codigo}
                    </code>
                    <button
                      type="button"
                      onClick={(e) => copyCode(e, prioridad)}
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

                  <Badge
                    variant="outline"
                    className={`gap-1 text-[10px] font-semibold px-1.5 py-0.2 ${nivelStyles.badgeClass}`}
                  >
                    <span>Nivel {prioridad.nivel}</span>
                  </Badge>

                  {prioridad.porDefecto ? (
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/25 text-[10px] font-semibold px-1.5 py-0.2"
                    >
                      Por Defecto
                    </Badge>
                  ) : null}
                </div>

                {prioridad.descripcion ? (
                  <p className="line-clamp-1 text-xs text-muted-foreground leading-snug">
                    {prioridad.descripcion}
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
                editLabel="Editar prioridad"
                deleteLabel="Eliminar prioridad"
                deleteDisabled={deleteMutation.isPending}
                onEdit={() => onEdit(prioridad)}
                onDelete={() => setPrioridadToDelete(prioridad)}
              />
            </div>
          </div>
        )
      })}

      <ConfirmDeleteDialog
        open={Boolean(prioridadToDelete)}
        onOpenChange={(open) => {
          if (!open) setPrioridadToDelete(null)
        }}
        title="Eliminar prioridad de mantenimiento"
        description={
          prioridadToDelete
            ? `¿Seguro que deseas eliminar la prioridad "${prioridadToDelete.nombre}"?`
            : "¿Seguro que deseas eliminar esta prioridad?"
        }
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!prioridadToDelete) return
          await deleteMutation.mutateAsync(prioridadToDelete.id)
          setPrioridadToDelete(null)
        }}
      />
    </div>
  )
}

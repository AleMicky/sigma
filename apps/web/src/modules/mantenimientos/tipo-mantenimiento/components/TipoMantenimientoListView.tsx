import React, { useState } from "react"
import { Calendar, Check, Clock, Copy, Wrench } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { formatDateTime } from "@/shared/utils/date.utils"

import { useDeleteTipoMantenimiento } from "../api/tipo-mantenimiento.mutations"
import type { TipoMantenimiento } from "../api/tipo-mantenimiento.service"

type TipoMantenimientoListViewProps = {
  tiposMantenimiento: TipoMantenimiento[]
  onEdit: (tipo: TipoMantenimiento) => void
}

export function TipoMantenimientoListView({
  tiposMantenimiento,
  onEdit,
}: TipoMantenimientoListViewProps) {
  const [itemToDelete, setItemToDelete] = useState<TipoMantenimiento | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const deleteMutation = useDeleteTipoMantenimiento()

  function copyCode(e: React.MouseEvent, item: TipoMantenimiento) {
    e.stopPropagation()
    navigator.clipboard.writeText(item.codigo)
    setCopiedId(item.id)
    toast.success(`Código "${item.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card divide-y divide-border/40 overflow-hidden shadow-2xs">
      {tiposMantenimiento.map((tipo) => {
        const isCopied = copiedId === tipo.id

        const audit =
          "auditoria" in tipo && tipo.auditoria
            ? tipo.auditoria
            : tipo
        const createdAt = audit.createdAt ?? ""
        const updatedAt = audit.updatedAt ?? audit.createdAt ?? ""
        const createdBy = audit.createdBy ?? null
        const updatedBy = audit.updatedBy ?? audit.createdBy ?? null

        return (
          <div
            key={tipo.id}
            className="group flex items-start justify-between gap-3 p-3 sm:px-4 sm:py-3 transition-colors hover:bg-muted/30"
          >
            {/* Lado izquierdo: Icono y contenido principal */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform group-hover:scale-105">
                <Wrench className="size-4" />
              </span>

              <div className="flex flex-col min-w-0 flex-1 gap-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {tipo.nombre}
                  </span>

                  <div className="flex items-center gap-1">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                      {tipo.codigo}
                    </code>
                    <button
                      type="button"
                      onClick={(e) => copyCode(e, tipo)}
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
                </div>

                {tipo.descripcion ? (
                  <p className="line-clamp-1 text-xs text-muted-foreground leading-snug">
                    {tipo.descripcion}
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
                editLabel="Editar tipo"
                deleteLabel="Eliminar tipo"
                deleteDisabled={deleteMutation.isPending}
                onEdit={() => onEdit(tipo)}
                onDelete={() => setItemToDelete(tipo)}
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
        title="Eliminar tipo de mantenimiento"
        description={
          itemToDelete
            ? `¿Seguro que deseas eliminar el tipo de mantenimiento "${itemToDelete.nombre}"?`
            : "¿Seguro que deseas eliminar este tipo de mantenimiento?"
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

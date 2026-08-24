import React, { useState } from "react"
import { Calendar, Check, Clock, Copy, User, Wrench } from "lucide-react"
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
    <div className="flex flex-col gap-2.5">
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
            className="group flex flex-col justify-between gap-3 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-2xs hover:border-primary/40 hover:bg-muted/10 hover:shadow-xs transition-all"
          >
            {/* Cabecera de la fila: Icono, Título, Código y Acciones */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform group-hover:scale-105">
                  <Wrench className="size-5" />
                </span>

                <div className="flex flex-col min-w-0 flex-1 gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                      {tipo.nombre}
                    </span>

                    <div className="flex items-center gap-1">
                      <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                        {tipo.codigo}
                      </code>
                      <button
                        type="button"
                        onClick={(e) => copyCode(e, tipo)}
                        className="inline-flex size-5 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                        title="Copiar código"
                      >
                        {isCopied ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Descripción */}
                  {tipo.descripcion ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed pt-0.5">
                      {tipo.descripcion}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/40 italic pt-0.5">
                      Sin descripción registrada
                    </p>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
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

            {/* Barra inferior de datos de auditoría */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-2.5 border-t border-border/30 text-[11px] text-muted-foreground/75 font-normal">
              {createdAt ? (
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3 text-muted-foreground/50 shrink-0" />
                  <span>
                    <strong className="font-medium text-muted-foreground">Creado:</strong>{" "}
                    {formatDateTime(createdAt)}
                    {createdBy ? ` por ${createdBy}` : ""}
                  </span>
                </div>
              ) : null}

              {updatedAt && updatedAt !== createdAt ? (
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3 text-muted-foreground/50 shrink-0" />
                  <span>
                    <strong className="font-medium text-muted-foreground">Actualizado:</strong>{" "}
                    {formatDateTime(updatedAt)}
                    {updatedBy ? ` por ${updatedBy}` : ""}
                  </span>
                </div>
              ) : null}

              {!createdAt && !updatedAt && (createdBy || updatedBy) ? (
                <div className="flex items-center gap-1.5">
                  <User className="size-3 text-muted-foreground/50 shrink-0" />
                  <span>
                    <strong className="font-medium text-muted-foreground">Autor:</strong>{" "}
                    {updatedBy ?? createdBy}
                  </span>
                </div>
              ) : null}
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

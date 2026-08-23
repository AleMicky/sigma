import { useState } from "react"
import { Calendar, Check, Clock, Copy, Paperclip, Tag, User } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import { formatDateTime } from "@/shared/utils/date.utils"

import { useDeleteAccesorio } from "../api/accesorio.mutations"
import type { Accesorio } from "../api/accesorio.service"

type AccesorioListViewProps = {
  accesorios: Accesorio[]
  onEdit: (accesorio: Accesorio) => void
}

export function AccesorioListView({
  accesorios,
  onEdit,
}: AccesorioListViewProps) {
  const [accesorioToDelete, setAccesorioToDelete] =
    useState<Accesorio | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const deleteMutation = useDeleteAccesorio()

  function copyCode(e: React.MouseEvent, accesorio: Accesorio) {
    e.stopPropagation()
    navigator.clipboard.writeText(accesorio.codigo)
    setCopiedId(accesorio.id)
    toast.success(`Código "${accesorio.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card divide-y divide-border/40 overflow-hidden shadow-2xs">
      {accesorios.map((accesorio) => {
        const catalogo = accesorio.catalogo
        const isCopied = copiedId === accesorio.id

        const audit =
          "auditoria" in accesorio && accesorio.auditoria
            ? accesorio.auditoria
            : (accesorio as unknown as {
                createdAt?: string
                updatedAt?: string
                createdBy?: string
                updatedBy?: string
              })
        const createdAt = audit.createdAt ?? ""
        const updatedAt = audit.updatedAt ?? audit.createdAt ?? ""
        const createdBy = audit.createdBy ?? null
        const updatedBy = audit.updatedBy ?? audit.createdBy ?? null

        return (
          <div
            key={accesorio.id}
            className="group flex flex-col justify-between gap-3 p-4 sm:p-5 transition-colors hover:bg-muted/30"
          >
            {/* Cabecera de la fila: Icono, Título, Código, Badge y Acciones */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform group-hover:scale-105">
                  <Paperclip className="size-5" />
                </span>

                <div className="flex flex-col min-w-0 flex-1 gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                      {accesorio.nombre}
                    </span>

                    <div className="flex items-center gap-1">
                      <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                        {accesorio.codigo}
                      </code>
                      <button
                        type="button"
                        onClick={(e) => copyCode(e, accesorio)}
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

                    {catalogo ? (
                      <Badge
                        variant="secondary"
                        className="gap-1 text-[11px] font-medium"
                      >
                        <Tag className="size-3 text-primary" />
                        <span className="truncate max-w-[180px]">
                          {catalogo.nombre}
                        </span>
                      </Badge>
                    ) : null}
                  </div>

                  {/* Descripción */}
                  {accesorio.descripcion ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed pt-0.5">
                      {accesorio.descripcion}
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
                  editLabel="Editar accesorio"
                  deleteLabel="Eliminar accesorio"
                  deleteDisabled={deleteMutation.isPending}
                  onEdit={() => onEdit(accesorio)}
                  onDelete={() => setAccesorioToDelete(accesorio)}
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
        open={Boolean(accesorioToDelete)}
        onOpenChange={(open) => {
          if (!open) setAccesorioToDelete(null)
        }}
        title="Eliminar accesorio"
        description={
          accesorioToDelete
            ? `¿Seguro que deseas eliminar "${accesorioToDelete.nombre}"? Esta acción no se puede deshacer.`
            : "¿Seguro que deseas eliminar este accesorio?"
        }
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!accesorioToDelete) return
          await deleteMutation.mutateAsync(accesorioToDelete.id)
          setAccesorioToDelete(null)
        }}
      />
    </div>
  )
}

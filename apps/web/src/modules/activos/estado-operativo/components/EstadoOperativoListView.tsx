import { useState } from "react"
import {
  Activity,
  Calendar,
  Check,
  Clock,
  Copy,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import { formatDateTime } from "@/shared/utils/date.utils"

import { useDeleteEstadoOperativo } from "../api/estado-operativo.mutations"
import type { EstadoOperativo } from "../api/estado-operativo.service"

type EstadoOperativoListViewProps = {
  estados: EstadoOperativo[]
  onEdit: (estado: EstadoOperativo) => void
}

export function EstadoOperativoListView({
  estados,
  onEdit,
}: EstadoOperativoListViewProps) {
  const [estadoToDelete, setEstadoToDelete] = useState<EstadoOperativo | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const deleteMutation = useDeleteEstadoOperativo()

  function copyCode(e: React.MouseEvent, estado: EstadoOperativo) {
    e.stopPropagation()
    navigator.clipboard.writeText(estado.codigo)
    setCopiedId(estado.id)
    toast.success(`Código "${estado.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card divide-y divide-border/40 overflow-hidden shadow-2xs">
      {estados.map((estado) => {
        const isCopied = copiedId === estado.id

        const audit =
          "auditoria" in estado && estado.auditoria
            ? estado.auditoria
            : (estado as unknown as {
                createdAt?: string
                updatedAt?: string
                createdBy?: string
                updatedBy?: string
              })
        const createdAt = audit.createdAt ?? ""
        const updatedAt = audit.updatedAt ?? audit.createdAt ?? ""
        const createdBy = audit.createdBy ?? null
        const updatedBy = audit.updatedBy ?? audit.createdBy ?? null
        const color = estado.color || "#10B981"

        return (
          <div
            key={estado.id}
            className="group flex flex-col justify-between gap-3 p-4 sm:p-5 transition-colors hover:bg-muted/30"
          >
            {/* Cabecera de la fila: Icono con color, Título, Código, Badge y Acciones */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs transition-transform group-hover:scale-105"
                  style={{ backgroundColor: color }}
                >
                  <Activity className="size-5" />
                </span>

                <div className="flex flex-col min-w-0 flex-1 gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                      {estado.nombre}
                    </span>

                    <div className="flex items-center gap-1">
                      <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                        {estado.codigo}
                      </code>
                      <button
                        type="button"
                        onClick={(e) => copyCode(e, estado)}
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

                    {estado.color && (
                      <Badge
                        variant="outline"
                        className="gap-1.5 text-[11px] font-medium font-mono"
                      >
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: estado.color }}
                        />
                        <span className="uppercase">{estado.color}</span>
                      </Badge>
                    )}
                  </div>

                  {/* Descripción */}
                  {estado.descripcion ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed pt-0.5">
                      {estado.descripcion}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/40 italic pt-0.5">
                      Sin descripción registrada
                    </p>
                  )}
                </div>
              </div>

              {/* Botón de acciones contextuales */}
              <div className="shrink-0 pt-0.5">
                <RowActions
                  onEdit={() => onEdit(estado)}
                  onDelete={() => setEstadoToDelete(estado)}
                />
              </div>
            </div>

            {/* Metadatos y Auditoría en el pie de la fila */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 pt-2 border-t border-border/30 text-[11px] text-muted-foreground">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {createdAt && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3 text-muted-foreground/60" />
                    <span>Creado: {formatDateTime(createdAt)}</span>
                  </span>
                )}
                {createdBy && (
                  <span className="inline-flex items-center gap-1">
                    <User className="size-3 text-muted-foreground/60" />
                    <span>Por: {createdBy}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground/75">
                {updatedAt && updatedAt !== createdAt && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground/60" />
                    <span>Actualizado: {formatDateTime(updatedAt)}</span>
                  </span>
                )}
                {updatedBy && updatedBy !== createdBy && (
                  <span className="inline-flex items-center gap-1">
                    <User className="size-3 text-muted-foreground/60" />
                    <span>Por: {updatedBy}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}

      <ConfirmDeleteDialog
        open={Boolean(estadoToDelete)}
        onOpenChange={(open) => !open && setEstadoToDelete(null)}
        title="¿Eliminar estado operativo?"
        description={
          estadoToDelete
            ? `Esta acción eliminará el estado operativo "${estadoToDelete.nombre}". No podrás recuperarlo si está asociado a activos existentes.`
            : ""
        }
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!estadoToDelete) return
          await deleteMutation.mutateAsync(estadoToDelete.id)
          setEstadoToDelete(null)
        }}
      />
    </div>
  )
}

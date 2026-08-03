import { useState } from "react"
import { CalendarClock, FileText } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"

import { useDeleteTipoDocumento } from "../api/tipo-documento.mutations"
import type { TipoDocumento } from "../api/tipo-documento.service"

type TipoDocumentoCardProps = {
  tipoDocumento: TipoDocumento
  onEdit: (tipoDocumento: TipoDocumento) => void
}

export function TipoDocumentoCard({
  tipoDocumento,
  onEdit,
}: TipoDocumentoCardProps) {
  const deleteMutation = useDeleteTipoDocumento()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <li className="group flex min-w-0 gap-2.5 rounded-xl border border-border bg-card p-3 sm:gap-3 sm:p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground sm:size-9">
        <FileText className="size-3.5 sm:size-4" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="truncate text-sm font-medium">
              {tipoDocumento.nombre}
            </span>
            <code className="max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {tipoDocumento.codigo}
            </code>
            {tipoDocumento.requiereVencimiento ? (
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                <CalendarClock className="size-3" />
                Vence
              </span>
            ) : null}
          </div>

          <RowActions
            className="shrink-0"
            editLabel="Editar tipo de documento"
            deleteLabel="Eliminar tipo de documento"
            deleteDisabled={deleteMutation.isPending}
            onEdit={() => onEdit(tipoDocumento)}
            onDelete={() => setConfirmOpen(true)}
          />
        </div>

        {tipoDocumento.descripcion ? (
          <p className="line-clamp-2 text-sm text-muted-foreground sm:line-clamp-3">
            {tipoDocumento.descripcion}
          </p>
        ) : null}
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar tipo de documento"
        description={`¿Seguro que deseas eliminar "${tipoDocumento.nombre}"?`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(tipoDocumento.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}

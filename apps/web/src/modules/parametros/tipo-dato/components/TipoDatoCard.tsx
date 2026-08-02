import { useState } from "react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"

import { useDeleteTipoDato } from "../api/tipo-dato.mutations"
import type { TipoDato } from "../api/tipo-dato.service"
import { getTipoDatoIcon } from "../lib/tipo-dato-icons"

type TipoDatoCardProps = {
  tipoDato: TipoDato
  onEdit: (tipoDato: TipoDato) => void
}

export function TipoDatoCard({ tipoDato, onEdit }: TipoDatoCardProps) {
  const Icon = getTipoDatoIcon(tipoDato.codigo)
  const deleteMutation = useDeleteTipoDato()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <li className="group flex min-w-0 gap-2.5 rounded-xl border border-border bg-card p-3 sm:gap-3 sm:p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground sm:size-9">
        <Icon className="size-3.5 sm:size-4" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="truncate text-sm font-medium">
              {tipoDato.nombre}
            </span>
            <code className="max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {tipoDato.codigo}
            </code>
            {tipoDato.permiteOpciones ? (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                Opciones
              </span>
            ) : null}
          </div>

          <RowActions
            className="shrink-0"
            editLabel="Editar tipo de dato"
            deleteLabel="Eliminar tipo de dato"
            deleteDisabled={deleteMutation.isPending}
            onEdit={() => onEdit(tipoDato)}
            onDelete={() => setConfirmOpen(true)}
          />
        </div>

        {tipoDato.descripcion ? (
          <p className="line-clamp-2 text-sm text-muted-foreground sm:line-clamp-3">
            {tipoDato.descripcion}
          </p>
        ) : null}
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar tipo de dato"
        description={`¿Seguro que deseas eliminar "${tipoDato.nombre}"?`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(tipoDato.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}

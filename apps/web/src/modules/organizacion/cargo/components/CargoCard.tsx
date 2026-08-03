import { useState } from "react"
import { Briefcase } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"

import { useDeleteCargo } from "../api/cargo.mutations"
import type { Cargo } from "../api/cargo.service"

type CargoCardProps = {
  cargo: Cargo
  onEdit: (cargo: Cargo) => void
}

export function CargoCard({ cargo, onEdit }: CargoCardProps) {
  const deleteMutation = useDeleteCargo()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <li className="group flex min-w-0 gap-2.5 rounded-xl border border-border bg-card p-3 sm:gap-3 sm:p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground sm:size-9">
        <Briefcase className="size-3.5 sm:size-4" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="truncate text-sm font-medium">
              {cargo.nombre}
            </span>
            <code className="max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {cargo.codigo}
            </code>
          </div>

          <RowActions
            className="shrink-0"
            editLabel="Editar cargo"
            deleteLabel="Eliminar cargo"
            deleteDisabled={deleteMutation.isPending}
            onEdit={() => onEdit(cargo)}
            onDelete={() => setConfirmOpen(true)}
          />
        </div>

        {cargo.descripcion ? (
          <p className="line-clamp-2 text-sm text-muted-foreground sm:line-clamp-3">
            {cargo.descripcion}
          </p>
        ) : null}
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar cargo"
        description={`¿Seguro que deseas eliminar el cargo "${cargo.nombre}"?`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(cargo.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}

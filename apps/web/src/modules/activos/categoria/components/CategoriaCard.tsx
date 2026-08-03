import { useState } from "react"
import { FolderTree } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"

import { useDeleteCategoria } from "../api/categoria.mutations"
import type { Categoria } from "../api/categoria.service"

type CategoriaCardProps = {
  categoria: Categoria
  onEdit: (categoria: Categoria) => void
}

export function CategoriaCard({ categoria, onEdit }: CategoriaCardProps) {
  const deleteMutation = useDeleteCategoria()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <li className="group flex min-w-0 gap-2.5 rounded-xl border border-border bg-card p-3 sm:gap-3 sm:p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground sm:size-9">
        <FolderTree className="size-3.5 sm:size-4" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="truncate text-sm font-medium">
              {categoria.nombre}
            </span>
            <code className="max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {categoria.codigo}
            </code>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              Orden {categoria.orden}
            </span>
          </div>

          <RowActions
            className="shrink-0"
            editLabel="Editar categoría"
            deleteLabel="Eliminar categoría"
            deleteDisabled={deleteMutation.isPending}
            onEdit={() => onEdit(categoria)}
            onDelete={() => setConfirmOpen(true)}
          />
        </div>

        {categoria.descripcion ? (
          <p className="line-clamp-2 text-sm text-muted-foreground sm:line-clamp-3">
            {categoria.descripcion}
          </p>
        ) : null}
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar categoría"
        description={`¿Seguro que deseas eliminar "${categoria.nombre}"?`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(categoria.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}

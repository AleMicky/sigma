import { useState } from "react"
import { FolderTree } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"

import { useDeleteCategoriaInsumo } from "../api/categoria-insumo.mutations"
import type { CategoriaInsumo } from "../api/categoria-insumo.service"

type CategoriaInsumoCardProps = {
  categoria: CategoriaInsumo
  tipoInsumoNombre?: string
  onEdit: (categoria: CategoriaInsumo) => void
}

export function CategoriaInsumoCard({
  categoria,
  tipoInsumoNombre,
  onEdit,
}: CategoriaInsumoCardProps) {
  const deleteMutation = useDeleteCategoriaInsumo()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <li className="group relative flex min-w-0 gap-3 rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-md">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
        <FolderTree className="size-5" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">
              {categoria.nombre}
            </span>
            <code className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-mono font-medium text-muted-foreground">
              {categoria.codigo}
            </code>
            { (categoria.tipoInsumo?.nombre || tipoInsumoNombre) && (
              <span className="inline-flex items-center rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                {categoria.tipoInsumo?.nombre || tipoInsumoNombre}
              </span>
            )}
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
          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {categoria.descripcion}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/50 italic">
            Sin descripción
          </p>
        )}
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar categoría de insumo"
        description={`¿Seguro que deseas eliminar la categoría "${categoria.nombre}"?`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(categoria.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}

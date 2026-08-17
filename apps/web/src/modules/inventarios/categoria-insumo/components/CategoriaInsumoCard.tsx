import { useState } from "react"
import { FolderTree, Layers } from "lucide-react"

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

  const nombreTipo = categoria.tipoInsumo?.nombre || tipoInsumoNombre

  return (
    <li className="group relative flex min-w-0 flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-xs">
          <FolderTree className="size-5" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {categoria.nombre}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <code className="rounded-md border border-border/50 bg-muted/70 px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
                  {categoria.codigo}
                </code>
                {nombreTipo && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                    <Layers className="size-2.5 text-primary/70" />
                    <span className="truncate max-w-[140px]">{nombreTipo}</span>
                  </span>
                )}
              </div>
            </div>

            <RowActions
              className="shrink-0 opacity-80 transition-opacity group-hover:opacity-100"
              editLabel="Editar categoría"
              deleteLabel="Eliminar categoría"
              deleteDisabled={deleteMutation.isPending}
              onEdit={() => onEdit(categoria)}
              onDelete={() => setConfirmOpen(true)}
            />
          </div>
        </div>
      </div>

      <div className="mt-1 border-t border-border/40 pt-2.5">
        {categoria.descripcion ? (
          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {categoria.descripcion}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/40 italic">
            Sin descripción registrada
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

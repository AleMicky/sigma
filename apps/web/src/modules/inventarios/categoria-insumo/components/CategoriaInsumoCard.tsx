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
    <li className="group relative flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 text-primary transition-all duration-300 group-hover:scale-105 group-hover:from-primary group-hover:to-primary/90 group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/20">
          <FolderTree className="size-5" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {categoria.nombre}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <code className="rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[11px] font-bold text-primary tracking-wide">
                  {categoria.codigo}
                </code>
                {nombreTipo && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 border border-border/60 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-2xs">
                    <Layers className="size-3 text-primary" />
                    <span className="truncate max-w-[140px]">{nombreTipo}</span>
                  </span>
                )}
              </div>
            </div>

            <RowActions
              className="shrink-0 opacity-80 transition-all duration-200 group-hover:opacity-100"
              editLabel="Editar categoría"
              deleteLabel="Eliminar categoría"
              deleteDisabled={deleteMutation.isPending}
              onEdit={() => onEdit(categoria)}
              onDelete={() => setConfirmOpen(true)}
            />
          </div>
        </div>
      </div>

      <div className="mt-1 border-t border-border/50 pt-3">
        {categoria.descripcion ? (
          <p className="line-clamp-2 text-xs text-muted-foreground/90 leading-relaxed font-normal">
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

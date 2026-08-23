import { useState } from "react"
import { Calendar, Check, Clock, Copy, FolderTree, Layers, User } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import { formatDateTime } from "@/shared/utils/date.utils"

import { useDeleteCategoriaInsumo } from "../api/categoria-insumo.mutations"
import type { CategoriaInsumo } from "../api/categoria-insumo.service"

type CategoriaInsumoListViewProps = {
  categorias: CategoriaInsumo[]
  tiposInsumoMap: Map<string, { nombre: string; codigo: string }>
  onEdit: (categoria: CategoriaInsumo) => void
}

export function CategoriaInsumoListView({
  categorias,
  tiposInsumoMap,
  onEdit,
}: CategoriaInsumoListViewProps) {
  const [categoriaToDelete, setCategoriaToDelete] =
    useState<CategoriaInsumo | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const deleteMutation = useDeleteCategoriaInsumo()

  function copyCode(e: React.MouseEvent, categoria: CategoriaInsumo) {
    e.stopPropagation()
    navigator.clipboard.writeText(categoria.codigo)
    setCopiedId(categoria.id)
    toast.success(`Código "${categoria.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card divide-y divide-border/40 overflow-hidden shadow-2xs">
      {categorias.map((categoria) => {
        const tipoInfo =
          categoria.tipoInsumo ??
          (categoria.tipoInsumoId
            ? tiposInsumoMap.get(categoria.tipoInsumoId)
            : undefined)
        const isCopied = copiedId === categoria.id

        const audit =
          "auditoria" in categoria && categoria.auditoria
            ? categoria.auditoria
            : categoria
        const createdAt = audit.createdAt ?? ""
        const updatedAt = audit.updatedAt ?? audit.createdAt ?? ""
        const createdBy = audit.createdBy ?? null
        const updatedBy = audit.updatedBy ?? audit.createdBy ?? null

        return (
          <div
            key={categoria.id}
            className="group flex flex-col justify-between gap-3 p-4 sm:p-5 transition-colors hover:bg-muted/30"
          >
            {/* Cabecera de la fila: Icono, Título, Código, Badge y Acciones */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform group-hover:scale-105">
                  <FolderTree className="size-5" />
                </span>

                <div className="flex flex-col min-w-0 flex-1 gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                      {categoria.nombre}
                    </span>

                    <div className="flex items-center gap-1">
                      <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                        {categoria.codigo}
                      </code>
                      <button
                        type="button"
                        onClick={(e) => copyCode(e, categoria)}
                        className="inline-flex size-5 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                        title="Copiar código"
                      >
                        {isCopied ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>

                    {tipoInfo ? (
                      <Badge
                        variant="secondary"
                        className="gap-1 text-[11px] font-medium"
                      >
                        <Layers className="size-3 text-primary" />
                        <span className="truncate max-w-[180px]">
                          {tipoInfo.nombre}
                        </span>
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60 italic">
                        Sin tipo asignado
                      </span>
                    )}
                  </div>

                  {/* Descripción */}
                  {categoria.descripcion ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed pt-0.5">
                      {categoria.descripcion}
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
                  editLabel="Editar categoría"
                  deleteLabel="Eliminar categoría"
                  deleteDisabled={deleteMutation.isPending}
                  onEdit={() => onEdit(categoria)}
                  onDelete={() => setCategoriaToDelete(categoria)}
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
        open={Boolean(categoriaToDelete)}
        onOpenChange={(open) => {
          if (!open) setCategoriaToDelete(null)
        }}
        title="Eliminar categoría de insumo"
        description={
          categoriaToDelete
            ? `¿Seguro que deseas eliminar la categoría "${categoriaToDelete.nombre}"?`
            : "¿Seguro que deseas eliminar esta categoría?"
        }
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!categoriaToDelete) return
          await deleteMutation.mutateAsync(categoriaToDelete.id)
          setCategoriaToDelete(null)
        }}
      />
    </div>
  )
}

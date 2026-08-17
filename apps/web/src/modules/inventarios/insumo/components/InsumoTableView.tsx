import { useState } from "react"
import { Eye, FolderTree, Package, Ruler } from "lucide-react"

import type { CategoriaInsumo } from "@/modules/inventarios/categoria-insumo/api/categoria-insumo.service"
import type { UnidadMedida } from "@/modules/parametros/unidad-medida/api/unidad-medida.service"
import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"

import { useDeleteInsumo } from "../api/insumo.mutations"
import type { Insumo } from "../api/insumo.service"

type InsumoTableViewProps = {
  insumos: Insumo[]
  categoriasById: Map<string, CategoriaInsumo>
  unidadesMedidaById: Map<string, UnidadMedida>
  onEdit: (insumo: Insumo) => void
  onQuickView: (insumo: Insumo) => void
}

export function InsumoTableView({
  insumos,
  categoriasById,
  unidadesMedidaById,
  onEdit,
  onQuickView,
}: InsumoTableViewProps) {
  const deleteMutation = useDeleteInsumo()
  const [deletingInsumo, setDeletingInsumo] = useState<Insumo | null>(null)

  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Insumo</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Unidad Medida</th>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3">Auditoría</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {insumos.map((insumo) => {
              const categoriaName = insumo.categoriaInsumo?.nombre ?? (insumo.categoriaInsumoId ? categoriasById.get(insumo.categoriaInsumoId)?.nombre : undefined)
              const umObj = insumo.unidadMedidaId ? unidadesMedidaById.get(insumo.unidadMedidaId) : undefined
              const umName = insumo.unidadMedida?.nombre ?? umObj?.nombre
              const umDetail = insumo.unidadMedida?.codigo ?? (umObj ? (umObj.simbolo ?? umObj.codigo) : undefined)

              return (
                <tr
                  key={insumo.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Package className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate max-w-xs">
                          {insumo.nombre}
                        </p>
                        {insumo.descripcion && (
                          <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                            {insumo.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {insumo.codigo}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    {categoriaName ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 border border-blue-500/20">
                        <FolderTree className="size-2.5" />
                        {categoriaName}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {umName ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                        <Ruler className="size-2.5" />
                        {umName} {umDetail ? `(${umDetail})` : ""}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-medium">
                    {insumo.marca || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <AuditInfo
                      data={insumo.auditoria ?? insumo}
                      compact
                      className="max-w-[190px] text-[10px]"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onQuickView(insumo)}
                        title="Ver detalle"
                      >
                        <Eye className="size-3.5 text-muted-foreground" />
                      </Button>
                      <RowActions
                        className="shrink-0"
                        editLabel="Editar insumo"
                        deleteLabel="Eliminar insumo"
                        deleteDisabled={deleteMutation.isPending}
                        onEdit={() => onEdit(insumo)}
                        onDelete={() => setDeletingInsumo(insumo)}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteDialog
        open={Boolean(deletingInsumo)}
        onOpenChange={(open) => {
          if (!open) setDeletingInsumo(null)
        }}
        title="Eliminar insumo"
        description={
          deletingInsumo
            ? `¿Seguro que deseas eliminar "${deletingInsumo.nombre}" (${deletingInsumo.codigo})?`
            : ""
        }
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (deletingInsumo) {
            await deleteMutation.mutateAsync(deletingInsumo.id)
            setDeletingInsumo(null)
          }
        }}
      />
    </div>
  )
}

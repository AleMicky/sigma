import { useState } from "react"
import { Eye, FolderTree, Package, Ruler, Tags } from "lucide-react"

import type { CategoriaInsumo } from "@/modules/inventarios/categoria-insumo/api/categoria-insumo.service"
import type { TipoInsumo } from "@/modules/inventarios/tipo-insumo/api/tipo-insumo.service"
import type { UnidadMedida } from "@/modules/parametros/unidad-medida/api/unidad-medida.service"
import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"

import { useDeleteInsumo } from "../api/insumo.mutations"
import type { Insumo } from "../api/insumo.service"

type InsumoCardProps = {
  insumo: Insumo
  tipoInsumo?: TipoInsumo
  categoria?: CategoriaInsumo
  unidadMedida?: UnidadMedida
  onEdit: (insumo: Insumo) => void
  onQuickView: (insumo: Insumo) => void
}

export function InsumoCard({
  insumo,
  tipoInsumo,
  categoria,
  unidadMedida,
  onEdit,
  onQuickView,
}: InsumoCardProps) {
  const deleteMutation = useDeleteInsumo()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <li className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-md">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <Package className="size-5" />
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h3 className="truncate text-base font-semibold text-foreground">
                {insumo.nombre}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {insumo.codigo}
                </code>
                {insumo.marca && (
                  <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium text-foreground/80">
                    Marca: {insumo.marca}
                  </span>
                )}
              </div>
            </div>
          </div>

          <RowActions
            className="shrink-0"
            editLabel="Editar insumo"
            deleteLabel="Eliminar insumo"
            deleteDisabled={deleteMutation.isPending}
            onEdit={() => onEdit(insumo)}
            onDelete={() => setConfirmOpen(true)}
          />
        </div>

        {insumo.descripcion ? (
          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {insumo.descripcion}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/40 italic">
            Sin descripción registrada
          </p>
        )}

        {/* Tags / Metadata Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {tipoInsumo && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <Tags className="size-2.5" />
              {tipoInsumo.nombre}
            </span>
          )}

          {categoria && (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 border border-blue-500/20">
              <FolderTree className="size-2.5" />
              {categoria.nombre}
            </span>
          )}

          {unidadMedida && (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
              <Ruler className="size-2.5" />
              {unidadMedida.nombre} ({unidadMedida.simbolo ?? unidadMedida.codigo})
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 gap-2">
        <AuditInfo data={insumo.auditoria ?? insumo} compact className="text-[10px] min-w-0 flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onQuickView(insumo)}
          className="justify-center gap-1.5 rounded-lg text-xs font-medium hover:bg-accent shrink-0"
        >
          <Eye className="size-3.5" />
          Ficha
        </Button>
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar insumo"
        description={`¿Seguro que deseas eliminar el insumo "${insumo.nombre}" (${insumo.codigo})?`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(insumo.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}

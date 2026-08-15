import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { ChevronRight, Settings2, Tags } from "lucide-react"

import { routes } from "@/app/config/routes"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"

import { useDeleteTipoInsumo } from "../api/tipo-insumo.mutations"
import type { TipoInsumo } from "../api/tipo-insumo.service"

type TipoInsumoCardProps = {
  tipoInsumo: TipoInsumo
  onEdit: (tipoInsumo: TipoInsumo) => void
}

export function TipoInsumoCard({ tipoInsumo, onEdit }: TipoInsumoCardProps) {
  const deleteMutation = useDeleteTipoInsumo()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <li className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-105">
          <Tags className="size-5" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <span className="truncate text-base font-semibold text-foreground">
                {tipoInsumo.nombre}
              </span>
              <code className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-mono font-medium text-muted-foreground">
                {tipoInsumo.codigo}
              </code>
            </div>

            <RowActions
              className="shrink-0"
              editLabel="Editar tipo de insumo"
              deleteLabel="Eliminar tipo de insumo"
              deleteDisabled={deleteMutation.isPending}
              onEdit={() => onEdit(tipoInsumo)}
              onDelete={() => setConfirmOpen(true)}
            />
          </div>

          {tipoInsumo.descripcion ? (
            <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {tipoInsumo.descripcion}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/50 italic">
              Sin descripción especificada
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
        <Button
          variant="outline"
          size="sm"
          render={
            <Link
              to={routes.inventarios.tiposInsumo.atributos(tipoInsumo.id) as any}
            />
          }
          className="w-full justify-between rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <span className="flex items-center gap-1.5">
            <Settings2 className="size-3.5" />
            Configurar Atributos Dinámicos
          </span>
          <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar tipo de insumo"
        description={`¿Seguro que deseas eliminar el tipo de insumo "${tipoInsumo.nombre}"?`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(tipoInsumo.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}

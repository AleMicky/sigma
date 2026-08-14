import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowRight, Eye, Layers, Sliders } from "lucide-react"

import { routes } from "@/app/config/routes"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"

import { useDeleteTipoActivo } from "../api/tipo-activo.mutations"
import type { TipoActivo } from "../api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "../lib/tipo-activo-colors"
import { getTipoActivoIcon } from "../lib/tipo-activo-icons"

type TipoActivoCardProps = {
  tipoActivo: TipoActivo
  categoriaNombre?: string | null
  onEdit: (tipoActivo: TipoActivo) => void
  onQuickView?: (tipoActivo: TipoActivo) => void
}

export function TipoActivoCard({
  tipoActivo,
  categoriaNombre,
  onEdit,
  onQuickView,
}: TipoActivoCardProps) {
  const deleteMutation = useDeleteTipoActivo()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const Icon = getTipoActivoIcon(tipoActivo.icono)
  const color = tipoActivo.color || DEFAULT_TIPO_ACTIVO_COLOR

  return (
    <li className="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      {/* Top Color Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-opacity opacity-70 group-hover:opacity-100"
        style={{ backgroundColor: color }}
      />

      <div className="flex flex-col gap-3 min-w-0">
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs transition-transform group-hover:scale-105"
              style={{ backgroundColor: color }}
            >
              <Icon className="size-5" />
            </span>

            <div className="flex flex-col min-w-0">
              <button
                type="button"
                onClick={() => onQuickView?.(tipoActivo)}
                className="text-left font-heading font-semibold text-foreground hover:text-primary transition-colors truncate text-base"
              >
                {tipoActivo.nombre}
              </button>
              {categoriaNombre ? (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground w-fit mt-0.5 border border-border/40">
                  {categoriaNombre}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onQuickView ? (
              <Button
                size="icon-xs"
                variant="ghost"
                title="Ver resumen"
                onClick={() => onQuickView(tipoActivo)}
              >
                <Eye className="size-3.5" />
              </Button>
            ) : null}
            <RowActions
              className="shrink-0"
              editLabel="Editar tipo de activo"
              deleteLabel="Eliminar tipo de activo"
              deleteDisabled={deleteMutation.isPending}
              onEdit={() => onEdit(tipoActivo)}
              onDelete={() => setConfirmOpen(true)}
            />
          </div>
        </div>

        {tipoActivo.descripcion ? (
          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed min-h-[2.25rem]">
            {tipoActivo.descripcion}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic min-h-[2.25rem]">
            Sin descripción registrada.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/60">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs justify-between"
          render={
            <Link
              to={routes.tiposActivo.atributos(tipoActivo.id)}
            />
          }
        >
          <span className="inline-flex items-center gap-1.5 truncate">
            <Sliders className="size-3.5 text-muted-foreground" />
            Atributos
          </span>
          <ArrowRight className="size-3 text-muted-foreground shrink-0" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs justify-between"
          render={
            <Link
              to={routes.tiposActivo.componentes(tipoActivo.id)}
            />
          }
        >
          <span className="inline-flex items-center gap-1.5 truncate">
            <Layers className="size-3.5 text-muted-foreground" />
            Comp.
          </span>
          <ArrowRight className="size-3 text-muted-foreground shrink-0" />
        </Button>
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar tipo de activo"
        description={`¿Seguro que deseas eliminar "${tipoActivo.nombre}"?`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(tipoActivo.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}

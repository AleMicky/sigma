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
    <li className="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-3.5 transition-all duration-200 hover:border-primary/40 hover:shadow-xs">
      {/* Top Color Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-opacity opacity-70 group-hover:opacity-100"
        style={{ backgroundColor: color }}
      />

      <div className="flex flex-col gap-2.5 min-w-0">
        <div className="flex items-start justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="flex size-8.5 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs transition-transform group-hover:scale-105"
              style={{ backgroundColor: color }}
            >
              <Icon className="size-4" />
            </span>

            <div className="flex flex-col min-w-0">
              <button
                type="button"
                onClick={() => onQuickView?.(tipoActivo)}
                className="text-left font-heading font-semibold text-foreground hover:text-primary transition-colors truncate text-sm"
              >
                {tipoActivo.nombre}
              </button>
              {categoriaNombre ? (
                <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground w-fit mt-0.5 border border-border/40">
                  {categoriaNombre}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
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
          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed min-h-[2rem]">
            {tipoActivo.descripcion}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/50 italic min-h-[2rem]">
            Sin descripción registrada.
          </p>
        )}
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 pt-2.5 border-t border-border/50">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-7.5 px-2 text-[11px] justify-between"
          render={
            <Link
              to={routes.tiposActivo.atributos(tipoActivo.id)}
            />
          }
        >
          <span className="inline-flex items-center gap-1 truncate">
            <Sliders className="size-3 text-muted-foreground" />
            Atributos
          </span>
          <ArrowRight className="size-3 text-muted-foreground shrink-0" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-7.5 px-2 text-[11px] justify-between"
          render={
            <Link
              to={routes.tiposActivo.componentes(tipoActivo.id)}
            />
          }
        >
          <span className="inline-flex items-center gap-1 truncate">
            <Layers className="size-3 text-muted-foreground" />
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

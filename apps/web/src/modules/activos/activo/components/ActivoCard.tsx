import { useState } from "react"
import { Eye, ImageIcon, MapPin } from "lucide-react"

import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"

import { useDeleteActivo } from "../api/activo.mutations"
import type { Activo } from "../api/activo.service"

type ActivoCardProps = {
  activo: Activo
  tipoActivo?: TipoActivo | null
  ubicacion?: Ubicacion | null
  onEdit: (activo: Activo) => void
  onQuickView?: (activo: Activo) => void
}

export function ActivoCard({
  activo,
  tipoActivo,
  ubicacion,
  onEdit,
  onQuickView,
}: ActivoCardProps) {
  const deleteMutation = useDeleteActivo()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const tipoColor = tipoActivo?.color || DEFAULT_TIPO_ACTIVO_COLOR

  return (
    <li className="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      {/* Top Color Accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-opacity opacity-70 group-hover:opacity-100"
        style={{ backgroundColor: tipoColor }}
      />

      <div className="flex flex-col gap-3 min-w-0">
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 min-w-0">
            <AuthenticatedImage
              src={activo.urlImagen}
              alt={activo.nombre}
              className="size-12 shrink-0 rounded-xl object-cover border border-border/60 shadow-xs transition-transform group-hover:scale-105"
              fallbackClassName="size-12 shrink-0 rounded-xl bg-muted flex items-center justify-center border border-border/60 shadow-xs"
              fallback={<ImageIcon className="size-5 text-muted-foreground/60" />}
            />

            <div className="flex flex-col min-w-0">
              <button
                type="button"
                onClick={() => onQuickView?.(activo)}
                className="text-left font-heading font-semibold text-foreground hover:text-primary transition-colors truncate text-base"
              >
                {activo.nombre}
              </button>
              <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground border border-border/40 shrink-0">
                  {activo.codigo}
                </code>
                {tipoActivo ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                    <span
                      aria-hidden
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: tipoColor }}
                    />
                    <span className="truncate">{tipoActivo.nombre}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onQuickView ? (
              <Button
                size="icon-xs"
                variant="ghost"
                title="Ver resumen"
                onClick={() => onQuickView(activo)}
              >
                <Eye className="size-3.5" />
              </Button>
            ) : null}
            <RowActions
              className="shrink-0"
              editLabel="Editar activo"
              deleteLabel="Eliminar activo"
              deleteDisabled={deleteMutation.isPending}
              onEdit={() => onEdit(activo)}
              onDelete={() => setConfirmOpen(true)}
            />
          </div>
        </div>

        {ubicacion ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <MapPin className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{ubicacion.nombre}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/60 italic mt-1">
            Sin ubicación registrada.
          </span>
        )}
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar activo"
        description={`¿Seguro que deseas eliminar "${activo.nombre}"?`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(activo.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}

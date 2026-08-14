import { useState } from "react"
import { Eye, MapPin, Navigation } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"

import { useDeleteUbicacion } from "../api/ubicacion.mutations"
import type { Ubicacion } from "../api/ubicacion.service"
import { TIPO_UBICACION_CONFIG, TipoUbicacionBadge } from "./TipoUbicacionBadge"

type UbicacionCardProps = {
  ubicacion: Ubicacion
  parentName?: string | null
  onEdit: (ubicacion: Ubicacion) => void
  onQuickView?: (id: string) => void
}

export function UbicacionCard({
  ubicacion,
  parentName,
  onEdit,
  onQuickView,
}: UbicacionCardProps) {
  const deleteMutation = useDeleteUbicacion()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const config = TIPO_UBICACION_CONFIG[ubicacion.tipo] || TIPO_UBICACION_CONFIG.OTRO
  const Icon = config.icon

  const hasCoords = ubicacion.latitud !== null && ubicacion.longitud !== null

  return (
    <li className="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      {/* Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-opacity opacity-70 group-hover:opacity-100"
        style={{ backgroundColor: config.color }}
      />

      <div className="flex flex-col gap-3 min-w-0">
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/60 shadow-xs"
              style={{ backgroundColor: `${config.color}15`, color: config.color }}
            >
              <Icon className="size-5" />
            </div>

            <div className="flex flex-col min-w-0">
              <button
                type="button"
                onClick={() => onQuickView?.(ubicacion.id)}
                className="text-left font-heading font-semibold text-foreground hover:text-primary transition-colors truncate text-base"
              >
                {ubicacion.nombre}
              </button>
              <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground border border-border/40 shrink-0">
                  {ubicacion.codigo}
                </code>
                {parentName ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                    <span>•</span>
                    <span className="truncate">{parentName}</span>
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
                onClick={() => onQuickView(ubicacion.id)}
              >
                <Eye className="size-3.5" />
              </Button>
            ) : null}
            <RowActions
              className="shrink-0"
              editLabel="Editar ubicación"
              deleteLabel="Eliminar ubicación"
              deleteDisabled={deleteMutation.isPending}
              onEdit={() => onEdit(ubicacion)}
              onDelete={() => setConfirmOpen(true)}
            />
          </div>
        </div>

        {/* Type Badge & Address */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center gap-2">
            <TipoUbicacionBadge tipo={ubicacion.tipo} />
            {hasCoords ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${ubicacion.latitud},${ubicacion.longitud}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                title="Ver en Google Maps"
              >
                <Navigation className="size-3" />
                <span>GPS</span>
              </a>
            ) : null}
          </div>

          {ubicacion.direccion ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <MapPin className="size-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{ubicacion.direccion}</span>
            </div>
          ) : ubicacion.descripcion ? (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {ubicacion.descripcion}
            </p>
          ) : null}
        </div>
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar ubicación"
        description={`¿Seguro que deseas eliminar "${ubicacion.nombre}"?`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(ubicacion.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}

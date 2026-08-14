import { useState } from "react"
import { Eye, MapPin, Navigation } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"

import { useDeleteUbicacion } from "../api/ubicacion.mutations"
import type { Ubicacion } from "../api/ubicacion.service"
import { TipoUbicacionBadge } from "./TipoUbicacionBadge"

type UbicacionTableViewProps = {
  ubicaciones: Ubicacion[]
  parentsById?: Map<string, Ubicacion>
  onEdit: (ubicacion: Ubicacion) => void
  onQuickView?: (id: string) => void
}

export function UbicacionTableView({
  ubicaciones,
  parentsById,
  onEdit,
  onQuickView,
}: UbicacionTableViewProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-3 sm:px-6">Código</th>
              <th scope="col" className="px-4 py-3 sm:px-6">Nombre</th>
              <th scope="col" className="px-4 py-3 sm:px-6">Tipo</th>
              <th scope="col" className="hidden px-4 py-3 md:table-cell sm:px-6">Padre</th>
              <th scope="col" className="hidden px-4 py-3 lg:table-cell sm:px-6">Dirección</th>
              <th scope="col" className="hidden px-4 py-3 xl:table-cell sm:px-6">Coordenadas</th>
              <th scope="col" className="px-4 py-3 text-right sm:px-6">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ubicaciones.map((ubicacion) => (
              <UbicacionTableRow
                key={ubicacion.id}
                ubicacion={ubicacion}
                parent={ubicacion.ubicacionPadreId ? parentsById?.get(ubicacion.ubicacionPadreId) : null}
                onEdit={onEdit}
                onQuickView={onQuickView}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UbicacionTableRow({
  ubicacion,
  parent,
  onEdit,
  onQuickView,
}: {
  ubicacion: Ubicacion
  parent?: Ubicacion | null
  onEdit: (ubicacion: Ubicacion) => void
  onQuickView?: (id: string) => void
}) {
  const deleteMutation = useDeleteUbicacion()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const hasCoords = ubicacion.latitud !== null && ubicacion.longitud !== null

  return (
    <tr className="group hover:bg-accent/40 transition-colors">
      <td className="px-4 py-3 sm:px-6 font-mono text-xs">
        <code className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground border border-border/40">
          {ubicacion.codigo}
        </code>
      </td>

      <td className="px-4 py-3 sm:px-6 font-medium">
        <button
          type="button"
          onClick={() => onQuickView?.(ubicacion.id)}
          className="text-left hover:text-primary transition-colors font-medium truncate block max-w-[200px] sm:max-w-xs"
        >
          {ubicacion.nombre}
        </button>
      </td>

      <td className="px-4 py-3 sm:px-6">
        <TipoUbicacionBadge tipo={ubicacion.tipo} />
      </td>

      <td className="hidden px-4 py-3 md:table-cell sm:px-6 text-xs text-muted-foreground">
        {parent ? (
          <span className="font-medium text-foreground">{parent.nombre}</span>
        ) : (
          <span className="italic text-muted-foreground/60">Raíz (Sin padre)</span>
        )}
      </td>

      <td className="hidden px-4 py-3 lg:table-cell sm:px-6 text-xs text-muted-foreground max-w-[200px] truncate">
        {ubicacion.direccion ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3 text-muted-foreground shrink-0" />
            <span className="truncate">{ubicacion.direccion}</span>
          </span>
        ) : (
          <span className="italic text-muted-foreground/50">-</span>
        )}
      </td>

      <td className="hidden px-4 py-3 xl:table-cell sm:px-6">
        {hasCoords ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${ubicacion.latitud},${ubicacion.longitud}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary hover:underline"
            title={`${ubicacion.latitud}, ${ubicacion.longitud}`}
          >
            <Navigation className="size-3" />
            <span>Maps</span>
          </a>
        ) : (
          <span className="text-xs italic text-muted-foreground/50">-</span>
        )}
      </td>

      <td className="px-4 py-3 text-right sm:px-6">
        <div className="flex items-center justify-end gap-1.5">
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
      </td>
    </tr>
  )
}

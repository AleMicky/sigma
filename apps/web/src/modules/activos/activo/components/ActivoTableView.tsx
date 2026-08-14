import { useState } from "react"
import { Eye, ImageIcon, MapPin } from "lucide-react"

import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"

import { useDeleteActivo } from "../api/activo.mutations"
import type { Activo } from "../api/activo.service"

type ActivoTableViewProps = {
  activos: Activo[]
  tiposById: Map<string, TipoActivo>
  onEdit: (activo: Activo) => void
  onQuickView: (activo: Activo) => void
}

export function ActivoTableView({
  activos,
  tiposById,
  onEdit,
  onQuickView,
}: ActivoTableViewProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Activo
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Código
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Tipo
              </th>
              <th scope="col" className="hidden px-4 py-3 md:table-cell sm:px-6">
                Ubicación
              </th>
              <th scope="col" className="px-4 py-3 text-right sm:px-6">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activos.map((activo) => (
              <ActivoTableRow
                key={activo.id}
                activo={activo}
                tipoActivo={tiposById.get(activo.tipoActivoId)}
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

function ActivoTableRow({
  activo,
  tipoActivo,
  onEdit,
  onQuickView,
}: {
  activo: Activo
  tipoActivo?: TipoActivo | null
  onEdit: (activo: Activo) => void
  onQuickView: (activo: Activo) => void
}) {
  const deleteMutation = useDeleteActivo()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const tipoColor = tipoActivo?.color || DEFAULT_TIPO_ACTIVO_COLOR

  return (
    <tr className="group hover:bg-accent/40 transition-colors">
      <td className="px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <AuthenticatedImage
            src={activo.urlImagen}
            alt={activo.nombre}
            className="size-9 shrink-0 rounded-lg object-cover border border-border/60 shadow-2xs transition-transform group-hover:scale-105"
            fallbackClassName="size-9 shrink-0 rounded-lg bg-muted flex items-center justify-center border border-border/60 shadow-2xs"
            fallback={<ImageIcon className="size-4 text-muted-foreground/60" />}
          />
          <button
            type="button"
            onClick={() => onQuickView(activo)}
            className="text-left font-medium text-foreground hover:text-primary transition-colors truncate"
          >
            {activo.nombre}
          </button>
        </div>
      </td>

      <td className="px-4 py-3 sm:px-6">
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground border border-border/40">
          {activo.codigo}
        </code>
      </td>

      <td className="px-4 py-3 sm:px-6">
        {tipoActivo ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground border border-border/40">
            <span
              aria-hidden
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: tipoColor }}
            />
            {tipoActivo.nombre}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">Sin tipo</span>
        )}
      </td>

      <td className="hidden px-4 py-3 md:table-cell sm:px-6">
        {activo.ubicacion ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            {activo.ubicacion}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        )}
      </td>

      <td className="px-4 py-3 text-right sm:px-6">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="icon-xs"
            variant="ghost"
            title="Ver resumen"
            onClick={() => onQuickView(activo)}
          >
            <Eye className="size-3.5" />
          </Button>

          <RowActions
            className="shrink-0"
            editLabel="Editar activo"
            deleteLabel="Eliminar activo"
            deleteDisabled={deleteMutation.isPending}
            onEdit={() => onEdit(activo)}
            onDelete={() => setConfirmOpen(true)}
          />
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
      </td>
    </tr>
  )
}

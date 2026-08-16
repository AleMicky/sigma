import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Calendar, FileText, ImageIcon, MapPin, Package } from "lucide-react"

import { routes } from "@/app/config/routes"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { getTipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { TIPO_UBICACION_CONFIG } from "@/modules/parametros/ubicacion/components/TipoUbicacionBadge"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"

import { useDeleteActivo } from "../api/activo.mutations"
import type { Activo } from "../api/activo.service"

type ActivoTableViewProps = {
  activos: Activo[]
  tiposById: Map<string, TipoActivo>
  ubicacionesById?: Map<string, Ubicacion>
  onEdit: (activo: Activo) => void
}

export function ActivoTableView({
  activos,
  tiposById,
  ubicacionesById,
  onEdit,
}: ActivoTableViewProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/70 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-3 py-2.5 sm:px-4">
                Activo
              </th>
              <th scope="col" className="px-3 py-2.5 sm:px-4">
                Código
              </th>
              <th scope="col" className="px-3 py-2.5 sm:px-4">
                Tipo
              </th>
              <th scope="col" className="hidden px-3 py-2.5 md:table-cell sm:px-4">
                Ubicación
              </th>
              <th scope="col" className="hidden px-3 py-2.5 lg:table-cell sm:px-4">
                Fecha Adquisición
              </th>
              <th scope="col" className="px-3 py-2.5 text-right sm:px-4">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {activos.map((activo) => (
              <ActivoTableRow
                key={activo.id}
                activo={activo}
                tipoActivo={tiposById.get(activo.tipoActivoId)}
                ubicacion={
                  activo.ubicacionId
                    ? ubicacionesById?.get(activo.ubicacionId)
                    : undefined
                }
                onEdit={onEdit}
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
  ubicacion,
  onEdit,
}: {
  activo: Activo
  tipoActivo?: TipoActivo | null
  ubicacion?: Ubicacion | null
  onEdit: (activo: Activo) => void
}) {
  const deleteMutation = useDeleteActivo()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const tipoColor = tipoActivo?.color || DEFAULT_TIPO_ACTIVO_COLOR
  const TipoIcon = tipoActivo ? getTipoActivoIcon(tipoActivo.icono) : Package

  const formattedDate = activo.fechaAdquisicion
    ? new Date(activo.fechaAdquisicion).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  const ubicacionConfig = ubicacion ? TIPO_UBICACION_CONFIG[ubicacion.tipo] : null
  const UbicacionIcon = ubicacionConfig?.icon || MapPin

  return (
    <tr className="group hover:bg-muted/30 transition-colors">
      {/* Activo Image + Title + Description */}
      <td className="px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex items-center gap-2.5 max-w-sm sm:max-w-md">
          <AuthenticatedImage
            src={activo.urlImagen}
            alt={activo.nombre}
            className="size-9 shrink-0 rounded-lg object-cover border border-border/70 shadow-xs transition-transform group-hover:scale-105"
            fallbackClassName="size-9 shrink-0 rounded-lg bg-muted/60 flex items-center justify-center border border-border/70 shadow-xs"
            fallback={<ImageIcon className="size-4 text-muted-foreground/50" />}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-left font-heading font-semibold text-foreground transition-colors truncate text-sm">
              {activo.nombre}
            </span>
            {activo.descripcion ? (
              <p className="text-xs text-muted-foreground truncate leading-relaxed">
                {activo.descripcion}
              </p>
            ) : (
              <span className="text-[11px] text-muted-foreground/50 italic">
                Sin descripción
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Código Institucional */}
      <td className="px-3 py-2 sm:px-4 sm:py-2.5">
        <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground border border-border/60">
          {activo.codigo}
        </code>
      </td>

      {/* Tipo de Activo */}
      <td className="px-3 py-2 sm:px-4 sm:py-2.5">
        {tipoActivo ? (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted/70 text-foreground border border-border/60">
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: tipoColor }}
            />
            <TipoIcon className="size-3 shrink-0 text-muted-foreground" />
            <span className="truncate max-w-[120px]">{tipoActivo.nombre}</span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50 italic">—</span>
        )}
      </td>

      {/* Ubicación */}
      <td className="hidden px-3 py-2 md:table-cell sm:px-4 sm:py-2.5">
        {ubicacion ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <UbicacionIcon className="size-3.5 shrink-0 text-primary" />
            <span className="truncate max-w-[150px]">{ubicacion.nombre}</span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50 italic">—</span>
        )}
      </td>

      {/* Fecha de Adquisición */}
      <td className="hidden px-3 py-2 lg:table-cell sm:px-4 sm:py-2.5">
        {formattedDate ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5 shrink-0 text-muted-foreground/70" />
            <span>{formattedDate}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50 italic">—</span>
        )}
      </td>

      {/* Acciones */}
      <td className="px-3 py-2 text-right sm:px-4 sm:py-2.5">
        <div className="flex items-center justify-end gap-1">
          <Button
            size="icon-xs"
            variant="ghost"
            title="Ver ficha técnica"
            render={<Link to={routes.activos.detail(activo.id)} />}
            className="hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <FileText className="size-3.5" />
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

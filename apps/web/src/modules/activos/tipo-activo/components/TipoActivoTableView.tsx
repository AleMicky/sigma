import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Eye, Layers, Sliders } from "lucide-react"

import { routes } from "@/app/config/routes"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"

import { useDeleteTipoActivo } from "../api/tipo-activo.mutations"
import type { TipoActivo } from "../api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "../lib/tipo-activo-colors"
import { getTipoActivoIcon } from "../lib/tipo-activo-icons"

type TipoActivoTableViewProps = {
  tipos: TipoActivo[]
  categoriasById: Map<string, string>
  onEdit: (tipoActivo: TipoActivo) => void
  onQuickView: (tipoActivo: TipoActivo) => void
}

export function TipoActivoTableView({
  tipos,
  categoriasById,
  onEdit,
  onQuickView,
}: TipoActivoTableViewProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-3.5 py-2.5 sm:px-4">
                Tipo de Activo
              </th>
              <th scope="col" className="px-3.5 py-2.5 sm:px-4">
                Categoría
              </th>
              <th scope="col" className="hidden px-3.5 py-2.5 md:table-cell sm:px-4">
                Descripción
              </th>
              <th scope="col" className="px-3.5 py-2.5 text-right sm:px-4">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tipos.map((tipoActivo) => (
              <TipoActivoTableRow
                key={tipoActivo.id}
                tipoActivo={tipoActivo}
                categoriaNombre={categoriasById.get(tipoActivo.categoriaId)}
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

function TipoActivoTableRow({
  tipoActivo,
  categoriaNombre,
  onEdit,
  onQuickView,
}: {
  tipoActivo: TipoActivo
  categoriaNombre?: string | null
  onEdit: (tipoActivo: TipoActivo) => void
  onQuickView: (tipoActivo: TipoActivo) => void
}) {
  const deleteMutation = useDeleteTipoActivo()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const Icon = getTipoActivoIcon(tipoActivo.icono)
  const color = tipoActivo.color || DEFAULT_TIPO_ACTIVO_COLOR

  return (
    <tr className="group hover:bg-accent/40 transition-colors">
      <td className="px-3.5 py-2 sm:px-4">
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-7.5 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs transition-transform group-hover:scale-105"
            style={{ backgroundColor: color }}
          >
            <Icon className="size-3.5" />
          </span>
          <div className="flex flex-col min-w-0">
            <button
              type="button"
              onClick={() => onQuickView(tipoActivo)}
              className="text-left font-medium text-foreground hover:text-primary transition-colors truncate"
            >
              {tipoActivo.nombre}
            </button>
          </div>
        </div>
      </td>

      <td className="px-3.5 py-2 sm:px-4">
        {categoriaNombre ? (
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/40">
            {categoriaNombre}
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground italic">Sin categoría</span>
        )}
      </td>

      <td className="hidden px-3.5 py-2 md:table-cell sm:px-4 max-w-md">
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {tipoActivo.descripcion || "—"}
        </p>
      </td>

      <td className="px-3.5 py-2 text-right sm:px-4">
        <div className="flex items-center justify-end gap-1">
          <Button
            size="icon-xs"
            variant="ghost"
            title="Ver Atributos"
            render={
              <Link
                to={routes.tiposActivo.atributos(tipoActivo.id)}
              />
            }
          >
            <Sliders className="size-3.5" />
          </Button>

          <Button
            size="icon-xs"
            variant="ghost"
            title="Ver Componentes"
            render={
              <Link
                to={routes.tiposActivo.componentes(tipoActivo.id)}
              />
            }
          >
            <Layers className="size-3.5" />
          </Button>

          <Button
            size="icon-xs"
            variant="ghost"
            title="Ver resumen"
            onClick={() => onQuickView(tipoActivo)}
          >
            <Eye className="size-3.5" />
          </Button>

          <RowActions
            className="shrink-0"
            editLabel="Editar tipo de activo"
            deleteLabel="Eliminar tipo de activo"
            deleteDisabled={deleteMutation.isPending}
            onEdit={() => onEdit(tipoActivo)}
            onDelete={() => setConfirmOpen(true)}
          />
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
      </td>
    </tr>
  )
}

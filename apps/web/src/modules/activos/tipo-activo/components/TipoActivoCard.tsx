import { useState } from "react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"

import { useDeleteTipoActivo } from "../api/tipo-activo.mutations"
import type { TipoActivo } from "../api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "../lib/tipo-activo-colors"
import { getTipoActivoIcon } from "../lib/tipo-activo-icons"

type TipoActivoCardProps = {
  tipoActivo: TipoActivo
  onEdit: (tipoActivo: TipoActivo) => void
}

export function TipoActivoCard({ tipoActivo, onEdit }: TipoActivoCardProps) {
  const deleteMutation = useDeleteTipoActivo()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const Icon = getTipoActivoIcon(tipoActivo.icono)
  const color = tipoActivo.color || DEFAULT_TIPO_ACTIVO_COLOR

  return (
    <li className="group flex min-w-0 gap-2.5 rounded-xl border border-border bg-card p-3 sm:gap-3 sm:p-4">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white sm:size-9"
        style={{ backgroundColor: color }}
      >
        <Icon className="size-3.5 sm:size-4" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <span className="truncate text-sm font-medium">
            {tipoActivo.nombre}
          </span>

          <RowActions
            className="shrink-0"
            editLabel="Editar tipo de activo"
            deleteLabel="Eliminar tipo de activo"
            deleteDisabled={deleteMutation.isPending}
            onEdit={() => onEdit(tipoActivo)}
            onDelete={() => setConfirmOpen(true)}
          />
        </div>

        {tipoActivo.descripcion ? (
          <p className="line-clamp-2 text-sm text-muted-foreground sm:line-clamp-3">
            {tipoActivo.descripcion}
          </p>
        ) : null}
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

import { useState } from "react"
import { Wrench } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  MasterPanelShell,
  PaginatedList,
  SelectableListItem,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import type { PageResponse } from "@/shared/types/api.types"

import { useDeleteActividad } from "../api/actividad.mutations"
import type { ActividadMantenimiento } from "../api/actividad.service"

type ActividadMasterPanelProps = {
  actividades: ActividadMantenimiento[]
  page?: PageResponse<ActividadMantenimiento>
  selectedId: string | null
  search: string
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (actividad: ActividadMantenimiento) => void
  onPageChange: (page: number) => void
}

export function ActividadMasterPanel({
  actividades,
  page,
  selectedId,
  search,
  isLoading,
  isFetching,
  errorMessage,
  onSearchChange,
  onSelect,
  onCreate,
  onEdit,
  onPageChange,
}: ActividadMasterPanelProps) {
  const deleteMutation = useDeleteActividad()
  const [actividadToDelete, setActividadToDelete] =
    useState<ActividadMantenimiento | null>(null)

  return (
    <MasterPanelShell
      label="Actividades de Mantenimiento"
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por código o nombre…"
      searchAriaLabel="Buscar actividades de mantenimiento"
      footer={
        <ConfirmDeleteDialog
          open={Boolean(actividadToDelete)}
          onOpenChange={(open) => {
            if (!open) setActividadToDelete(null)
          }}
          title="Eliminar actividad de mantenimiento"
          description={
            actividadToDelete
              ? `¿Seguro que deseas eliminar "${actividadToDelete.nombre}"? Sus aplicaciones y asignaciones también se eliminarán.`
              : "¿Seguro que deseas eliminar esta actividad?"
          }
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            if (!actividadToDelete) return
            await deleteMutation.mutateAsync(actividadToDelete.id)
            setActividadToDelete(null)
          }}
        />
      }
    >
      <PaginatedList
        items={actividades}
        page={page}
        isLoading={isLoading}
        isFetching={isFetching}
        errorMessage={errorMessage}
        hasSearch={search.trim().length > 0}
        onPageChange={onPageChange}
        getKey={(actividad) => actividad.id}
        empty={{
          icon: <Wrench className="size-5 text-muted-foreground" />,
          title: "No hay actividades de mantenimiento",
          description:
            "Crea tu primera actividad estandarizada para definir procedimientos de mantenimiento.",
          actionLabel: "Crear Actividad",
          onAction: onCreate,
          searchDescription: "Prueba con otros términos de búsqueda.",
        }}
      >
        {(actividad: ActividadMantenimiento) => {
          const isSelected = actividad.id === selectedId

          return (
            <SelectableListItem
              key={actividad.id}
              active={isSelected}
              onSelect={() => onSelect(actividad.id)}
              title={
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                    <Wrench className="size-3.5" />
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground border border-border/70">
                      {actividad.codigo}
                    </code>
                    <span className="truncate font-semibold text-xs text-foreground">
                      {actividad.nombre}
                    </span>
                  </div>
                </div>
              }
              subtitle={
                actividad.descripcion ? (
                  <p className="truncate text-[11px] text-muted-foreground mt-1 pl-8">
                    {actividad.descripcion}
                  </p>
                ) : null
              }
              actions={
                <RowActions
                  editLabel="Editar actividad"
                  deleteLabel="Eliminar actividad"
                  deleteDisabled={deleteMutation.isPending}
                  onEdit={() => onEdit(actividad)}
                  onDelete={() => setActividadToDelete(actividad)}
                />
              }
            />
          )
        }}
      </PaginatedList>
    </MasterPanelShell>
  )
}

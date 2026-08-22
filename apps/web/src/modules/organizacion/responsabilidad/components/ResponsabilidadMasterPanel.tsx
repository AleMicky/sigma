import { useState } from "react"
import { Award, FolderOpen } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  MasterPanelShell,
  PaginatedList,
  SelectableListItem,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import type { PageResponse } from "@/shared/types/api.types"

import { useDeleteResponsabilidad } from "../api/responsabilidad.mutations"
import type { Responsabilidad } from "../api/responsabilidad.service"

type ResponsabilidadMasterPanelProps = {
  responsabilidades: Responsabilidad[]
  page?: PageResponse<Responsabilidad>
  selectedId: string | null
  search: string
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (responsabilidad: Responsabilidad) => void
  onPageChange: (page: number) => void
}

export function ResponsabilidadMasterPanel({
  responsabilidades,
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
}: ResponsabilidadMasterPanelProps) {
  const deleteMutation = useDeleteResponsabilidad()
  const [responsabilidadToDelete, setResponsabilidadToDelete] =
    useState<Responsabilidad | null>(null)

  return (
    <MasterPanelShell
      label="Responsabilidades"
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por código o nombre…"
      searchAriaLabel="Buscar responsabilidades"
      footer={
        <ConfirmDeleteDialog
          open={Boolean(responsabilidadToDelete)}
          onOpenChange={(open) => {
            if (!open) setResponsabilidadToDelete(null)
          }}
          title="Eliminar responsabilidad"
          description={
            responsabilidadToDelete
              ? `¿Seguro que deseas eliminar "${responsabilidadToDelete.nombre}" (${responsabilidadToDelete.codigo})? También se removerán sus asignaciones.`
              : "¿Seguro que deseas eliminar esta responsabilidad?"
          }
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            if (!responsabilidadToDelete) return
            await deleteMutation.mutateAsync(responsabilidadToDelete.id)
            setResponsabilidadToDelete(null)
          }}
        />
      }
    >
      <PaginatedList
        items={responsabilidades}
        page={page}
        isLoading={isLoading}
        isFetching={isFetching}
        errorMessage={errorMessage}
        hasSearch={search.trim().length > 0}
        onPageChange={onPageChange}
        getKey={(resp) => resp.id}
        empty={{
          icon: <FolderOpen className="size-4 text-muted-foreground" />,
          title: "No hay responsabilidades",
          description:
            "Crea una responsabilidad organizacional para asignar a los empleados.",
          actionLabel: "Crear",
          onAction: onCreate,
          searchDescription: "Prueba con otro código o nombre.",
        }}
      >
        {(responsabilidad) => {
          const isSelected = responsabilidad.id === selectedId

          return (
            <SelectableListItem
              active={isSelected}
              onSelect={() => onSelect(responsabilidad.id)}
              title={
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                  >
                    <Award className="size-3.5" />
                  </div>
                  <span className="truncate">{responsabilidad.nombre}</span>
                </div>
              }
              subtitle={
                <div className="flex items-center gap-1.5 pt-0.5">
                  <code className="w-fit max-w-[180px] truncate rounded bg-muted/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground group-hover:bg-muted">
                    {responsabilidad.codigo}
                  </code>
                </div>
              }
              actions={
                <RowActions
                  editLabel="Editar responsabilidad"
                  deleteLabel="Eliminar responsabilidad"
                  deleteDisabled={deleteMutation.isPending}
                  onEdit={() => onEdit(responsabilidad)}
                  onDelete={() => setResponsabilidadToDelete(responsabilidad)}
                />
              }
            />
          )
        }}
      </PaginatedList>
    </MasterPanelShell>
  )
}

import { useState } from "react"
import { CalendarRange } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  MasterPanelShell,
  PaginatedList,
  SelectableListItem,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import { formatDate } from "@/shared/lib/format-date"
import type { PageResponse } from "@/shared/types/api.types"

import { useDeleteGestion } from "../api/gestion.mutations"
import type { Gestion } from "../api/gestion.service"

type GestionMasterPanelProps = {
  gestiones: Gestion[]
  page?: PageResponse<Gestion>
  selectedId: string | null
  search: string
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (gestion: Gestion) => void
  onPageChange: (page: number) => void
}

export function GestionMasterPanel({
  gestiones,
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
}: GestionMasterPanelProps) {
  const deleteMutation = useDeleteGestion()
  const [gestionToDelete, setGestionToDelete] = useState<Gestion | null>(null)

  return (
    <MasterPanelShell
      label="Gestiones"
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por año…"
      searchAriaLabel="Buscar gestiones"
      footer={
        <ConfirmDeleteDialog
          open={Boolean(gestionToDelete)}
          onOpenChange={(open) => {
            if (!open) setGestionToDelete(null)
          }}
          title="Eliminar gestión"
          description={
            gestionToDelete
              ? `¿Seguro que deseas eliminar la gestión ${gestionToDelete.gestion}? También se eliminarán sus períodos.`
              : "¿Seguro que deseas eliminar esta gestión?"
          }
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            if (!gestionToDelete) return
            await deleteMutation.mutateAsync(gestionToDelete.id)
            setGestionToDelete(null)
          }}
        />
      }
    >
      <PaginatedList
        items={gestiones}
        page={page}
        isLoading={isLoading}
        isFetching={isFetching}
        errorMessage={errorMessage}
        hasSearch={search.trim().length > 0}
        onPageChange={onPageChange}
        getKey={(gestion) => gestion.id}
        empty={{
          icon: <CalendarRange className="size-4 text-muted-foreground" />,
          title: "No hay gestiones",
          description: "Crea una gestión para generar sus 12 períodos.",
          actionLabel: "Crear",
          onAction: onCreate,
          searchDescription: "Prueba con otro año.",
        }}
      >
        {(gestion) => (
          <SelectableListItem
            active={gestion.id === selectedId}
            onSelect={() => onSelect(gestion.id)}
            title={`Gestión ${gestion.gestion}`}
            subtitle={
              <span className="truncate text-[11px] text-muted-foreground">
                {formatDate(gestion.fechaInicio)} —{" "}
                {formatDate(gestion.fechaFin)}
              </span>
            }
            actions={
              <RowActions
                editLabel="Editar gestión"
                deleteLabel="Eliminar gestión"
                deleteDisabled={deleteMutation.isPending}
                onEdit={() => onEdit(gestion)}
                onDelete={() => setGestionToDelete(gestion)}
              />
            }
          />
        )}
      </PaginatedList>
    </MasterPanelShell>
  )
}

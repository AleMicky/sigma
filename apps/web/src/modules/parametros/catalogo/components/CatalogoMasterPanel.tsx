import { useState } from "react"
import { FolderOpen } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  MasterPanelShell,
  PaginatedList,
  SelectableListItem,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import type { PageResponse } from "@/shared/types/api.types"

import { useDeleteCatalogo } from "../api/catalogo.mutations"
import type { Catalogo } from "../api/catalogo.service"

type CatalogoMasterPanelProps = {
  catalogos: Catalogo[]
  page?: PageResponse<Catalogo>
  selectedId: string | null
  search: string
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (catalogo: Catalogo) => void
  onPageChange: (page: number) => void
}

export function CatalogoMasterPanel({
  catalogos,
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
}: CatalogoMasterPanelProps) {
  const deleteMutation = useDeleteCatalogo()
  const [catalogoToDelete, setCatalogoToDelete] = useState<Catalogo | null>(
    null,
  )

  return (
    <MasterPanelShell
      label="Maestros"
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por código o nombre…"
      searchAriaLabel="Buscar catálogos"
      footer={
        <ConfirmDeleteDialog
          open={Boolean(catalogoToDelete)}
          onOpenChange={(open) => {
            if (!open) setCatalogoToDelete(null)
          }}
          title="Eliminar catálogo"
          description={
            catalogoToDelete
              ? `¿Seguro que deseas eliminar "${catalogoToDelete.nombre}"? También se eliminarán sus valores.`
              : "¿Seguro que deseas eliminar este catálogo?"
          }
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            if (!catalogoToDelete) return
            await deleteMutation.mutateAsync(catalogoToDelete.id)
            setCatalogoToDelete(null)
          }}
        />
      }
    >
      <PaginatedList
        items={catalogos}
        page={page}
        isLoading={isLoading}
        isFetching={isFetching}
        errorMessage={errorMessage}
        hasSearch={search.trim().length > 0}
        onPageChange={onPageChange}
        getKey={(catalogo) => catalogo.id}
        empty={{
          icon: <FolderOpen className="size-4 text-muted-foreground" />,
          title: "No hay catálogos",
          description:
            "Crea un catálogo maestro, por ejemplo Tipo de documento.",
          actionLabel: "Crear",
          onAction: onCreate,
          searchDescription: "Prueba con otro código o nombre.",
        }}
      >
        {(catalogo) => (
          <SelectableListItem
            active={catalogo.id === selectedId}
            onSelect={() => onSelect(catalogo.id)}
            title={catalogo.nombre}
            subtitle={
              <code className="w-fit max-w-full truncate rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {catalogo.codigo}
              </code>
            }
            actions={
              <RowActions
                editLabel="Editar catálogo"
                deleteLabel="Eliminar catálogo"
                deleteDisabled={deleteMutation.isPending}
                onEdit={() => onEdit(catalogo)}
                onDelete={() => setCatalogoToDelete(catalogo)}
              />
            }
          />
        )}
      </PaginatedList>
    </MasterPanelShell>
  )
}

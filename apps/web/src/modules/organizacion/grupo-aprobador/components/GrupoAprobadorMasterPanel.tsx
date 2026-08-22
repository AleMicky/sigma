import { useState } from "react"
import { FolderOpen, ShieldCheck } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  MasterPanelShell,
  PaginatedList,
  SelectableListItem,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import type { PageResponse } from "@/shared/types/api.types"

import { useDeleteGrupoAprobador } from "../api/grupo-aprobador.mutations"
import type { GrupoAprobador } from "../api/grupo-aprobador.service"

type GrupoAprobadorMasterPanelProps = {
  grupos: GrupoAprobador[]
  page?: PageResponse<GrupoAprobador>
  selectedId: string | null
  search: string
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (grupo: GrupoAprobador) => void
  onPageChange: (page: number) => void
}

export function GrupoAprobadorMasterPanel({
  grupos,
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
}: GrupoAprobadorMasterPanelProps) {
  const deleteMutation = useDeleteGrupoAprobador()
  const [grupoToDelete, setGrupoToDelete] = useState<GrupoAprobador | null>(null)

  return (
    <MasterPanelShell
      label="Grupos"
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por código o nombre…"
      searchAriaLabel="Buscar grupos aprobadores"
      footer={
        <ConfirmDeleteDialog
          open={Boolean(grupoToDelete)}
          onOpenChange={(open) => {
            if (!open) setGrupoToDelete(null)
          }}
          title="Eliminar grupo aprobador"
          description={
            grupoToDelete
              ? `¿Seguro que deseas eliminar "${grupoToDelete.nombre}" (${grupoToDelete.codigo})? También se removerán sus aprobadores asociados.`
              : "¿Seguro que deseas eliminar este grupo aprobador?"
          }
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            if (!grupoToDelete) return
            await deleteMutation.mutateAsync(grupoToDelete.id)
            setGrupoToDelete(null)
          }}
        />
      }
    >
      <PaginatedList
        items={grupos}
        page={page}
        isLoading={isLoading}
        isFetching={isFetching}
        errorMessage={errorMessage}
        hasSearch={search.trim().length > 0}
        onPageChange={onPageChange}
        getKey={(grupo) => grupo.id}
        empty={{
          icon: <FolderOpen className="size-4 text-muted-foreground" />,
          title: "No hay grupos aprobadores",
          description:
            "Crea un grupo aprobador para definir secuencias de validación y control.",
          actionLabel: "Crear",
          onAction: onCreate,
          searchDescription: "Prueba con otro código o nombre.",
        }}
      >
        {(grupo) => {
          const isSelected = grupo.id === selectedId

          return (
            <SelectableListItem
              active={isSelected}
              onSelect={() => onSelect(grupo.id)}
              title={
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                  >
                    <ShieldCheck className="size-3.5" />
                  </div>
                  <span className="truncate">{grupo.nombre}</span>
                </div>
              }
              subtitle={
                <div className="flex items-center gap-1.5 pt-0.5">
                  <code className="w-fit max-w-[180px] truncate rounded bg-muted/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground group-hover:bg-muted">
                    {grupo.codigo}
                  </code>
                </div>
              }
              actions={
                <RowActions
                  editLabel="Editar grupo aprobador"
                  deleteLabel="Eliminar grupo aprobador"
                  deleteDisabled={deleteMutation.isPending}
                  onEdit={() => onEdit(grupo)}
                  onDelete={() => setGrupoToDelete(grupo)}
                />
              }
            />
          )
        }}
      </PaginatedList>
    </MasterPanelShell>
  )
}

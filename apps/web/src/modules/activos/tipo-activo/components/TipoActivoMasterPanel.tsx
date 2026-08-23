import { useState } from "react"
import { Tags } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  MasterPanelShell,
  PaginatedList,
  SelectableListItem,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import type { PageResponse } from "@/shared/types/api.types"

import { useDeleteTipoActivo } from "../api/tipo-activo.mutations"
import type { TipoActivo } from "../api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "../lib/tipo-activo-colors"
import { getTipoActivoIcon } from "../lib/tipo-activo-icons"

type TipoActivoMasterPanelProps = {
  tipos: TipoActivo[]
  page?: PageResponse<TipoActivo>
  selectedId: string | null
  search: string
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  categoriasById: Map<string, string>
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (tipo: TipoActivo) => void
  onPageChange: (page: number) => void
}

export function TipoActivoMasterPanel({
  tipos,
  page,
  selectedId,
  search,
  isLoading,
  isFetching,
  errorMessage,
  categoriasById,
  onSearchChange,
  onSelect,
  onCreate,
  onEdit,
  onPageChange,
}: TipoActivoMasterPanelProps) {
  const deleteMutation = useDeleteTipoActivo()
  const [tipoToDelete, setTipoToDelete] = useState<TipoActivo | null>(null)

  return (
    <MasterPanelShell
      label="Tipos de Activo"
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por nombre o descripción…"
      searchAriaLabel="Buscar tipos de activo"
      footer={
        <ConfirmDeleteDialog
          open={Boolean(tipoToDelete)}
          onOpenChange={(open) => {
            if (!open) setTipoToDelete(null)
          }}
          title="Eliminar tipo de activo"
          description={
            tipoToDelete
              ? `¿Seguro que deseas eliminar "${tipoToDelete.nombre}"? Sus atributos y componentes también se verán afectados.`
              : "¿Seguro que deseas eliminar este tipo de activo?"
          }
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            if (!tipoToDelete) return
            await deleteMutation.mutateAsync(tipoToDelete.id)
            setTipoToDelete(null)
          }}
        />
      }
    >
      <PaginatedList
        items={tipos}
        page={page}
        isLoading={isLoading}
        isFetching={isFetching}
        errorMessage={errorMessage}
        hasSearch={search.trim().length > 0}
        onPageChange={onPageChange}
        getKey={(tipo) => tipo.id}
        empty={{
          icon: <Tags className="size-5 text-muted-foreground" />,
          title: "No hay tipos de activo",
          description:
            "Crea tu primer tipo de activo para clasificar y estructurar atributos dinámicos.",
          actionLabel: "Crear Tipo",
          onAction: onCreate,
          searchDescription: "Prueba con otros términos de búsqueda.",
        }}
      >
        {(tipo: TipoActivo) => {
          const color = tipo.color || DEFAULT_TIPO_ACTIVO_COLOR
          const TipoIcon = getTipoActivoIcon(tipo.icono)
          const isSelected = tipo.id === selectedId
          const categoriaNombre = tipo.categoriaId
            ? categoriasById.get(tipo.categoriaId)
            : null

          return (
            <SelectableListItem
              key={tipo.id}
              active={isSelected}
              onSelect={() => onSelect(tipo.id)}
              title={
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-md shadow-2xs text-white"
                    style={{ backgroundColor: color }}
                  >
                    <TipoIcon className="size-3.5" />
                  </span>
                  <span className="truncate font-semibold">{tipo.nombre}</span>
                </div>
              }
              subtitle={
                <div className="flex flex-col gap-0.5 mt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      {color}
                    </span>
                    {categoriaNombre ? (
                      <Badge
                        variant="secondary"
                        className="px-1.5 py-0 text-[10px] font-normal"
                      >
                        {categoriaNombre}
                      </Badge>
                    ) : null}
                  </div>
                  {tipo.descripcion ? (
                    <span className="line-clamp-1 text-[11px] text-muted-foreground/80">
                      {tipo.descripcion}
                    </span>
                  ) : null}
                </div>
              }
              actions={
                <RowActions
                  editLabel="Editar tipo de activo"
                  deleteLabel="Eliminar tipo de activo"
                  deleteDisabled={deleteMutation.isPending}
                  onEdit={() => onEdit(tipo)}
                  onDelete={() => setTipoToDelete(tipo)}
                />
              }
            />
          )
        }}
      </PaginatedList>
    </MasterPanelShell>
  )
}

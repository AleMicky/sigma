import { Package, Plus, RotateCcw } from "lucide-react"

import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import type { PageResponse } from "@/shared/types/api.types"

import type { Activo } from "../api/activo.service"
import { ActivoGridView } from "./ActivoGridView"
import { ActivoListView } from "./ActivoListView"

type ActivoEmptyStateProps = {
  hasActiveFilters: boolean
  onResetFilters: () => void
  onCreate: () => void
}

function ActivoEmptyState({
  hasActiveFilters,
  onResetFilters,
  onCreate,
}: Readonly<ActivoEmptyStateProps>) {
  if (hasActiveFilters) {
    return (
      <EmptyState
        icon={<Package className="size-8 text-muted-foreground/60" />}
        title="Sin resultados para la búsqueda"
        description="Prueba a modificar los filtros seleccionados o el estado (Alta / Baja)."
        action={
          <Button size="sm" variant="outline" onClick={onResetFilters}>
            <RotateCcw className="size-4" />
            Limpiar filtros
          </Button>
        }
        className="py-12"
      />
    )
  }

  return (
    <EmptyState
      icon={<Package className="size-8 text-muted-foreground/60" />}
      title="No hay activos registrados"
      description="Comienza a registrar tu inventario creando el primer activo."
      action={
        <Button size="sm" type="button" onClick={onCreate}>
          <Plus className="size-4" />
          Nuevo Activo
        </Button>
      }
      className="py-12"
    />
  )
}

type ActivoContentSectionProps = {
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  activos: Activo[]
  hasActiveFilters: boolean
  viewMode: "list" | "grid"
  tiposById: Map<string, TipoActivo>
  ubicacionesById: Map<string, Ubicacion>
  pageData?: PageResponse<Activo>
  onPageChange: (page: number) => void
  onResetFilters: () => void
  onCreate: () => void
  onEdit: (activo: Activo) => void
}

export function ActivoContentSection({
  isLoading,
  isFetching,
  isError,
  error,
  activos,
  hasActiveFilters,
  viewMode,
  tiposById,
  ubicacionesById,
  pageData,
  onPageChange,
  onResetFilters,
  onCreate,
  onEdit,
}: Readonly<ActivoContentSectionProps>) {
  if (isLoading) {
    return (
      <ListSkeleton
        rows={6}
        rowClassName="h-28 rounded-2xl"
        className="p-0 space-y-3"
      />
    )
  }

  if (isError) {
    return (
      <EmptyState
        title={getErrorMessage(error)}
        className="text-destructive py-12"
      />
    )
  }

  if (activos.length === 0) {
    return (
      <ActivoEmptyState
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        onCreate={onCreate}
      />
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <div
        className={cn(
          isFetching && "opacity-75 transition-opacity",
        )}
      >
        {viewMode === "list" ? (
          <ActivoListView
            activos={activos}
            tiposById={tiposById}
            ubicacionesById={ubicacionesById}
            onEdit={onEdit}
          />
        ) : (
          <ActivoGridView
            activos={activos}
            tiposById={tiposById}
            ubicacionesById={ubicacionesById}
            onEdit={onEdit}
          />
        )}
      </div>

      {pageData ? (
        <Pagination
          page={pageData}
          onPageChange={onPageChange}
          className="border-t border-border/50 py-3 bg-transparent"
        />
      ) : null}
    </div>
  )
}

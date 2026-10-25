import { Package, RotateCcw } from "lucide-react"

import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import type { PageResponse } from "@/shared/types/api.types"

import type { Activo } from "../../api/activo.service"
import { ActivoCatalogoGridView } from "./ActivoCatalogoGridView"
import { ActivoCatalogoListView } from "./ActivoCatalogoListView"

type ActivoCatalogoEmptyStateProps = {
  hasActiveFilters: boolean
  onResetFilters: () => void
}

function ActivoCatalogoEmptyState({
  hasActiveFilters,
  onResetFilters,
}: Readonly<ActivoCatalogoEmptyStateProps>) {
  if (hasActiveFilters) {
    return (
      <EmptyState
        icon={<Package className="size-8 text-muted-foreground/60" />}
        title="Sin resultados para los filtros seleccionados"
        description="Prueba a modificar los términos de búsqueda o cambiar los filtros seleccionados."
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
      title="Catálogo vacío"
      description="Aún no se han registrado activos vigentes en el sistema."
      className="py-12"
    />
  )
}

type ActivoCatalogoContentSectionProps = {
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
}

export function ActivoCatalogoContentSection({
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
}: Readonly<ActivoCatalogoContentSectionProps>) {
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
      <ActivoCatalogoEmptyState
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
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
          <ActivoCatalogoListView
            activos={activos}
            tiposById={tiposById}
            ubicacionesById={ubicacionesById}
          />
        ) : (
          <ActivoCatalogoGridView
            activos={activos}
            tiposById={tiposById}
            ubicacionesById={ubicacionesById}
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

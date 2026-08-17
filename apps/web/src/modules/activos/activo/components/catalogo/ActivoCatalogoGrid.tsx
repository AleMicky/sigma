import { Package, RotateCcw } from "lucide-react"

import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import type { PageResponse } from "@/shared/types/api.types"
import { cn } from "@/shared/lib/utils"

import type { Activo } from "../../api/activo.service"
import { ActivoCatalogoCard } from "./ActivoCatalogoCard"

interface ActivoCatalogoGridProps {
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  errorMessage?: string
  activos: Activo[]
  tiposById: Map<string, TipoActivo>
  ubicacionesById: Map<string, Ubicacion>
  pageData?: PageResponse<Activo>
  onPageChange: (page: number) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export function ActivoCatalogoGrid({
  isLoading,
  isFetching,
  isError,
  errorMessage,
  activos,
  tiposById,
  ubicacionesById,
  pageData,
  onPageChange,
  hasActiveFilters,
  onResetFilters,
}: ActivoCatalogoGridProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-3">
        <ListSkeleton
          rows={8}
          rowClassName="h-36 rounded-2xl"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center pt-3">
        <EmptyState
          title={errorMessage || "Error al cargar el catálogo de activos"}
          className="text-destructive my-auto"
        />
      </div>
    )
  }

  if (activos.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center pt-3">
        <EmptyState
          icon={<Package className="size-8 text-muted-foreground/60" />}
          title={
            hasActiveFilters
              ? "Sin resultados para los filtros seleccionados"
              : "Catálogo vacío"
          }
          description={
            hasActiveFilters
              ? "Prueba a modificar los términos de búsqueda o cambiar los filtros seleccionados."
              : "Aún no se han registrado activos en el sistema."
          }
          action={
            hasActiveFilters ? (
              <Button size="sm" variant="outline" onClick={onResetFilters}>
                <RotateCcw className="size-4" />
                Limpiar filtros
              </Button>
            ) : undefined
          }
          className="my-auto"
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-3">
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3 pr-1",
          isFetching && "opacity-75 transition-opacity",
        )}
      >
        <ul className="grid grid-cols-1 content-start gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activos.map((activo) => (
            <ActivoCatalogoCard
              key={activo.id}
              activo={activo}
              tipoActivo={activo.tipoActivo ?? (activo.tipoActivoId ? tiposById.get(activo.tipoActivoId) : undefined)}
              ubicacion={
                activo.ubicacion ??
                (activo.ubicacionId
                  ? ubicacionesById.get(activo.ubicacionId)
                  : undefined)
              }
            />
          ))}
        </ul>
      </div>

      {pageData ? (
        <Pagination
          page={pageData}
          onPageChange={onPageChange}
          className="border-t border-border/50 py-2 bg-transparent"
        />
      ) : null}
    </div>
  )
}

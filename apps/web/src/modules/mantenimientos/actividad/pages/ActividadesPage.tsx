import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { useMasterDetail } from "@/shared/hooks/use-master-detail"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { actividadQueries } from "../api/actividad.queries"
import type { ActividadMantenimiento } from "../api/actividad.service"
import { ActividadDetailPanel } from "../components/ActividadDetailPanel"
import { ActividadFormDialog } from "../components/ActividadFormDialog"
import { ActividadMasterPanel } from "../components/ActividadMasterPanel"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function ActividadesPage() {
  const [actividadDialogOpen, setActividadDialogOpen] = useState(false)
  const [editingActividad, setEditingActividad] =
    useState<ActividadMantenimiento | null>(null)

  const actividadSearch = usePaginatedSearch()

  const actividadesQuery = useQuery(
    actividadQueries.list({
      page: actividadSearch.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(actividadSearch.query ? { q: actividadSearch.query } : {}),
    }),
  )

  const actividades = actividadesQuery.data?.content ?? []

  useClampPage(
    actividadSearch.page,
    actividadSearch.setPage,
    actividadesQuery.data?.totalPages,
  )

  const masterDetail = useMasterDetail(actividades)

  const openCreateActividad = () => {
    setEditingActividad(null)
    setActividadDialogOpen(true)
  }

  const openEditActividad = (actividad: ActividadMantenimiento) => {
    setEditingActividad(actividad)
    setActividadDialogOpen(true)
  }

  return (
    <div className="-m-3 sm:-m-4 md:-m-5 flex h-[calc(100%+1.5rem)] sm:h-[calc(100%+2rem)] md:h-[calc(100%+2.5rem)] w-[calc(100%+1.5rem)] sm:w-[calc(100%+2rem)] md:w-[calc(100%+2.5rem)] min-h-0 flex-1 overflow-hidden bg-background">
      <div
        className={cn(
          "grid min-h-0 flex-1 overflow-hidden w-full h-full",
          "md:grid-cols-[minmax(300px,360px)_1fr]",
        )}
      >
        {/* Panel Maestro (Izquierdo) */}
        <div
          className={cn(
            "h-full min-h-0 min-w-0 flex-col overflow-hidden border-r border-border/40",
            masterDetail.showMaster ? "flex" : "hidden",
            "md:flex",
          )}
        >
          <ActividadMasterPanel
            actividades={actividades}
            page={actividadesQuery.data}
            selectedId={masterDetail.selectedId}
            search={actividadSearch.search}
            isLoading={actividadesQuery.isLoading}
            isFetching={actividadesQuery.isFetching}
            errorMessage={
              actividadesQuery.isError
                ? getErrorMessage(actividadesQuery.error)
                : null
            }
            onSearchChange={actividadSearch.setSearch}
            onSelect={masterDetail.select}
            onCreate={openCreateActividad}
            onEdit={openEditActividad}
            onPageChange={actividadSearch.setPage}
            onRefresh={() => actividadesQuery.refetch()}
          />
        </div>

        {/* Panel Detalle (Derecho) */}
        <div
          className={cn(
            "h-full min-h-0 min-w-0 flex-col overflow-hidden",
            masterDetail.showDetail ? "flex" : "hidden",
            "md:flex",
          )}
        >
          <ActividadDetailPanel
            actividad={masterDetail.selected}
            onEdit={openEditActividad}
            onBack={masterDetail.isMobile ? masterDetail.backToMaster : undefined}
            onPrev={
              masterDetail.selectedId &&
              actividades.findIndex((a) => a.id === masterDetail.selectedId) > 0
                ? () => {
                    const idx = actividades.findIndex(
                      (a) => a.id === masterDetail.selectedId,
                    )
                    if (idx > 0) masterDetail.select(actividades[idx - 1].id)
                  }
                : undefined
            }
            onNext={
              masterDetail.selectedId &&
              actividades.findIndex((a) => a.id === masterDetail.selectedId) <
                actividades.length - 1
                ? () => {
                    const idx = actividades.findIndex(
                      (a) => a.id === masterDetail.selectedId,
                    )
                    if (idx < actividades.length - 1)
                      masterDetail.select(actividades[idx + 1].id)
                  }
                : undefined
            }
          />
        </div>
      </div>

      {/* Form Dialog Modal */}
      {actividadDialogOpen && (
        <ActividadFormDialog
          key={editingActividad?.id ?? "new-actividad"}
          open={actividadDialogOpen}
          onOpenChange={setActividadDialogOpen}
          actividad={editingActividad}
          onSuccess={(saved) => {
            masterDetail.revealDetail(saved.id)
            if (!editingActividad) {
              actividadSearch.setPage(0)
            }
          }}
        />
      )}
    </div>
  )
}


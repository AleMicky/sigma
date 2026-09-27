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

import { flotaQueries } from "../api/flota.queries"
import type { FlotaVehicular } from "../api/flota.service"
import { FlotaDetailPanel } from "../components/FlotaDetailPanel"
import { FlotaFormDialog } from "../components/FlotaFormDialog"
import { FlotaMasterPanel } from "../components/FlotaMasterPanel"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function FlotasPage() {
  const [flotaDialogOpen, setFlotaDialogOpen] = useState(false)
  const [editingFlota, setEditingFlota] = useState<FlotaVehicular | null>(null)
  const [activoFilter, setActivoFilter] = useState<boolean | null>(null)

  const search = usePaginatedSearch()

  const queryParams = {
    page: search.page,
    size: PAGE_SIZE,
    sortBy: "codigo",
    direction: "ASC" as const,
    ...(search.query && { search: search.query }),
    ...(activoFilter !== null && { activo: activoFilter }),
  }

  const flotasQuery = useQuery(flotaQueries.list(queryParams))
  const flotas = flotasQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    flotasQuery.data?.totalPages
  )

  const masterDetail = useMasterDetail<FlotaVehicular>(flotas)

  const openCreateFlota = () => {
    setEditingFlota(null)
    setFlotaDialogOpen(true)
  }

  const openEditFlota = (flota: FlotaVehicular) => {
    setEditingFlota(flota)
    setFlotaDialogOpen(true)
  }

  return (
    <div className="-m-3 sm:-m-4 md:-m-5 flex h-[calc(100%+1.5rem)] sm:h-[calc(100%+2rem)] md:h-[calc(100%+2.5rem)] w-[calc(100%+1.5rem)] sm:w-[calc(100%+2rem)] md:w-[calc(100%+2.5rem)] min-h-0 flex-1 overflow-hidden bg-background">
      <div
        className={cn(
          "grid min-h-0 flex-1 overflow-hidden w-full h-full",
          "md:grid-cols-[minmax(300px,360px)_1fr]"
        )}
      >
        {/* Panel Maestro (Izquierdo) */}
        <div
          className={cn(
            "h-full min-h-0 min-w-0 flex-col overflow-hidden border-r border-border/40",
            masterDetail.showMaster ? "flex" : "hidden",
            "md:flex"
          )}
        >
          <FlotaMasterPanel
            flotas={flotas}
            page={flotasQuery.data}
            selectedId={masterDetail.selectedId}
            search={search.search}
            activoFilter={activoFilter}
            isLoading={flotasQuery.isLoading}
            isFetching={flotasQuery.isFetching}
            errorMessage={
              flotasQuery.isError ? getErrorMessage(flotasQuery.error) : null
            }
            onSearchChange={search.setSearch}
            onActivoFilterChange={setActivoFilter}
            onSelect={masterDetail.select}
            onCreate={openCreateFlota}
            onEdit={openEditFlota}
            onPageChange={search.setPage}
          />
        </div>

        {/* Panel Detalle (Derecho) */}
        <div
          className={cn(
            "h-full min-h-0 min-w-0 flex-col overflow-hidden",
            masterDetail.showDetail ? "flex" : "hidden",
            "md:flex"
          )}
        >
          <FlotaDetailPanel
            flota={masterDetail.selected}
            onEditFlota={openEditFlota}
            onPrev={
              masterDetail.selectedId &&
              flotas.findIndex((f: FlotaVehicular) => f.id === masterDetail.selectedId) > 0
                ? () => {
                    const idx = flotas.findIndex(
                      (f: FlotaVehicular) => f.id === masterDetail.selectedId
                    )
                    if (idx > 0) masterDetail.select(flotas[idx - 1].id)
                  }
                : undefined
            }
            onNext={
              masterDetail.selectedId &&
              flotas.findIndex((f: FlotaVehicular) => f.id === masterDetail.selectedId) <
                flotas.length - 1
                ? () => {
                    const idx = flotas.findIndex(
                      (f: FlotaVehicular) => f.id === masterDetail.selectedId
                    )
                    if (idx < flotas.length - 1)
                      masterDetail.select(flotas[idx + 1].id)
                  }
                : undefined
            }
          />
        </div>
      </div>

      {/* Modal Formulario Flota */}
      {flotaDialogOpen && (
        <FlotaFormDialog
          key={editingFlota?.id ?? "new-flota"}
          open={flotaDialogOpen}
          onOpenChange={setFlotaDialogOpen}
          flota={editingFlota}
          onSuccess={(saved) => {
            masterDetail.revealDetail(saved.id)
            search.setPage(0)
          }}
        />
      )}
    </div>
  )
}

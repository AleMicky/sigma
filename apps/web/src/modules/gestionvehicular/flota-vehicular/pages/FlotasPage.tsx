import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { useMasterDetail } from "@/shared/hooks/use-master-detail"
import { useClampPage, usePaginatedSearch } from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { flotaQueries } from "../api/flota.queries"
import type { FlotaVehicular } from "../api/flota.service"
import { FlotaDetailPanel } from "../components/FlotaDetailPanel"
import { FlotaFormDialog } from "../components/FlotaFormDialog"
import { FlotaMasterPanel } from "../components/FlotaMasterPanel"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function FlotasPage() {
  const [formDialog, setFormDialog] = useState<{ open: boolean; flota: FlotaVehicular | null }>({
    open: false,
    flota: null,
  })
  const [activoFilter, setActivoFilter] = useState<boolean | null>(null)
  const search = usePaginatedSearch()

  const flotasQuery = useQuery(
    flotaQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "codigo",
      direction: "ASC",
      ...(search.query && { search: search.query }),
      ...(activoFilter !== null && { activo: activoFilter }),
    })
  )

  const flotas = flotasQuery.data?.content ?? []
  useClampPage(search.page, search.setPage, flotasQuery.data?.totalPages)

  const masterDetail = useMasterDetail(flotas)

  const openForm = (flota: FlotaVehicular | null = null) => setFormDialog({ open: true, flota })
  const closeForm = () => setFormDialog((prev) => ({ ...prev, open: false }))

  // Navegación secuencial simplificada
  const currentIndex = flotas.findIndex((f) => f.id === masterDetail.selectedId)
  const prevFlota = currentIndex > 0 ? flotas[currentIndex - 1] : null
  const nextFlota = currentIndex >= 0 && currentIndex < flotas.length - 1 ? flotas[currentIndex + 1] : null

  return (
    <div className="-m-3 sm:-m-4 md:-m-5 flex h-[calc(100%+1.5rem)] sm:h-[calc(100%+2rem)] md:h-[calc(100%+2.5rem)] w-[calc(100%+1.5rem)] sm:w-[calc(100%+2rem)] md:w-[calc(100%+2.5rem)] min-h-0 flex-1 overflow-hidden bg-background">
      <div className={cn("grid min-h-0 flex-1 overflow-hidden w-full h-full", "md:grid-cols-[minmax(320px,380px)_1fr] xl:grid-cols-[minmax(340px,400px)_1fr]")}>
        {/* Panel Maestro (Izquierdo) */}
        <div className={cn("h-full min-h-0 min-w-0 flex-col overflow-hidden border-r border-border/40", masterDetail.showMaster ? "flex" : "hidden", "md:flex")}>
          <FlotaMasterPanel
            flotas={flotas}
            page={flotasQuery.data}
            selectedId={masterDetail.selectedId}
            search={search.search}
            activoFilter={activoFilter}
            isLoading={flotasQuery.isLoading}
            isFetching={flotasQuery.isFetching}
            errorMessage={flotasQuery.isError ? getErrorMessage(flotasQuery.error) : null}
            onSearchChange={search.setSearch}
            onActivoFilterChange={setActivoFilter}
            onSelect={masterDetail.select}
            onCreate={() => openForm()}
            onEdit={openForm}
            onPageChange={search.setPage}
          />
        </div>

        {/* Panel Detalle (Derecho) */}
        <div className={cn("h-full min-h-0 min-w-0 flex-col overflow-hidden", masterDetail.showDetail ? "flex" : "hidden", "md:flex")}>
          <FlotaDetailPanel
            flota={masterDetail.selected}
            onEditFlota={openForm}
            onPrev={prevFlota ? () => masterDetail.select(prevFlota.id) : undefined}
            onNext={nextFlota ? () => masterDetail.select(nextFlota.id) : undefined}
          />
        </div>
      </div>

      {/* Modal Formulario Flota */}
      {formDialog.open && (
        <FlotaFormDialog
          key={formDialog.flota?.id ?? "new-flota"}
          open={formDialog.open}
          onOpenChange={(open) => !open && closeForm()}
          flota={formDialog.flota}
          onSuccess={(saved) => {
            closeForm()
            masterDetail.revealDetail(saved.id)
            search.setPage(0)
          }}
        />
      )}
    </div>
  )
}

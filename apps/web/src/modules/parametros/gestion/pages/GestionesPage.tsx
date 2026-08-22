import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { MasterDetailLayout } from "@/shared/components/master-detail"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"
import { useMasterDetail } from "@/shared/hooks/use-master-detail"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { gestionQueries } from "../api/gestion.queries"
import type { Gestion } from "../api/gestion.service"
import type { Periodo } from "../api/periodo.service"
import { GestionDetailPanel } from "../components/GestionDetailPanel"
import { GestionFormDialog } from "../components/GestionFormDialog"
import { GestionMasterPanel } from "../components/GestionMasterPanel"
import { PeriodoFormDialog } from "../components/PeriodoFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function GestionesPage() {
  const [gestionDialogOpen, setGestionDialogOpen] = useState(false)
  const [editingGestion, setEditingGestion] = useState<Gestion | null>(null)
  const [editingPeriodo, setEditingPeriodo] = useState<Periodo | null>(null)

  const gestionSearch = usePaginatedSearch()

  const gestionesQuery = useQuery(
    gestionQueries.list({
      page: gestionSearch.page,
      size: PAGE_SIZE,
      sortBy: "gestion",
      direction: "DESC",
      ...(gestionSearch.query ? { q: gestionSearch.query } : {}),
    }),
  )

  const gestiones = gestionesQuery.data?.content ?? []

  useClampPage(
    gestionSearch.page,
    gestionSearch.setPage,
    gestionesQuery.data?.totalPages,
  )

  const masterDetail = useMasterDetail(gestiones)
  const periodoSearch = usePaginatedSearch({
    resetKey: masterDetail.selectedId,
  })

  function openCreateGestion() {
    setEditingGestion(null)
    setGestionDialogOpen(true)
  }

  function openEditGestion(gestion: Gestion) {
    setEditingGestion(gestion)
    setGestionDialogOpen(true)
  }

  return (
    <MasterDetailLayout
      title={
        masterDetail.isMobile &&
        masterDetail.mobileShowDetail &&
        masterDetail.selected
          ? `Gestión ${masterDetail.selected.gestion}`
          : "Gestiones"
      }
      showMaster={masterDetail.showMaster}
      showDetail={masterDetail.showDetail}
      showBack={masterDetail.isMobile && masterDetail.mobileShowDetail}
      backLabel="Volver a gestiones"
      onBack={masterDetail.backToMaster}
      headerAction={
        <div className="flex items-center gap-1.5 sm:gap-2">
          <RefreshButton
            size="sm"
            onRefresh={() => gestionesQuery.refetch()}
            isRefreshing={gestionesQuery.isFetching}
          />
          {masterDetail.showMaster ? (
            <Button
              size="sm"
              type="button"
              onClick={openCreateGestion}
              className="shrink-0"
            >
              <Plus />
              Crear
            </Button>
          ) : null}
        </div>
      }
      master={
        <GestionMasterPanel
          gestiones={gestiones}
          page={gestionesQuery.data}
          selectedId={masterDetail.selectedId}
          search={gestionSearch.search}
          isLoading={gestionesQuery.isLoading}
          isFetching={gestionesQuery.isFetching}
          errorMessage={
            gestionesQuery.isError
              ? getErrorMessage(gestionesQuery.error)
              : null
          }
          onSearchChange={gestionSearch.setSearch}
          onSelect={masterDetail.select}
          onCreate={openCreateGestion}
          onEdit={openEditGestion}
          onPageChange={gestionSearch.setPage}
        />
      }
      detail={
        <GestionDetailPanel
          gestion={masterDetail.selected}
          periodoPage={periodoSearch.page}
          onPageChange={periodoSearch.setPage}
          onEditPeriodo={setEditingPeriodo}
        />
      }
    >
      <GestionFormDialog
        key={editingGestion?.id ?? "new-gestion"}
        open={gestionDialogOpen}
        onOpenChange={setGestionDialogOpen}
        gestion={editingGestion}
        onSuccess={(saved) => {
          masterDetail.revealDetail(saved.id)
          gestionSearch.setPage(0)
        }}
      />

      {editingPeriodo ? (
        <PeriodoFormDialog
          key={editingPeriodo.id}
          open={Boolean(editingPeriodo)}
          onOpenChange={(open) => {
            if (!open) setEditingPeriodo(null)
          }}
          periodo={editingPeriodo}
        />
      ) : null}
    </MasterDetailLayout>
  )
}

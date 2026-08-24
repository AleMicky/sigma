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
  const aplicacionSearch = usePaginatedSearch({
    resetKey: masterDetail.selectedId,
  })

  function openCreateActividad() {
    setEditingActividad(null)
    setActividadDialogOpen(true)
  }

  function openEditActividad(actividad: ActividadMantenimiento) {
    setEditingActividad(actividad)
    setActividadDialogOpen(true)
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      <MasterDetailLayout
        title={
          masterDetail.isMobile &&
          masterDetail.mobileShowDetail &&
          masterDetail.selected
            ? masterDetail.selected.nombre
            : "Actividades de Mantenimiento"
        }
        showMaster={masterDetail.showMaster}
        showDetail={masterDetail.showDetail}
        showBack={masterDetail.isMobile && masterDetail.mobileShowDetail}
        backLabel="Volver a actividades"
        onBack={masterDetail.backToMaster}
        headerAction={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <RefreshButton
              size="sm"
              queries={[actividadesQuery]}
            />

            <Button
              size="sm"
              type="button"
              onClick={openCreateActividad}
              className="shrink-0 gap-1 shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>Nueva Actividad</span>
            </Button>
          </div>
        }
        master={
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
          />
        }
        detail={
          <ActividadDetailPanel
            actividad={masterDetail.selected}
            search={aplicacionSearch.search}
            onSearchChange={aplicacionSearch.setSearch}
          />
        }
      />

      {/* Form Dialog Modal */}
      <ActividadFormDialog
        key={editingActividad?.id ?? "new-actividad"}
        open={actividadDialogOpen}
        onOpenChange={setActividadDialogOpen}
        actividad={editingActividad}
        onSuccess={() => {
          if (!editingActividad) {
            actividadSearch.setPage(0)
          }
        }}
      />
    </div>
  )
}

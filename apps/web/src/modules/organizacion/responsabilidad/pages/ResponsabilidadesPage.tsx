import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { HelpCircle, Plus } from "lucide-react"

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

import { empleadoResponsabilidadQueries } from "../../empleado-responsabilidad/api/empleado-responsabilidad.queries"
import type { EmpleadoResponsabilidad } from "../../empleado-responsabilidad/api/empleado-responsabilidad.service"
import { EmpleadoResponsabilidadFormDialog } from "../../empleado-responsabilidad/components/EmpleadoResponsabilidadFormDialog"
import { ResponsabilidadDetailPanel } from "../../empleado-responsabilidad/components/ResponsabilidadDetailPanel"
import { responsabilidadQueries } from "../api/responsabilidad.queries"
import type { Responsabilidad } from "../api/responsabilidad.service"
import { ResponsabilidadFormDialog } from "../components/ResponsabilidadFormDialog"
import { ResponsabilidadHelpModal } from "../components/ResponsabilidadHelpModal"
import { ResponsabilidadMasterPanel } from "../components/ResponsabilidadMasterPanel"
import { ResponsabilidadStats } from "../components/ResponsabilidadStats"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function ResponsabilidadesPage() {
  const [responsabilidadDialogOpen, setResponsabilidadDialogOpen] =
    useState(false)
  const [editingResponsabilidad, setEditingResponsabilidad] =
    useState<Responsabilidad | null>(null)
  const [asignacionDialogOpen, setAsignacionDialogOpen] = useState(false)
  const [editingAsignacion, setEditingAsignacion] =
    useState<EmpleadoResponsabilidad | null>(null)
  const [helpModalOpen, setHelpModalOpen] = useState(false)

  const responsabilidadSearch = usePaginatedSearch()

  const responsabilidadesQuery = useQuery(
    responsabilidadQueries.list({
      page: responsabilidadSearch.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(responsabilidadSearch.query ? { q: responsabilidadSearch.query } : {}),
    }),
  )

  const responsabilidades = responsabilidadesQuery.data?.content ?? []
  const totalResponsabilidades =
    responsabilidadesQuery.data?.totalElements ?? responsabilidades.length

  useClampPage(
    responsabilidadSearch.page,
    responsabilidadSearch.setPage,
    responsabilidadesQuery.data?.totalPages,
  )

  const masterDetail = useMasterDetail(responsabilidades)
  const asignacionSearch = usePaginatedSearch({
    resetKey: masterDetail.selectedId,
  })

  // Consulta de asignaciones del rol seleccionado para el banner de estadísticas
  const selectedAsignacionesQuery = useQuery({
    ...empleadoResponsabilidadQueries.list({
      responsabilidadId: masterDetail.selectedId ?? "",
      page: 0,
      size: 1,
    }),
    enabled: Boolean(masterDetail.selectedId),
  })

  function openCreateResponsabilidad() {
    setEditingResponsabilidad(null)
    setResponsabilidadDialogOpen(true)
  }

  function openEditResponsabilidad(responsabilidad: Responsabilidad) {
    setEditingResponsabilidad(responsabilidad)
    setResponsabilidadDialogOpen(true)
  }

  function openCreateAsignacion() {
    setEditingAsignacion(null)
    setAsignacionDialogOpen(true)
  }

  function openEditAsignacion(asignacion: EmpleadoResponsabilidad) {
    setEditingAsignacion(asignacion)
    setAsignacionDialogOpen(true)
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Banner Superior de Estadísticas */}
      <ResponsabilidadStats
        totalResponsabilidades={totalResponsabilidades}
        totalAsignadosSelected={
          selectedAsignacionesQuery.data?.totalElements
        }
        selectedResponsabilidadNombre={masterDetail.selected?.nombre}
      />

      <div className="flex-1 min-h-0">
        <MasterDetailLayout
          title={
            masterDetail.isMobile &&
            masterDetail.mobileShowDetail &&
            masterDetail.selected
              ? masterDetail.selected.nombre
              : "Responsabilidades Organizacionales"
          }
          showMaster={masterDetail.showMaster}
          showDetail={masterDetail.showDetail}
          showBack={masterDetail.isMobile && masterDetail.mobileShowDetail}
          backLabel="Volver a responsabilidades"
          onBack={masterDetail.backToMaster}
          headerAction={
            <div className="flex items-center gap-1.5 sm:gap-2">
              <RefreshButton
                size="sm"
                queries={[responsabilidadesQuery, selectedAsignacionesQuery]}
              />

              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setHelpModalOpen(true)}
                className="shrink-0 gap-1.5 text-xs"
                title="Guía de responsabilidades organizacionales"
              >
                <HelpCircle className="size-3.5 text-primary" />
                <span className="hidden sm:inline">Guía</span>
              </Button>

              {masterDetail.showMaster ? (
                <Button
                  size="sm"
                  type="button"
                  onClick={openCreateResponsabilidad}
                  className="shrink-0 gap-1 shadow-2xs"
                >
                  <Plus className="size-3.5" />
                  <span>Crear Rol</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  type="button"
                  onClick={openCreateAsignacion}
                  className="shrink-0 gap-1 shadow-2xs"
                >
                  <Plus className="size-3.5" />
                  <span>Asignar</span>
                </Button>
              )}
            </div>
          }
          master={
            <ResponsabilidadMasterPanel
              responsabilidades={responsabilidades}
              page={responsabilidadesQuery.data}
              selectedId={masterDetail.selectedId}
              search={responsabilidadSearch.search}
              isLoading={responsabilidadesQuery.isLoading}
              isFetching={responsabilidadesQuery.isFetching}
              errorMessage={
                responsabilidadesQuery.isError
                  ? getErrorMessage(responsabilidadesQuery.error)
                  : null
              }
              onSearchChange={responsabilidadSearch.setSearch}
              onSelect={masterDetail.select}
              onCreate={openCreateResponsabilidad}
              onEdit={openEditResponsabilidad}
              onPageChange={responsabilidadSearch.setPage}
            />
          }
          detail={
            <ResponsabilidadDetailPanel
              responsabilidad={masterDetail.selected}
              itemPage={asignacionSearch.page}
              search={asignacionSearch.search}
              searchQuery={asignacionSearch.debouncedSearch}
              hidePrimaryAction={
                masterDetail.isMobile && masterDetail.mobileShowDetail
              }
              onSearchChange={asignacionSearch.setSearch}
              onPageChange={asignacionSearch.setPage}
              onAssignEmpleado={openCreateAsignacion}
              onEditAsignacion={openEditAsignacion}
            />
          }
        >
          {/* Modal de Crear / Editar Responsabilidad */}
          <ResponsabilidadFormDialog
            key={editingResponsabilidad?.id ?? "new-responsabilidad"}
            open={responsabilidadDialogOpen}
            onOpenChange={setResponsabilidadDialogOpen}
            responsabilidad={editingResponsabilidad}
            onSuccess={(saved) => {
              masterDetail.revealDetail(saved.id)
              responsabilidadSearch.setPage(0)
            }}
          />

          {/* Modal de Asignar / Editar Colaborador */}
          {masterDetail.selected ? (
            <EmpleadoResponsabilidadFormDialog
              key={
                editingAsignacion?.id ??
                `new-asignacion-${masterDetail.selected.id}`
              }
              open={asignacionDialogOpen}
              onOpenChange={setAsignacionDialogOpen}
              responsabilidadId={masterDetail.selected.id}
              responsabilidadNombre={masterDetail.selected.nombre}
              responsabilidadCodigo={masterDetail.selected.codigo}
              asignacion={editingAsignacion}
              onSuccess={() => {
                if (!editingAsignacion) {
                  asignacionSearch.setPage(0)
                }
                selectedAsignacionesQuery.refetch()
              }}
            />
          ) : null}

          {/* Modal de Ayuda */}
          <ResponsabilidadHelpModal
            open={helpModalOpen}
            onOpenChange={setHelpModalOpen}
          />
        </MasterDetailLayout>
      </div>
    </div>
  )
}

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { useMasterDetail } from "@/shared/hooks/use-master-detail"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { useDeleteLicencia } from "../api/conductor-licencia.mutations"
import { conductorQueries } from "../api/conductor.queries"
import type { Conductor, ConductorLicencia } from "../api/conductor.service"
import { ConductorDetailPanel } from "../components/ConductorDetailPanel"
import { ConductorFormDialog } from "../components/ConductorFormDialog"
import { ConductorLicenciaFormDialog } from "../components/ConductorLicenciaFormDialog"
import { ConductorMasterPanel } from "../components/ConductorMasterPanel"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function ConductoresPage() {
  // Modal de Conductor (Maestro)
  const [conductorDialogOpen, setConductorDialogOpen] = useState(false)
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null)

  // Modal de Licencia (Detalle)
  const [licenciaDialogOpen, setLicenciaDialogOpen] = useState(false)
  const [editingLicencia, setEditingLicencia] = useState<ConductorLicencia | null>(null)
  const [licenciaTargetConductor, setLicenciaTargetConductor] = useState<Conductor | null>(null)

  // Confirmación de eliminación de licencia
  const [licenciaToDelete, setLicenciaToDelete] = useState<{
    conductor: Conductor
    licencia: ConductorLicencia
  } | null>(null)

  const conductorSearch = usePaginatedSearch()

  const queryParams = {
    page: conductorSearch.page,
    size: PAGE_SIZE,
    sortBy: "createdAt",
    direction: "DESC" as const,
    ...(conductorSearch.query && { search: conductorSearch.query }),
  }

  const conductoresQuery = useQuery(conductorQueries.list(queryParams))
  const conductores = conductoresQuery.data?.content ?? []

  useClampPage(
    conductorSearch.page,
    conductorSearch.setPage,
    conductoresQuery.data?.totalPages
  )

  const masterDetail = useMasterDetail(conductores)

  // Acciones Conductor (Maestro)
  const openCreateConductor = () => {
    setEditingConductor(null)
    setConductorDialogOpen(true)
  }

  const openEditConductor = (conductor: Conductor) => {
    setEditingConductor(conductor)
    setConductorDialogOpen(true)
  }

  // Acciones Licencia (Detalle)
  const openAddLicencia = (conductor: Conductor) => {
    setLicenciaTargetConductor(conductor)
    setEditingLicencia(null)
    setLicenciaDialogOpen(true)
  }

  const openEditLicencia = (conductor: Conductor, licencia: ConductorLicencia) => {
    setLicenciaTargetConductor(conductor)
    setEditingLicencia(licencia)
    setLicenciaDialogOpen(true)
  }

  const deleteLicenciaMutation = useDeleteLicencia()
  const handleDeleteLicencia = async () => {
    if (!licenciaToDelete) return
    const { conductor, licencia } = licenciaToDelete

    if (!licencia.id) {
      setLicenciaToDelete(null)
      return
    }

    try {
      await deleteLicenciaMutation.mutateAsync({
        id: licencia.id,
        conductorId: conductor.id,
      })
      setLicenciaToDelete(null)
    } catch {
      // Handled in mutation
    }
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
          <ConductorMasterPanel
            conductores={conductores}
            page={conductoresQuery.data}
            selectedId={masterDetail.selectedId}
            search={conductorSearch.search}
            isLoading={conductoresQuery.isLoading}
            isFetching={conductoresQuery.isFetching}
            errorMessage={
              conductoresQuery.isError
                ? getErrorMessage(conductoresQuery.error)
                : null
            }
            onSearchChange={conductorSearch.setSearch}
            onSelect={masterDetail.select}
            onCreate={openCreateConductor}
            onEdit={openEditConductor}
            onPageChange={conductorSearch.setPage}
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
          <ConductorDetailPanel
            conductor={masterDetail.selected}
            onEditConductor={openEditConductor}
            onAddLicencia={openAddLicencia}
            onEditLicencia={openEditLicencia}
            onDeleteLicencia={(conductor, licencia) =>
              setLicenciaToDelete({ conductor, licencia })
            }
            onPrev={
              masterDetail.selectedId &&
              conductores.findIndex((c) => c.id === masterDetail.selectedId) > 0
                ? () => {
                    const idx = conductores.findIndex(
                      (c) => c.id === masterDetail.selectedId
                    )
                    if (idx > 0) masterDetail.select(conductores[idx - 1].id)
                  }
                : undefined
            }
            onNext={
              masterDetail.selectedId &&
              conductores.findIndex((c) => c.id === masterDetail.selectedId) <
                conductores.length - 1
                ? () => {
                    const idx = conductores.findIndex(
                      (c) => c.id === masterDetail.selectedId
                    )
                    if (idx < conductores.length - 1)
                      masterDetail.select(conductores[idx + 1].id)
                  }
                : undefined
            }
          />
        </div>
      </div>

      {/* 1. MODAL EXCLUSIVO PARA CONDUCTOR (MAESTRO) */}
      {conductorDialogOpen && (
        <ConductorFormDialog
          key={editingConductor?.id ?? "new-conductor"}
          open={conductorDialogOpen}
          onOpenChange={setConductorDialogOpen}
          conductor={editingConductor}
          onSuccess={(saved) => {
            masterDetail.revealDetail(saved.id)
            conductorSearch.setPage(0)
          }}
        />
      )}

      {/* 2. MODAL EXCLUSIVO PARA LICENCIA (DETALLE) */}
      {licenciaDialogOpen && licenciaTargetConductor && (
        <ConductorLicenciaFormDialog
          key={
            editingLicencia?.id ??
            `new-licencia-${licenciaTargetConductor.id}`
          }
          open={licenciaDialogOpen}
          onOpenChange={setLicenciaDialogOpen}
          conductor={licenciaTargetConductor}
          licencia={editingLicencia}
          onSuccess={() => {
            conductoresQuery.refetch()
          }}
        />
      )}

      {/* 3. DIÁLOGO CONFIRMAR ELIMINACIÓN DE LICENCIA */}
      {licenciaToDelete && (
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setLicenciaToDelete(null)}
          title="Eliminar Licencia"
          description={`¿Seguro que deseas eliminar la licencia de Categoría ${licenciaToDelete.licencia.categoriaLicencia} (Nº ${licenciaToDelete.licencia.numeroLicencia}) de este conductor?`}
          isPending={deleteLicenciaMutation.isPending}
          onConfirm={handleDeleteLicencia}
        />
      )}
    </div>
  )
}

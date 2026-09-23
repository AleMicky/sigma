import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Building, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { useDeleteArea } from "../api/area.mutations"
import { areaQueries } from "../api/area.queries"
import type { Area } from "../api/area.service"
import { AreaFormDialog } from "../components/AreaFormDialog"
import { AreaHelpModal } from "../components/AreaHelpModal"
import { AreasFilters } from "../components/AreasFilters"
import { AreasHeader } from "../components/AreasHeader"
import { AreaTableView } from "../components/AreaTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function AreasPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [editing, setEditing] = useState<Area | null>(null)
  const [deleting, setDeleting] = useState<Area | null>(null)

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteArea()

  const areasQuery = useQuery(
    areaQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const areas = areasQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    areasQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(area: Area) {
    setEditing(area)
    setDialogOpen(true)
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
    } catch {
      // Handled by toast in mutation
    }
  }

  const hasActiveFilters = Boolean(search.search.trim())

  function resetFilters() {
    search.setSearch("")
  }

  return (
    <div className="flex w-full flex-col gap-6 px-2 pt-2 pb-6">
      <AreasHeader
        isRefreshing={areasQuery.isFetching}
        onRefresh={() => areasQuery.refetch()}
        onOpenHelp={() => setHelpModalOpen(true)}
        onOpenCreate={openCreate}
      />

      <AreasFilters
        search={search.search}
        setSearch={search.setSearch}
        hasActiveFilters={hasActiveFilters}
        resetFilters={resetFilters}
      />

      {/* TABLE SECTION */}
      <div className="flex-1 w-full mt-1">
        <AreaTableView
          areas={areas}
          isLoading={areasQuery.isFetching}
          page={areasQuery.data}
          onPageChange={search.setPage}
          onEdit={openEdit}
          onDelete={setDeleting}
          emptyTitle={
            hasActiveFilters
              ? "No se encontraron áreas"
              : "No hay áreas registradas"
          }
          emptyDescription={
            hasActiveFilters
              ? "No hay resultados para la búsqueda realizada."
              : "Agrega áreas para definir la estructura organizacional."
          }
          emptyIcon={
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary/60 shadow-inner">
              <Building className="size-8" />
            </div>
          }
          emptyAction={
            !hasActiveFilters && (
              <Button onClick={openCreate} className="mt-4 gap-2">
                <Plus className="size-4" />
                Agregar Área
              </Button>
            )
          }
        />
      </div>

      {/* MODALS */}
      {dialogOpen && (
        <AreaFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          area={editing}
        />
      )}

      {deleting && (
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={(isOpen) => !isOpen && setDeleting(null)}
          title="Eliminar área"
          description={`¿Estás seguro de que deseas eliminar el área "${deleting.nombre}"?`}
          onConfirm={handleDelete}
          isPending={deleteMutation.isPending}
        />
      )}

      {helpModalOpen && (
        <AreaHelpModal open={helpModalOpen} onOpenChange={setHelpModalOpen} />
      )}
    </div>
  )
}

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Users } from "lucide-react"

import { appConfig } from "@/app/config"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { areaQueries } from "../../area/api/area.queries"
import { useDeleteEmpleado } from "../api/empleado.mutations"
import { empleadoQueries } from "../api/empleado.queries"
import type { Empleado } from "../api/empleado.service"
import { EmpleadoFormDialog } from "../components/EmpleadoFormDialog"
import { EmpleadoHelpModal } from "../components/EmpleadoHelpModal"
import { EmpleadosFilters } from "../components/EmpleadosFilters"
import { EmpleadosHeader } from "../components/EmpleadosHeader"
import { EmpleadoTableView } from "../components/EmpleadoTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function EmpleadosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [editing, setEditing] = useState<Empleado | null>(null)
  const [deleting, setDeleting] = useState<Empleado | null>(null)
  const [selectedAreaId, setSelectedAreaId] = useState<string>("")

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteEmpleado()

  const areasQuery = useQuery(areaQueries.list({ size: 100, sortBy: "nombre", direction: "ASC" }))

  const areas = areasQuery.data?.content ?? []

  const empleadosQuery = useQuery(
    empleadoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      ...(selectedAreaId ? { areaId: selectedAreaId } : {}),
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const empleados = empleadosQuery.data?.content ?? []
  const totalElements = empleadosQuery.data?.totalElements ?? 0

  useClampPage(
    search.page,
    search.setPage,
    empleadosQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(empleado: Empleado) {
    setEditing(empleado)
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

  const hasActiveFilters = Boolean(
    search.search.trim() || selectedAreaId,
  )

  function resetFilters() {
    search.setSearch("")
    setSelectedAreaId("")
  }


  return (
    <div className="flex w-full flex-col gap-6 px-2 pt-2 pb-6">
      <EmpleadosHeader
        isRefreshing={empleadosQuery.isFetching}
        onRefresh={() => empleadosQuery.refetch()}
        onOpenHelp={() => setHelpModalOpen(true)}
        onOpenCreate={openCreate}
      />

      <EmpleadosFilters
        search={search.search}
        setSearch={search.setSearch}
        selectedAreaId={selectedAreaId}
        setSelectedAreaId={setSelectedAreaId}
        areas={areas}
        hasActiveFilters={hasActiveFilters}
        resetFilters={resetFilters}
      />

      {/* TABLE SECTION */}
      <div className="flex-1 w-full mt-2">
        <EmpleadoTableView
          empleados={empleados}
          isLoading={empleadosQuery.isFetching}
          page={{
            page: search.page,
            size: PAGE_SIZE,
            totalElements,
            totalPages: empleadosQuery.data?.totalPages || 0,
            first: search.page === 1,
            last: search.page === (empleadosQuery.data?.totalPages || 1)
          }}
          onPageChange={search.setPage}
          onEdit={openEdit}
          onDelete={setDeleting}
          emptyTitle={
            hasActiveFilters
              ? "No se encontraron empleados"
              : "No hay empleados registrados"
          }
          emptyDescription={
            hasActiveFilters
              ? "No hay resultados para los filtros seleccionados."
              : "Agrega empleados para empezar."
          }
          emptyIcon={
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary/60 shadow-inner">
              <Users className="size-8" />
            </div>
          }
          emptyAction={
            !hasActiveFilters && (
              <Button onClick={openCreate} className="mt-4 gap-2">
                <Plus className="size-4" />
                Agregar Empleado
              </Button>
            )
          }
        />
      </div>

      {/* MODALS */}
      {dialogOpen && (
        <EmpleadoFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          empleado={editing}
        />
      )}

      {deleting && (
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={(isOpen) => !isOpen && setDeleting(null)}
          title="Eliminar empleado"
          description={`¿Estás seguro de que deseas eliminar al empleado "${deleting.personaInfo?.nombreCompleto || deleting.personaNombreCompleto}"?`}
          onConfirm={handleDelete}
          isPending={deleteMutation.isPending}
        />
      )}

      {helpModalOpen && (
        <EmpleadoHelpModal open={helpModalOpen} onOpenChange={setHelpModalOpen} />
      )}
    </div>
  )
}
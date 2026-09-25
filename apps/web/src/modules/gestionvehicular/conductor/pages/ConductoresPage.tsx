import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Car, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { useDeleteConductor } from "../api/conductor.mutations"
import { conductorQueries } from "../api/conductor.queries"
import type { Conductor } from "../api/conductor.service"
import { ConductorFormDialog } from "../components/ConductorFormDialog"
import { ConductoresFilters } from "../components/ConductoresFilters"
import { ConductoresHeader } from "../components/ConductoresHeader"
import { ConductorTableView } from "../components/ConductorTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function ConductoresPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Conductor | null>(null)
  const [deleting, setDeleting] = useState<Conductor | null>(null)
  const [selectedCategoria, setSelectedCategoria] = useState<string>("")
  const [selectedEstado, setSelectedEstado] = useState<string>("")

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteConductor()

  const queryParams = {
    page: search.page,
    size: PAGE_SIZE,
    sortBy: "createdAt",
    direction: "DESC" as const,
    ...(search.query ? { search: search.query } : {}),
    ...(selectedEstado === "ACTIVO"
      ? { activo: true }
      : selectedEstado === "INACTIVO"
      ? { activo: false }
      : {}),
  }

  const conductoresQuery = useQuery(conductorQueries.list(queryParams))

  let conductores = conductoresQuery.data?.content ?? []

  // Client-side filter for categoria if specified
  if (selectedCategoria) {
    conductores = conductores.filter(
      (c) => c.categoriaLicencia === selectedCategoria
    )
  }

  useClampPage(
    search.page,
    search.setPage,
    conductoresQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(conductor: Conductor) {
    setEditing(conductor)
    setDialogOpen(true)
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
    } catch {
      // Handled in mutation
    }
  }

  const hasActiveFilters = Boolean(
    search.search.trim() || selectedCategoria || selectedEstado
  )

  function resetFilters() {
    search.setSearch("")
    setSelectedCategoria("")
    setSelectedEstado("")
  }

  return (
    <div className="flex w-full flex-col gap-6 px-2 pt-2 pb-6">
      <ConductoresHeader
        isRefreshing={conductoresQuery.isFetching}
        onRefresh={() => conductoresQuery.refetch()}
        onOpenCreate={openCreate}
      />

      <ConductoresFilters
        search={search.search}
        setSearch={search.setSearch}
        categoria={selectedCategoria}
        setCategoria={setSelectedCategoria}
        estado={selectedEstado}
        setEstado={setSelectedEstado}
        hasActiveFilters={hasActiveFilters}
        resetFilters={resetFilters}
      />

      {/* TABLE SECTION */}
      <div className="flex-1 w-full mt-2">
        <ConductorTableView
          conductores={conductores}
          isLoading={conductoresQuery.isFetching}
          page={conductoresQuery.data}
          onPageChange={search.setPage}
          onEdit={openEdit}
          onDelete={setDeleting}
          emptyTitle={
            hasActiveFilters
              ? "No se encontraron conductores"
              : "No hay conductores registrados"
          }
          emptyDescription={
            hasActiveFilters
              ? "No hay resultados que coincidan con los filtros seleccionados."
              : "Registra conductores autorizados para gestionar la flota vehicular."
          }
          emptyIcon={
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary/60 shadow-inner">
              <Car className="size-8" />
            </div>
          }
          emptyAction={
            !hasActiveFilters && (
              <Button onClick={openCreate} className="mt-4 gap-2">
                <Plus className="size-4" />
                Registrar Conductor
              </Button>
            )
          }
        />
      </div>

      {/* MODALS */}
      {dialogOpen && (
        <ConductorFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          conductor={editing}
        />
      )}

      {deleting && (
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={(isOpen) => !isOpen && setDeleting(null)}
          title="Eliminar conductor"
          description={`¿Estás seguro de que deseas eliminar al conductor con licencia "${deleting.numeroLicencia}" (${deleting.empleado?.nombreCompleto || "Empleado asignado"})?`}
          onConfirm={handleDelete}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  )
}

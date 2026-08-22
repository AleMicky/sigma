import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Briefcase, HelpCircle, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { useDeleteCargo } from "../api/cargo.mutations"
import { cargoQueries } from "../api/cargo.queries"
import type { Cargo } from "../api/cargo.service"
import {
  CargoFilterToolbar,
  type DescriptionFilterMode,
} from "../components/CargoFilterToolbar"
import { CargoFormDialog } from "../components/CargoFormDialog"
import { CargoHelpModal } from "../components/CargoHelpModal"
import { CargoListItem } from "../components/CargoListItem"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function CargosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [editing, setEditing] = useState<Cargo | null>(null)
  const [deleting, setDeleting] = useState<Cargo | null>(null)
  const [descriptionFilter, setDescriptionFilter] =
    useState<DescriptionFilterMode>("all")

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteCargo()

  const cargosQuery = useQuery(
    cargoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const rawCargos = cargosQuery.data?.content ?? []

  // Client-side filtering by description presence
  const filteredCargos = useMemo(() => {
    if (descriptionFilter === "with_desc") {
      return rawCargos.filter((c) => Boolean(c.descripcion?.trim()))
    }
    if (descriptionFilter === "without_desc") {
      return rawCargos.filter((c) => !c.descripcion?.trim())
    }
    return rawCargos
  }, [rawCargos, descriptionFilter])

  useClampPage(
    search.page,
    search.setPage,
    cargosQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(cargo: Cargo) {
    setEditing(cargo)
    setDialogOpen(true)
  }

  const hasActiveFilters = Boolean(
    search.search.trim() || descriptionFilter !== "all",
  )

  function resetFilters() {
    search.setSearch("")
    setDescriptionFilter("all")
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

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Cargos
            </h1>
            <div className="flex items-center gap-1.5 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                onRefresh={() => cargosQuery.refetch()}
                isRefreshing={cargosQuery.isFetching}
              />
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setHelpModalOpen(true)}
              >
                <HelpCircle className="size-4 text-primary" />
                <span className="sr-only sm:not-sr-only">Guía</span>
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={openCreate}
                className="shrink-0"
              >
                <Plus className="size-4" />
                <span className="sr-only sm:not-sr-only">Crear</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Administra los cargos y puestos de la estructura organizacional institucional.
          </p>
        </div>

        <div className="hidden shrink-0 self-start md:flex md:items-center md:gap-2">
          <RefreshButton
            size="sm"
            onRefresh={() => cargosQuery.refetch()}
            isRefreshing={cargosQuery.isFetching}
          />

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="gap-1.5 border-border/80 hover:bg-muted"
          >
            <HelpCircle className="size-4 text-primary" />
            <span>Guía de Cargos</span>
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            <span>Crear Cargo</span>
          </Button>
        </div>
      </header>

      {/* Filter Toolbar */}
      <CargoFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        descriptionFilter={descriptionFilter}
        onDescriptionFilterChange={setDescriptionFilter}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      />

      {/* Content Section - Compact List */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
        {cargosQuery.isLoading ? (
          <ListSkeleton
            rows={8}
            rowClassName="h-12 rounded-lg"
            className="flex flex-col gap-2"
          />
        ) : cargosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(cargosQuery.error)}
            className="text-destructive"
          />
        ) : filteredCargos.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="size-4 text-muted-foreground" />}
            title={
              hasActiveFilters ? "Sin resultados" : "No hay cargos registrados"
            }
            description={
              hasActiveFilters
                ? "Prueba con otra búsqueda o limpia los filtros."
                : "Crea el primer cargo para definir la estructura laboral de la organización."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" type="button" onClick={resetFilters}>
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate}>
                  <Plus />
                  Crear Cargo
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3",
                cargosQuery.isFetching && "opacity-70",
              )}
            >
              <ul className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
                {filteredCargos.map((cargo) => (
                  <CargoListItem
                    key={cargo.id}
                    cargo={cargo}
                    onEdit={openEdit}
                    onDelete={(c) => setDeleting(c)}
                  />
                ))}
              </ul>
            </div>

            {cargosQuery.data ? (
              <Pagination
                page={cargosQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
      <CargoFormDialog
        key={editing?.id ?? "new-cargo"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cargo={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Help Guide Modal */}
      <CargoHelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar cargo "${deleting?.nombre}"?`}
        description="Esta acción no se puede deshacer. Se eliminará la definición de este cargo institucional del sistema."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}

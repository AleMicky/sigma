import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { HelpCircle, Plus, UserCheck } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { areaQueries } from "../../area/api/area.queries"
import { cargoQueries } from "../../cargo/api/cargo.queries"
import { useDeleteEmpleado } from "../api/empleado.mutations"
import { empleadoQueries } from "../api/empleado.queries"
import type { Empleado } from "../api/empleado.service"
import { EmpleadoFormDialog } from "../components/EmpleadoFormDialog"
import { EmpleadoHelpModal } from "../components/EmpleadoHelpModal"
import { EmpleadoListItem } from "../components/EmpleadoListItem"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function EmpleadosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [editing, setEditing] = useState<Empleado | null>(null)
  const [deleting, setDeleting] = useState<Empleado | null>(null)
  const [selectedAreaId, setSelectedAreaId] = useState<string>("")
  const [selectedCargoId, setSelectedCargoId] = useState<string>("")

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteEmpleado()

  const areasQuery = useQuery(areaQueries.list({ size: 100 }))
  const cargosQuery = useQuery(cargoQueries.list({ size: 100 }))

  const areas = areasQuery.data?.content ?? []
  const cargos = cargosQuery.data?.content ?? []

  const empleadosQuery = useQuery(
    empleadoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      ...(selectedAreaId ? { areaId: selectedAreaId } : {}),
      ...(selectedCargoId ? { cargoId: selectedCargoId } : {}),
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const empleados = empleadosQuery.data?.content ?? []

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
    search.search.trim() || selectedAreaId || selectedCargoId,
  )

  function resetFilters() {
    search.setSearch("")
    setSelectedAreaId("")
    setSelectedCargoId("")
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Empleados
            </h1>
            <div className="flex items-center gap-1.5 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                queries={[empleadosQuery, areasQuery, cargosQuery]}
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
            Gestión y vinculación de empleados a áreas y cargos institucionales.
          </p>
        </div>

        <div className="hidden shrink-0 self-start md:flex md:items-center md:gap-2">
          <RefreshButton
            size="sm"
            queries={[empleadosQuery, areasQuery, cargosQuery]}
          />

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="gap-1.5 border-border/80 hover:bg-muted"
          >
            <HelpCircle className="size-4 text-primary" />
            <span>Guía de Empleados</span>
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            <span>Crear Empleado</span>
          </Button>
        </div>
      </header>

      {/* Buscador y filtros rápidos */}
      <div className="flex shrink-0 flex-col gap-2 py-3 sm:flex-row sm:items-center">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código de empleado o nombre…"
          aria-label="Buscar empleados"
          className="w-full min-w-0 flex-1"
        />

        <select
          value={selectedAreaId}
          onChange={(e) => {
            setSelectedAreaId(e.target.value)
            search.setPage(0)
          }}
          className="h-9 rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-48 dark:bg-input/30"
        >
          <option value="">Todas las áreas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>

        <select
          value={selectedCargoId}
          onChange={(e) => {
            setSelectedCargoId(e.target.value)
            search.setPage(0)
          }}
          className="h-9 rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-48 dark:bg-input/30"
        >
          <option value="">Todos los cargos</option>
          {cargos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Content Section - Compact List */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {empleadosQuery.isLoading ? (
          <ListSkeleton
            rows={8}
            rowClassName="h-12 rounded-lg"
            className="flex flex-col gap-2"
          />
        ) : empleadosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(empleadosQuery.error)}
            className="text-destructive"
          />
        ) : empleados.length === 0 ? (
          <EmptyState
            icon={<UserCheck className="size-4 text-muted-foreground" />}
            title={
              hasActiveFilters ? "Sin resultados" : "No hay empleados registrados"
            }
            description={
              hasActiveFilters
                ? "Prueba cambiando los criterios de búsqueda o filtros."
                : "Registra un empleado asignando una persona a un área y un cargo."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" type="button" onClick={resetFilters}>
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate}>
                  <Plus />
                  Crear Empleado
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3",
                empleadosQuery.isFetching && "opacity-70",
              )}
            >
              <ul className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
                {empleados.map((empleado) => (
                  <EmpleadoListItem
                    key={empleado.id}
                    empleado={empleado}
                    onEdit={openEdit}
                    onDelete={(e) => setDeleting(e)}
                  />
                ))}
              </ul>
            </div>

            {empleadosQuery.data ? (
              <Pagination
                page={empleadosQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
      <EmpleadoFormDialog
        key={editing?.id ?? "new-empleado"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        empleado={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Help Guide Modal */}
      <EmpleadoHelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar registro de empleado "${deleting?.codigo}"?`}
        description="Esta acción no se puede deshacer. Se eliminará la vinculación de este empleado del sistema."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Briefcase,
  Building,
  FilterX,
  HelpCircle,
  Plus,
  Search,
  UserCheck,
  X,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
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

  const areasQuery = useQuery(areaQueries.list({ size: 100, sortBy: "nombre", direction: "ASC" }))
  const cargosQuery = useQuery(cargoQueries.list({ size: 100, sortBy: "nombre", direction: "ASC" }))

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
    search.search.trim() || selectedAreaId || selectedCargoId,
  )

  function resetFilters() {
    search.setSearch("")
    setSelectedAreaId("")
    setSelectedCargoId("")
  }

  const selectedArea = areas.find((a) => a.id === selectedAreaId)
  const selectedCargo = cargos.find((c) => c.id === selectedCargoId)

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Empleados
              </h1>
              {empleadosQuery.data ? (
                <Badge variant="secondary" className="font-mono text-xs px-2 h-5">
                  {totalElements}
                </Badge>
              ) : null}
            </div>

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
            Gestión y vinculación de colaboradores a áreas y cargos institucionales.
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

      {/* Buscador y filtros */}
      <div className="flex shrink-0 flex-col gap-2.5 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchField
            value={search.search}
            onChange={search.setSearch}
            placeholder="Buscar por código, nombre o documento…"
            aria-label="Buscar empleados"
            className="w-full min-w-0 flex-1"
          />

          {/* Filtro por Área */}
          <div className="relative shrink-0 sm:w-52">
            <select
              value={selectedAreaId}
              onChange={(e) => {
                setSelectedAreaId(e.target.value)
                search.setPage(0)
              }}
              className={cn(
                "h-9 w-full rounded-lg border bg-transparent pl-8 pr-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
                selectedAreaId ? "border-primary/50 text-foreground font-medium" : "border-input text-muted-foreground",
              )}
            >
              <option value="">Todas las áreas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id} className="text-foreground">
                  {a.nombre}
                </option>
              ))}
            </select>
            <Building className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground opacity-70" />
          </div>

          {/* Filtro por Cargo */}
          <div className="relative shrink-0 sm:w-52">
            <select
              value={selectedCargoId}
              onChange={(e) => {
                setSelectedCargoId(e.target.value)
                search.setPage(0)
              }}
              className={cn(
                "h-9 w-full rounded-lg border bg-transparent pl-8 pr-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
                selectedCargoId ? "border-primary/50 text-foreground font-medium" : "border-input text-muted-foreground",
              )}
            >
              <option value="">Todos los cargos</option>
              {cargos.map((c) => (
                <option key={c.id} value={c.id} className="text-foreground">
                  {c.nombre}
                </option>
              ))}
            </select>
            <Briefcase className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground opacity-70" />
          </div>
        </div>

        {/* Chips de filtros activos */}
        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
            <span className="text-muted-foreground mr-1 text-[11px]">Filtros activos:</span>

            {search.search.trim() ? (
              <Badge
                variant="secondary"
                className="gap-1 px-2 py-0.5 h-6 text-xs bg-muted/80 hover:bg-muted"
              >
                <Search className="size-3 text-muted-foreground" />
                <span className="max-w-[150px] truncate">"{search.search}"</span>
                <button
                  type="button"
                  onClick={() => search.setSearch("")}
                  className="rounded-full hover:bg-muted-foreground/20 p-0.5 cursor-pointer"
                >
                  <X className="size-3" />
                  <span className="sr-only">Quitar búsqueda</span>
                </button>
              </Badge>
            ) : null}

            {selectedArea ? (
              <Badge
                variant="secondary"
                className="gap-1 px-2 py-0.5 h-6 text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
              >
                <Building className="size-3" />
                <span className="max-w-[150px] truncate">{selectedArea.nombre}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAreaId("")
                    search.setPage(0)
                  }}
                  className="rounded-full hover:bg-blue-500/20 p-0.5 cursor-pointer"
                >
                  <X className="size-3" />
                  <span className="sr-only">Quitar filtro de área</span>
                </button>
              </Badge>
            ) : null}

            {selectedCargo ? (
              <Badge
                variant="secondary"
                className="gap-1 px-2 py-0.5 h-6 text-xs bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20"
              >
                <Briefcase className="size-3" />
                <span className="max-w-[150px] truncate">{selectedCargo.nombre}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCargoId("")
                    search.setPage(0)
                  }}
                  className="rounded-full hover:bg-purple-500/20 p-0.5 cursor-pointer"
                >
                  <X className="size-3" />
                  <span className="sr-only">Quitar filtro de cargo</span>
                </button>
              </Badge>
            ) : null}

            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
            >
              <FilterX className="size-3" />
              <span>Limpiar filtros</span>
            </Button>
          </div>
        ) : null}
      </div>

      {/* Content Section - Compact List */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {empleadosQuery.isLoading ? (
          <ListSkeleton
            rows={8}
            rowClassName="h-14 rounded-xl"
            className="flex flex-col gap-2"
          />
        ) : empleadosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(empleadosQuery.error)}
            className="text-destructive"
          />
        ) : empleados.length === 0 ? (
          <EmptyState
            icon={<UserCheck className="size-5 text-muted-foreground" />}
            title={
              hasActiveFilters ? "Sin resultados" : "No hay empleados registrados"
            }
            description={
              hasActiveFilters
                ? "Prueba cambiando los criterios de búsqueda o seleccionando otra área/cargo."
                : "Registra el primer colaborador asignando una persona a un área y un cargo institucional."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" variant="outline" type="button" onClick={resetFilters} className="gap-1.5">
                  <FilterX className="size-4" />
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate} className="gap-1.5">
                  <Plus className="size-4" />
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
        description="Esta acción no se puede deshacer. Se eliminará la vinculación de este colaborador de la institución."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}


import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, UserCheck } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { areaQueries } from "../../area/api/area.queries"
import { cargoQueries } from "../../cargo/api/cargo.queries"
import { empleadoQueries } from "../api/empleado.queries"
import type { Empleado } from "../api/empleado.service"
import { EmpleadoCard } from "../components/EmpleadoCard"
import { EmpleadoFormDialog } from "../components/EmpleadoFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function EmpleadosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Empleado | null>(null)
  const [selectedAreaId, setSelectedAreaId] = useState<string>("")
  const [selectedCargoId, setSelectedCargoId] = useState<string>("")

  const search = usePaginatedSearch()

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

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Empleados
            </h1>
            <Button
              size="sm"
              type="button"
              onClick={openCreate}
              className="shrink-0 md:hidden"
            >
              <Plus />
              <span className="sr-only sm:not-sr-only">Crear</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Gestión y asignación de empleados a áreas y cargos.
          </p>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={openCreate}
          className="hidden shrink-0 self-start md:inline-flex"
        >
          <Plus />
          Crear
        </Button>
      </header>

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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {empleadosQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-28 rounded-xl"
            className="grid grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
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
              search.search.trim() || selectedAreaId || selectedCargoId
                ? "Sin resultados"
                : "No hay empleados registrados"
            }
            description={
              search.search.trim() || selectedAreaId || selectedCargoId
                ? "Prueba cambiando los criterios de búsqueda o filtros."
                : "Registra un empleado asignando una persona a un área y un cargo."
            }
            action={
              search.search.trim() || selectedAreaId || selectedCargoId ? undefined : (
                <Button size="sm" type="button" onClick={openCreate}>
                  <Plus />
                  Crear
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
              <ul className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {empleados.map((emp) => (
                  <EmpleadoCard
                    key={emp.id}
                    empleado={emp}
                    onEdit={openEdit}
                  />
                ))}
              </ul>
            </div>

            {empleadosQuery.data ? (
              <Pagination
                page={empleadosQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10"
              />
            ) : null}
          </>
        )}
      </div>

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
    </PageShell>
  )
}

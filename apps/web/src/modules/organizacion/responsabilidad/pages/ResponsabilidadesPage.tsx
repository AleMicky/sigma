import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Award, HelpCircle, Plus } from "lucide-react"

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
import { useMasterDetail } from "@/shared/hooks/use-master-detail"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { ResponsabilidadDetailPanel } from "../../empleado-responsabilidad/components/ResponsabilidadDetailPanel"
import { useDeleteResponsabilidad } from "../api/responsabilidad.mutations"
import { responsabilidadQueries } from "../api/responsabilidad.queries"
import type { Responsabilidad } from "../api/responsabilidad.service"
import { ResponsabilidadFormDialog } from "../components/ResponsabilidadFormDialog"
import { ResponsabilidadHelpModal } from "../components/ResponsabilidadHelpModal"
import { ResponsabilidadMasterItem } from "../components/ResponsabilidadMasterItem"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function ResponsabilidadesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [editing, setEditing] = useState<Responsabilidad | null>(null)
  const [deleting, setDeleting] = useState<Responsabilidad | null>(null)

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteResponsabilidad()

  const responsabilidadesQuery = useQuery(
    responsabilidadQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const responsabilidades = responsabilidadesQuery.data?.content ?? []
  const totalElements = responsabilidadesQuery.data?.totalElements ?? 0

  const {
    selected,
    selectedId,
    showMaster,
    showDetail,
    select,
    revealDetail,
    backToMaster,
  } = useMasterDetail(responsabilidades)

  useClampPage(
    search.page,
    search.setPage,
    responsabilidadesQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(responsabilidad: Responsabilidad) {
    setEditing(responsabilidad)
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

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header Principal */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-6">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Responsabilidades
              </h1>
              {responsabilidadesQuery.data ? (
                <Badge variant="secondary" className="font-mono text-xs px-2 h-5">
                  {totalElements}
                </Badge>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5 md:hidden">
              <RefreshButton
                onRefresh={() => responsabilidadesQuery.refetch()}
                isRefreshing={responsabilidadesQuery.isFetching}
              />
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setHelpOpen(true)}
              >
                <HelpCircle className="size-4 text-primary" />
                <span className="sr-only">Guía</span>
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={openCreate}
                className="shrink-0"
              >
                <Plus />
                <span className="sr-only sm:not-sr-only">Crear</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Administra el catálogo de responsabilidades organizacionales y asigna colaboradores a cada rol.
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 self-start md:flex">
          <RefreshButton
            onRefresh={() => responsabilidadesQuery.refetch()}
            isRefreshing={responsabilidadesQuery.isFetching}
          />
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setHelpOpen(true)}
            className="gap-1.5 border-border/80 hover:bg-muted"
          >
            <HelpCircle className="size-4 text-primary" />
            <span>Guía de Roles</span>
          </Button>
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="shrink-0 gap-1.5 shadow-2xs"
          >
            <Plus className="size-4" />
            Nueva Responsabilidad
          </Button>
        </div>
      </header>

      {/* Grid Maestro-Detalle Split-Pane */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 py-3 md:grid-cols-12 md:gap-5 overflow-hidden">
        {/* Panel Izquierdo: MAESTRO (Catálogo de Responsabilidades) */}
        <div
          className={cn(
            "flex min-h-0 flex-col overflow-hidden md:col-span-5 lg:col-span-5 xl:col-span-4",
            !showMaster && "hidden md:flex",
          )}
        >
          <div className="flex shrink-0 pb-3">
            <SearchField
              value={search.search}
              onChange={search.setSearch}
              placeholder="Buscar por código o nombre…"
              aria-label="Buscar responsabilidades"
              className="w-full min-w-0"
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {responsabilidadesQuery.isLoading ? (
              <ListSkeleton
                rows={6}
                rowClassName="h-20 rounded-xl"
                className="flex flex-col gap-2.5 p-0"
              />
            ) : responsabilidadesQuery.isError ? (
              <EmptyState
                title={getErrorMessage(responsabilidadesQuery.error)}
                className="text-destructive"
              />
            ) : responsabilidades.length === 0 ? (
              <EmptyState
                icon={<Award className="size-5 text-muted-foreground" />}
                title={
                  search.search.trim()
                    ? "Sin resultados"
                    : "No hay responsabilidades"
                }
                description={
                  search.search.trim()
                    ? "Prueba con otro código o nombre."
                    : "Crea una nueva responsabilidad organizacional."
                }
                action={
                  search.search.trim() ? undefined : (
                    <Button size="sm" type="button" onClick={openCreate}>
                      <Plus className="size-4" />
                      Crear Responsabilidad
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <div
                  className={cn(
                    "min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 pb-2",
                    responsabilidadesQuery.isFetching && "opacity-70",
                  )}
                >
                  <ul className="flex flex-col gap-2">
                    {responsabilidades.map((responsabilidad) => (
                      <ResponsabilidadMasterItem
                        key={responsabilidad.id}
                        responsabilidad={responsabilidad}
                        isSelected={selectedId === responsabilidad.id}
                        onSelect={(r) => select(r.id)}
                        onEdit={openEdit}
                        onDelete={(r) => setDeleting(r)}
                      />
                    ))}
                  </ul>
                </div>

                {responsabilidadesQuery.data ? (
                  <div className="shrink-0 pt-2">
                    <Pagination
                      page={responsabilidadesQuery.data}
                      onPageChange={search.setPage}
                      className="border-t pt-2"
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Panel Derecho: DETALLE (Detalle de la Responsabilidad + Empleados Asignados) */}
        <div
          className={cn(
            "min-h-0 flex-col overflow-hidden md:col-span-7 lg:col-span-7 xl:col-span-8",
            !showDetail && "hidden md:flex",
          )}
        >
          <ResponsabilidadDetailPanel
            responsabilidad={selected}
            onEditResponsabilidad={openEdit}
            onCloseMobileDetail={backToMaster}
          />
        </div>
      </div>

      {/* Modal para Crear / Editar Responsabilidad */}
      <ResponsabilidadFormDialog
        key={editing?.id ?? "new-responsabilidad"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        responsabilidad={editing}
        onSuccess={(saved) => {
          if (!editing) {
            search.setPage(0)
            revealDetail(saved.id)
          }
        }}
      />

      {/* Modal de Guía de Responsabilidades */}
      <ResponsabilidadHelpModal
        open={helpOpen}
        onOpenChange={setHelpOpen}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar responsabilidad"
        description={`¿Seguro que deseas eliminar la responsabilidad "${deleting?.nombre}" (${deleting?.codigo})?`}
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}

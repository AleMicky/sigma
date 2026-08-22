import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Building, HelpCircle, Plus } from "lucide-react"

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

import { useDeleteArea } from "../api/area.mutations"
import { areaQueries } from "../api/area.queries"
import type { Area } from "../api/area.service"
import { AreaFormDialog } from "../components/AreaFormDialog"
import { AreaHelpModal } from "../components/AreaHelpModal"
import { AreaListItem } from "../components/AreaListItem"

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
      sortBy: "nombre",
      direction: "ASC",
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

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Áreas
            </h1>
            <div className="flex items-center gap-1.5 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                onRefresh={() => areasQuery.refetch()}
                isRefreshing={areasQuery.isFetching}
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
            Administra las áreas y divisiones de la estructura organizacional.
          </p>
        </div>

        <div className="hidden shrink-0 self-start md:flex md:items-center md:gap-2">
          <RefreshButton
            size="sm"
            onRefresh={() => areasQuery.refetch()}
            isRefreshing={areasQuery.isFetching}
          />

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="gap-1.5 border-border/80 hover:bg-muted"
          >
            <HelpCircle className="size-4 text-primary" />
            <span>Guía de Áreas</span>
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            <span>Crear Área</span>
          </Button>
        </div>
      </header>

      {/* Buscador de ancho completo */}
      <div className="flex shrink-0 py-3">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código o nombre…"
          aria-label="Buscar áreas"
          className="w-full min-w-0"
        />
      </div>

      {/* Content Section - Compact List */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {areasQuery.isLoading ? (
          <ListSkeleton
            rows={8}
            rowClassName="h-12 rounded-lg"
            className="flex flex-col gap-2"
          />
        ) : areasQuery.isError ? (
          <EmptyState
            title={getErrorMessage(areasQuery.error)}
            className="text-destructive"
          />
        ) : areas.length === 0 ? (
          <EmptyState
            icon={<Building className="size-4 text-muted-foreground" />}
            title={
              search.search.trim() ? "Sin resultados" : "No hay áreas registradas"
            }
            description={
              search.search.trim()
                ? "Prueba con otro código o nombre."
                : "Crea la primera área para definir la estructura de la organización."
            }
            action={
              search.search.trim() ? undefined : (
                <Button size="sm" type="button" onClick={openCreate}>
                  <Plus />
                  Crear Área
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3",
                areasQuery.isFetching && "opacity-70",
              )}
            >
              <ul className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
                {areas.map((area) => (
                  <AreaListItem
                    key={area.id}
                    area={area}
                    onEdit={openEdit}
                    onDelete={(a) => setDeleting(a)}
                  />
                ))}
              </ul>
            </div>

            {areasQuery.data ? (
              <Pagination
                page={areasQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
      <AreaFormDialog
        key={editing?.id ?? "new-area"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        area={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Help Guide Modal */}
      <AreaHelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar área "${deleting?.nombre}"?`}
        description="Esta acción no se puede deshacer. Se eliminará la definición de esta área de la organización."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}

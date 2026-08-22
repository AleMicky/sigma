import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, ShieldCheck } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
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

import { grupoAprobadorQueries } from "../api/grupo-aprobador.queries"
import type { GrupoAprobador } from "../api/grupo-aprobador.service"
import { GrupoAprobadorCard } from "../components/GrupoAprobadorCard"
import { GrupoAprobadorFormDialog } from "../components/GrupoAprobadorFormDialog"
import { GrupoAprobadorDetallesDrawer } from "../../grupo-aprobador-detalle/components/GrupoAprobadorDetallesDrawer"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function GruposAprobadoresPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<GrupoAprobador | null>(null)
  const [managingDetallesGrupo, setManagingDetallesGrupo] =
    useState<GrupoAprobador | null>(null)

  const search = usePaginatedSearch()

  const gruposQuery = useQuery(
    grupoAprobadorQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const grupos = gruposQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    gruposQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(grupo: GrupoAprobador) {
    setEditing(grupo)
    setDialogOpen(true)
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Grupos Aprobadores
            </h1>
            <div className="flex items-center gap-1.5 md:hidden">
              <RefreshButton
                onRefresh={() => gruposQuery.refetch()}
                isRefreshing={gruposQuery.isFetching}
              />
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
            Administra los grupos y secuencias de aprobación para solicitudes y procesos organizacionales.
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 self-start md:flex">
          <RefreshButton
            onRefresh={() => gruposQuery.refetch()}
            isRefreshing={gruposQuery.isFetching}
          />
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="shrink-0"
          >
            <Plus />
            Crear Grupo
          </Button>
        </div>
      </header>

      <div className="flex shrink-0 py-3">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código o nombre…"
          aria-label="Buscar grupos aprobadores"
          className="w-full min-w-0"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {gruposQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-28 rounded-xl"
            className="grid grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          />
        ) : gruposQuery.isError ? (
          <EmptyState
            title={getErrorMessage(gruposQuery.error)}
            className="text-destructive"
          />
        ) : grupos.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="size-4 text-muted-foreground" />}
            title={
              search.search.trim() ? "Sin resultados" : "No hay grupos aprobadores"
            }
            description={
              search.search.trim()
                ? "Prueba con otro código o nombre."
                : "Crea un nuevo grupo aprobador."
            }
            action={
              search.search.trim() ? undefined : (
                <Button size="sm" type="button" onClick={openCreate}>
                  <Plus />
                  Crear Grupo
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3",
                gruposQuery.isFetching && "opacity-70",
              )}
            >
              <ul className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {grupos.map((grupo) => (
                  <GrupoAprobadorCard
                    key={grupo.id}
                    grupo={grupo}
                    onEdit={openEdit}
                    onManageDetalles={(g) => setManagingDetallesGrupo(g)}
                  />
                ))}
              </ul>
            </div>

            {gruposQuery.data ? (
              <Pagination
                page={gruposQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10"
              />
            ) : null}
          </>
        )}
      </div>

      <GrupoAprobadorFormDialog
        key={editing?.id ?? "new-grupo"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        grupo={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      <GrupoAprobadorDetallesDrawer
        grupo={managingDetallesGrupo}
        open={Boolean(managingDetallesGrupo)}
        onOpenChange={(open) => {
          if (!open) setManagingDetallesGrupo(null)
        }}
      />
    </PageShell>
  )
}

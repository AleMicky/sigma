import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Filter, Paperclip, Plus, Tags } from "lucide-react"

import { appConfig } from "@/app/config"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RowActions } from "@/shared/components/row-actions"
import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { useDeleteAccesorio } from "../api/accesorio.mutations"
import { accesorioQueries } from "../api/accesorio.queries"
import type { Accesorio } from "../api/accesorio.service"
import { AccesorioFormDialog } from "../components/AccesorioFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function AccesoriosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Accesorio | null>(null)
  const [toDelete, setToDelete] = useState<Accesorio | null>(null)
  const [selectedTipoActivoId, setSelectedTipoActivoId] = useState<string>("ALL")

  const search = usePaginatedSearch({ resetKey: selectedTipoActivoId })
  const deleteMutation = useDeleteAccesorio()

  const tiposActivoQuery = useQuery(
    tipoActivoQueries.list({ page: 0, size: 100, sortBy: "nombre", direction: "ASC" }),
  )
  const tiposActivo = useMemo(
    () => tiposActivoQuery.data?.content ?? [],
    [tiposActivoQuery.data?.content],
  )

  const isFilteredByTipo = selectedTipoActivoId !== "ALL"

  const accesoriosQuery = useQuery(
    isFilteredByTipo
      ? accesorioQueries.byTipoActivo(selectedTipoActivoId, {
          page: search.page,
          size: PAGE_SIZE,
          sortBy: "nombre",
          direction: "ASC",
          ...(search.query ? { q: search.query } : {}),
        })
      : accesorioQueries.list({
          page: search.page,
          size: PAGE_SIZE,
          sortBy: "nombre",
          direction: "ASC",
          ...(search.query ? { q: search.query } : {}),
        }),
  )

  const accesorios = accesoriosQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    accesoriosQuery.data?.totalPages,
  )

  const totalAccesorios = accesoriosQuery.data?.totalElements ?? 0
  const conDescripcion = useMemo(
    () => accesorios.filter((a) => Boolean(a.descripcion?.trim())).length,
    [accesorios],
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(accesorio: Accesorio) {
    setEditing(accesorio)
    setDialogOpen(true)
  }

  const hasActiveFilters =
    Boolean(search.search.trim()) || selectedTipoActivoId !== "ALL"

  function resetFilters() {
    search.setSearch("")
    setSelectedTipoActivoId("ALL")
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-2 border-b py-2.5 sm:gap-3 sm:py-3.5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-heading text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
              Accesorios de Activos
            </h1>
            <Button
              size="sm"
              type="button"
              onClick={openCreate}
              className="h-7 px-2 text-xs md:hidden"
            >
              <Plus className="size-3.5" />
              <span className="sr-only sm:not-sr-only">Crear</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Administra los accesorios, periféricos y equipamiento secundario asociados a cada tipo de activo.
          </p>
        </div>

        <div className="hidden shrink-0 md:flex md:items-center md:gap-1.5">
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Crear Accesorio</span>
          </Button>
        </div>
      </header>

      {/* Stats Cards Section */}
      <div className="shrink-0 pt-2.5 pb-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <Card className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Accesorios
              </p>
              <p className="text-lg font-bold text-foreground">
                {totalAccesorios}
              </p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Paperclip className="size-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Tipos de Activo
              </p>
              <p className="text-lg font-bold text-foreground">
                {tiposActivo.length}
              </p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Tags className="size-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1 rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                En esta vista
              </p>
              <p className="text-lg font-bold text-foreground">
                {accesorios.length} ({conDescripcion} con desc.)
              </p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Filter className="size-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex shrink-0 flex-col gap-2 pt-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <SearchField
            value={search.search}
            onChange={search.setSearch}
            placeholder="Buscar por código o nombre…"
            aria-label="Buscar accesorios"
            className="w-full sm:max-w-xs"
          />

          <Select
            value={selectedTipoActivoId}
            onValueChange={(val) => {
              setSelectedTipoActivoId(val ?? "ALL")
              search.setPage(0)
            }}
          >
            <SelectTrigger className="h-8 text-xs w-full sm:w-56 bg-background">
              <SelectValue placeholder="Filtrar por tipo de activo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los tipos de activo</SelectItem>
              {tiposActivo.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Limpiar filtros
            </Button>
          ) : null}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-1">
        {accesoriosQuery.isLoading ? (
          <ListSkeleton rows={6} rowClassName="h-16 rounded-xl" />
        ) : accesoriosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(accesoriosQuery.error)}
            className="text-destructive"
          />
        ) : accesorios.length === 0 ? (
          <EmptyState
            icon={<Paperclip className="size-5 text-muted-foreground" />}
            title={
              hasActiveFilters
                ? "Sin resultados"
                : "No hay accesorios registrados"
            }
            description={
              hasActiveFilters
                ? "Prueba con otra búsqueda o selecciona otro tipo de activo."
                : "Crea el primer accesorio asociado a tus tipos de activo para comenzar."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" type="button" onClick={resetFilters} className="h-8 text-xs">
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate} className="h-8 text-xs">
                  <Plus className="size-3.5" />
                  Crear Accesorio
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2 space-y-2",
                accesoriosQuery.isFetching && "opacity-70",
              )}
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {accesorios.map((accesorio) => (
                  <div
                    key={accesorio.id}
                    className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs transition-all hover:border-border hover:shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm text-foreground truncate">
                            {accesorio.nombre}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                              {accesorio.codigo}
                            </code>
                            {accesorio.catalogo ? (
                              <Badge
                                variant="outline"
                                className="bg-primary/5 text-primary border-primary/20 text-[10px] font-medium"
                              >
                                <Tags className="size-2.5 mr-1" />
                                {accesorio.catalogo.nombre}
                              </Badge>
                            ) : null}
                          </div>
                        </div>

                        <RowActions
                          editLabel="Editar accesorio"
                          deleteLabel="Eliminar accesorio"
                          deleteDisabled={deleteMutation.isPending}
                          onEdit={() => openEdit(accesorio)}
                          onDelete={() => setToDelete(accesorio)}
                        />
                      </div>

                      {accesorio.descripcion ? (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {accesorio.descripcion}
                        </p>
                      ) : (
                        <p className="text-xs italic text-muted-foreground/60">
                          Sin descripción
                        </p>
                      )}
                    </div>

                    {accesorio.auditoria ? (
                      <div className="mt-3 pt-2.5 border-t border-border/50">
                        <AuditInfo
                          data={{
                            createdAt: accesorio.auditoria.createdAt,
                            updatedAt: accesorio.auditoria.updatedAt,
                            createdBy: accesorio.auditoria.createdBy,
                            updatedBy: accesorio.auditoria.updatedBy,
                          }}
                          compact
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {accesoriosQuery.data ? (
              <Pagination
                page={accesoriosQuery.data}
                onPageChange={search.setPage}
                className="-mx-3 border-x-0 px-3 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
      <AccesorioFormDialog
        key={editing?.id ?? "new-accesorio"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipoActivoId={selectedTipoActivoId !== "ALL" ? selectedTipoActivoId : undefined}
        accesorio={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`¿Eliminar accesorio "${toDelete?.nombre}"?`}
        description="Esta acción no se puede deshacer. Se eliminará el accesorio de la base de datos."
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!toDelete) return
          await deleteMutation.mutateAsync(toDelete.id)
          setToDelete(null)
        }}
      />
    </PageShell>
  )
}

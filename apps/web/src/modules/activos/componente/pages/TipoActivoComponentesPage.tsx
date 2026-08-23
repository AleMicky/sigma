import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Boxes, Check, Copy, Plus, Power, PowerOff } from "lucide-react"
import { toast } from "sonner"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Pagination } from "@/shared/components/pagination"
import { RowActions } from "@/shared/components/row-actions"
import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"
import { formatDateTime } from "@/shared/utils/date.utils"

import {
  useDeleteComponente,
  useSetActivoComponente,
} from "../api/componente.mutations"
import { componenteQueries } from "../api/componente.queries"
import type { Componente } from "../api/componente.service"
import { ComponenteFormDialog } from "../components/ComponenteFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

type TipoActivoComponentesPageProps = {
  tipoActivoId: string
}

export function TipoActivoComponentesPage({
  tipoActivoId,
}: TipoActivoComponentesPageProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Componente | null>(null)
  const [toDelete, setToDelete] = useState<Componente | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const search = usePaginatedSearch({ resetKey: tipoActivoId })
  const deleteMutation = useDeleteComponente()
  const setActivoMutation = useSetActivoComponente()

  const componentesQuery = useQuery(
    componenteQueries.byTipoActivo(tipoActivoId, {
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const componentes = componentesQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    componentesQuery.data?.totalPages,
  )

  function copyCode(e: React.MouseEvent, comp: Componente) {
    e.stopPropagation()
    navigator.clipboard.writeText(comp.codigo)
    setCopiedId(comp.id)
    toast.success(`Código "${comp.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(componente: Componente) {
    setEditing(componente)
    setDialogOpen(true)
  }

  const hasSearch = search.search.trim().length > 0

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Barra de búsqueda y acción */}
      <div className="flex shrink-0 flex-col gap-2.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código o nombre…"
          aria-label="Buscar componentes"
          className="w-full flex-1 sm:max-w-md"
        />
        <Button
          size="sm"
          type="button"
          onClick={openCreate}
          className="shrink-0 gap-1.5 shadow-2xs font-medium"
        >
          <Plus className="size-3.5" />
          <span>Nuevo Componente</span>
        </Button>
      </div>

      {/* Listado con diseño unificado */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {componentesQuery.isLoading ? (
          <ListSkeleton
            rows={5}
            rowClassName="h-16 rounded-xl"
            className="space-y-2.5"
          />
        ) : componentesQuery.isError ? (
          <EmptyState
            title={getErrorMessage(componentesQuery.error)}
            className="text-destructive my-auto"
          />
        ) : componentes.length === 0 ? (
          <EmptyState
            icon={<Boxes className="size-8 text-muted-foreground/60" />}
            title={
              hasSearch
                ? "Sin resultados para la búsqueda"
                : "Sin componentes registrados"
            }
            description={
              hasSearch
                ? "Prueba cambiando el código o nombre buscado."
                : "Registra partes o subconjuntos (ej. Motor, Batería, Memoria)."
            }
            action={
              hasSearch ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => search.setSearch("")}
                  className="rounded-xl"
                >
                  Limpiar Búsqueda
                </Button>
              ) : (
                <Button
                  size="sm"
                  type="button"
                  onClick={openCreate}
                  className="rounded-xl"
                >
                  <Plus className="size-4" />
                  Crear Componente
                </Button>
              )
            }
            className="my-auto"
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2 pr-1",
                componentesQuery.isFetching && "opacity-70",
              )}
            >
              <div className="w-full rounded-2xl border border-border/80 bg-card divide-y divide-border/40 overflow-hidden shadow-2xs">
                {componentes.map((componente) => {
                  const isCopied = copiedId === componente.id
                  const isToggling =
                    setActivoMutation.isPending &&
                    setActivoMutation.variables?.id === componente.id

                  const audit =
                    "auditoria" in componente && componente.auditoria
                      ? componente.auditoria
                      : (componente as unknown as {
                          createdAt?: string
                          updatedAt?: string
                          createdBy?: string
                          updatedBy?: string
                        })
                  const updatedAt = audit.updatedAt ?? audit.createdAt ?? ""
                  const updatedBy = audit.updatedBy ?? audit.createdBy ?? null

                  return (
                    <div
                      key={componente.id}
                      className={cn(
                        "group flex flex-col justify-between gap-2 p-3 sm:p-4 transition-colors hover:bg-muted/30",
                        !componente.activo && "opacity-80 bg-muted/10",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <Boxes className="size-4" />
                          </span>

                          <div className="flex flex-col min-w-0 flex-1 gap-1">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                {componente.nombre}
                              </span>

                              <div className="flex items-center gap-1">
                                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                                  {componente.codigo}
                                </code>
                                <button
                                  type="button"
                                  onClick={(e) => copyCode(e, componente)}
                                  className="inline-flex size-4 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:text-foreground cursor-pointer"
                                  title="Copiar código"
                                >
                                  {isCopied ? (
                                    <Check className="size-2.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="size-2.5" />
                                  )}
                                </button>
                              </div>

                              <Badge
                                variant={componente.activo ? "default" : "outline"}
                                className={cn(
                                  "text-[10px] font-medium transition-colors h-5 px-1.5 gap-1",
                                  componente.activo
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
                                )}
                              >
                                <span
                                  className={cn(
                                    "size-1.5 rounded-full",
                                    componente.activo
                                      ? "bg-emerald-500"
                                      : "bg-amber-500",
                                  )}
                                />
                                {componente.activo ? "Activo" : "Inactivo"}
                              </Badge>
                            </div>

                            {componente.descripcion ? (
                              <p className="line-clamp-1 text-xs text-muted-foreground pt-0.5">
                                {componente.descripcion}
                              </p>
                            ) : null}

                            {updatedAt ? (
                              <p className="text-[11px] text-muted-foreground/70">
                                Actualizado: {formatDateTime(updatedAt)}
                                {updatedBy ? ` por ${updatedBy}` : ""}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            disabled={isToggling}
                            onClick={() => {
                              setActivoMutation.mutate({
                                id: componente.id,
                                activo: !componente.activo,
                              })
                            }}
                            className={cn(
                              "h-7 px-2 text-xs font-medium gap-1 cursor-pointer",
                              componente.activo
                                ? "text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                                : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10",
                            )}
                            title={
                              componente.activo
                                ? "Desactivar componente"
                                : "Activar componente"
                            }
                          >
                            {componente.activo ? (
                              <PowerOff className="size-3" />
                            ) : (
                              <Power className="size-3" />
                            )}
                            <span>{componente.activo ? "Baja" : "Alta"}</span>
                          </Button>

                          <RowActions
                            editLabel="Editar componente"
                            deleteLabel="Eliminar componente"
                            deleteDisabled={deleteMutation.isPending}
                            onEdit={() => openEdit(componente)}
                            onDelete={() => setToDelete(componente)}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {componentesQuery.data ? (
              <Pagination
                page={componentesQuery.data}
                onPageChange={search.setPage}
                className="border-t border-border/50 py-2 bg-transparent shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      <ComponenteFormDialog
        key={editing?.id ?? `new-componente-${tipoActivoId}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipoActivoId={tipoActivoId}
        componente={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      <ConfirmDeleteDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => {
          if (!open) setToDelete(null)
        }}
        title="Eliminar componente"
        description={
          toDelete
            ? `¿Seguro que deseas eliminar "${toDelete.nombre}"?`
            : "¿Seguro que deseas eliminar este componente?"
        }
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!toDelete) return
          await deleteMutation.mutateAsync(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}

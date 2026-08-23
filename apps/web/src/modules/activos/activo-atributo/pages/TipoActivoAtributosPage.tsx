import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, Copy, ListChecks, Plus } from "lucide-react"
import { toast } from "sonner"

import { appConfig } from "@/app/config"
import { tipoDatoQueries } from "@/modules/parametros/tipo-dato/api/tipo-dato.queries"
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

import { useDeleteActivoAtributo } from "../api/activo-atributo.mutations"
import { activoAtributoQueries } from "../api/activo-atributo.queries"
import type { ActivoAtributo } from "../api/activo-atributo.service"
import { ActivoAtributoFormDialog } from "../components/ActivoAtributoFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

type TipoActivoAtributosPageProps = {
  tipoActivoId: string
}

export function TipoActivoAtributosPage({
  tipoActivoId,
}: TipoActivoAtributosPageProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ActivoAtributo | null>(null)
  const [toDelete, setToDelete] = useState<ActivoAtributo | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const search = usePaginatedSearch({ resetKey: tipoActivoId })
  const deleteMutation = useDeleteActivoAtributo()

  const atributosQuery = useQuery(
    activoAtributoQueries.byTipoActivo(tipoActivoId, {
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "orden",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const tiposDatoQuery = useQuery(
    tipoDatoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const tiposById = new Map(
    (tiposDatoQuery.data?.content ?? []).map((tipo) => [tipo.id, tipo]),
  )

  const atributos = atributosQuery.data?.content ?? []

  useClampPage(search.page, search.setPage, atributosQuery.data?.totalPages)

  function copyCode(e: React.MouseEvent, atributo: ActivoAtributo) {
    e.stopPropagation()
    navigator.clipboard.writeText(atributo.codigo)
    setCopiedId(atributo.id)
    toast.success(`Código "${atributo.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(atributo: ActivoAtributo) {
    setEditing(atributo)
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
          placeholder="Buscar por código o etiqueta…"
          aria-label="Buscar atributos"
          className="w-full flex-1 sm:max-w-md"
        />
        <Button
          size="sm"
          type="button"
          onClick={openCreate}
          className="shrink-0 gap-1.5 shadow-2xs font-medium"
        >
          <Plus className="size-3.5" />
          <span>Nuevo Atributo</span>
        </Button>
      </div>

      {/* Listado con diseño unificado */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {atributosQuery.isLoading ? (
          <ListSkeleton
            rows={5}
            rowClassName="h-16 rounded-xl"
            className="space-y-2.5"
          />
        ) : atributosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(atributosQuery.error)}
            className="text-destructive my-auto"
          />
        ) : atributos.length === 0 ? (
          <EmptyState
            icon={<ListChecks className="size-8 text-muted-foreground/60" />}
            title={
              hasSearch
                ? "Sin resultados para la búsqueda"
                : "Sin atributos configurados"
            }
            description={
              hasSearch
                ? "Prueba cambiando el código o etiqueta buscada."
                : "Define especificaciones dinámicas (ej. Número de serie, Marca, RAM)."
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
                  Crear Atributo
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
                atributosQuery.isFetching && "opacity-70",
              )}
            >
              <div className="w-full rounded-2xl border border-border/80 bg-card divide-y divide-border/40 overflow-hidden shadow-2xs">
                {atributos.map((atributo) => {
                  const tipoDato = tiposById.get(atributo.tipoDatoId)
                  const isCopied = copiedId === atributo.id

                  const audit =
                    "auditoria" in atributo && atributo.auditoria
                      ? atributo.auditoria
                      : (atributo as unknown as {
                          createdAt?: string
                          updatedAt?: string
                          createdBy?: string
                          updatedBy?: string
                        })
                  const updatedAt = audit.updatedAt ?? audit.createdAt ?? ""
                  const updatedBy = audit.updatedBy ?? audit.createdBy ?? null

                  return (
                    <div
                      key={atributo.id}
                      className="group flex flex-col justify-between gap-2 p-3 sm:p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                            {atributo.orden ?? 1}
                          </span>

                          <div className="flex flex-col min-w-0 flex-1 gap-1">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                {atributo.etiqueta}
                              </span>

                              <div className="flex items-center gap-1">
                                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                                  {atributo.codigo}
                                </code>
                                <button
                                  type="button"
                                  onClick={(e) => copyCode(e, atributo)}
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

                              {tipoDato ? (
                                <Badge
                                  variant="secondary"
                                  className="px-2 py-0 text-[10px] font-medium"
                                >
                                  {tipoDato.nombre}
                                </Badge>
                              ) : null}

                              {atributo.requerido ? (
                                <Badge
                                  variant="outline"
                                  className="px-1.5 py-0 text-[10px] text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10"
                                >
                                  Requerido
                                </Badge>
                              ) : (
                                <span className="text-[10px] text-muted-foreground/60">
                                  Opcional
                                </span>
                              )}
                            </div>

                            {/* Info de actualización */}
                            {updatedAt ? (
                              <p className="text-[11px] text-muted-foreground/70">
                                Actualizado: {formatDateTime(updatedAt)}
                                {updatedBy ? ` por ${updatedBy}` : ""}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <RowActions
                          editLabel="Editar atributo"
                          deleteLabel="Eliminar atributo"
                          deleteDisabled={deleteMutation.isPending}
                          onEdit={() => openEdit(atributo)}
                          onDelete={() => setToDelete(atributo)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {atributosQuery.data ? (
              <Pagination
                page={atributosQuery.data}
                onPageChange={search.setPage}
                className="border-t border-border/50 py-2 bg-transparent shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      <ActivoAtributoFormDialog
        key={editing?.id ?? `new-atributo-${tipoActivoId}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipoActivoId={tipoActivoId}
        atributo={editing}
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
        title="Eliminar atributo"
        description={
          toDelete
            ? `¿Seguro que deseas eliminar "${toDelete.etiqueta}"?`
            : "¿Seguro que deseas eliminar este atributo?"
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

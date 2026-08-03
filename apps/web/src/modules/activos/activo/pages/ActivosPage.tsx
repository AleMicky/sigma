import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ImageIcon, Package, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  DetailListItem,
  PaginatedList,
} from "@/shared/components/master-detail"
import { PageShell } from "@/shared/components/page-shell"
import { RowActions } from "@/shared/components/row-actions"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
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
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"

import { useDeleteActivo } from "../api/activo.mutations"
import { activoQueries } from "../api/activo.queries"
import type { Activo } from "../api/activo.service"

const PAGE_SIZE = appConfig.pagination.defaultPageSize
const ALL_TIPOS = "__all__"

export function ActivosPage() {
  const navigate = useNavigate()
  const [toDelete, setToDelete] = useState<Activo | null>(null)
  const [tipoActivoId, setTipoActivoId] = useState<string>(ALL_TIPOS)
  const search = usePaginatedSearch({ resetKey: tipoActivoId })
  const deleteMutation = useDeleteActivo()

  const tiposQuery = useQuery(
    tipoActivoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const tiposById = useMemo(
    () =>
      new Map((tiposQuery.data?.content ?? []).map((tipo) => [tipo.id, tipo])),
    [tiposQuery.data?.content],
  )

  const activosQuery = useQuery(
    activoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(tipoActivoId !== ALL_TIPOS ? { tipoActivoId } : {}),
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const activos = activosQuery.data?.content ?? []

  useClampPage(search.page, search.setPage, activosQuery.data?.totalPages)

  function goCreate() {
    void navigate({
      to: "/activos/nuevo",
      search:
        tipoActivoId !== ALL_TIPOS
          ? { tipoActivoId }
          : {},
    })
  }

  function goEdit(activo: Activo) {
    void navigate({
      to: "/activos/$activoId/editar",
      params: { activoId: activo.id },
    })
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Activos
            </h1>
            <Button
              size="sm"
              type="button"
              onClick={goCreate}
              className="shrink-0 md:hidden"
            >
              <Plus />
              <span className="sr-only sm:not-sr-only">Crear</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Listado y gestión de activos del inventario.
          </p>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={goCreate}
          className="hidden shrink-0 md:inline-flex"
        >
          <Plus />
          Crear activo
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <SearchField
              value={search.search}
              onChange={search.setSearch}
              placeholder="Buscar por código o nombre…"
              aria-label="Buscar activos"
              className="w-full min-w-0 sm:flex-1"
            />
            <Select
              value={tipoActivoId}
              onValueChange={(value) => setTipoActivoId(value ?? ALL_TIPOS)}
            >
              <SelectTrigger
                className="w-full shrink-0 sm:w-56"
                aria-label="Filtrar por tipo"
              >
                <SelectValue placeholder="Todos los tipos">
                  {tipoActivoId === ALL_TIPOS
                    ? "Todos los tipos"
                    : (tiposById.get(tipoActivoId)?.nombre ?? null)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_TIPOS}>Todos los tipos</SelectItem>
                {(tiposQuery.data?.content ?? []).map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <PaginatedList
          items={activos}
          page={activosQuery.data}
          isLoading={activosQuery.isLoading}
          isFetching={activosQuery.isFetching}
          errorMessage={
            activosQuery.isError ? getErrorMessage(activosQuery.error) : null
          }
          hasSearch={
            search.search.trim().length > 0 || tipoActivoId !== ALL_TIPOS
          }
          onPageChange={search.setPage}
          getKey={(item) => item.id}
          skeletonRowClassName="h-14"
          empty={{
            icon: <Package className="size-4 text-muted-foreground" />,
            title: "Sin activos",
            description: "Crea el primer activo del inventario.",
            actionLabel: "Crear activo",
            onAction: goCreate,
            searchDescription: "Prueba con otro código, nombre o tipo.",
          }}
        >
          {(activo) => {
            const tipo = tiposById.get(activo.tipoActivoId)
            const tipoColor = tipo?.color || DEFAULT_TIPO_ACTIVO_COLOR

            return (
              <DetailListItem
                accentColor={tipoColor}
                leading={
                  <AuthenticatedImage
                    src={activo.urlImagen}
                    alt={activo.nombre}
                    className="size-10 rounded-md"
                    fallbackClassName="size-10 rounded-md"
                    fallback={<ImageIcon className="size-4" />}
                  />
                }
                title={activo.nombre}
                subtitle={
                  <div className="flex flex-wrap items-center gap-1.5">
                    <code className="w-fit max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {activo.codigo}
                    </code>
                    {tipo ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          aria-hidden
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: tipoColor }}
                        />
                        {tipo.nombre}
                      </span>
                    ) : null}
                    {activo.ubicacion ? (
                      <span className="text-xs text-muted-foreground">
                        · {activo.ubicacion}
                      </span>
                    ) : null}
                  </div>
                }
                meta={<AuditInfo data={activo} compact />}
                actions={
                  <RowActions
                    editLabel="Editar activo"
                    deleteLabel="Eliminar activo"
                    deleteDisabled={deleteMutation.isPending}
                    onEdit={() => goEdit(activo)}
                    onDelete={() => setToDelete(activo)}
                  />
                }
              />
            )
          }}
        </PaginatedList>
      </div>

      <ConfirmDeleteDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => {
          if (!open) setToDelete(null)
        }}
        title="Eliminar activo"
        description={
          toDelete
            ? `¿Seguro que deseas eliminar "${toDelete.nombre}"?`
            : "¿Seguro que deseas eliminar este activo?"
        }
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

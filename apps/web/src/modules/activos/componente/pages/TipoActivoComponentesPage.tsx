import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Boxes, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  DetailListItem,
  PaginatedList,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { useDeleteComponente } from "../api/componente.mutations"
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
  const search = usePaginatedSearch({ resetKey: tipoActivoId })
  const deleteMutation = useDeleteComponente()

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

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(componente: Componente) {
    setEditing(componente)
    setDialogOpen(true)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código o nombre…"
          aria-label="Buscar componentes"
          className="w-full max-w-full sm:max-w-sm"
        />
        <Button
          size="sm"
          type="button"
          onClick={openCreate}
          className="shrink-0 self-start"
        >
          <Plus />
          Crear componente
        </Button>
      </div>

      <PaginatedList
        items={componentes}
        page={componentesQuery.data}
        isLoading={componentesQuery.isLoading}
        isFetching={componentesQuery.isFetching}
        errorMessage={
          componentesQuery.isError
            ? getErrorMessage(componentesQuery.error)
            : null
        }
        hasSearch={search.search.trim().length > 0}
        onPageChange={search.setPage}
        getKey={(item) => item.id}
        skeletonRowClassName="h-14"
        empty={{
          icon: <Boxes className="size-4 text-muted-foreground" />,
          title: "Sin componentes",
          description:
            "Crea partes o subconjuntos, por ejemplo motor o freno.",
          actionLabel: "Crear componente",
          onAction: openCreate,
          searchDescription: "Prueba con otro código o nombre.",
        }}
      >
        {(componente) => (
          <DetailListItem
            title={componente.nombre}
            subtitle={
              <div className="flex flex-wrap items-center gap-1.5">
                <code className="w-fit max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {componente.codigo}
                </code>
                {componente.descripcion ? (
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {componente.descripcion}
                  </span>
                ) : null}
              </div>
            }
            meta={<AuditInfo data={componente} compact />}
            actions={
              <RowActions
                editLabel="Editar componente"
                deleteLabel="Eliminar componente"
                deleteDisabled={deleteMutation.isPending}
                onEdit={() => openEdit(componente)}
                onDelete={() => setToDelete(componente)}
              />
            }
          />
        )}
      </PaginatedList>

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

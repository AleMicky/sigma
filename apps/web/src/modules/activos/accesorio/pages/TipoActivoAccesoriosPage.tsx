import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Paperclip, Plus } from "lucide-react"

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

import { useDeleteAccesorio } from "../api/accesorio.mutations"
import { accesorioQueries } from "../api/accesorio.queries"
import type { Accesorio } from "../api/accesorio.service"
import { AccesorioFormDialog } from "../components/AccesorioFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

type TipoActivoAccesoriosPageProps = {
  tipoActivoId: string
}

export function TipoActivoAccesoriosPage({
  tipoActivoId,
}: TipoActivoAccesoriosPageProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Accesorio | null>(null)
  const [toDelete, setToDelete] = useState<Accesorio | null>(null)
  const search = usePaginatedSearch({ resetKey: tipoActivoId })
  const deleteMutation = useDeleteAccesorio()

  const accesoriosQuery = useQuery(
    accesorioQueries.byTipoActivo(tipoActivoId, {
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

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(accesorio: Accesorio) {
    setEditing(accesorio)
    setDialogOpen(true)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código o nombre…"
          aria-label="Buscar accesorios"
          className="w-full max-w-full sm:max-w-sm"
        />
        <Button
          size="sm"
          type="button"
          onClick={openCreate}
          className="shrink-0 self-start"
        >
          <Plus />
          Crear accesorio
        </Button>
      </div>

      <PaginatedList
        items={accesorios}
        page={accesoriosQuery.data}
        isLoading={accesoriosQuery.isLoading}
        isFetching={accesoriosQuery.isFetching}
        errorMessage={
          accesoriosQuery.isError
            ? getErrorMessage(accesoriosQuery.error)
            : null
        }
        hasSearch={search.search.trim().length > 0}
        onPageChange={search.setPage}
        getKey={(item) => item.id}
        skeletonRowClassName="h-14"
        empty={{
          icon: <Paperclip className="size-4 text-muted-foreground" />,
          title: "Sin accesorios",
          description:
            "Crea accesorios asociados, por ejemplo GPS, extintor o botiquín.",
          actionLabel: "Crear accesorio",
          onAction: openCreate,
          searchDescription: "Prueba con otro código o nombre.",
        }}
      >
        {(accesorio) => (
          <DetailListItem
            title={
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">
                  {accesorio.nombre}
                </span>
              </div>
            }
            subtitle={
              <div className="flex flex-wrap items-center gap-1.5">
                <code className="w-fit max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {accesorio.codigo}
                </code>
                {accesorio.descripcion ? (
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {accesorio.descripcion}
                  </span>
                ) : null}
              </div>
            }
            meta={
              accesorio.auditoria ? (
                <AuditInfo
                  data={{
                    createdAt: accesorio.auditoria.createdAt,
                    updatedAt: accesorio.auditoria.updatedAt,
                    createdBy: accesorio.auditoria.createdBy,
                    updatedBy: accesorio.auditoria.updatedBy,
                  }}
                  compact
                />
              ) : null
            }
            actions={
              <div className="flex items-center gap-1">
                <RowActions
                  editLabel="Editar accesorio"
                  deleteLabel="Eliminar accesorio"
                  deleteDisabled={deleteMutation.isPending}
                  onEdit={() => openEdit(accesorio)}
                  onDelete={() => setToDelete(accesorio)}
                />
              </div>
            }
          />
        )}
      </PaginatedList>

      <AccesorioFormDialog
        key={editing?.id ?? `new-accesorio-${tipoActivoId}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipoActivoId={tipoActivoId}
        accesorio={editing}
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
        title="Eliminar accesorio"
        description={
          toDelete
            ? `¿Seguro que deseas eliminar "${toDelete.nombre}"?`
            : "¿Seguro que deseas eliminar este accesorio?"
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

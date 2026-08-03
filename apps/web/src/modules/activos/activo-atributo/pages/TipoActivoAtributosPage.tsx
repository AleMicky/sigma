import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ListChecks, Plus } from "lucide-react"

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
import { tipoDatoQueries } from "@/modules/parametros/tipo-dato/api/tipo-dato.queries"

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

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(atributo: ActivoAtributo) {
    setEditing(atributo)
    setDialogOpen(true)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código o etiqueta…"
          aria-label="Buscar atributos"
          className="w-full max-w-full sm:max-w-sm"
        />
        <Button
          size="sm"
          type="button"
          onClick={openCreate}
          className="shrink-0 self-start"
        >
          <Plus />
          Crear atributo
        </Button>
      </div>

      <PaginatedList
        items={atributos}
        page={atributosQuery.data}
        isLoading={atributosQuery.isLoading}
        isFetching={atributosQuery.isFetching}
        errorMessage={
          atributosQuery.isError
            ? getErrorMessage(atributosQuery.error)
            : null
        }
        hasSearch={search.search.trim().length > 0}
        onPageChange={search.setPage}
        getKey={(item) => item.id}
        skeletonRowClassName="h-14"
        empty={{
          icon: <ListChecks className="size-4 text-muted-foreground" />,
          title: "Sin atributos",
          description:
            "Crea campos personalizados, por ejemplo placa o marca.",
          actionLabel: "Crear atributo",
          onAction: openCreate,
          searchDescription: "Prueba con otro código o etiqueta.",
        }}
      >
        {(atributo) => {
          const tipoDato = tiposById.get(atributo.tipoDatoId)

          return (
            <DetailListItem
              title={atributo.etiqueta}
              subtitle={
                <div className="flex flex-wrap items-center gap-1.5">
                  <code className="w-fit max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {atributo.codigo}
                  </code>
                  {tipoDato ? (
                    <span className="text-xs text-muted-foreground">
                      {tipoDato.nombre}
                    </span>
                  ) : null}
                  {atributo.requerido ? (
                    <span className="text-xs text-muted-foreground">
                      · Requerido
                    </span>
                  ) : null}
                </div>
              }
              meta={<AuditInfo data={atributo} compact />}
              actions={
                <RowActions
                  editLabel="Editar atributo"
                  deleteLabel="Eliminar atributo"
                  deleteDisabled={deleteMutation.isPending}
                  onEdit={() => openEdit(atributo)}
                  onDelete={() => setToDelete(atributo)}
                />
              }
            />
          )
        }}
      </PaginatedList>

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

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CalendarRange, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  DetailListItem,
  DetailPanelHeader,
  DetailPanelShell,
  MasterDetailLayout,
  MasterPanelShell,
  PaginatedList,
  SelectableListItem,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"
import { useMasterDetail } from "@/shared/hooks/use-master-detail"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { formatDate } from "@/shared/lib/format-date"
import type { PageResponse } from "@/shared/types/api.types"

import { useDeleteGestion } from "../api/gestion.mutations"
import { gestionQueries } from "../api/gestion.queries"
import type { Gestion } from "../api/gestion.service"
import { periodoQueries } from "../api/periodo.queries"
import type { Periodo } from "../api/periodo.service"
import { GestionFormDialog } from "../components/GestionFormDialog"
import { PeriodoFormDialog } from "../components/PeriodoFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function GestionesPage() {
  const [gestionDialogOpen, setGestionDialogOpen] = useState(false)
  const [editingGestion, setEditingGestion] = useState<Gestion | null>(null)
  const [editingPeriodo, setEditingPeriodo] = useState<Periodo | null>(null)

  const gestionSearch = usePaginatedSearch()

  const gestionesQuery = useQuery(
    gestionQueries.list({
      page: gestionSearch.page,
      size: PAGE_SIZE,
      sortBy: "gestion",
      direction: "DESC",
      ...(gestionSearch.query ? { q: gestionSearch.query } : {}),
    }),
  )

  const gestiones = gestionesQuery.data?.content ?? []

  useClampPage(
    gestionSearch.page,
    gestionSearch.setPage,
    gestionesQuery.data?.totalPages,
  )

  const masterDetail = useMasterDetail(gestiones)
  const periodoSearch = usePaginatedSearch({
    resetKey: masterDetail.selectedId,
  })

  function openCreateGestion() {
    setEditingGestion(null)
    setGestionDialogOpen(true)
  }

  function openEditGestion(gestion: Gestion) {
    setEditingGestion(gestion)
    setGestionDialogOpen(true)
  }

  return (
    <MasterDetailLayout
      title={
        masterDetail.isMobile &&
        masterDetail.mobileShowDetail &&
        masterDetail.selected
          ? `Gestión ${masterDetail.selected.gestion}`
          : "Gestiones"
      }
      showMaster={masterDetail.showMaster}
      showDetail={masterDetail.showDetail}
      showBack={masterDetail.isMobile && masterDetail.mobileShowDetail}
      backLabel="Volver a gestiones"
      onBack={masterDetail.backToMaster}
      headerAction={
        masterDetail.showMaster ? (
          <Button
            size="sm"
            type="button"
            onClick={openCreateGestion}
            className="shrink-0"
          >
            <Plus />
            Crear
          </Button>
        ) : null
      }
      master={
        <MasterPanel
          gestiones={gestiones}
          page={gestionesQuery.data}
          selectedId={masterDetail.selectedId}
          search={gestionSearch.search}
          isLoading={gestionesQuery.isLoading}
          isFetching={gestionesQuery.isFetching}
          errorMessage={
            gestionesQuery.isError
              ? getErrorMessage(gestionesQuery.error)
              : null
          }
          onSearchChange={gestionSearch.setSearch}
          onSelect={masterDetail.select}
          onCreate={openCreateGestion}
          onEdit={openEditGestion}
          onPageChange={gestionSearch.setPage}
        />
      }
      detail={
        <DetailPanel
          gestion={masterDetail.selected}
          periodoPage={periodoSearch.page}
          onPageChange={periodoSearch.setPage}
          onEditPeriodo={setEditingPeriodo}
        />
      }
    >
      <GestionFormDialog
        key={editingGestion?.id ?? "new-gestion"}
        open={gestionDialogOpen}
        onOpenChange={setGestionDialogOpen}
        gestion={editingGestion}
        onSuccess={(saved) => {
          masterDetail.revealDetail(saved.id)
          gestionSearch.setPage(0)
        }}
      />

      {editingPeriodo ? (
        <PeriodoFormDialog
          key={editingPeriodo.id}
          open={Boolean(editingPeriodo)}
          onOpenChange={(open) => {
            if (!open) setEditingPeriodo(null)
          }}
          periodo={editingPeriodo}
        />
      ) : null}
    </MasterDetailLayout>
  )
}

function MasterPanel({
  gestiones,
  page,
  selectedId,
  search,
  isLoading,
  isFetching,
  errorMessage,
  onSearchChange,
  onSelect,
  onCreate,
  onEdit,
  onPageChange,
}: {
  gestiones: Gestion[]
  page?: PageResponse<Gestion>
  selectedId: string | null
  search: string
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (gestion: Gestion) => void
  onPageChange: (page: number) => void
}) {
  const deleteMutation = useDeleteGestion()
  const [gestionToDelete, setGestionToDelete] = useState<Gestion | null>(null)

  return (
    <MasterPanelShell
      label="Gestiones"
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por año…"
      searchAriaLabel="Buscar gestiones"
      footer={
        <ConfirmDeleteDialog
          open={Boolean(gestionToDelete)}
          onOpenChange={(open) => {
            if (!open) setGestionToDelete(null)
          }}
          title="Eliminar gestión"
          description={
            gestionToDelete
              ? `¿Seguro que deseas eliminar la gestión ${gestionToDelete.gestion}? También se eliminarán sus períodos.`
              : "¿Seguro que deseas eliminar esta gestión?"
          }
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            if (!gestionToDelete) return
            await deleteMutation.mutateAsync(gestionToDelete.id)
            setGestionToDelete(null)
          }}
        />
      }
    >
      <PaginatedList
        items={gestiones}
        page={page}
        isLoading={isLoading}
        isFetching={isFetching}
        errorMessage={errorMessage}
        hasSearch={search.trim().length > 0}
        onPageChange={onPageChange}
        getKey={(gestion) => gestion.id}
        empty={{
          icon: <CalendarRange className="size-4 text-muted-foreground" />,
          title: "No hay gestiones",
          description: "Crea una gestión para generar sus 12 períodos.",
          actionLabel: "Crear",
          onAction: onCreate,
          searchDescription: "Prueba con otro año.",
        }}
      >
        {(gestion) => (
          <SelectableListItem
            active={gestion.id === selectedId}
            onSelect={() => onSelect(gestion.id)}
            title={`Gestión ${gestion.gestion}`}
            subtitle={
              <span className="truncate text-[11px] text-muted-foreground">
                {formatDate(gestion.fechaInicio)} —{" "}
                {formatDate(gestion.fechaFin)}
              </span>
            }
            actions={
              <RowActions
                editLabel="Editar gestión"
                deleteLabel="Eliminar gestión"
                deleteDisabled={deleteMutation.isPending}
                onEdit={() => onEdit(gestion)}
                onDelete={() => setGestionToDelete(gestion)}
              />
            }
          />
        )}
      </PaginatedList>
    </MasterPanelShell>
  )
}

function DetailPanel({
  gestion,
  periodoPage,
  onPageChange,
  onEditPeriodo,
}: {
  gestion: Gestion | null
  periodoPage: number
  onPageChange: (page: number) => void
  onEditPeriodo: (periodo: Periodo) => void
}) {
  const periodosQuery = useQuery({
    ...periodoQueries.byGestion(gestion?.id ?? "", {
      page: periodoPage,
      size: 12,
      sortBy: "periodo",
      direction: "ASC",
    }),
  })

  useClampPage(periodoPage, onPageChange, periodosQuery.data?.totalPages)

  const periodos = periodosQuery.data?.content ?? []

  return (
    <DetailPanelShell
      hasSelection={Boolean(gestion)}
      emptySelectionMessage="Selecciona una gestión para ver sus períodos."
      header={
        gestion ? (
          <DetailPanelHeader
            title={`Gestión ${gestion.gestion}`}
            subtitle={
              <span className="text-xs text-muted-foreground">
                {formatDate(gestion.fechaInicio)} —{" "}
                {formatDate(gestion.fechaFin)}
              </span>
            }
            meta={
              <>
                <AuditInfo data={gestion} />
                <p className="text-xs text-muted-foreground">
                  Los períodos se crean automáticamente al registrar la
                  gestión.
                </p>
              </>
            }
          />
        ) : null
      }
    >
      <PaginatedList
        items={periodos}
        page={periodosQuery.data}
        isLoading={periodosQuery.isLoading}
        isFetching={periodosQuery.isFetching}
        errorMessage={
          periodosQuery.isError
            ? getErrorMessage(periodosQuery.error)
            : null
        }
        onPageChange={onPageChange}
        getKey={(periodo) => periodo.id}
        skeletonRowClassName="h-10"
        listClassName="sm:p-3"
        empty={{
          title: "Sin períodos",
          description: "Esta gestión aún no tiene períodos asociados.",
        }}
      >
        {(periodo) => (
          <DetailListItem
            title={`${periodo.periodo}. ${periodo.literal}`}
            subtitle={
              <span className="truncate text-[11px] text-muted-foreground">
                {formatDate(periodo.fechaInicio)} —{" "}
                {formatDate(periodo.fechaFin)}
              </span>
            }
            meta={<AuditInfo data={periodo} compact />}
            actions={
              <RowActions
                editLabel={`Editar período ${periodo.literal}`}
                onEdit={() => onEditPeriodo(periodo)}
              />
            }
          />
        )}
      </PaginatedList>
    </DetailPanelShell>
  )
}

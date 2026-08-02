import { useQuery } from "@tanstack/react-query"

import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import {
  DetailListItem,
  DetailPanelHeader,
  DetailPanelShell,
  PaginatedList,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import { useClampPage } from "@/shared/hooks/use-paginated-search"
import { formatDate } from "@/shared/lib/format-date"

import type { Gestion } from "../api/gestion.service"
import { periodoQueries } from "../api/periodo.queries"
import type { Periodo } from "../api/periodo.service"

type GestionDetailPanelProps = {
  gestion: Gestion | null
  periodoPage: number
  onPageChange: (page: number) => void
  onEditPeriodo: (periodo: Periodo) => void
}

export function GestionDetailPanel({
  gestion,
  periodoPage,
  onPageChange,
  onEditPeriodo,
}: GestionDetailPanelProps) {
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

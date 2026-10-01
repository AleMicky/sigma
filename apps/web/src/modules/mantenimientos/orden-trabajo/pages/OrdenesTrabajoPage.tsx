import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ClipboardList, Wrench } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"
import { useMasterDetail } from "@/shared/hooks/use-master-detail"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"
import { solicitudQueries } from "@/modules/mantenimientos/solicitud/api/solicitud.queries"

import { OrdenTrabajoDetailPanel } from "../components/OrdenTrabajoDetailPanel"
import { OrdenTrabajoMasterPanel } from "../components/OrdenTrabajoMasterPanel"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function OrdenesTrabajoPage() {
  const search = usePaginatedSearch()

  // Solicitudes Query for Master Panel
  const solicitudesQuery = useQuery(
    solicitudQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const solicitudes = solicitudesQuery.data?.content ?? []
  const totalCount = solicitudesQuery.data?.totalElements ?? solicitudes.length

  useClampPage(search.page, search.setPage, solicitudesQuery.data?.totalPages)

  const masterDetail = useMasterDetail(solicitudes)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* Executive Page Header */}
      <header className="flex shrink-0 flex-col gap-2 border-b px-4 py-3 sm:gap-3 sm:px-6 sm:py-3.5 bg-card/60 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {masterDetail.isMobile && masterDetail.mobileShowDetail && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Volver a solicitudes"
              onClick={masterDetail.backToMaster}
              className="shrink-0"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}

          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 shadow-2xs">
            <Wrench className="size-4.5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-lg font-bold tracking-tight sm:text-xl text-foreground">
                {masterDetail.isMobile &&
                masterDetail.mobileShowDetail &&
                masterDetail.selected
                  ? `Reporte OT - ${masterDetail.selected.numero}`
                  : "Reporte de Órdenes de Trabajo"}
              </h1>
              {totalCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300 border border-sky-500/30">
                  {totalCount} {totalCount === 1 ? "Registro" : "Registros"}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              Consulta técnica de órdenes de trabajo, seguimiento de checklist, evidencias y diagnóstico.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <RefreshButton
            size="sm"
            queries={[solicitudesQuery]}
            className="h-8 gap-1.5 px-3 text-xs font-medium shadow-2xs"
          />
        </div>
      </header>

      {/* Master-Detail Split View */}
      <div
        className={cn(
          "grid min-h-0 flex-1 overflow-hidden",
          "md:grid-cols-[330px_1fr] lg:grid-cols-[370px_1fr] xl:grid-cols-[390px_1fr]",
        )}
      >
        <div
          className={cn(
            "h-full min-h-0 min-w-0 flex-col overflow-hidden",
            masterDetail.showMaster ? "flex" : "hidden",
            "md:flex",
          )}
        >
          <OrdenTrabajoMasterPanel
            solicitudes={solicitudes}
            page={solicitudesQuery.data}
            selectedId={masterDetail.selectedId}
            search={search.search}
            isLoading={solicitudesQuery.isLoading}
            isFetching={solicitudesQuery.isFetching}
            errorMessage={
              solicitudesQuery.isError
                ? getErrorMessage(solicitudesQuery.error)
                : null
            }
            onSearchChange={search.setSearch}
            onSelect={masterDetail.select}
            onPageChange={search.setPage}
          />
        </div>

        <div
          className={cn(
            "h-full min-h-0 min-w-0 flex-col overflow-hidden",
            masterDetail.showDetail ? "flex" : "hidden",
            "md:flex",
          )}
        >
          <OrdenTrabajoDetailPanel
            solicitud={masterDetail.selected}
          />
        </div>
      </div>
    </div>
  )
}

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ClipboardCheck } from "lucide-react"

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

import { ControlActivoDetailPanel } from "../components/ControlActivoDetailPanel"
import { ControlActivoMasterPanel } from "../components/ControlActivoMasterPanel"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function ControlesActivosPage() {
  const search = usePaginatedSearch()

  // Solicitudes Query for Master Panel (Read-only Consultation)
  const solicitudesQuery = useQuery(
    solicitudQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const solicitudes = useMemo(() => {
    const rawSolicitudes = solicitudesQuery.data?.content ?? []
    return rawSolicitudes.filter((sol) => {
      const norm = (sol.estado ?? "").toLowerCase().trim()
      return norm !== "borrador" && norm !== "solicitado"
    })
  }, [solicitudesQuery.data?.content])

  const totalCount = solicitudes.length

  useClampPage(search.page, search.setPage, solicitudesQuery.data?.totalPages)

  const masterDetail = useMasterDetail(solicitudes)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* Compact Page Header */}
      <header className="flex shrink-0 items-center justify-between gap-2 border-b px-3.5 py-2 sm:px-5 sm:py-2 bg-card/60">
        <div className="flex items-center gap-2.5 min-w-0">
          {masterDetail.isMobile && masterDetail.mobileShowDetail && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Volver a solicitudes"
              onClick={masterDetail.backToMaster}
              className="shrink-0"
            >
              <ArrowLeft className="size-3.5" />
            </Button>
          )}

          <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 shadow-2xs">
            <ClipboardCheck className="size-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-heading text-sm sm:text-base font-bold tracking-tight text-foreground">
                {masterDetail.isMobile &&
                masterDetail.mobileShowDetail &&
                masterDetail.selected
                  ? `Reporte Control - ${masterDetail.selected.numero}`
                  : "Control de Activos y Accesorios"}
              </h1>
              {totalCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-sky-500/15 px-1.5 py-0 text-[10.5px] font-bold text-sky-700 dark:text-sky-300 border border-sky-500/30">
                  {totalCount} {totalCount === 1 ? "Registro" : "Registros"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              Consulta técnica de actas de entrega, devolución y verificación de componentes por solicitud.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <RefreshButton
            size="sm"
            queries={[solicitudesQuery]}
            className="h-7 px-2 text-xs font-medium shadow-2xs"
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
          <ControlActivoMasterPanel
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
          <ControlActivoDetailPanel
            solicitud={masterDetail.selected}
          />
        </div>
      </div>
    </div>
  )
}

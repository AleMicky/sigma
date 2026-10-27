import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Car, GitFork, ShieldCheck } from "lucide-react"

import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"

import { salidaVehicularQueries } from "../api/salida-vehicular.queries"
import type { SalidaVehicular } from "../api/salida-vehicular.types"
import { CancelarSalidaDialog } from "../components/CancelarSalidaDialog"
import { EjecutarAccionFlowableDialog } from "../components/EjecutarAccionFlowableDialog"
import { RegistrarBitacoraDialog } from "../components/RegistrarBitacoraDialog"
import { RegistrarSalidaDialog } from "../components/RegistrarSalidaDialog"
import { SalidaVehicularFiltrosBar } from "../components/SalidaVehicularFiltrosBar"
import { SalidaVehicularMetrics } from "../components/SalidaVehicularMetrics"
import { SalidaVehicularTable } from "../components/SalidaVehicularTable"

export function SalidasVehicularesPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("ALL")

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [actionSalida, setActionSalida] = useState<SalidaVehicular | null>(null)
  const [bitacoraSalida, setBitacoraSalida] = useState<SalidaVehicular | null>(null)
  const [cancelSalida, setCancelSalida] = useState<SalidaVehicular | null>(null)

  // Query Salidas
  const salidasQuery = useQuery(
    salidaVehicularQueries.list({
      page,
      size: 20,
      sortBy: "createdAt",
      direction: "DESC",
      search: search.trim() || undefined,
      estado: estadoFilter !== "ALL" ? estadoFilter : undefined,
    })
  )

  // Query General Report for KPI stats
  const reporteGeneralQuery = useQuery(salidaVehicularQueries.reporteGeneral())

  const items = salidasQuery.data?.content ?? []
  const totalElements = salidasQuery.data?.totalElements ?? 0

  const kpis = useMemo(() => {
    if (reporteGeneralQuery.data) {
      return {
        total: reporteGeneralQuery.data.totalSalidas,
        activas: reporteGeneralQuery.data.salidasActivas,
        finalizadas: reporteGeneralQuery.data.salidasFinalizadas,
        canceladas: reporteGeneralQuery.data.salidasCanceladas,
      }
    }
    // Fallback: estimate from current page
    return {
      total: totalElements,
      activas: items.filter((i) => !i.estado.includes("FINALIZ") && !i.estado.includes("CANCEL")).length,
      finalizadas: items.filter((i) => i.estado.includes("FINALIZ")).length,
      canceladas: items.filter((i) => i.estado.includes("CANCEL")).length,
    }
  }, [reporteGeneralQuery.data, totalElements, items])

  const handleResetFilters = () => {
    setSearch("")
    setEstadoFilter("ALL")
    setPage(0)
  }

  return (
    <PageShell size="full" padding="none" layout="auto" className="w-full space-y-4 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Car className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Gestión de Salidas Vehiculares
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Control de comisiones y viajes vehiculares con seguimiento de estados y transiciones Flowable BPMN.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 font-medium">
            <GitFork className="h-3.5 w-3.5 text-indigo-500" />
            <span>Motor BPMN: Flowable</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Auditoría de Eventos Activa</span>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <SalidaVehicularMetrics
        total={kpis.total}
        activas={kpis.activas}
        finalizadas={kpis.finalizadas}
        canceladas={kpis.canceladas}
      />

      {/* Filters Bar */}
      <SalidaVehicularFiltrosBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(0)
        }}
        estadoFilter={estadoFilter}
        onEstadoFilterChange={(val) => {
          setEstadoFilter(val)
          setPage(0)
        }}
        onReset={handleResetFilters}
        onRefresh={() => {
          void salidasQuery.refetch()
          void reporteGeneralQuery.refetch()
        }}
        onOpenCreate={() => setIsCreateOpen(true)}
        isFetching={salidasQuery.isFetching}
      />

      {/* Data Table */}
      <SalidaVehicularTable
        items={items}
        isLoading={salidasQuery.isLoading}
        onExecuteAction={(salida) => setActionSalida(salida)}
        onAddBitacora={(salida) => setBitacoraSalida(salida)}
        onCancel={(salida) => setCancelSalida(salida)}
      />

      {/* Pagination */}
      {salidasQuery.data && salidasQuery.data.totalPages > 1 && (
        <div className="flex justify-end pt-2">
          <Pagination
            page={salidasQuery.data}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Dialogs */}
      <RegistrarSalidaDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <EjecutarAccionFlowableDialog
        open={Boolean(actionSalida)}
        onOpenChange={(open) => !open && setActionSalida(null)}
        salida={actionSalida}
      />

      <RegistrarBitacoraDialog
        open={Boolean(bitacoraSalida)}
        onOpenChange={(open) => !open && setBitacoraSalida(null)}
        salidaId={bitacoraSalida?.id ?? ""}
        salidaNumero={bitacoraSalida?.numero}
      />

      <CancelarSalidaDialog
        open={Boolean(cancelSalida)}
        onOpenChange={(open) => !open && setCancelSalida(null)}
        salida={cancelSalida}
      />
    </PageShell>
  )
}

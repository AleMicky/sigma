import { useState } from "react"
import { Link, Outlet } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Edit2, Tags } from "lucide-react"

import { routes } from "@/app/config/routes"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { PageTabs } from "@/shared/components/page-tabs"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"

import { tipoInsumoQueries } from "../api/tipo-insumo.queries"
import { TipoInsumoFormDialog } from "../components/TipoInsumoFormDialog"

type TipoInsumoDetailPageProps = {
  tipoInsumoId: string
}

export function TipoInsumoDetailPage({
  tipoInsumoId,
}: TipoInsumoDetailPageProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const tipoQuery = useQuery(tipoInsumoQueries.detail(tipoInsumoId))
  const tipoInsumo = tipoQuery.data

  const tabs = [
    {
      label: "Atributos Dinámicos",
      to: routes.inventarios.tiposInsumo.atributos(tipoInsumoId),
    },
  ]

  const activeTo = tabs[0].to

  return (
    <PageShell className="h-full min-h-0 max-w-6xl gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-10 md:py-0 flex flex-col">
      <header className="flex shrink-0 flex-col gap-4 border-b py-4 sm:py-6 md:py-8">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            render={<Link to={routes.inventarios.tiposInsumo.root} />}
            aria-label="Volver a tipos de insumo"
            className="shrink-0 rounded-lg shadow-xs hover:bg-accent"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Detalle de Tipo de Insumo
          </span>
        </div>

        {tipoQuery.isLoading ? (
          <div className="min-w-0 flex-1">
            <ListSkeleton rows={1} rowClassName="h-16 rounded-xl" />
          </div>
        ) : tipoQuery.isError ? (
          <EmptyState
            title={getErrorMessage(tipoQuery.error)}
            className="text-destructive"
          />
        ) : tipoInsumo ? (
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/80 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent shadow-xs overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />

            <div className="flex min-w-0 flex-1 items-start sm:items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
                <Tags className="size-6" />
              </span>

              <div className="min-w-0 flex flex-1 flex-col gap-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h1 className="truncate font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                    {tipoInsumo.nombre}
                  </h1>

                  <span className="inline-flex items-center rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-mono font-medium text-foreground border border-border/60 shadow-xs">
                    {tipoInsumo.codigo}
                  </span>
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                  {tipoInsumo.descripcion ||
                    "Configura los atributos personalizados dinámicos para los insumos pertenecientes a este tipo."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
              <RefreshButton
                onRefresh={() => tipoQuery.refetch()}
                isRefreshing={tipoQuery.isFetching}
                className="h-8 bg-background/80 hover:bg-background"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                className="h-8 bg-background/80 hover:bg-background shadow-xs text-xs font-medium"
              >
                <Edit2 className="size-3.5" />
                Editar Tipo
              </Button>
            </div>
          </div>
        ) : null}

        <PageTabs tabs={tabs} activeTo={activeTo} />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4">
        <Outlet />
      </div>

      {tipoInsumo ? (
        <TipoInsumoFormDialog
          key={tipoInsumo.id}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          tipoInsumo={tipoInsumo}
        />
      ) : null}
    </PageShell>
  )
}

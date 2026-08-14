import { useState } from "react"
import { Link, Outlet, useRouterState } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Edit2, Tags } from "lucide-react"

import { routes } from "@/app/config/routes"
import { categoriaQueries } from "@/modules/activos/categoria/api/categoria.queries"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { PageTabs } from "@/shared/components/page-tabs"
import { Button } from "@/shared/components/ui/button"

import { tipoActivoQueries } from "../api/tipo-activo.queries"
import { TipoActivoFormDialog } from "../components/TipoActivoFormDialog"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "../lib/tipo-activo-colors"
import { getTipoActivoIcon } from "../lib/tipo-activo-icons"

type TipoActivoDetailPageProps = {
  tipoActivoId: string
}

export function TipoActivoDetailPage({
  tipoActivoId,
}: TipoActivoDetailPageProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const tipoQuery = useQuery(tipoActivoQueries.detail(tipoActivoId))
  const tipoActivo = tipoQuery.data

  const categoriaQuery = useQuery({
    ...categoriaQueries.detail(tipoActivo?.categoriaId ?? ""),
    enabled: Boolean(tipoActivo?.categoriaId),
  })

  const tabs = [
    {
      label: "Atributos",
      to: routes.tiposActivo.atributos(tipoActivoId),
    },
    {
      label: "Componentes",
      to: routes.tiposActivo.componentes(tipoActivoId),
    },
  ]

  const activeTo =
    tabs.find((tab) => pathname === tab.to || pathname.startsWith(`${tab.to}/`))
      ?.to ?? tabs[0].to

  const color = tipoActivo?.color || DEFAULT_TIPO_ACTIVO_COLOR

  return (
    <PageShell className="h-full min-h-0 max-w-6xl gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-10 md:py-0 flex flex-col">
      <header className="flex shrink-0 flex-col gap-4 border-b py-4 sm:py-6 md:py-8">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            render={<Link to={routes.tiposActivo.root} />}
            aria-label="Volver a tipos de activo"
            className="shrink-0 rounded-lg shadow-xs hover:bg-accent"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Detalle de Tipo de Activo
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
        ) : tipoActivo ? (
          <div
            className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${color}12 0%, ${color}03 100%)`,
            }}
          >
            {/* Top Color Highlight Bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: color }}
            />

            <div className="flex min-w-0 flex-1 items-start sm:items-center gap-4">
              <TipoActivoBadge
                color={tipoActivo.color}
                icono={tipoActivo.icono}
              />

              <div className="min-w-0 flex flex-1 flex-col gap-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h1 className="truncate font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                    {tipoActivo.nombre}
                  </h1>

                  {categoriaQuery.data ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-medium text-foreground border border-border/60 shadow-xs">
                      <Tags className="size-3 text-muted-foreground" />
                      {categoriaQuery.data.nombre}
                    </span>
                  ) : null}
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                  {tipoActivo.descripcion ||
                    "Configura atributos personalizados y componentes asociados a este tipo de activo."}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
              className="shrink-0 self-start sm:self-auto bg-background/80 hover:bg-background shadow-xs text-xs font-medium"
            >
              <Edit2 className="size-3.5" />
              Editar Tipo
            </Button>
          </div>
        ) : null}

        <PageTabs tabs={tabs} activeTo={activeTo} />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-3">
        <Outlet />
      </div>

      {tipoActivo ? (
        <TipoActivoFormDialog
          key={tipoActivo.id}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          tipoActivo={tipoActivo}
        />
      ) : null}
    </PageShell>
  )
}

function TipoActivoBadge({
  color,
  icono,
}: {
  color: string | null
  icono: string | null
}) {
  const Icon = getTipoActivoIcon(icono)
  const badgeColor = color || DEFAULT_TIPO_ACTIVO_COLOR

  return (
    <span
      className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-transform hover:scale-105"
      style={{ backgroundColor: badgeColor }}
    >
      <Icon className="size-6" />
    </span>
  )
}

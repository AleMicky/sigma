import { Link, Outlet, useRouterState } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

import { routes } from "@/app/config/routes"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { PageTabs } from "@/shared/components/page-tabs"
import { Button } from "@/shared/components/ui/button"

import { tipoActivoQueries } from "../api/tipo-activo.queries"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "../lib/tipo-activo-colors"
import { getTipoActivoIcon } from "../lib/tipo-activo-icons"

type TipoActivoDetailPageProps = {
  tipoActivoId: string
}

export function TipoActivoDetailPage({
  tipoActivoId,
}: TipoActivoDetailPageProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const tipoQuery = useQuery(tipoActivoQueries.detail(tipoActivoId))
  const tipoActivo = tipoQuery.data

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

  return (
    <PageShell className="h-full min-h-0 max-w-6xl gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-10 md:py-0">
      <header className="flex shrink-0 flex-col gap-4 border-b py-4 sm:py-6 md:py-8">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link to={routes.tiposActivo.root} />}
            aria-label="Volver a tipos de activo"
            className="mt-0.5 shrink-0"
          >
            <ArrowLeft />
          </Button>

          {tipoQuery.isLoading ? (
            <div className="min-w-0 flex-1">
              <ListSkeleton rows={1} rowClassName="h-12 rounded-xl" />
            </div>
          ) : tipoQuery.isError ? (
            <EmptyState
              title={getErrorMessage(tipoQuery.error)}
              className="text-destructive"
            />
          ) : tipoActivo ? (
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <TipoActivoBadge
                color={tipoActivo.color}
                icono={tipoActivo.icono}
              />
              <div className="min-w-0 flex flex-1 flex-col gap-0.5">
                <h1 className="truncate font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  {tipoActivo.nombre}
                </h1>
                {tipoActivo.descripcion ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {tipoActivo.descripcion}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Configura atributos y componentes de este tipo.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <PageTabs tabs={tabs} activeTo={activeTo} />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
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
      className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white sm:size-11"
      style={{ backgroundColor: badgeColor }}
    >
      <Icon className="size-4 sm:size-5" />
    </span>
  )
}

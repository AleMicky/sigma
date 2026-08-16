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
    <PageShell size="xl" layout="fill" padding="compact">
      {/* Compact Detail Header */}
      <header className="flex shrink-0 flex-col gap-2.5 border-b py-2.5 sm:py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-xs"
            render={<Link to={routes.tiposActivo.root} />}
            aria-label="Volver a tipos de activo"
            title="Volver a tipos de activo"
            className="size-7.5 shrink-0 rounded-lg shadow-2xs hover:bg-accent"
          >
            <ArrowLeft className="size-3.5" />
          </Button>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Detalle de Tipo de Activo
          </span>
        </div>

        {tipoQuery.isLoading ? (
          <div className="min-w-0 flex-1">
            <ListSkeleton rows={1} rowClassName="h-14 rounded-xl" />
          </div>
        ) : tipoQuery.isError ? (
          <EmptyState
            title={getErrorMessage(tipoQuery.error)}
            className="text-destructive py-2"
          />
        ) : tipoActivo ? (
          <div
            className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border border-border/80 bg-card shadow-2xs overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${color}12 0%, ${color}03 100%)`,
            }}
          >
            {/* Top Color Highlight Bar */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: color }}
            />

            <div className="flex min-w-0 flex-1 items-center gap-3">
              <TipoActivoBadge
                color={tipoActivo.color}
                icono={tipoActivo.icono}
              />

              <div className="min-w-0 flex flex-1 flex-col gap-0.5">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h1 className="truncate font-heading text-lg font-bold tracking-tight sm:text-xl text-foreground">
                    {tipoActivo.nombre}
                  </h1>

                  {categoriaQuery.data ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-[11px] font-medium text-foreground border border-border/60 shadow-2xs">
                      <Tags className="size-3 text-muted-foreground" />
                      {categoriaQuery.data.nombre}
                    </span>
                  ) : null}
                </div>

                <p className="line-clamp-1 text-xs text-muted-foreground leading-snug">
                  {tipoActivo.descripcion ||
                    "Configura atributos personalizados y componentes asociados a este tipo de activo."}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
              className="h-8 px-2.5 shrink-0 self-start sm:self-auto bg-background/80 hover:bg-background shadow-2xs text-xs font-medium"
            >
              <Edit2 className="size-3.5" />
              Editar Tipo
            </Button>
          </div>
        ) : null}

        <PageTabs tabs={tabs} activeTo={activeTo} />
      </header>

      {/* Main Tabs Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-2.5">
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
      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs transition-transform hover:scale-105"
      style={{ backgroundColor: badgeColor }}
    >
      <Icon className="size-4.5" />
    </span>
  )
}

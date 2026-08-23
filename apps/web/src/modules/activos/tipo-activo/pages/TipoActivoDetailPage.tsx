import { useState } from "react"
import { Link, Outlet, useRouterState } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Edit2, Tag } from "lucide-react"

import { routes } from "@/app/config/routes"
import { categoriaQueries } from "@/modules/activos/categoria/api/categoria.queries"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { PageTabs } from "@/shared/components/page-tabs"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Badge } from "@/shared/components/ui/badge"
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
      label: "Atributos Dinámicos",
      to: routes.tiposActivo.atributos(tipoActivoId),
    },
    {
      label: "Componentes Estructurales",
      to: routes.tiposActivo.componentes(tipoActivoId),
    },
  ]

  const activeTo =
    tabs.find((tab) => pathname === tab.to || pathname.startsWith(`${tab.to}/`))
      ?.to ?? tabs[0].to

  const color = tipoActivo?.color || DEFAULT_TIPO_ACTIVO_COLOR
  const TipoIcon = getTipoActivoIcon(tipoActivo?.icono ?? null)

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header maestro-detalle */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:py-6">
        {/* Navegación y retorno */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-xs"
              render={<Link to={routes.tiposActivo.root} />}
              aria-label="Volver a tipos de activo"
              title="Volver a tipos de activo"
              className="size-8 shrink-0 rounded-xl shadow-2xs hover:bg-accent cursor-pointer"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Detalle y Configuración Maestro-Detalle
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <RefreshButton
              queries={[tipoQuery, categoriaQuery]}
            />
            {tipoActivo && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                className="h-8 px-3 text-xs font-medium gap-1.5 shadow-2xs"
              >
                <Edit2 className="size-3.5" />
                <span>Editar Tipo</span>
              </Button>
            )}
          </div>
        </div>

        {tipoQuery.isLoading ? (
          <div className="min-w-0 flex-1">
            <ListSkeleton rows={1} rowClassName="h-20 rounded-2xl" />
          </div>
        ) : tipoQuery.isError ? (
          <EmptyState
            title={getErrorMessage(tipoQuery.error)}
            className="text-destructive py-2"
          />
        ) : tipoActivo ? (
          <div
            className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${color}14 0%, ${color}04 100%)`,
            }}
          >
            {/* Barra superior de acento con color personalizado */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: color }}
            />

            <div className="flex min-w-0 flex-1 items-start sm:items-center gap-3.5">
              {/* Icono temático del tipo de activo */}
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl shadow-2xs transition-transform"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                  borderColor: `${color}40`,
                }}
              >
                <TipoIcon className="size-6" />
              </div>

              <div className="min-w-0 flex flex-1 flex-col gap-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h1 className="truncate font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {tipoActivo.nombre}
                  </h1>

                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-background/90 text-foreground border border-border/70 shadow-2xs">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-mono text-[11px] text-muted-foreground uppercase">
                      {color}
                    </span>
                  </span>

                  {categoriaQuery.data ? (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-[11px] font-medium bg-background/90 border-border/70"
                    >
                      <Tag className="size-3 text-primary" />
                      <span>{categoriaQuery.data.nombre}</span>
                    </Badge>
                  ) : null}
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {tipoActivo.descripcion ||
                    "Configura los atributos dinámicos y componentes estructurales pertenecientes a este tipo de activo."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <PageTabs tabs={tabs} activeTo={activeTo} />
      </header>

      {/* Main Tabs Content */}
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

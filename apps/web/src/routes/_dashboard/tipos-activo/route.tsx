import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router"

import { routes } from "@/app/config/routes"
import { PageShell } from "@/shared/components/page-shell"
import { PageTabs } from "@/shared/components/page-tabs"

const tabs = [
  { label: "General", to: routes.tiposActivo.root },
  { label: "Atributos", to: routes.tiposActivo.atributos },
  { label: "Historial", to: routes.tiposActivo.historial },
] as const

export const Route = createFileRoute("/_dashboard/tipos-activo")({
  component: TiposActivoLayout,
})

function TiposActivoLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const activeTo =
    tabs.find((tab) => tab.to === pathname)?.to ?? routes.tiposActivo.root

  return (
    <PageShell>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Tipos de activo
        </h1>
        <p className="text-sm text-muted-foreground">
          Catálogo y configuración. El 3.er nivel vive en tabs, no en el
          sidebar.
        </p>
      </div>

      <PageTabs tabs={[...tabs]} activeTo={activeTo} />

      <div className="max-w-xl">
        <Outlet />
      </div>
    </PageShell>
  )
}

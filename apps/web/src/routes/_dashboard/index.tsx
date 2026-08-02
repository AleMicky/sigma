import { createFileRoute } from "@tanstack/react-router"

import { appConfig } from "@/app/config"
import { PageShell } from "@/shared/components/page-shell"

export const Route = createFileRoute("/_dashboard/")({
  component: HomePage,
})

function HomePage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Inicio
        </h1>
        <p className="text-sm text-muted-foreground">
          Bienvenido a {appConfig.shortName}
        </p>
      </div>
    </PageShell>
  )
}

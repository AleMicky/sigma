import { createFileRoute } from "@tanstack/react-router"

import { PageShell } from "@/shared/components/page-shell"

export const Route = createFileRoute("/_dashboard/activos")({
  component: ActivosPage,
})

function ActivosPage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Activos
        </h1>
        <p className="text-sm text-muted-foreground">
          Listado y gestión de activos.
        </p>
      </div>
    </PageShell>
  )
}

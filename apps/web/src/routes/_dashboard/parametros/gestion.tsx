import { createFileRoute } from "@tanstack/react-router"

import { PageShell } from "@/shared/components/page-shell"

export const Route = createFileRoute("/_dashboard/parametros/gestion")({
  component: ParametrosGestionPage,
})

function ParametrosGestionPage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Gestión
        </h1>
        <p className="text-sm text-muted-foreground">
          Parámetros generales de operación del sistema.
        </p>
      </div>
    </PageShell>
  )
}

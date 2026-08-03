import { createFileRoute } from "@tanstack/react-router"

import { PageShell } from "@/shared/components/page-shell"

export const Route = createFileRoute("/_dashboard/tipos-activo/historial")({
  component: TiposActivoHistorialPage,
})

function TiposActivoHistorialPage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Historial
        </h1>
        <p className="text-sm text-muted-foreground">
          Cambios recientes del catálogo. Próximamente.
        </p>
      </div>
    </PageShell>
  )
}

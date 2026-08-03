import { createFileRoute } from "@tanstack/react-router"

import { PageShell } from "@/shared/components/page-shell"

export const Route = createFileRoute("/_dashboard/tipos-activo/atributos")({
  component: TiposActivoAtributosPage,
})

function TiposActivoAtributosPage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Atributos
        </h1>
        <p className="text-sm text-muted-foreground">
          Campos personalizados del tipo de activo. Próximamente.
        </p>
      </div>
    </PageShell>
  )
}

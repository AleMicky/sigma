import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/tipos-activo/historial")({
  component: TiposActivoHistorialPage,
})

function TiposActivoHistorialPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium">Historial</h2>
      <p className="text-sm text-muted-foreground">
        Cambios recientes del catálogo. También es 3.er nivel vía subruta.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">Sin eventos aún.</p>
    </div>
  )
}

import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/tipos-activo/atributos")({
  component: TiposActivoAtributosPage,
})

function TiposActivoAtributosPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium">Atributos</h2>
      <p className="text-sm text-muted-foreground">
        Campos personalizados del tipo (placa, serie, capacidad…). Este nivel
        no aparece en el sidebar: se navega por tabs.
      </p>
      <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
        <li>Sin atributos configurados aún</li>
      </ul>
    </div>
  )
}

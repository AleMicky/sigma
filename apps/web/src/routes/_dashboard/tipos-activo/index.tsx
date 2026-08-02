import { createFileRoute } from "@tanstack/react-router"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

export const Route = createFileRoute("/_dashboard/tipos-activo/")({
  component: TiposActivoGeneralPage,
})

function TiposActivoGeneralPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="tipo-nombre">Nombre</Label>
        <Input id="tipo-nombre" placeholder="Ej. Vehículo, Equipo…" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tipo-descripcion">Descripción</Label>
        <Input
          id="tipo-descripcion"
          placeholder="Descripción breve del tipo"
        />
      </div>

      <div>
        <Button type="button">Guardar</Button>
      </div>
    </div>
  )
}

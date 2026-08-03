import { Boxes } from "lucide-react"

import { EmptyState } from "@/shared/components/empty-state"

export function TipoActivoComponentesPage() {
  return (
    <EmptyState
      icon={<Boxes className="size-4 text-muted-foreground" />}
      title="Componentes"
      description="Subconjuntos o partes del tipo de activo. Próximamente."
      className="py-16"
    />
  )
}

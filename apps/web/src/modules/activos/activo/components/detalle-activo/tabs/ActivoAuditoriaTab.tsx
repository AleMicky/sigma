import { ShieldCheck } from "lucide-react"

import type { Activo } from "@/modules/activos/activo/api/activo.service"
import { AuditInfo } from "@/shared/components/audit-info"

type ActivoAuditoriaTabProps = {
  activo: Activo
}

export function ActivoAuditoriaTab({ activo }: ActivoAuditoriaTabProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col gap-4">
      <h3 className="font-heading text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
        <ShieldCheck className="size-4.5 text-amber-500" />
        Metadatos & Registro de Auditoría
      </h3>

      <div className="p-3 bg-muted/20 rounded-xl border border-border/60">
        <AuditInfo data={activo} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <div className="p-3.5 rounded-xl border border-border/60 bg-muted/15 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            ID del Registro (UUID)
          </span>
          <span className="font-mono text-xs text-foreground select-all">
            {activo.id}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-border/60 bg-muted/15 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            Tipo de Activo ID
          </span>
          <span className="font-mono text-xs text-foreground select-all">
            {activo.tipoActivoId}
          </span>
        </div>
      </div>
    </div>
  )
}

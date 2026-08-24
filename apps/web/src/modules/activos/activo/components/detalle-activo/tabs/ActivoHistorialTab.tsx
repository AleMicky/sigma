import { History, Wrench } from "lucide-react"

import type { Activo } from "@/modules/activos/activo/api/activo.service"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { Badge } from "@/shared/components/ui/badge"

type ActivoHistorialTabProps = {
  activo: Activo
  tipoActivo?: TipoActivo | null
}

export function ActivoHistorialTab({
  activo,
  tipoActivo,
}: ActivoHistorialTabProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <History className="size-5 text-primary" />
          <h3 className="font-heading text-sm sm:text-base font-bold text-foreground">
            Bitácora de Mantenimiento & Trazabilidad
          </h3>
        </div>
      </div>

      {/* Integration Notice Card */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-950 dark:text-amber-200">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
          <Wrench className="size-4" />
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="text-xs font-bold">
            Módulo en proceso de integración
          </span>
          <p className="text-xs text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
            El registro de mantenimientos preventivos/correctivos y la trazabilidad de asignación y uso de vehículos se integrarán próximamente con los respectivos servicios operativos.
          </p>
        </div>
      </div>

      {/* Real Asset Timeline */}
      <div className="relative pl-6 border-l border-border/80 space-y-6 my-2">
        {/* Alta event */}
        <div className="relative">
          <span className="absolute -left-[31px] top-1 size-3.5 rounded-full bg-emerald-500 ring-4 ring-background" />
          <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-border/70 bg-muted/15">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Alta y Registro en el Catálogo
                </span>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]"
                >
                  Registrado
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                {activo.createdAt
                  ? new Date(activo.createdAt).toLocaleString("es-ES")
                  : "Reciente"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Se dio de alta formalmente el activo{" "}
              <strong className="text-foreground">"{activo.nombre}"</strong> con código{" "}
              <code className="text-xs font-mono font-bold text-foreground">[{activo.codigo}]</code>{" "}
              bajo el tipo "{tipoActivo?.nombre || "General"}".
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { History } from "lucide-react"

import type { Activo } from "@/modules/activos/activo/api/activo.service"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { cn } from "@/shared/lib/utils"

import type { MantenimientoItem } from "../types"

type ActivoHistorialTabProps = {
  activo: Activo
  tipoActivo?: TipoActivo | null
  mantenimientos: MantenimientoItem[]
}

export function ActivoHistorialTab({
  activo,
  tipoActivo,
  mantenimientos,
}: ActivoHistorialTabProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <History className="size-5 text-primary" />
          <h3 className="font-heading text-sm sm:text-base font-bold text-foreground">
            Bitácora de Mantenimiento & Trazabilidad
          </h3>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-6 border-l border-border/80 space-y-6 my-2">
        {mantenimientos.map((maint) => (
          <div key={maint.id} className="relative">
            <span
              className={cn(
                "absolute -left-[31px] top-1 size-3.5 rounded-full ring-4 ring-background",
                maint.tipo === "preventivo"
                  ? "bg-amber-500"
                  : maint.tipo === "correctivo"
                  ? "bg-destructive"
                  : "bg-primary",
              )}
            />
            <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-border/70 bg-muted/15">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    {maint.titulo}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.2 rounded-md uppercase",
                      maint.tipo === "preventivo"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        : maint.tipo === "correctivo"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-primary/15 text-primary",
                    )}
                  >
                    {maint.tipo}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {maint.fecha}
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {maint.observaciones}
              </p>

              <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                {maint.kilometraje && (
                  <span>
                    Odómetro:{" "}
                    <strong className="text-foreground">
                      {maint.kilometraje}
                    </strong>
                  </span>
                )}
                <span>
                  Responsable:{" "}
                  <strong className="text-foreground">
                    {maint.responsable}
                  </strong>
                </span>
                {maint.costo && (
                  <span>
                    Costo:{" "}
                    <strong className="text-foreground">{maint.costo}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Alta event */}
        <div className="relative">
          <span className="absolute -left-[31px] top-1 size-3.5 rounded-full bg-emerald-500 ring-4 ring-background" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                Alta y Registro en el Catálogo
              </span>
              <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                {activo.createdAt
                  ? new Date(activo.createdAt).toLocaleString("es-ES")
                  : "Reciente"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Se registró formalmente el activo "{activo.nombre}" bajo el tipo "
              {tipoActivo?.nombre || "General"}".
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

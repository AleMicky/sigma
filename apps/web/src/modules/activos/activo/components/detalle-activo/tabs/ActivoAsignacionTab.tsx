import { FileText, History, UserCheck } from "lucide-react"
import { toast } from "sonner"

import type { Activo } from "@/modules/activos/activo/api/activo.service"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { Button } from "@/shared/components/ui/button"

type ActivoAsignacionTabProps = {
  activo: Activo
  ubicacion?: Ubicacion | null
}

export function ActivoAsignacionTab({
  activo,
  ubicacion,
}: ActivoAsignacionTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Current Custodio / Responsable */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="size-5 text-emerald-500" />
            <h3 className="font-heading text-sm sm:text-base font-bold text-foreground">
              Custodio y Responsable Actual
            </h3>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            Custodia Activa
          </span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
              CM
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                Responsable Directo
              </span>
              <span className="font-heading text-base font-bold text-foreground">
                Ing. Carlos Mendoza R.
              </span>
              <span className="text-xs text-muted-foreground">
                Supervisor de Mantenimiento & Flota · Sede{" "}
                {ubicacion?.nombre || "Planta Principal"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.info("Generando acta de custodia...")}
              className="h-8 text-xs font-semibold"
            >
              <FileText className="size-3.5" />
              Ver Acta de Entrega
            </Button>
          </div>
        </div>
      </div>

      {/* Assignment Timeline */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <h3 className="font-heading text-sm sm:text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <History className="size-4 text-primary" />
          Historial de Responsables y Traspasos
        </h3>

        <div className="relative pl-6 border-l border-border/80 space-y-4 my-2">
          <div className="relative">
            <span className="absolute -left-[31px] top-1 size-3.5 rounded-full bg-emerald-500 ring-4 ring-background" />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Asignación Formal a Ing. Carlos Mendoza R.
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  15/01/2025
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Entrega de llaves, ficha técnica y acta de responsabilidad para
                operación en {ubicacion?.nombre || "Sede Principal"}.
              </p>
            </div>
          </div>

          <div className="relative">
            <span className="absolute -left-[31px] top-1 size-3.5 rounded-full bg-primary ring-4 ring-background" />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Recepción de Adquisición en Almacén Central
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {activo.createdAt
                    ? new Date(activo.createdAt).toLocaleDateString("es-ES")
                    : "Reciente"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ingreso inicial del activo con código institucional{" "}
                <span className="font-mono text-foreground font-semibold">
                  {activo.codigo}
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

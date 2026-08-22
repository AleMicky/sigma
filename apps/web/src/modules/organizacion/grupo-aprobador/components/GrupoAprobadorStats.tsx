import { GitMerge, Layers, ShieldCheck } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent } from "@/shared/components/ui/card"

type GrupoAprobadorStatsProps = {
  totalGrupos?: number
  totalPasosSelected?: number
  selectedGrupoNombre?: string | null
}

export function GrupoAprobadorStats({
  totalGrupos = 0,
  totalPasosSelected,
  selectedGrupoNombre,
}: GrupoAprobadorStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-2 px-4 pt-2.5 sm:grid-cols-3 sm:px-6 md:px-8">
      {/* Total Grupos */}
      <Card className="border-border/60 bg-gradient-to-br from-background via-muted/20 to-muted/30 shadow-2xs">
        <CardContent className="flex items-center gap-2.5 p-2 sm:p-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">
              Total Grupos
            </p>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-heading text-sm sm:text-base font-bold text-foreground">
                {totalGrupos}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                flujos de aprobación
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pasos en Selección */}
      <Card className="border-border/60 bg-gradient-to-br from-background via-muted/20 to-muted/30 shadow-2xs">
        <CardContent className="flex items-center gap-2.5 p-2 sm:p-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs">
            <Layers className="size-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">
              Pasos del Grupo
            </p>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-heading text-sm sm:text-base font-bold text-foreground">
                {totalPasosSelected ?? "—"}
              </span>
              {selectedGrupoNombre ? (
                <span className="truncate text-[10px] font-medium text-blue-600 dark:text-blue-400">
                  en {selectedGrupoNombre}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground truncate">
                  sin grupo seleccionado
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado del Flujo */}
      <Card className="border-border/60 bg-gradient-to-br from-background via-muted/20 to-muted/30 shadow-2xs">
        <CardContent className="flex items-center gap-2.5 p-2 sm:p-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
            <GitMerge className="size-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">
              Secuencia Aprobatoria
            </p>
            <div className="flex items-center gap-1.5 leading-none">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0 font-medium h-4"
              >
                Activo
              </Badge>
              <span className="text-[10px] text-muted-foreground truncate">
                jerárquico / escalonado
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Award, ShieldCheck, Users } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent } from "@/shared/components/ui/card"

type ResponsabilidadStatsProps = {
  totalResponsabilidades?: number
  totalAsignadosSelected?: number
  selectedResponsabilidadNombre?: string | null
}

export function ResponsabilidadStats({
  totalResponsabilidades = 0,
  totalAsignadosSelected,
  selectedResponsabilidadNombre,
}: ResponsabilidadStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-2 px-4 pt-2.5 sm:grid-cols-3 sm:px-6 md:px-8">
      {/* Total Responsabilidades */}
      <Card className="border-border/60 bg-gradient-to-br from-background via-muted/20 to-muted/30 shadow-2xs">
        <CardContent className="flex items-center gap-2.5 p-2 sm:p-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            <Award className="size-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">
              Total Responsabilidades
            </p>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-heading text-sm sm:text-base font-bold text-foreground">
                {totalResponsabilidades}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                roles configurados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colaboradores Asignados */}
      <Card className="border-border/60 bg-gradient-to-br from-background via-muted/20 to-muted/30 shadow-2xs">
        <CardContent className="flex items-center gap-2.5 p-2 sm:p-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
            <Users className="size-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">
              Colaboradores Asignados
            </p>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-heading text-sm sm:text-base font-bold text-foreground">
                {totalAsignadosSelected ?? "—"}
              </span>
              {selectedResponsabilidadNombre ? (
                <span className="truncate text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  en {selectedResponsabilidadNombre}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground truncate">
                  sin rol seleccionado
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Institucional */}
      <Card className="border-border/60 bg-gradient-to-br from-background via-muted/20 to-muted/30 shadow-2xs">
        <CardContent className="flex items-center gap-2.5 p-2 sm:p-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-2xs">
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">
              Control Institucional
            </p>
            <div className="flex items-center gap-1.5 leading-none">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0 font-medium h-4"
              >
                Estructura Activa
              </Badge>
              <span className="text-[10px] text-muted-foreground truncate">
                roles transversales
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

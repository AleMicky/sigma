import { Link } from "@tanstack/react-router"
import { ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react"

import { routes } from "@/app/config"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { buttonVariants } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import type { AlertaLicenciaConductor } from "../types/gestion-vehicular-dashboard.types"

interface AlertasLicenciasCardProps {
  alertas: AlertaLicenciaConductor[]
  isLoading?: boolean
}

export const AlertasLicenciasCard = ({
  alertas,
  isLoading,
}: AlertasLicenciasCardProps) => {
  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <div className="h-6 w-44 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="h-44 flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted/40 animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 shadow-xs flex flex-col justify-between">
      <CardHeader className="p-3.5 pb-2 flex flex-row items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-3.5 w-3.5" />
            </div>
            <CardTitle className="text-sm sm:text-base font-semibold">
              Alertas de Licencias de Conducir
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Documentación vencida o próxima a expirar (&le; 30 días)
          </CardDescription>
        </div>

        <Link
          to={routes.gestionVehicular.configuraciones.conductores}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-7 text-xs gap-1 text-rose-600 hover:text-rose-700 px-2"
          )}
        >
          <span>Gestionar</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-3.5 pt-0">
        {alertas.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Todas las licencias están al día
              </p>
              <p className="text-[11px] text-muted-foreground">
                No hay conductores con licencias vencidas ni próximas a expirar en los próximos 30 días
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alertas.map((alerta) => {
              const isVencida = alerta.diasRestantes < 0
              const isCritica = alerta.diasRestantes >= 0 && alerta.diasRestantes <= 7

              return (
                <div
                  key={`${alerta.conductorId}-${alerta.numeroLicencia}`}
                  className="p-2.5 rounded-lg border border-border/60 bg-background/50 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {alerta.conductorNombre}
                      </span>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        Cat. {alerta.categoria || "-"}
                      </Badge>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        N° {alerta.numeroLicencia}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Vence: <strong className="text-foreground">{alerta.fechaVencimiento}</strong>
                    </p>
                  </div>

                  <div className="shrink-0">
                    {isVencida ? (
                      <Badge className="bg-rose-500 text-white font-bold text-[10px]">
                        VENCIDA HACE {Math.abs(alerta.diasRestantes)} DÍAS
                      </Badge>
                    ) : isCritica ? (
                      <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 font-bold text-[10px] animate-pulse">
                        VENCE EN {alerta.diasRestantes} DÍAS
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px]">
                        VENCE EN {alerta.diasRestantes} DÍAS
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

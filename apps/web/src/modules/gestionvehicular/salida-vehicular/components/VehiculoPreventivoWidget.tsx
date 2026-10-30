import { useMemo } from "react"
import { AlertTriangle, CalendarClock, CheckCircle2, Gauge, Wrench } from "lucide-react"

import { useProgramacionesByActivo } from "@/modules/mantenimientos/programacion-mantenimiento/api/programacion-mantenimiento.queries"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

interface VehiculoPreventivoWidgetProps {
  activoId?: string | null
  variant?: "badge" | "card" | "inline"
  className?: string
}

export function VehiculoPreventivoWidget({
  activoId,
  variant = "card",
  className,
}: VehiculoPreventivoWidgetProps) {
  const { data: programaciones, isLoading } = useProgramacionesByActivo(activoId ?? undefined)

  const info = useMemo(() => {
    if (!programaciones || programaciones.length === 0) return null

    // Buscar la programación activa
    const activa = programaciones.find((p) => p.activo)
    if (!activa) return null

    const planNombre = activa.planActivo?.planNombre ?? "Plan Preventivo"
    const kmCriterio = activa.criterios?.find(
      (c) => c.activo && c.tipoCriterio === "KILOMETRAJE"
    )
    const tiempoCriterio = activa.criterios?.find(
      (c) => c.activo && c.tipoCriterio === "TIEMPO"
    )

    let estado: "AL_DIA" | "PROXIMO" | "REQUIERE_SERVICIO" = "AL_DIA"
    let detalle = ""
    let kmActual: number | null = null
    let kmProximo: number | null = null
    let kmRestante: number | null = null

    if (kmCriterio) {
      kmActual = kmCriterio.valorActualUso ?? null
      kmProximo = kmCriterio.proximoValorUso ?? null
      if (kmProximo !== null && kmActual !== null) {
        kmRestante = kmProximo - kmActual
        if (kmActual >= kmProximo) {
          estado = "REQUIERE_SERVICIO"
          detalle = `Límite superado por ${Math.abs(kmRestante).toLocaleString()} km`
        } else if (kmRestante <= 500) {
          estado = "PROXIMO"
          detalle = `Faltan ${kmRestante.toLocaleString()} km para el servicio`
        } else {
          detalle = `Próximo a los ${kmProximo.toLocaleString()} km (faltan ${kmRestante.toLocaleString()} km)`
        }
      }
    }

    if (tiempoCriterio && tiempoCriterio.proximaFecha) {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const fechaProx = new Date(tiempoCriterio.proximaFecha)
      const diffDias = Math.ceil((fechaProx.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDias <= 0 && estado !== "REQUIERE_SERVICIO") {
        estado = "REQUIERE_SERVICIO"
        detalle = `Fecha límite alcanzada (${tiempoCriterio.proximaFecha})`
      } else if (diffDias <= 7 && estado === "AL_DIA") {
        estado = "PROXIMO"
        detalle = `Vence en ${diffDias} día${diffDias === 1 ? "" : "s"}`
      }
    }

    return {
      planNombre,
      estado,
      detalle,
      kmActual,
      kmProximo,
      kmRestante,
    }
  }, [programaciones])

  if (isLoading || !info) {
    return null
  }

  if (variant === "badge") {
    if (info.estado === "REQUIERE_SERVICIO") {
      return (
        <Badge
          variant="destructive"
          className={cn("gap-1 text-[10px] font-medium py-0 px-1.5", className)}
        >
          <AlertTriangle className="size-3 shrink-0" />
          Requiere Preventivo
        </Badge>
      )
    }
    if (info.estado === "PROXIMO") {
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1 text-[10px] font-medium py-0 px-1.5 border-amber-500/40 text-amber-600 bg-amber-500/10",
            className
          )}
        >
          <Wrench className="size-3 shrink-0" />
          Preventivo Próximo
        </Badge>
      )
    }
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1 text-[10px] font-medium py-0 px-1.5 border-emerald-500/40 text-emerald-600 bg-emerald-500/10",
          className
        )}
      >
        <CheckCircle2 className="size-3 shrink-0" />
        Preventivo al Día
      </Badge>
    )
  }

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded border",
          info.estado === "REQUIERE_SERVICIO"
            ? "border-destructive/30 bg-destructive/10 text-destructive font-medium"
            : info.estado === "PROXIMO"
            ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            : "border-border/60 bg-muted/30 text-muted-foreground",
          className
        )}
      >
        <Gauge className="size-3 shrink-0" />
        <span className="font-semibold">{info.planNombre}:</span>
        <span>{info.detalle}</span>
      </div>
    )
  }

  // variant === "card"
  const isDanger = info.estado === "REQUIERE_SERVICIO"
  const isWarning = info.estado === "PROXIMO"

  return (
    <div
      className={cn(
        "p-3 rounded-xl border space-y-2 transition-all",
        isDanger
          ? "bg-destructive/10 border-destructive/30 text-destructive"
          : isWarning
          ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300"
          : "bg-muted/20 border-border/50 text-foreground",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 text-muted-foreground">
          <CalendarClock className="size-3.5 text-primary" />
          Mantenimiento Preventivo
        </span>
        <Badge
          variant={isDanger ? "destructive" : isWarning ? "outline" : "outline"}
          className={cn(
            "text-[10px] font-bold py-0 px-1.5",
            isWarning && "border-amber-500/40 text-amber-600 bg-amber-500/10",
            !isDanger && !isWarning && "border-emerald-500/40 text-emerald-600 bg-emerald-500/10"
          )}
        >
          {isDanger ? "Requiere Servicio" : isWarning ? "Próximo a Vencer" : "Al Día"}
        </Badge>
      </div>

      <div className="space-y-1">
        <p className="font-semibold text-xs text-foreground leading-tight">
          {info.planNombre}
        </p>
        <p className="text-[11px] text-muted-foreground leading-snug">
          {info.detalle}
        </p>
      </div>

      {info.kmProximo !== null && (
        <div className="pt-1.5 border-t border-border/40 grid grid-cols-2 gap-2 text-[10.5px] font-mono">
          <div>
            <span className="text-muted-foreground block text-[9.5px]">Odómetro actual</span>
            <span className="font-bold text-foreground">
              {info.kmActual !== null ? `${info.kmActual.toLocaleString()} km` : "Sin datos"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[9.5px]">Próximo límite</span>
            <span className="font-bold text-foreground">
              {`${info.kmProximo.toLocaleString()} km`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

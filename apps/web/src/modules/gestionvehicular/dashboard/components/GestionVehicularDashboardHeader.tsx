import { Link } from "@tanstack/react-router"
import {
  Fuel,
  History,
  LayoutDashboard,
  RefreshCw,
} from "lucide-react"

import { Button, buttonVariants } from "@/shared/components/ui/button"
import { routes } from "@/app/config"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { cn } from "@/shared/lib/utils"

interface GestionVehicularDashboardHeaderProps {
  meses: number
  onMesesChange: (meses: number) => void
  onRefresh: () => void
  isFetching?: boolean
}

export const GestionVehicularDashboardHeader = ({
  meses,
  onMesesChange,
  onRefresh,
  isFetching,
}: GestionVehicularDashboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-2 border-b border-border/50">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-xs">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dashboard de Gestión Vehicular
            </h1>
            <span className="inline-flex items-center rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
              Panel de Consulta
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Métricas de flota, control de viajes activos, consumo de combustible y alertas operativas
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border">
          <span className="text-xs font-medium text-muted-foreground pl-2 hidden sm:inline">
            Periodo:
          </span>
          <Select
            value={String(meses)}
            onValueChange={(val) => onMesesChange(Number(val))}
          >
            <SelectTrigger className="h-8 w-[145px] text-xs font-medium bg-background">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Últimos 3 meses</SelectItem>
              <SelectItem value="6">Últimos 6 meses</SelectItem>
              <SelectItem value="12">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
          className="h-9 px-3 gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-cyan-500" : ""}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>

        <Link
          to={routes.gestionVehicular.reportes.historialViajes}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 px-3 text-xs gap-1.5 hidden md:flex")}
        >
          <History className="h-3.5 w-3.5 text-emerald-500" />
          <span>Historial Viajes</span>
        </Link>

        <Link
          to={routes.gestionVehicular.reportes.consumoCombustible}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 px-3 text-xs gap-1.5 hidden md:flex")}
        >
          <Fuel className="h-3.5 w-3.5 text-amber-500" />
          <span>Combustible</span>
        </Link>
      </div>
    </div>
  )
}

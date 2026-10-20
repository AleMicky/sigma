import {
  Car,
  Clock,
  Coins,
  Droplet,
  Fuel,
  Navigation,
  User,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { formatDate } from "@/shared/lib/format-date"
import type { CargaCombustible } from "../api/carga-combustible.service"

export interface ConsumoCombustibleDetalleDialogProps {
  carga: CargaCombustible | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConsumoCombustibleDetalleDialog({
  carga,
  open,
  onOpenChange,
}: Readonly<ConsumoCombustibleDetalleDialogProps>) {
  if (!carga) return null

  const precioPorLitro =
    carga.litros > 0 ? (carga.precioTotal / carga.litros).toFixed(2) : "0.00"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/40 pb-3">
          <div className="flex items-center justify-between gap-4 pr-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Fuel className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Detalle de Carga de Combustible
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Comprobante: {carga.numeroFactura || "Sin número registrado"}
                </DialogDescription>
              </div>
            </div>

            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs">
              Recarga Registrada
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* Métricas Principales */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Droplet className="h-3 w-3 text-sky-500" />
                Volumen
              </span>
              <p className="text-base font-bold text-sky-600 dark:text-sky-400">
                {Number(carga.litros).toLocaleString("es-BO", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <span className="text-xs font-normal">L</span>
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Coins className="h-3 w-3 text-emerald-500" />
                Importe Total
              </span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {Number(carga.precioTotal).toLocaleString("es-BO", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <span className="text-xs font-normal">Bs.</span>
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Fuel className="h-3 w-3 text-indigo-500" />
                Precio / Litro
              </span>
              <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                {precioPorLitro}{" "}
                <span className="text-xs font-normal">Bs./L</span>
              </p>
            </div>
          </div>

          {/* Vehículo e Insumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border/50 space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Car className="h-4 w-4 text-primary" />
                <span>Vehículo Asignado</span>
              </div>
              <div className="pl-5 space-y-1 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Nombre:</strong>{" "}
                  {carga.activo?.nombre || "No especificado"}
                </p>
                <p>
                  <strong className="text-foreground">Código / Placa:</strong>{" "}
                  <span className="font-mono">{carga.activo?.codigo || "S/C"}</span>
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border/50 space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Fuel className="h-4 w-4 text-amber-500" />
                <span>Tipo de Combustible</span>
              </div>
              <div className="pl-5 space-y-1 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Insumo:</strong>{" "}
                  {carga.insumo?.nombre || "Combustible"}
                </p>
                <p>
                  <strong className="text-foreground">Código Insumo:</strong>{" "}
                  <span className="font-mono">{carga.insumo?.codigo || "S/C"}</span>
                </p>
                {carga.insumo?.unidadMedida && (
                  <p>
                    <strong className="text-foreground">Unidad:</strong>{" "}
                    {carga.insumo.unidadMedida}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Responsable y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border/50 space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <User className="h-4 w-4 text-blue-500" />
                <span>Responsable de Carga</span>
              </div>
              <div className="pl-5 space-y-1 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Empleado:</strong>{" "}
                  {carga.empleado?.nombreCompleto || "No registrado"}
                </p>
                {carga.empleado?.cargo && (
                  <p>
                    <strong className="text-foreground">Cargo:</strong>{" "}
                    {carga.empleado.cargo}
                  </p>
                )}
                {carga.empleado?.codigo && (
                  <p>
                    <strong className="text-foreground">Código Emp.:</strong>{" "}
                    <span className="font-mono">{carga.empleado.codigo}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border/50 space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Clock className="h-4 w-4 text-emerald-500" />
                <span>Fecha y Facturación</span>
              </div>
              <div className="pl-5 space-y-1 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Fecha de Carga:</strong>{" "}
                  {carga.fechaCarga ? formatDate(carga.fechaCarga) : "S/F"}
                </p>
                <p>
                  <strong className="text-foreground">Nº Factura / Vale:</strong>{" "}
                  {carga.numeroFactura || "Sin número"}
                </p>
                {carga.viajeVehicularId && (
                  <p className="flex items-center gap-1">
                    <Navigation className="h-3 w-3 text-sky-500" />
                    <strong className="text-foreground">Viaje Asociado:</strong>{" "}
                    <span className="font-mono text-[11px] truncate">
                      {carga.viajeVehicularId}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-border/40">
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

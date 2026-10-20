import {
  Activity,
  Layers,
  MapPin,
  Tag,
} from "lucide-react"

import type { Activo } from "@/modules/activos/activo/api/activo.service"
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

export interface DisponibilidadActivoDetalleDialogProps {
  activo: Activo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCambiarEstado?: (activo: Activo) => void
}

export function DisponibilidadActivoDetalleDialog({
  activo,
  open,
  onOpenChange,
  onCambiarEstado,
}: Readonly<DisponibilidadActivoDetalleDialogProps>) {
  if (!activo) return null

  const estadoColor = activo.estadoOperativo?.color || "#6B7280"
  const estadoNombre = activo.estadoOperativo?.nombre || "Sin Estado"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/40 pb-3">
          <div className="flex items-center justify-between gap-4 pr-6">
            <div className="flex items-center gap-2.5">
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: `${estadoColor}15`,
                  color: estadoColor,
                }}
              >
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  {activo.nombre}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-mono">
                  Código: {activo.codigo}
                </DialogDescription>
              </div>
            </div>

            <Badge
              className="text-xs font-medium px-2.5 py-0.5 border"
              style={{
                backgroundColor: `${estadoColor}15`,
                color: estadoColor,
                borderColor: `${estadoColor}40`,
              }}
            >
              ● {estadoNombre}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* Imagen si existe */}
          {activo.urlImagen && (
            <div className="w-full h-48 rounded-lg overflow-hidden border border-border/50 bg-muted/30 flex items-center justify-center">
              <img
                src={activo.urlImagen}
                alt={activo.nombre}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Información Técnica y Clasificación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border/50 space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Tag className="h-4 w-4 text-primary" />
                <span>Clasificación del Activo</span>
              </div>
              <div className="pl-5 space-y-1 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Tipo de Activo:</strong>{" "}
                  {activo.tipoActivo?.nombre || "No especificado"}
                </p>
                {activo.tipoActivo?.descripcion && (
                  <p className="text-[11px]">
                    {activo.tipoActivo.descripcion}
                  </p>
                )}
                <p>
                  <strong className="text-foreground">Estado Registro:</strong>{" "}
                  <Badge variant={activo.activo ? "default" : "secondary"} className="text-[10px] ml-1">
                    {activo.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border/50 space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <MapPin className="h-4 w-4 text-rose-500" />
                <span>Ubicación y Asignación</span>
              </div>
              <div className="pl-5 space-y-1 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Ubicación Física:</strong>{" "}
                  {activo.ubicacion?.nombre || "Sin ubicación asignada"}
                </p>
                {activo.ubicacion?.codigo && (
                  <p>
                    <strong className="text-foreground">Código Ubicación:</strong>{" "}
                    <span className="font-mono">{activo.ubicacion.codigo}</span>
                  </p>
                )}
                <p>
                  <strong className="text-foreground">Fecha Adquisición:</strong>{" "}
                  {activo.fechaAdquisicion ? formatDate(activo.fechaAdquisicion) : "No registrada"}
                </p>
              </div>
            </div>
          </div>

          {/* Descripción técnica */}
          {activo.descripcion && (
            <div className="p-3 rounded-lg border border-border/50 space-y-1.5">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                Descripción y Observaciones
              </span>
              <p className="text-muted-foreground leading-relaxed pl-5">
                {activo.descripcion}
              </p>
            </div>
          )}

          {/* Estado Operativo Detalle */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1.5">
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Condición Operativa Actual
            </span>
            <div className="pl-5 space-y-1 text-muted-foreground">
              <p>
                <strong className="text-foreground">Estado:</strong>{" "}
                <span className="font-semibold" style={{ color: estadoColor }}>
                  {estadoNombre}
                </span>
              </p>
              {activo.estadoOperativo?.descripcion && (
                <p className="text-[11px] italic">
                  {activo.estadoOperativo.descripcion}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          {onCambiarEstado && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onCambiarEstado(activo)
              }}
              className="text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Activity className="h-3.5 w-3.5" />
              Cambiar Estado Operativo
            </Button>
          )}

          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)} className="ml-auto">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

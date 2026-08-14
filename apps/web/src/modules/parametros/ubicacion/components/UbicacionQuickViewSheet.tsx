import { Edit2, ExternalLink, MapPin, Navigation, Network } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"

import type { Ubicacion } from "../api/ubicacion.service"
import { TIPO_UBICACION_CONFIG, TipoUbicacionBadge } from "./TipoUbicacionBadge"
import { UbicacionMapPreview } from "./map/UbicacionMapPreview"

type UbicacionQuickViewSheetProps = {
  ubicacion: Ubicacion | null
  parentLocation?: Ubicacion | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (ubicacion: Ubicacion) => void
}

export function UbicacionQuickViewSheet({
  ubicacion,
  parentLocation,
  open,
  onOpenChange,
  onEdit,
}: UbicacionQuickViewSheetProps) {
  if (!ubicacion) return null

  const config = TIPO_UBICACION_CONFIG[ubicacion.tipo] || TIPO_UBICACION_CONFIG.OTRO
  const Icon = config.icon

  const hasCoords = ubicacion.latitud !== null && ubicacion.longitud !== null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col justify-between overflow-hidden">
        <div className="flex flex-col min-h-0 flex-1 overflow-y-auto">
          {/* Header Banner */}
          <div
            className="relative px-6 pt-6 pb-6 flex flex-col items-center justify-center border-b bg-muted/30 gap-3 text-center"
            style={{
              background: `linear-gradient(135deg, ${config.color}15 0%, ${config.color}05 100%)`,
            }}
          >
            <div
              className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-border/60 shadow-md"
              style={{ backgroundColor: `${config.color}20`, color: config.color }}
            >
              <Icon className="size-8" />
            </div>

            <div className="flex flex-col items-center gap-1.5 min-w-0 w-full px-2">
              <div className="flex items-center gap-2">
                <code className="rounded bg-background/80 border border-border/60 px-2 py-0.5 font-mono text-xs font-semibold text-foreground shadow-2xs">
                  {ubicacion.codigo}
                </code>
                <TipoUbicacionBadge tipo={ubicacion.tipo} />
              </div>

              <SheetTitle className="text-xl font-bold truncate mt-1">
                {ubicacion.nombre}
              </SheetTitle>
            </div>
          </div>

          <SheetHeader className="px-6 pt-4 pb-2">
            <SheetDescription className="text-sm text-foreground/80 leading-relaxed">
              {ubicacion.descripcion || "Sin descripción registrada."}
            </SheetDescription>
          </SheetHeader>

          {/* Details List */}
          <div className="px-6 py-4 flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Detalles de la Ubicación
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Parent Location */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-card">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Network className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-muted-foreground">
                    Ubicación Padre
                  </span>
                  <span className="text-sm font-medium truncate">
                    {parentLocation ? parentLocation.nombre : "Nodo Raíz (Sin padre)"}
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-card">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <MapPin className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-muted-foreground">
                    Dirección Física
                  </span>
                  <span className="text-sm font-medium truncate">
                    {ubicacion.direccion || "No especificada"}
                  </span>
                </div>
              </div>

              {/* Mini Map Preview */}
              {hasCoords ? (
                <div className="flex flex-col gap-2 p-3 rounded-xl border border-border/80 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation className="size-4 text-purple-500" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Coordenadas: {ubicacion.latitud}, {ubicacion.longitud}
                      </span>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${ubicacion.latitud},${ubicacion.longitud}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="size-3" />
                      Google Maps
                    </a>
                  </div>

                  <UbicacionMapPreview
                    latitud={ubicacion.latitud!}
                    longitud={ubicacion.longitud!}
                    tipo={ubicacion.tipo}
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* Audit Metadata */}
          <div className="px-6 py-4 mt-auto border-t bg-muted/20">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Información de Auditoría
            </h4>
            <AuditInfo data={ubicacion} />
          </div>
        </div>

        <SheetFooter className="p-4 border-t bg-card flex-row gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false)
              onEdit(ubicacion)
            }}
            className="flex-1"
          >
            <Edit2 className="size-4" />
            Editar Ubicación
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

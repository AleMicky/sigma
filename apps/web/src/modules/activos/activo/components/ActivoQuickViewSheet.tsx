import { Calendar, Edit2, ImageIcon, MapPin } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"

import type { Activo } from "../api/activo.service"

type ActivoQuickViewSheetProps = {
  activo: Activo | null
  tipoActivo?: TipoActivo | null
  ubicacion?: Ubicacion | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (activo: Activo) => void
}

export function ActivoQuickViewSheet({
  activo,
  tipoActivo,
  ubicacion,
  open,
  onOpenChange,
  onEdit,
}: ActivoQuickViewSheetProps) {
  if (!activo) return null

  const tipoColor = tipoActivo?.color || DEFAULT_TIPO_ACTIVO_COLOR

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col justify-between overflow-hidden">
        <div className="flex flex-col min-h-0 flex-1 overflow-y-auto">
          {/* Top Banner / Image Header */}
          <div
            className="relative px-6 pt-6 pb-6 flex flex-col items-center justify-center border-b bg-muted/30 gap-3 text-center"
            style={{
              background: `linear-gradient(135deg, ${tipoColor}15 0%, ${tipoColor}05 100%)`,
            }}
          >
            <AuthenticatedImage
              src={activo.urlImagen}
              alt={activo.nombre}
              className="size-24 rounded-2xl object-cover shadow-md border border-border/60"
              fallbackClassName="size-24 rounded-2xl bg-card flex items-center justify-center border border-border/60 shadow-xs"
              fallback={<ImageIcon className="size-10 text-muted-foreground/50" />}
            />

            <div className="flex flex-col items-center gap-1 min-w-0 w-full px-2">
              <div className="flex items-center gap-2">
                <code className="rounded bg-background/80 border border-border/60 px-2 py-0.5 font-mono text-xs font-semibold text-foreground shadow-2xs">
                  {activo.codigo}
                </code>
                {tipoActivo ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-background/80 text-foreground border border-border/60">
                    <span
                      aria-hidden
                      className="size-2 rounded-full"
                      style={{ backgroundColor: tipoColor }}
                    />
                    {tipoActivo.nombre}
                  </span>
                ) : null}
              </div>

              <SheetTitle className="text-xl font-bold truncate mt-1">
                {activo.nombre}
              </SheetTitle>
            </div>
          </div>

          <SheetHeader className="px-6 pt-4 pb-2">
            <SheetDescription className="text-sm text-foreground/80 leading-relaxed">
              {activo.descripcion || "Sin descripción registrada."}
            </SheetDescription>
          </SheetHeader>

          {/* Asset Meta Info List */}
          <div className="px-6 py-4 flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Detalles del Activo
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-card">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <MapPin className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-muted-foreground">Ubicación</span>
                  <span className="text-sm font-medium truncate">
                    {ubicacion?.nombre || "Sin ubicación asignada"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-card">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Calendar className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-muted-foreground">Fecha de Adquisición</span>
                  <span className="text-sm font-medium">
                    {activo.fechaAdquisicion
                      ? new Date(activo.fechaAdquisicion).toLocaleDateString("es-ES")
                      : "No registrada"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Metadata */}
          <div className="px-6 py-4 mt-auto border-t bg-muted/20">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Información de Auditoría
            </h4>
            <AuditInfo data={activo} />
          </div>
        </div>

        <SheetFooter className="p-4 border-t bg-card flex-row gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false)
              onEdit(activo)
            }}
            className="flex-1"
          >
            <Edit2 className="size-4" />
            Editar Activo
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

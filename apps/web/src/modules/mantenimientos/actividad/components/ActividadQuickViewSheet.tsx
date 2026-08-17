import { CheckSquare, Globe2, Layers, Pencil, Wrench } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"

import type { ActividadMantenimiento } from "../api/actividad.service"

type ActividadQuickViewSheetProps = {
  actividad: ActividadMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (actividad: ActividadMantenimiento) => void
  onManageAplicaciones?: (actividad: ActividadMantenimiento) => void
}

export function ActividadQuickViewSheet({
  actividad,
  open,
  onOpenChange,
  onEdit,
  onManageAplicaciones,
}: ActividadQuickViewSheetProps) {
  if (!actividad) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center gap-2 text-primary">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Wrench className="size-4" />
            </span>
            <span className="font-mono text-xs font-semibold uppercase">
              {actividad.codigo}
            </span>
          </div>
          <SheetTitle className="font-heading text-lg font-bold">
            {actividad.nombre}
          </SheetTitle>
          <SheetDescription className="text-xs">
            Ficha de especificación de la actividad de mantenimiento.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Reglas de Aplicación */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Alcance y Validación
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Aplicabilidad:</span>
                {actividad.aplicaTodosTiposActivo ? (
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] gap-1">
                    <Globe2 className="size-3" />
                    Universal (Todos los Activos)
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <Layers className="size-3" />
                    Por Tipo de Activo
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Checklist obligatorio:</span>
                {actividad.requiereChecklist ? (
                  <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[10px] gap-1">
                    <CheckSquare className="size-3" />
                    Sí, requiere checklist
                  </Badge>
                ) : (
                  <span className="font-medium text-foreground">No requerido</span>
                )}
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Descripción / Procedimiento
            </p>
            <div className="rounded-lg border border-border/60 bg-card p-3 text-foreground leading-relaxed">
              {actividad.descripcion || (
                <span className="text-muted-foreground/60 italic">
                  No se ha registrado una descripción detallada.
                </span>
              )}
            </div>
          </div>

          {/* Auditoría */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Registro y Auditoría
            </p>
            <AuditInfo data={actividad} />
          </div>
        </div>

        <SheetFooter className="border-t pt-3 flex items-center justify-between gap-2 sm:justify-between">
          {onManageAplicaciones && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onManageAplicaciones(actividad)
              }}
              className="text-xs gap-1.5"
            >
              <Layers className="size-3.5 text-primary" />
              Aplicaciones
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false)
              onEdit(actividad)
            }}
            className="text-xs gap-1.5 ml-auto"
          >
            <Pencil className="size-3.5" />
            Editar Actividad
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

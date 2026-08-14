import {
  Building,
  Building2,
  CornerDownRight,
  FolderTree,
  Grid,
  HelpCircle,
  Layers,
  MapPin,
  Monitor,
  Warehouse,
  Wrench,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

import { TipoUbicacionBadge } from "./TipoUbicacionBadge"

type UbicacionHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UbicacionHelpModal({
  open,
  onOpenChange,
}: UbicacionHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl lg:max-w-3xl max-h-[90vh] p-5 flex flex-col justify-between overflow-hidden">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <HelpCircle className="size-5 text-primary" />
            <span>Guía de Estructuración de Ubicaciones</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Aprende a organizar la jerarquía física de tu organización paso a paso con este ejemplo.
          </DialogDescription>
        </DialogHeader>

        {/* Content Body */}
        <div className="py-4 flex-1 min-h-0 overflow-y-auto flex flex-col gap-5 pr-1">
          {/* Introductory Tip Box */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3.5 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <FolderTree className="size-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="leading-relaxed">
              <strong>¿Cómo funciona la jerarquía recursiva?</strong>
              <p className="mt-0.5 text-muted-foreground dark:text-blue-200/80">
                Cada ubicación puede tener una <strong>"Ubicación Padre"</strong>. Al vincularlas, creas un árbol estructurado desde regiones hasta escritorios u oficinas específicas.
              </p>
            </div>
          </div>

          {/* Hierarchical Structure Example Tree */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ejemplo Recreado de Estructura Recomendada
            </h4>

            <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs font-sans text-xs">
              <div className="flex flex-col gap-2">
                {/* Level 0: Empresa */}
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Building2 className="size-4 text-blue-500" />
                  <span>Empresa Principal</span>
                  <TipoUbicacionBadge tipo="PAIS" />
                  <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                    (Nodo Raíz - Sin Padre)
                  </span>
                </div>

                {/* Level 1: Cochabamba */}
                <div className="ml-4 flex items-center gap-2 font-semibold text-foreground/90 border-l-2 border-primary/40 pl-3 py-1">
                  <CornerDownRight className="size-3.5 text-primary" />
                  <MapPin className="size-4 text-teal-500" />
                  <span>Cochabamba</span>
                  <TipoUbicacionBadge tipo="CIUDAD" />
                  <span className="text-[10px] text-muted-foreground">→ Padre: Empresa</span>
                </div>

                {/* Level 2: Oficina Central */}
                <div className="ml-9 flex items-center gap-2 font-medium text-foreground/80 border-l-2 border-primary/30 pl-3 py-1">
                  <CornerDownRight className="size-3.5 text-primary/70" />
                  <Building className="size-4 text-violet-500" />
                  <span>Oficina Central</span>
                  <TipoUbicacionBadge tipo="SUCURSAL" />
                  <span className="text-[10px] text-muted-foreground">→ Padre: Cochabamba</span>
                </div>

                {/* Level 3: Planta Baja */}
                <div className="ml-14 flex flex-col gap-1.5 border-l-2 border-primary/20 pl-3 py-1">
                  <div className="flex items-center gap-2 font-medium text-foreground/80">
                    <CornerDownRight className="size-3.5 text-primary/60" />
                    <Layers className="size-3.5 text-purple-500" />
                    <span>Planta Baja</span>
                    <TipoUbicacionBadge tipo="PLANTA" />
                    <span className="text-[10px] text-muted-foreground">→ Padre: Oficina Central</span>
                  </div>

                  {/* Level 4: Almacén & Taller under Planta Baja */}
                  <div className="ml-6 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CornerDownRight className="size-3 text-muted-foreground" />
                      <Warehouse className="size-3.5 text-orange-500" />
                      <span className="font-medium text-foreground">Almacén</span>
                      <TipoUbicacionBadge tipo="ALMACEN" />
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CornerDownRight className="size-3 text-muted-foreground" />
                      <Wrench className="size-3.5 text-rose-500" />
                      <span className="font-medium text-foreground">Taller</span>
                      <TipoUbicacionBadge tipo="TALLER" />
                    </div>
                  </div>
                </div>

                {/* Level 3: Primer Piso */}
                <div className="ml-14 flex flex-col gap-1.5 border-l-2 border-primary/20 pl-3 py-1">
                  <div className="flex items-center gap-2 font-medium text-foreground/80">
                    <CornerDownRight className="size-3.5 text-primary/60" />
                    <Layers className="size-3.5 text-purple-500" />
                    <span>Primer Piso</span>
                    <TipoUbicacionBadge tipo="PLANTA" />
                    <span className="text-[10px] text-muted-foreground">→ Padre: Oficina Central</span>
                  </div>

                  {/* Level 4: Sistemas & Administración under Primer Piso */}
                  <div className="ml-6 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CornerDownRight className="size-3 text-muted-foreground" />
                      <Monitor className="size-3.5 text-emerald-500" />
                      <span className="font-medium text-foreground">Sistemas</span>
                      <TipoUbicacionBadge tipo="OFICINA" />
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CornerDownRight className="size-3 text-muted-foreground" />
                      <Grid className="size-3.5 text-amber-500" />
                      <span className="font-medium text-foreground">Administración</span>
                      <TipoUbicacionBadge tipo="AREA" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Steps Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-primary">PASO 1</span>
              <span className="text-xs font-semibold text-foreground">Crear Nodos Raíz</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Crea primero la Empresa o Ciudad seleccionando <em>"Sin ubicación padre (Nodo Raíz)"</em>.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-primary">PASO 2</span>
              <span className="text-xs font-semibold text-foreground">Vincular Sucursales</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Crea el edificio o sucursal seleccionando la Empresa/Ciudad creada como su Ubicación Padre.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-primary">PASO 3</span>
              <span className="text-xs font-semibold text-foreground">Añadir Áreas y Oficinas</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Registra plantas, almacenes u oficinas vinculándolas al piso o edificio correspondiente.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="pt-3 border-t flex flex-row items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cerrar Guía
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

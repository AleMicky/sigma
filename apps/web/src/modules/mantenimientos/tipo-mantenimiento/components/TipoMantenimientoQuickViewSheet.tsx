import { Pencil, Wrench } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"

import type { TipoMantenimiento } from "../api/tipo-mantenimiento.service"

type TipoMantenimientoQuickViewSheetProps = {
  tipoMantenimiento: TipoMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (tipoMantenimiento: TipoMantenimiento) => void
}

export function TipoMantenimientoQuickViewSheet({
  tipoMantenimiento,
  open,
  onOpenChange,
  onEdit,
}: TipoMantenimientoQuickViewSheetProps) {
  if (!tipoMantenimiento) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wrench className="size-5" />
            </span>
            <div>
              <SheetTitle className="text-base font-heading">
                {tipoMantenimiento.nombre}
              </SheetTitle>
              <SheetDescription className="font-mono text-xs text-muted-foreground mt-0.5">
                {tipoMantenimiento.codigo}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5 py-4 text-xs">
          {/* Detail Overview */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Descripción</h4>
            <p className="text-muted-foreground leading-relaxed">
              {tipoMantenimiento.descripcion || "Sin descripción registrada."}
            </p>
          </div>

          {/* Audit Data */}
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
            <h4 className="font-semibold text-foreground">Información del Registro</h4>
            <AuditInfo data={tipoMantenimiento} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false)
              onEdit(tipoMantenimiento)
            }}
            className="gap-1.5 text-xs"
          >
            <Pencil className="size-3.5" />
            Editar Tipo
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

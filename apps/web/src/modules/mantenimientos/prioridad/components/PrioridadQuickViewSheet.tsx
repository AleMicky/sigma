import { AlertCircle, Pencil } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"

import type { Prioridad } from "../api/prioridad.service"

type PrioridadQuickViewSheetProps = {
  prioridad: Prioridad | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (prioridad: Prioridad) => void
}

function getNivelBadgeStyles(nivel: number) {
  switch (nivel) {
    case 5:
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    case 4:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    case 3:
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
    case 2:
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    default:
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  }
}

export function PrioridadQuickViewSheet({
  prioridad,
  open,
  onOpenChange,
  onEdit,
}: PrioridadQuickViewSheetProps) {
  if (!prioridad) return null

  const badgeStyle = getNivelBadgeStyles(prioridad.nivel)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <span className={`flex size-10 items-center justify-center rounded-xl border ${badgeStyle}`}>
              <AlertCircle className="size-5" />
            </span>
            <div>
              <SheetTitle className="text-base font-heading flex items-center gap-2">
                {prioridad.nombre}
                <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-bold ${badgeStyle}`}>
                  Nivel {prioridad.nivel}
                </span>
              </SheetTitle>
              <SheetDescription className="font-mono text-xs text-muted-foreground mt-0.5">
                {prioridad.codigo}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5 py-4 text-xs">
          {/* Detail Overview */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Descripción</h4>
            <p className="text-muted-foreground leading-relaxed">
              {prioridad.descripcion || "Sin descripción registrada."}
            </p>
          </div>

          {/* Audit Data */}
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
            <h4 className="font-semibold text-foreground">Información del Registro</h4>
            <AuditInfo data={prioridad} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false)
              onEdit(prioridad)
            }}
            className="gap-1.5 text-xs"
          >
            <Pencil className="size-3.5" />
            Editar Prioridad
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

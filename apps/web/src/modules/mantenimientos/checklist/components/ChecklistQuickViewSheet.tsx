import { CheckSquare, ListTodo, Pencil, Wrench } from "lucide-react"

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

import type { ChecklistMantenimiento } from "../api/checklist.service"

type ChecklistQuickViewSheetProps = {
  checklist: ChecklistMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (checklist: ChecklistMantenimiento) => void
  onManageItems?: (checklist: ChecklistMantenimiento) => void
}

export function ChecklistQuickViewSheet({
  checklist,
  open,
  onOpenChange,
  onEdit,
  onManageItems,
}: ChecklistQuickViewSheetProps) {
  if (!checklist) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
              <CheckSquare className="size-4" />
            </span>
            <span className="font-mono text-xs font-semibold uppercase">
              {checklist.codigo}
            </span>
          </div>
          <SheetTitle className="font-heading text-lg font-bold">
            {checklist.nombre}
          </SheetTitle>
          <SheetDescription className="text-xs">
            Ficha del checklist de mantenimiento y su actividad vinculada.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Actividad Vinculada */}
          {checklist.actividadMantenimiento && (
            <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Actividad de Mantenimiento Vinculada
              </p>
              <div className="flex items-center gap-2">
                <Wrench className="size-3.5 text-primary" />
                <span className="font-medium text-foreground">
                  {checklist.actividadMantenimiento.nombre}
                </span>
                <code className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                  {checklist.actividadMantenimiento.codigo}
                </code>
              </div>
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Descripción e Instrucciones
            </p>
            <div className="rounded-lg border border-border/60 bg-card p-3 text-foreground leading-relaxed">
              {checklist.descripcion || (
                <span className="text-muted-foreground/60 italic">
                  No se ha registrado una descripción adicional.
                </span>
              )}
            </div>
          </div>

          {/* Auditoría */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Registro y Auditoría
            </p>
            <AuditInfo data={checklist} />
          </div>
        </div>

        <SheetFooter className="border-t pt-3 flex items-center justify-between gap-2 sm:justify-between">
          {onManageItems && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onManageItems(checklist)
              }}
              className="text-xs gap-1.5"
            >
              <ListTodo className="size-3.5 text-primary" />
              Gestionar Ítems
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false)
              onEdit(checklist)
            }}
            className="text-xs gap-1.5 ml-auto"
          >
            <Pencil className="size-3.5" />
            Editar Checklist
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

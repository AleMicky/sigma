import { AuditInfo } from "@/shared/components/audit-info"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import { Calculator, Hash, Pencil, Ruler } from "lucide-react"

import type { UnidadMedida } from "../api/unidad-medida.service"

type UnidadMedidaQuickViewSheetProps = {
  unidadMedida: UnidadMedida | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (unidadMedida: UnidadMedida) => void
}

export function UnidadMedidaQuickViewSheet({
  unidadMedida,
  open,
  onOpenChange,
  onEdit,
}: UnidadMedidaQuickViewSheetProps) {
  if (!unidadMedida) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {unidadMedida.codigo}
            </Badge>
            {unidadMedida.permiteDecimal ? (
              <Badge
                variant="outline"
                className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              >
                <Calculator className="size-3" />
                Decimal
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
              >
                <Hash className="size-3" />
                Entero
              </Badge>
            )}
          </div>
          <SheetTitle className="font-heading text-xl pt-1">
            {unidadMedida.nombre}
          </SheetTitle>
          <SheetDescription>
            Ficha técnica de la unidad de medida utilizada en atributos e inventarios.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Symbol Showcase Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center shadow-xs">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Símbolo Representativo
            </p>
            <div className="font-mono text-4xl font-extrabold text-primary py-2">
              {unidadMedida.simbolo}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Ejemplo de formato:{" "}
              <span className="font-semibold text-foreground">
                {unidadMedida.permiteDecimal ? "125.50" : "125"} {unidadMedida.simbolo}
              </span>
            </p>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Ruler className="size-4 text-primary" />
              Propiedades de la unidad
            </h4>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border bg-muted/20 p-3">
                <span className="text-xs text-muted-foreground block">Código Identificador</span>
                <span className="font-mono font-medium text-foreground">{unidadMedida.codigo}</span>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3">
                <span className="text-xs text-muted-foreground block">Nombre Oficial</span>
                <span className="font-medium text-foreground">{unidadMedida.nombre}</span>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3 col-span-2">
                <span className="text-xs text-muted-foreground block mb-1">Comportamiento numérico</span>
                <div className="flex items-center gap-2">
                  {unidadMedida.permiteDecimal ? (
                    <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                      <Calculator className="size-4" />
                      Admite fracciones decimales (float / double)
                    </span>
                  ) : (
                    <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-1.5">
                      <Hash className="size-4" />
                      Restringido a valores enteros disjuntos (integer)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Section */}
          <div className="pt-2 border-t">
            <AuditInfo data={unidadMedida} />
          </div>
        </div>

        {/* Footer Actions */}
        {onEdit ? (
          <div className="pt-4 border-t flex justify-end">
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false)
                onEdit(unidadMedida)
              }}
              className="gap-2"
            >
              <Pencil className="size-4" />
              Editar Unidad
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

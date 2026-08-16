import { CalendarClock, FileCheck, FileText, Pencil } from "lucide-react"

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

import type { TipoDocumento } from "../api/tipo-documento.service"

type TipoDocumentoQuickViewSheetProps = {
  tipoDocumento: TipoDocumento | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (tipoDocumento: TipoDocumento) => void
}

export function TipoDocumentoQuickViewSheet({
  tipoDocumento,
  open,
  onOpenChange,
  onEdit,
}: TipoDocumentoQuickViewSheetProps) {
  if (!tipoDocumento) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {tipoDocumento.codigo}
            </Badge>
            {tipoDocumento.requiereVencimiento ? (
              <Badge
                variant="outline"
                className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              >
                <CalendarClock className="size-3" />
                Requiere Vencimiento
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              >
                <FileCheck className="size-3" />
                Vigencia Permanente
              </Badge>
            )}
          </div>
          <SheetTitle className="font-heading text-xl pt-1">
            {tipoDocumento.nombre}
          </SheetTitle>
          <SheetDescription>
            Ficha de parametrización del tipo de documento para activos.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Behavior Showcase Card */}
          <div
            className={`rounded-xl border p-4 shadow-2xs ${
              tipoDocumento.requiereVencimiento
                ? "border-amber-500/20 bg-amber-500/5 text-amber-950 dark:text-amber-100"
                : "border-primary/20 bg-primary/5 text-foreground"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  tipoDocumento.requiereVencimiento
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-primary/20 text-primary"
                }`}
              >
                {tipoDocumento.requiereVencimiento ? (
                  <CalendarClock className="size-4" />
                ) : (
                  <FileText className="size-4" />
                )}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Regla de Control Documental
              </p>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              {tipoDocumento.requiereVencimiento
                ? "Este documento exige fecha de vencimiento. El sistema enviará alertas preventivas y controlará caducidades (pólizas, garantías, revisiones)."
                : "Documento permanente sin caducidad. Permite asociar comprobantes históricos y manuales sin activar alertas de vencimiento."}
            </p>
          </div>

          {/* Properties Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              Parámetros de Configuración
            </h4>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border bg-muted/20 p-3">
                <span className="text-xs text-muted-foreground block">Código Identificador</span>
                <span className="font-mono font-medium text-foreground">{tipoDocumento.codigo}</span>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3">
                <span className="text-xs text-muted-foreground block">Nombre Oficial</span>
                <span className="font-medium text-foreground">{tipoDocumento.nombre}</span>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3 col-span-2">
                <span className="text-xs text-muted-foreground block mb-1">Descripción</span>
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {tipoDocumento.descripcion || "Sin descripción adicional especificada."}
                </p>
              </div>
            </div>
          </div>

          {/* Audit Section */}
          <div className="space-y-3 pt-2 border-t">
            <h4 className="text-sm font-semibold text-foreground">
              Datos de Auditoría y Trazabilidad
            </h4>
            <div className="rounded-xl border bg-muted/30 p-3.5">
              <AuditInfo data={tipoDocumento} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {onEdit ? (
          <div className="pt-4 border-t flex justify-end">
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false)
                onEdit(tipoDocumento)
              }}
              className="gap-2"
            >
              <Pencil className="size-4" />
              Editar Tipo de Documento
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

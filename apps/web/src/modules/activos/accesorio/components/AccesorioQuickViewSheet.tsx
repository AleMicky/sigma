import { FolderTree, Paperclip, Pencil } from "lucide-react"

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

import type { Accesorio } from "../api/accesorio.service"

type AccesorioQuickViewSheetProps = {
  accesorio: Accesorio | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (accesorio: Accesorio) => void
}

export function AccesorioQuickViewSheet({
  accesorio,
  open,
  onOpenChange,
  onEdit,
}: AccesorioQuickViewSheetProps) {
  if (!accesorio) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {accesorio.codigo}
            </Badge>
            {accesorio.catalogo ? (
              <Badge
                variant="outline"
                className="gap-1 border-primary/30 bg-primary/10 text-primary"
              >
                <FolderTree className="size-3" />
                {accesorio.catalogo.nombre}
              </Badge>
            ) : null}
          </div>
          <SheetTitle className="font-heading text-xl pt-1">
            {accesorio.nombre}
          </SheetTitle>
          <SheetDescription>
            Ficha de parametrización del accesorio de activo.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Info Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-2xs text-foreground">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <Paperclip className="size-4" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Accesorio Vinculado
              </p>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              {accesorio.catalogo
                ? `Accesorio configurado para la categoría "${accesorio.catalogo.nombre}".`
                : "Accesorio registrado en el catálogo maestro del sistema."}
            </p>
          </div>

          {/* Properties Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Paperclip className="size-4 text-primary" />
              Parámetros del Accesorio
            </h4>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border bg-muted/20 p-3">
                <span className="text-xs text-muted-foreground block">
                  Código Identificador
                </span>
                <span className="font-mono font-medium text-foreground">
                  {accesorio.codigo}
                </span>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3">
                <span className="text-xs text-muted-foreground block">
                  Categoría
                </span>
                <span className="font-medium text-foreground">
                  {accesorio.catalogo?.nombre ?? "—"}
                </span>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3 col-span-2">
                <span className="text-xs text-muted-foreground block">
                  Nombre Oficial
                </span>
                <span className="font-medium text-foreground">
                  {accesorio.nombre}
                </span>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3 col-span-2">
                <span className="text-xs text-muted-foreground block mb-1">
                  Descripción
                </span>
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {accesorio.descripcion || "Sin descripción adicional especificada."}
                </p>
              </div>
            </div>
          </div>

          {/* Audit Section */}
          {accesorio.auditoria ? (
            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-semibold text-foreground">
                Datos de Auditoría y Trazabilidad
              </h4>
              <div className="rounded-xl border bg-muted/30 p-3.5">
                <AuditInfo
                  data={{
                    createdAt: accesorio.auditoria.createdAt,
                    updatedAt: accesorio.auditoria.updatedAt,
                    createdBy: accesorio.auditoria.createdBy,
                    updatedBy: accesorio.auditoria.updatedBy,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        {onEdit ? (
          <div className="pt-4 border-t flex justify-end">
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false)
                onEdit(accesorio)
              }}
              className="gap-2"
            >
              <Pencil className="size-4" />
              Editar Accesorio
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

import { FolderTree, Layers, ListOrdered, Pencil } from "lucide-react"

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

import type { Categoria } from "../api/categoria.service"

type CategoriaQuickViewSheetProps = {
  categoria: Categoria | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (categoria: Categoria) => void
}

export function CategoriaQuickViewSheet({
  categoria,
  open,
  onOpenChange,
  onEdit,
}: CategoriaQuickViewSheetProps) {
  if (!categoria) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-3 border-b">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {categoria.codigo}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 border-primary/30 bg-primary/10 text-primary"
            >
              <ListOrdered className="size-3" />
              Posición #{categoria.orden}
            </Badge>
          </div>
          <SheetTitle className="font-heading text-xl pt-1">
            {categoria.nombre}
          </SheetTitle>
          <SheetDescription>
            Ficha técnica de parametrización de categoría de activos.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-4 text-sm">
          {/* Classification Showcase */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/20 text-primary">
                <FolderTree className="size-4" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Jerarquía en el Catálogo
              </p>
            </div>
            <p className="text-xs font-medium leading-relaxed text-foreground">
              Agrupa y clasifica lógicamente los activos para filtros, reportes consolidados y asignación de atributos y depreciación.
            </p>
          </div>

          {/* Properties Section */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              Parámetros de la Categoría
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border bg-muted/20 p-2.5">
                <span className="text-[11px] text-muted-foreground block">Código Identificador</span>
                <span className="font-mono font-medium text-foreground">{categoria.codigo}</span>
              </div>

              <div className="rounded-lg border bg-muted/20 p-2.5">
                <span className="text-[11px] text-muted-foreground block">Orden de Visualización</span>
                <span className="font-mono font-medium text-foreground">#{categoria.orden}</span>
              </div>

              <div className="rounded-lg border bg-muted/20 p-2.5 col-span-2">
                <span className="text-[11px] text-muted-foreground block mb-0.5">Nombre Oficial</span>
                <span className="font-medium text-foreground">{categoria.nombre}</span>
              </div>

              <div className="rounded-lg border bg-muted/20 p-2.5 col-span-2">
                <span className="text-[11px] text-muted-foreground block mb-0.5">Descripción</span>
                <p className="text-xs text-foreground/90 whitespace-pre-wrap">
                  {categoria.descripcion || "Sin descripción adicional especificada."}
                </p>
              </div>
            </div>
          </div>

          {/* Audit Section */}
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Datos de Auditoría
            </h4>
            <div className="rounded-lg border bg-muted/30 p-3">
              <AuditInfo data={categoria} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {onEdit ? (
          <div className="pt-3 border-t flex justify-end">
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false)
                onEdit(categoria)
              }}
              className="gap-1.5 h-8 text-xs"
            >
              <Pencil className="size-3.5" />
              Editar Categoría
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

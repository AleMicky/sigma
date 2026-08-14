import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BookOpen, Check, Copy, Hash, Layers, ListFilter, Plus } from "lucide-react"
import { toast } from "sonner"

import { AuditInfo } from "@/shared/components/audit-info"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"

import { catalogoItemQueries } from "../api/catalogo-item.queries"
import type { Catalogo } from "../api/catalogo.service"

type CatalogoQuickViewSheetProps = {
  catalogo: Catalogo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddValue?: () => void
}

export function CatalogoQuickViewSheet({
  catalogo,
  open,
  onOpenChange,
  onAddValue,
}: CatalogoQuickViewSheetProps) {
  const [copied, setCopied] = useState(false)

  const itemsQuery = useQuery({
    ...catalogoItemQueries.byCatalogo(catalogo?.id ?? "", {
      size: 50,
      sortBy: "orden",
      direction: "ASC",
    }),
  })

  const items = itemsQuery.data?.content ?? []

  function copyCode() {
    if (!catalogo) return
    navigator.clipboard.writeText(catalogo.codigo)
    setCopied(true)
    toast.success(`Código "${catalogo.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!catalogo) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full overflow-hidden p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </div>
            <div>
              <SheetTitle className="text-lg">{catalogo.nombre}</SheetTitle>
              <SheetDescription className="text-xs">
                Ficha técnica del catálogo maestro
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Identificador & Código */}
          <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <Hash className="size-3.5 text-primary" />
                Código de Identificación
              </span>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={copyCode}
                className="h-7 gap-1 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
            <code className="block w-full rounded-lg bg-background p-2.5 font-mono text-sm font-semibold tracking-wide text-foreground border shadow-2xs">
              {catalogo.codigo}
            </code>
          </div>

          {/* Metadata de Auditoría */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Auditoría del Registro
            </h4>
            <div className="rounded-xl border p-3.5 bg-card">
              <AuditInfo data={catalogo} />
            </div>
          </div>

          {/* Valores del Catálogo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" />
                Valores Asociados ({items.length})
              </h4>
              {onAddValue ? (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={onAddValue}
                  className="h-7 text-xs text-primary gap-1"
                >
                  <Plus className="size-3" />
                  Agregar
                </Button>
              ) : null}
            </div>

            {itemsQuery.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-lg bg-muted/60 animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground space-y-1">
                <ListFilter className="size-6 mx-auto text-muted-foreground/60 mb-2" />
                <p className="font-medium text-foreground">Sin valores definidos</p>
                <p>Este catálogo aún no tiene ítems hijos configurados.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-2.5 text-xs hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted font-mono text-[10px] font-bold text-muted-foreground">
                        #{item.orden}
                      </span>
                      <span className="font-medium truncate">{item.nombre}</span>
                    </div>
                    <code className="shrink-0 rounded bg-muted/80 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {item.valor}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-muted/10 flex justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

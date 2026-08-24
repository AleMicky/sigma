import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, Loader2, PackagePlus, Plus, Search } from "lucide-react"

import { accesorioQueries } from "@/modules/activos/accesorio/api/accesorio.queries"
import type { Accesorio } from "@/modules/activos/accesorio/api/accesorio.service"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"

type AccesorioSelectDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingAccesorioIds: string[]
  onSelect: (accesorio: Accesorio) => void
}

export function AccesorioSelectDialog({
  open,
  onOpenChange,
  existingAccesorioIds,
  onSelect,
}: AccesorioSelectDialogProps) {
  const [search, setSearch] = useState("")

  const accesoriosQuery = useQuery({
    ...accesorioQueries.list({
      q: search.trim() || undefined,
      size: 50,
      sortBy: "nombre",
      direction: "ASC",
    }),
    enabled: open,
  })

  const accesorios = accesoriosQuery.data?.content ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="p-4 pb-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PackagePlus className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Agregar Accesorio Adicional
              </DialogTitle>
              <DialogDescription className="text-xs">
                Seleccione un accesorio del catálogo para incluirlo en el acta
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Buscador */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-9"
              autoFocus
            />
          </div>
        </div>

        {/* Lista de Accesorios */}
        <div className="max-h-[320px] overflow-y-auto p-2 space-y-1">
          {accesoriosQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-xs text-muted-foreground gap-2">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span>Cargando catálogo de accesorios...</span>
            </div>
          ) : accesorios.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No se encontraron accesorios en el catálogo.
            </div>
          ) : (
            accesorios.map((acc) => {
              const alreadyAdded = existingAccesorioIds.includes(acc.id)
              return (
                <div
                  key={acc.id}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-lg border transition-all text-xs",
                    alreadyAdded
                      ? "opacity-60 bg-muted/40 border-dashed"
                      : "hover:bg-muted/60 hover:border-primary/40 bg-card cursor-pointer",
                  )}
                  onClick={() => {
                    if (!alreadyAdded) {
                      onSelect(acc)
                      onOpenChange(false)
                    }
                  }}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {acc.codigo}
                      </span>
                      <span className="font-semibold text-foreground truncate">
                        {acc.nombre}
                      </span>
                    </div>
                    {acc.descripcion && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {acc.descripcion}
                      </p>
                    )}
                  </div>

                  {alreadyAdded ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                      <Check className="size-3 text-emerald-500" />
                      Agregado
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs font-semibold gap-1 shrink-0"
                    >
                      <Plus className="size-3" />
                      Elegir
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

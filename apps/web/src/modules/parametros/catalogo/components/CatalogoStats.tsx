import { BookOpen, Database, Layers, Sparkles } from "lucide-react"

import { Card, CardContent } from "@/shared/components/ui/card"

type CatalogoStatsProps = {
  totalCatalogos?: number
  totalItemsSelected?: number
  selectedCatalogoNombre?: string | null
}

export function CatalogoStats({
  totalCatalogos = 0,
  totalItemsSelected,
  selectedCatalogoNombre,
}: CatalogoStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 pt-4 sm:grid-cols-3 sm:px-6 md:px-8">
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-background via-muted/20 to-muted/40 transition-all hover:border-border">
        <CardContent className="flex items-center gap-3.5 p-3.5 sm:p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-xs">
            <BookOpen className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Catálogos
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-xl font-bold tracking-tight">
                {totalCatalogos}
              </span>
              <span className="text-[11px] text-muted-foreground">
                maestros configurados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-background via-muted/20 to-muted/40 transition-all hover:border-border">
        <CardContent className="flex items-center gap-3.5 p-3.5 sm:p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 shadow-xs">
            <Layers className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Ítems en Selección
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-xl font-bold tracking-tight">
                {totalItemsSelected ?? "—"}
              </span>
              {selectedCatalogoNombre ? (
                <span className="truncate text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  {selectedCatalogoNombre}
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground">
                  sin catálogo activo
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-background via-muted/20 to-muted/40 transition-all hover:border-border">
        <CardContent className="flex items-center gap-3.5 p-3.5 sm:p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 shadow-xs">
            <Database className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Estado de Parámetros
            </p>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                <Sparkles className="size-3" />
                Sincronizado
              </span>
              <span className="text-[11px] text-muted-foreground">
                versión global
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

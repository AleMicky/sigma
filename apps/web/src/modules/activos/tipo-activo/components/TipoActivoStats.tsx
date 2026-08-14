import { FolderTree, Palette, Tags } from "lucide-react"

import type { TipoActivo } from "../api/tipo-activo.service"

type TipoActivoStatsProps = {
  totalTipos: number
  totalCategorias: number
  tipos: TipoActivo[]
}

export function TipoActivoStats({
  totalTipos,
  totalCategorias,
  tipos,
}: TipoActivoStatsProps) {
  const personalizadosCount = tipos.filter(
    (t) => Boolean(t.color) || Boolean(t.icono),
  ).length

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="flex items-center gap-3.5 rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-xs transition-all hover:bg-card">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-11">
          <Tags className="size-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Tipos
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-heading text-2xl font-bold tracking-tight">
              {totalTipos}
            </span>
            <span className="text-xs text-muted-foreground">registrados</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3.5 rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-xs transition-all hover:bg-card">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 sm:size-11">
          <FolderTree className="size-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Categorías
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-heading text-2xl font-bold tracking-tight">
              {totalCategorias}
            </span>
            <span className="text-xs text-muted-foreground">disponibles</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3.5 rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-xs transition-all hover:bg-card">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 sm:size-11">
          <Palette className="size-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Personalizados
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-heading text-2xl font-bold tracking-tight">
              {personalizadosCount}
            </span>
            <span className="text-xs text-muted-foreground">con color/icono</span>
          </div>
        </div>
      </div>
    </div>
  )
}

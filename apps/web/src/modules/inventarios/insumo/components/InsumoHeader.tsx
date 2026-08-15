import { Package, Plus, Tags, FolderTree } from "lucide-react"

import { Button } from "@/shared/components/ui/button"

import type { Insumo } from "../api/insumo.service"

type InsumoHeaderProps = {
  totalInsumos: number
  totalTipos: number
  totalCategorias: number
  insumos: Insumo[]
  onCreate: () => void
}

export function InsumoHeader({
  totalInsumos,
  totalTipos,
  totalCategorias,
  onCreate,
}: InsumoHeaderProps) {
  return (
    <header className="flex shrink-0 flex-col gap-4 border-b py-4 sm:gap-6 sm:py-6 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="size-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Módulo de Inventarios
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Catálogo de Insumos
            </h1>

            <Button
              size="sm"
              type="button"
              onClick={onCreate}
              className="shrink-0 gap-1.5 rounded-xl shadow-sm md:hidden"
            >
              <Plus className="size-4" />
              <span>Nuevo</span>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Administra los insumos y materiales del sistema, vinculados a unidades de medida, categorías y atributos dinámicos personalizados.
          </p>
        </div>

        <Button
          size="default"
          type="button"
          onClick={onCreate}
          className="hidden shrink-0 items-center gap-2 rounded-xl px-5 shadow-sm transition-all hover:shadow-md md:inline-flex"
        >
          <Plus className="size-4" />
          <span>Nuevo Insumo</span>
        </Button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted-foreground">
              Total Insumos
            </p>
            <p className="text-lg font-bold text-foreground">
              {totalInsumos}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Tags className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted-foreground">
              Tipos de Insumo
            </p>
            <p className="text-lg font-bold text-foreground">
              {totalTipos}
            </p>
          </div>
        </div>

        <div className="col-span-2 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 sm:col-span-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <FolderTree className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted-foreground">
              Categorías
            </p>
            <p className="text-lg font-bold text-foreground">
              {totalCategorias}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

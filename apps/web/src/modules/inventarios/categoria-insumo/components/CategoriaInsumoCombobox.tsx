import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { FolderTree, Layers, Loader2, X } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import { cn } from "@/shared/lib/utils"

import { categoriaInsumoQueries } from "../api/categoria-insumo.queries"
import type { CategoriaInsumo } from "../api/categoria-insumo.service"

export type CategoriaInsumoComboboxProps = {
  value?: string | null
  onValueChange?: (value: string, categoria?: CategoriaInsumo | null) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  "aria-invalid"?: boolean
}

export function CategoriaInsumoCombobox({
  value = "",
  onValueChange,
  onBlur,
  placeholder = "Buscar categoría por nombre o código…",
  disabled = false,
  className,
  id,
  name,
  "aria-invalid": ariaInvalid,
}: CategoriaInsumoComboboxProps) {
  const query = useQuery({
    ...categoriaInsumoQueries.list({ size: 100, sortBy: "nombre", direction: "ASC" }),
  })

  const categorias = React.useMemo(
    () => query.data?.content ?? [],
    [query.data?.content],
  )

  const selectedCategoria = React.useMemo(() => {
    if (!value) return null
    return categorias.find((c) => c.id === value) ?? null
  }, [value, categorias])

  // Tarjeta seleccionada
  if (selectedCategoria) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-background p-2.5 sm:p-3 shadow-2xs hover:border-primary/40 transition-all",
          ariaInvalid && "border-destructive ring-1 ring-destructive/20",
          className,
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            <FolderTree className="size-4.5" />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="font-semibold text-xs sm:text-sm text-foreground truncate">
                {selectedCategoria.nombre}
              </span>
              <code className="text-[10px] font-mono font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                {selectedCategoria.codigo}
              </code>
            </div>

            {selectedCategoria.tipoInsumo?.nombre ? (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Layers className="size-3 text-primary/70 shrink-0" />
                <span className="truncate">{selectedCategoria.tipoInsumo.nombre}</span>
              </div>
            ) : null}
          </div>
        </div>

        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onValueChange?.("", null)}
            className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg shrink-0 cursor-pointer"
            title="Cambiar categoría seleccionada"
          >
            <X className="size-3.5" />
            <span className="sr-only">Remover selección</span>
          </Button>
        )}
      </div>
    )
  }

  // Autocomplete Combobox
  return (
    <Combobox
      items={categorias}
      itemToStringLabel={(item: CategoriaInsumo) =>
        item ? `${item.nombre} (${item.codigo})` : ""
      }
      itemToStringValue={(item: CategoriaInsumo) => item?.id ?? ""}
      value={null}
      onValueChange={(val: CategoriaInsumo | null) => {
        onValueChange?.(val?.id ?? "", val)
      }}
      disabled={disabled || query.isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          placeholder={query.isLoading ? "Cargando categorías..." : placeholder}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          className={cn("w-full shadow-2xs text-xs bg-background", className)}
        />
        {query.isLoading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <ComboboxContent className="z-50 max-h-64 min-w-[300px] p-1 rounded-xl shadow-lg border border-border/80">
        <ComboboxEmpty className="py-4 text-xs text-muted-foreground text-center">
          {query.isLoading
            ? "Cargando categorías..."
            : "No se encontraron categorías coincidentes."}
        </ComboboxEmpty>
        <ComboboxList>
          {(item: CategoriaInsumo) => (
            <ComboboxItem
              key={item.id}
              value={item}
              className="cursor-pointer py-2 px-2.5 rounded-lg hover:bg-accent/60 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FolderTree className="size-3.5" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="truncate text-xs font-semibold text-foreground">
                      {item.nombre}
                    </span>
                    <code className="text-[10px] text-muted-foreground bg-muted px-1 rounded font-mono">
                      {item.codigo}
                    </code>
                  </div>
                  {item.tipoInsumo?.nombre ? (
                    <span className="text-[11px] text-muted-foreground truncate">
                      {item.tipoInsumo.nombre}
                    </span>
                  ) : null}
                </div>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

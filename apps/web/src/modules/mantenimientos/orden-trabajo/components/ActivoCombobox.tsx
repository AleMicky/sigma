import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Box, Loader2, X } from "lucide-react"

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
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

export type ActivoComboboxProps = {
  value?: string | null
  onValueChange?: (value: string, activo?: Activo | null) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  "aria-invalid"?: boolean
}

export function ActivoCombobox({
  value = "",
  onValueChange,
  onBlur,
  placeholder = "Buscar activo por código o nombre…",
  disabled = false,
  className,
  id,
  name,
  "aria-invalid": ariaInvalid,
}: ActivoComboboxProps) {
  const query = useQuery({
    ...activoQueries.list({ size: 100, sortBy: "codigo", direction: "ASC" }),
  })

  const activos = React.useMemo(
    () => query.data?.content ?? [],
    [query.data?.content],
  )

  const selectedActivo = React.useMemo(() => {
    if (!value) return null
    return activos.find((a) => a.id === value) ?? null
  }, [value, activos])

  if (selectedActivo) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-muted/20 p-2.5 shadow-2xs hover:border-primary/40 transition-all",
          ariaInvalid && "border-destructive ring-1 ring-destructive/20",
          className,
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold text-xs border border-sky-500/30">
            <Box className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <code className="text-[11px] font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                {selectedActivo.codigo}
              </code>
              <span className="font-semibold text-xs text-foreground truncate">
                {selectedActivo.nombre}
              </span>
            </div>
            {selectedActivo.tipoActivo?.nombre ? (
              <p className="text-[10px] text-muted-foreground truncate">
                {selectedActivo.tipoActivo.nombre}
              </p>
            ) : null}
          </div>
        </div>

        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onValueChange?.("", null)}
            className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded-lg shrink-0 cursor-pointer"
            title="Cambiar activo seleccionado"
          >
            <X className="size-3.5" />
            <span className="sr-only">Remover selección</span>
          </Button>
        )}
      </div>
    )
  }

  return (
    <Combobox
      items={activos}
      itemToStringLabel={(item: Activo) =>
        item ? `${item.codigo} - ${item.nombre}` : ""
      }
      itemToStringValue={(item: Activo) => item?.id ?? ""}
      value={null}
      onValueChange={(val: Activo | null) => {
        onValueChange?.(val?.id ?? "", val)
      }}
      disabled={disabled || query.isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          placeholder={query.isLoading ? "Cargando activos..." : placeholder}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          className={cn("w-full text-xs shadow-2xs", className)}
        />
        {query.isLoading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <ComboboxContent className="z-50 max-h-60 min-w-[300px] p-1 rounded-xl shadow-lg border border-border/80">
        <ComboboxEmpty className="py-3 text-xs text-muted-foreground text-center">
          {query.isLoading
            ? "Cargando activos..."
            : "No se encontraron activos coincidentes."}
        </ComboboxEmpty>
        <ComboboxList>
          {(item: Activo) => (
            <ComboboxItem
              key={item.id}
              value={item}
              className="cursor-pointer py-1.5 px-2 rounded-lg hover:bg-accent/60 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <code className="text-[10px] font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                  {item.codigo}
                </code>
                <span className="truncate text-xs font-medium text-foreground">
                  {item.nombre}
                </span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

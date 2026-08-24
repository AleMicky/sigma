import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Briefcase, Loader2, X } from "lucide-react"

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

import { cargoQueries } from "../api/cargo.queries"
import type { Cargo } from "../api/cargo.service"

export type CargoComboboxProps = {
  value?: string | null
  onValueChange?: (value: string, cargo?: Cargo | null) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  "aria-invalid"?: boolean
}

export function CargoCombobox({
  value = "",
  onValueChange,
  onBlur,
  placeholder = "Buscar cargo…",
  disabled = false,
  className,
  id,
  name,
  "aria-invalid": ariaInvalid,
}: CargoComboboxProps) {
  const query = useQuery({
    ...cargoQueries.list({ size: 100, sortBy: "nombre", direction: "ASC" }),
  })

  const cargos = React.useMemo(
    () => query.data?.content ?? [],
    [query.data?.content],
  )

  const selectedCargo = React.useMemo(() => {
    if (!value) return null
    return cargos.find((c) => c.id === value) ?? null
  }, [value, cargos])

  // Tarjeta compacta cuando un cargo está seleccionado
  if (selectedCargo) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-background px-2.5 py-1.5 shadow-2xs hover:border-primary/40 transition-all",
          ariaInvalid && "border-destructive ring-1 ring-destructive/20",
          className,
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
            <Briefcase className="size-3.5" />
          </div>

          <div className="min-w-0 flex-1 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-xs text-foreground truncate">
              {selectedCargo.nombre}
            </span>
            <code className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
              {selectedCargo.codigo}
            </code>
          </div>
        </div>

        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onValueChange?.("", null)}
            className="size-6 text-muted-foreground hover:text-foreground hover:bg-muted rounded shrink-0 cursor-pointer"
            title="Cambiar cargo"
          >
            <X className="size-3.5" />
            <span className="sr-only">Remover selección</span>
          </Button>
        )}
      </div>
    )
  }

  // Combobox Input
  return (
    <Combobox
      items={cargos}
      itemToStringLabel={(item: Cargo) =>
        item ? `${item.nombre} (${item.codigo})` : ""
      }
      itemToStringValue={(item: Cargo) => item?.id ?? ""}
      value={null}
      onValueChange={(val: Cargo | null) => {
        onValueChange?.(val?.id ?? "", val)
      }}
      disabled={disabled || query.isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          placeholder={query.isLoading ? "Cargando cargos..." : placeholder}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          className={cn("w-full shadow-2xs text-xs bg-background", className)}
        />
        {query.isLoading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <ComboboxContent className="z-50 max-h-56 min-w-[280px] p-1 rounded-lg shadow-lg border border-border/80">
        <ComboboxEmpty className="py-3 text-xs text-muted-foreground text-center">
          {query.isLoading
            ? "Cargando cargos..."
            : "No se encontraron cargos coincidentes."}
        </ComboboxEmpty>
        <ComboboxList>
          {(item: Cargo) => (
            <ComboboxItem
              key={item.id}
              value={item}
              className="cursor-pointer py-1.5 px-2 rounded-md hover:bg-accent/60 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                  <Briefcase className="size-3" />
                </div>
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="truncate text-xs font-medium text-foreground">
                    {item.nombre}
                  </span>
                  <code className="text-[10px] text-muted-foreground bg-muted px-1 rounded font-mono">
                    {item.codigo}
                  </code>
                </div>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

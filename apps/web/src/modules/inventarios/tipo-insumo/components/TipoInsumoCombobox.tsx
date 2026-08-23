import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Boxes,
  Cpu,
  Droplet,
  Loader2,
  Package,
  Shield,
  Tags,
  Wrench,
  X,
  Zap,
} from "lucide-react"

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

import { tipoInsumoQueries } from "../api/tipo-insumo.queries"
import type { TipoInsumo } from "../api/tipo-insumo.service"

export type TipoInsumoComboboxProps = {
  value?: string | null
  onValueChange?: (value: string, tipo?: TipoInsumo | null) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  "aria-invalid"?: boolean
}

function getTipoInsumoIcon(codigo: string, nombre: string) {
  const text = (codigo + " " + nombre).toUpperCase()
  if (text.includes("MECAN") || text.includes("REPUESTO") || text.includes("HERRAMIENTA")) {
    return Wrench
  }
  if (text.includes("ELEC") || text.includes("CIRCUITO") || text.includes("POTENCIA")) {
    return Zap
  }
  if (text.includes("DIGITAL") || text.includes("CHIP") || text.includes("COMPUTO") || text.includes("SENSOR")) {
    return Cpu
  }
  if (text.includes("QUIMIC") || text.includes("LUBRIC") || text.includes("ACEITE") || text.includes("FLUIDO")) {
    return Droplet
  }
  if (text.includes("EPP") || text.includes("SEGUR") || text.includes("PROTEC")) {
    return Shield
  }
  if (text.includes("PAQUETE") || text.includes("CAJA") || text.includes("EMPAQUE")) {
    return Boxes
  }
  if (text.includes("CONSUMIBLE") || text.includes("MATERIAL") || text.includes("SUMINISTRO")) {
    return Package
  }
  return Tags
}

export function TipoInsumoCombobox({
  value = "",
  onValueChange,
  onBlur,
  placeholder = "Buscar y seleccionar tipo de insumo…",
  disabled = false,
  className,
  id,
  name,
  "aria-invalid": ariaInvalid,
}: TipoInsumoComboboxProps) {
  const query = useQuery({
    ...tipoInsumoQueries.list({ size: 100, sortBy: "nombre", direction: "ASC" }),
  })

  const tiposInsumo = React.useMemo(
    () => query.data?.content ?? [],
    [query.data?.content],
  )

  const selectedTipo = React.useMemo(() => {
    if (!value) return null
    return tiposInsumo.find((t) => t.id === value) ?? null
  }, [value, tiposInsumo])

  // Si hay un tipo seleccionado, mostramos la tarjeta estilizada
  if (selectedTipo) {
    const Icon = getTipoInsumoIcon(selectedTipo.codigo, selectedTipo.nombre)

    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 p-2.5 sm:p-3 shadow-2xs hover:border-primary/40 transition-all",
          ariaInvalid && "border-destructive ring-1 ring-destructive/20",
          className,
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            <Icon className="size-4.5" />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-xs sm:text-sm text-foreground truncate">
                {selectedTipo.nombre}
              </span>
              <code className="text-[10px] font-mono font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                {selectedTipo.codigo}
              </code>
            </div>

            {selectedTipo.descripcion ? (
              <p className="line-clamp-1 text-[11px] text-muted-foreground">
                {selectedTipo.descripcion}
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
            className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg shrink-0 cursor-pointer"
            title="Cambiar tipo de insumo seleccionado"
          >
            <X className="size-3.5" />
            <span className="sr-only">Remover selección</span>
          </Button>
        )}
      </div>
    )
  }

  // Si no hay seleccionado, mostramos el Autocomplete Combobox
  return (
    <Combobox
      items={tiposInsumo}
      itemToStringLabel={(item: TipoInsumo) =>
        item ? `${item.nombre} (${item.codigo})` : ""
      }
      itemToStringValue={(item: TipoInsumo) => item?.id ?? ""}
      value={null}
      onValueChange={(val: TipoInsumo | null) => {
        onValueChange?.(val?.id ?? "", val)
      }}
      disabled={disabled || query.isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          placeholder={query.isLoading ? "Cargando tipos de insumo..." : placeholder}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          className={cn("w-full shadow-2xs text-xs", className)}
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
            ? "Cargando tipos..."
            : "No se encontraron tipos de insumo coincidentes."}
        </ComboboxEmpty>
        <ComboboxList>
          {(item: TipoInsumo) => {
            const Icon = getTipoInsumoIcon(item.codigo, item.nombre)

            return (
              <ComboboxItem
                key={item.id}
                value={item}
                className="cursor-pointer py-2 px-2.5 rounded-lg hover:bg-accent/60 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-3.5" />
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
                    {item.descripcion ? (
                      <span className="text-[11px] text-muted-foreground truncate">
                        {item.descripcion}
                      </span>
                    ) : null}
                  </div>
                </div>
              </ComboboxItem>
            )
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

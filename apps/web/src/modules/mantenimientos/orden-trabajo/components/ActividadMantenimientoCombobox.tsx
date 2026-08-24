import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { CheckSquare, Loader2, X } from "lucide-react"

import { actividadQueries } from "@/modules/mantenimientos/actividad/api/actividad.queries"
import type { ActividadMantenimiento } from "@/modules/mantenimientos/actividad/api/actividad.service"
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

export type ActividadMantenimientoComboboxProps = {
  value?: string | null
  onValueChange?: (
    value: string,
    actividad?: ActividadMantenimiento | null,
  ) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  "aria-invalid"?: boolean
}

export function ActividadMantenimientoCombobox({
  value = "",
  onValueChange,
  onBlur,
  placeholder = "Seleccionar actividad del catálogo (opcional)…",
  disabled = false,
  className,
  id,
  name,
  "aria-invalid": ariaInvalid,
}: ActividadMantenimientoComboboxProps) {
  const query = useQuery({
    ...actividadQueries.list({ size: 100, sortBy: "codigo", direction: "ASC" }),
  })

  const actividades = React.useMemo(
    () => query.data?.content ?? [],
    [query.data?.content],
  )

  const selectedActividad = React.useMemo(() => {
    if (!value) return null
    return actividades.find((a) => a.id === value) ?? null
  }, [value, actividades])

  if (selectedActividad) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-muted/20 p-2 shadow-2xs hover:border-primary/40 transition-all",
          ariaInvalid && "border-destructive ring-1 ring-destructive/20",
          className,
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/30">
            <CheckSquare className="size-3.5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <code className="text-[10px] font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                {selectedActividad.codigo}
              </code>
              <span className="font-medium text-xs text-foreground truncate">
                {selectedActividad.nombre}
              </span>
            </div>
          </div>
        </div>

        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onValueChange?.("", null)}
            className="size-6 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded-lg shrink-0 cursor-pointer"
            title="Quitar selección"
          >
            <X className="size-3" />
            <span className="sr-only">Remover selección</span>
          </Button>
        )}
      </div>
    )
  }

  return (
    <Combobox
      items={actividades}
      itemToStringLabel={(item: ActividadMantenimiento) =>
        item ? `${item.codigo} - ${item.nombre}` : ""
      }
      itemToStringValue={(item: ActividadMantenimiento) => item?.id ?? ""}
      value={null}
      onValueChange={(val: ActividadMantenimiento | null) => {
        onValueChange?.(val?.id ?? "", val)
      }}
      disabled={disabled || query.isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          placeholder={
            query.isLoading ? "Cargando actividades..." : placeholder
          }
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
            ? "Cargando actividades..."
            : "No se encontraron actividades en el catálogo."}
        </ComboboxEmpty>
        <ComboboxList>
          {(item: ActividadMantenimiento) => (
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

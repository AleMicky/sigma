import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import { catalogoItemQueries } from "@/modules/parametros/catalogo/api/catalogo-item.queries"
import type { CatalogoItem } from "@/modules/parametros/catalogo/api/catalogo-item.service"

export type CatalogoComboboxProps = {
  codigo: string
  value?: string
  onValueChange?: (value: string, item?: CatalogoItem | null) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  maxLength?: number
  "aria-invalid"?: boolean
  allowCustomValue?: boolean
}

export function CatalogoCombobox({
  codigo,
  value = "",
  onValueChange,
  onBlur,
  placeholder = "Seleccionar o escribir...",
  disabled = false,
  className,
  id,
  name,
  maxLength,
  "aria-invalid": ariaInvalid,
  allowCustomValue = true,
}: CatalogoComboboxProps) {
  const query = useQuery(
    catalogoItemQueries.byCodigo(codigo, {
      size: 100,
      sortBy: "orden",
      direction: "ASC",
    }),
  )

  const items = React.useMemo(() => query.data?.content ?? [], [query.data?.content])

  const selectedItem = React.useMemo(() => {
    if (!value) return null
    return (
      items.find(
        (item) =>
          item.nombre.toLowerCase() === value.toLowerCase() ||
          item.valor.toLowerCase() === value.toLowerCase(),
      ) ??
      (allowCustomValue
        ? ({
            id: `custom-${value}`,
            nombre: value,
            valor: value,
            orden: 999,
            catalogoId: "",
            createdAt: "",
            updatedAt: "",
            createdBy: null,
            updatedBy: null,
            activo: true,
          } as CatalogoItem)
        : null)
    )
  }, [value, items, allowCustomValue])

  return (
    <Combobox
      items={items}
      itemToStringLabel={(item: CatalogoItem) => item?.nombre ?? ""}
      itemToStringValue={(item: CatalogoItem) => item?.nombre ?? item?.id ?? ""}
      value={selectedItem}
      onValueChange={(val: CatalogoItem | null) => {
        onValueChange?.(val?.nombre ?? "", val)
      }}
      onInputValueChange={(inputVal) => {
        if (allowCustomValue) {
          onValueChange?.(inputVal, null)
        }
      }}
      disabled={disabled || query.isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          placeholder={query.isLoading ? "Cargando opciones..." : placeholder}
          showClear={Boolean(value)}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          maxLength={maxLength}
          className={cn(
            "w-full h-10 text-sm shadow-2xs rounded-lg border border-input bg-transparent [&>input]:h-full [&>input]:text-sm [&>input]:px-2.5",
            className,
          )}
        />
        {query.isLoading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      <ComboboxContent className="z-50 max-h-60 min-w-[280px] p-1.5 rounded-xl shadow-lg border border-border/80">
        <ComboboxEmpty className="py-4 text-xs text-muted-foreground text-center">
          {query.isLoading
            ? "Cargando opciones..."
            : "No se encontraron sugerencias. Puedes escribir un motivo personalizado."}
        </ComboboxEmpty>
        <ComboboxList>
          {(item: CatalogoItem) => (
            <ComboboxItem
              key={item.id}
              value={item}
              className="cursor-pointer py-2 px-2.5 rounded-lg hover:bg-accent/60 transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="size-1.5 rounded-full bg-primary/50 shrink-0" />
                <span className="truncate font-medium text-foreground">
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

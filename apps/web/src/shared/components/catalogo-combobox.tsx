import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
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
  pageSize?: number
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
  pageSize = 7,
}: CatalogoComboboxProps) {
  const [page, setPage] = React.useState(0)

  const query = useQuery(
    catalogoItemQueries.byCodigo(codigo, {
      page,
      size: pageSize,
      sortBy: "orden",
      direction: "ASC",
    }),
  )

  const items = React.useMemo(() => query.data?.content ?? [], [query.data?.content])
  const totalPages = query.data?.totalPages ?? 1
  const totalElements = query.data?.totalElements ?? items.length

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

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    query.refetch()
  }

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
          placeholder={query.isLoading && !query.data ? "Cargando opciones..." : placeholder}
          showClear={Boolean(value)}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          maxLength={maxLength}
          className={cn(
            "w-full h-10 text-sm shadow-2xs rounded-lg border border-input bg-transparent [&>input]:h-full [&>input]:text-sm [&>input]:px-2.5",
            className,
          )}
        />
        {query.isFetching && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <ComboboxContent className="z-50 w-(--anchor-width) min-w-[min(100vw-2rem,var(--anchor-width))] max-w-[var(--anchor-width)] p-1 rounded-xl shadow-lg border border-border/80 bg-popover overflow-hidden flex flex-col">
        {/* Header con indicador y botón de recarga */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 text-[11px] text-muted-foreground bg-muted/30 select-none">
          <span className="font-medium truncate">
            {query.isFetching ? "Actualizando catálogo..." : `Catálogo (${totalElements} registros)`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleRefresh}
            disabled={query.isFetching}
            title="Recargar catálogo"
            className="size-6 text-muted-foreground hover:text-foreground hover:bg-background/80"
          >
            <RefreshCw className={cn("size-3", query.isFetching && "animate-spin")} />
          </Button>
        </div>

        {/* Mensaje cuando no hay resultados */}
        <ComboboxEmpty className="py-5 text-xs text-muted-foreground text-center">
          {query.isLoading
            ? "Cargando opciones..."
            : "No se encontraron sugerencias. Puedes escribir un motivo personalizado."}
        </ComboboxEmpty>

        {/* Lista con scrollbar contenido */}
        <ComboboxList className="max-h-52 overflow-y-auto overscroll-contain pr-1 py-1">
          {(item: CatalogoItem) => (
            <ComboboxItem
              key={item.id}
              value={item}
              className="cursor-pointer py-2 px-2.5 rounded-lg hover:bg-accent/60 transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="size-1.5 rounded-full bg-primary/60 shrink-0" />
                <span className="truncate font-medium text-foreground">
                  {item.nombre}
                </span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>

        {/* Footer con controles de paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-1.5 border-t border-border/50 bg-muted/20 text-[11px] text-muted-foreground select-none">
            <span className="font-medium tabular-nums">
              Página {page + 1} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setPage((p) => Math.max(0, p - 1))
                }}
                disabled={page === 0 || query.isFetching}
                className="size-6 text-muted-foreground hover:text-foreground"
                title="Página anterior"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }}
                disabled={page >= totalPages - 1 || query.isFetching}
                className="size-6 text-muted-foreground hover:text-foreground"
                title="Página siguiente"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </ComboboxContent>
    </Combobox>
  )
}

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, Loader2, RefreshCw, X } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { http } from "@/shared/api/http"
import { cn } from "@/shared/lib/utils"

export type WorkflowRestSelectProps = {
  url: string
  params?: Record<string, string>
  value?: string | null
  onValueChange?: (value: string, item?: any | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  "aria-invalid"?: boolean
}

function getItemLabel(item: any): string {
  if (!item) return ""
  if (typeof item === "string") return item

  const codigo = item.codigo ? `[${item.codigo}] ` : ""
  const nombre =
    item.personaInfo?.nombreCompleto ||
    item.personaNombreCompleto ||
    item.nombreCompleto ||
    item.nombre ||
    item.name ||
    item.username ||
    item.titulo ||
    item.descripcion ||
    item.label ||
    item.id ||
    ""

  const extra =
    item.cargoInfo?.nombre ||
    item.cargoNombre ||
    item.cargo ||
    item.areaInfo?.nombre ||
    item.areaNombre ||
    item.email ||
    ""

  if (extra && extra !== nombre) {
    return `${codigo}${nombre} (${extra})`
  }
  return `${codigo}${nombre}`
}

function getItemId(item: any): string {
  if (!item) return ""
  if (typeof item === "string") return item
  return item.id ?? item.value ?? item.codigo ?? ""
}

export function WorkflowRestSelect({
  url,
  params = {},
  value = "",
  onValueChange,
  placeholder = "Seleccionar opción...",
  disabled = false,
  className,
  id,
  name,
  "aria-invalid": ariaInvalid,
}: WorkflowRestSelectProps) {
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search, 300)

  const queryParams = React.useMemo(() => {
    const p: Record<string, any> = {
      page: 0,
      size: 50,
      ...params,
    }
    if (debouncedSearch.trim()) {
      p.q = debouncedSearch.trim()
    }
    return p
  }, [params, debouncedSearch])

  const normalizedUrl = React.useMemo(() => {
    if (!url) return ""
    let formatted = url.trim()
    if (formatted.startsWith("/api/v1/")) {
      formatted = formatted.substring(7)
    } else if (formatted.startsWith("api/v1/")) {
      formatted = "/" + formatted.substring(7)
    }
    return formatted
  }, [url])

  const query = useQuery({
    queryKey: ["workflow-rest-select", normalizedUrl, queryParams],
    queryFn: async () => {
      const data = await http.get<any>(normalizedUrl, { params: queryParams })
      if (!data) return []
      if (Array.isArray(data)) return data
      if (data.data && Array.isArray(data.data)) return data.data
      if (data.data && Array.isArray(data.data.content)) return data.data.content
      if (Array.isArray(data.content)) return data.content
      return []
    },
    enabled: Boolean(normalizedUrl),
    staleTime: 1000 * 60 * 2,
  })

  const items: any[] = React.useMemo(() => query.data ?? [], [query.data])

  const selectedItem = React.useMemo(() => {
    if (!value) return null
    return items.find((i) => getItemId(i) === value) ?? null
  }, [value, items])

  // Si hay un valor seleccionado, mostramos chip/card con opción de deseleccionar
  if (selectedItem) {
    const label = getItemLabel(selectedItem)
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-1.5 text-xs shadow-2xs hover:border-primary/40 transition-all",
          ariaInvalid && "border-destructive ring-1 ring-destructive/20",
          className,
        )}
      >
        <span className="font-semibold text-foreground truncate">{label}</span>
        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onValueChange?.("", null)}
            className="size-6 text-muted-foreground hover:text-foreground rounded-md shrink-0 cursor-pointer"
            title="Cambiar selección"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <Combobox
      items={items}
      filter={() => true}
      itemToStringLabel={(item: any) => getItemLabel(item)}
      itemToStringValue={(item: any) => getItemId(item)}
      value={null}
      onValueChange={(val: any) => {
        onValueChange?.(getItemId(val), val)
        setSearch("")
      }}
      disabled={disabled || query.isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={query.isLoading && !query.data ? "Cargando opciones..." : placeholder}
          aria-invalid={ariaInvalid}
          className={cn("w-full shadow-2xs text-xs h-9 bg-background", className)}
        />
        {query.isFetching && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <ComboboxContent className="z-50 w-(--anchor-width) min-w-[min(100vw-2rem,var(--anchor-width))] max-w-(--anchor-width) p-1 rounded-xl shadow-lg border border-border/80 bg-popover overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-2.5 py-1 border-b border-border/50 text-[11px] text-muted-foreground bg-muted/30 select-none">
          <span className="font-medium truncate">
            {query.isFetching
              ? "Buscando en servidor..."
              : `Opciones (${items.length} encontradas)`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.preventDefault()
              query.refetch()
            }}
            disabled={query.isFetching}
            className="size-5 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("size-2.5", query.isFetching && "animate-spin")} />
          </Button>
        </div>

        <ComboboxEmpty className="py-4 text-xs text-muted-foreground text-center">
          {query.isLoading ? "Cargando datos..." : "No se encontraron resultados."}
        </ComboboxEmpty>

        <ComboboxList className="max-h-52 overflow-y-auto overscroll-contain pr-1 py-1">
          {(item: any) => {
            const label = getItemLabel(item)
            const itemId = getItemId(item)
            const isSelected = value === itemId

            return (
              <ComboboxItem
                key={itemId}
                value={item}
                className="cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-accent/60 transition-colors flex items-center justify-between text-xs"
              >
                <span className="truncate flex-1">{label}</span>
                {isSelected && <Check className="size-3.5 text-primary shrink-0 ml-2" />}
              </ComboboxItem>
            )
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

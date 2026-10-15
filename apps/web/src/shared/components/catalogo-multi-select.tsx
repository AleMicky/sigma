import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, ChevronsUpDown, Loader2, Plus, RefreshCw, Search, X } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { catalogoItemQueries } from "@/modules/parametros/catalogo/api/catalogo-item.queries"
import type { CatalogoItem } from "@/modules/parametros/catalogo/api/catalogo-item.service"

export type CatalogoMultiSelectProps = {
  codigo: string
  value?: string[]
  onValueChange?: (values: string[]) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  "aria-invalid"?: boolean
  allowCustomValue?: boolean
}

export function CatalogoMultiSelect({
  codigo,
  value = [],
  onValueChange,
  onBlur,
  placeholder = "Seleccionar fallas...",
  disabled = false,
  className,
  id,
  name,
  "aria-invalid": ariaInvalid,
  allowCustomValue = true,
}: CatalogoMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const query = useQuery(
    catalogoItemQueries.byCodigo(codigo, {
      page: 0,
      size: 100,
      sortBy: "orden",
      direction: "ASC",
    }),
  )

  const items: CatalogoItem[] = React.useMemo(() => query.data?.content ?? [], [query.data?.content])

  const selectedValues = React.useMemo(() => {
    return Array.isArray(value) ? value : []
  }, [value])

  const filteredItems = React.useMemo(() => {
    if (!search.trim()) return items
    const s = search.toLowerCase().trim()
    return items.filter(
      (item) =>
        item.nombre.toLowerCase().includes(s) ||
        item.valor.toLowerCase().includes(s),
    )
  }, [items, search])

  const canAddCustom = React.useMemo(() => {
    if (!allowCustomValue || !search.trim()) return false
    const s = search.trim().toLowerCase()
    return !items.some((item) => item.nombre.toLowerCase() === s) &&
      !selectedValues.some((val) => val.toLowerCase() === s)
  }, [allowCustomValue, search, items, selectedValues])

  const handleToggle = (val: string) => {
    const isSelected = selectedValues.some(
      (v) => v.toLowerCase() === val.toLowerCase(),
    )
    let next: string[]
    if (isSelected) {
      next = selectedValues.filter((v) => v.toLowerCase() !== val.toLowerCase())
    } else {
      next = [...selectedValues, val]
    }
    onValueChange?.(next)
  }

  const handleRemove = (e: React.MouseEvent, val: string) => {
    e.stopPropagation()
    e.preventDefault()
    const next = selectedValues.filter((v) => v.toLowerCase() !== val.toLowerCase())
    onValueChange?.(next)
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onValueChange?.([])
  }

  const handleAddCustom = () => {
    const trimmed = search.trim()
    if (!trimmed) return
    if (!selectedValues.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      onValueChange?.([...selectedValues, trimmed])
    }
    setSearch("")
  }

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    query.refetch()
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setSearch("")
          onBlur?.()
        }
      }}
    >
      <PopoverTrigger
        id={id}
        name={name}
        disabled={disabled || query.isLoading}
        aria-invalid={ariaInvalid}
        render={
          <div
            role="combobox"
            aria-expanded={open}
            tabIndex={disabled ? -1 : 0}
            className={cn(
              "flex min-h-10 w-full items-center justify-between rounded-lg border border-input bg-background/50 px-2.5 py-1.5 text-xs sm:text-sm shadow-2xs transition-all hover:bg-accent/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              ariaInvalid && "border-destructive ring-1 ring-destructive",
              disabled && "cursor-not-allowed opacity-50",
              className,
            )}
          />
        }
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0 pr-1">
          {selectedValues.length === 0 ? (
            <span className="text-muted-foreground select-none text-xs sm:text-sm">
              {query.isLoading ? "Cargando opciones..." : placeholder}
            </span>
          ) : (
            selectedValues.map((val) => (
              <Badge
                key={val}
                variant="secondary"
                className="gap-1 pl-2 pr-1 py-0.5 text-xs font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors"
              >
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{val}</span>
                {!disabled && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleRemove(e, val)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        handleRemove(e as unknown as React.MouseEvent, val)
                      }
                    }}
                    className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <X className="size-3" />
                  </span>
                )}
              </Badge>
            ))
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-muted-foreground ml-1">
          {query.isFetching && (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          )}
          {selectedValues.length > 0 && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleClearAll}
              title="Limpiar selección"
              className="size-5 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-3" />
            </Button>
          )}
          <ChevronsUpDown className="size-3.5 opacity-60" />
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-(--anchor-width) min-w-[260px] max-w-[420px] p-0 rounded-xl shadow-xl border border-border/80 bg-popover overflow-hidden flex flex-col z-50"
      >
        {/* Header con indicador y botón de recarga */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 text-xs text-muted-foreground bg-muted/40 select-none">
          <span className="font-semibold text-foreground/80">
            {selectedValues.length > 0
              ? `${selectedValues.length} seleccionada(s)`
              : "Seleccionar tipos de falla"}
          </span>
          <div className="flex items-center gap-1.5">
            {selectedValues.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onValueChange?.([])}
                className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-destructive"
              >
                Limpiar
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleRefresh}
              disabled={query.isFetching}
              title="Recargar catálogo"
              className="size-6 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={cn("size-3", query.isFetching && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Buscador interno */}
        <div className="p-2 border-b border-border/40 bg-background/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canAddCustom) {
                  e.preventDefault()
                  handleAddCustom()
                }
              }}
              placeholder="Buscar o escribir falla..."
              className="h-8 pl-8 pr-7 text-xs bg-muted/30 border-muted-foreground/20 focus-visible:ring-1"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Opción para agregar valor personalizado */}
        {canAddCustom && (
          <div className="p-1 border-b border-border/40 bg-primary/5">
            <button
              type="button"
              onClick={handleAddCustom}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-primary font-medium rounded-lg hover:bg-primary/10 transition-colors text-left"
            >
              <Plus className="size-3.5 shrink-0" />
              <span className="truncate">
                Agregar custom: <strong>&ldquo;{search.trim()}&rdquo;</strong>
              </span>
            </button>
          </div>
        )}

        {/* Lista de opciones */}
        <div className="max-h-56 overflow-y-auto p-1 divide-y divide-border/20">
          {filteredItems.length === 0 && !canAddCustom ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {query.isLoading
                ? "Cargando catálogo..."
                : "No se encontraron coincidencias"}
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedValues.some(
                (v) => v.toLowerCase() === item.nombre.toLowerCase(),
              )

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleToggle(item.nombre)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleToggle(item.nombre)
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs cursor-pointer select-none transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-accent/60 text-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "size-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input bg-background",
                    )}
                  >
                    {isSelected && <Check className="size-3 stroke-[3]" />}
                  </div>
                  <span className="truncate flex-1">{item.nombre}</span>
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

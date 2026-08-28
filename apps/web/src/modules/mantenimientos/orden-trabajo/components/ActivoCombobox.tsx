import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Box, ChevronLeft, ChevronRight, Loader2, MapPin, RefreshCw, X } from "lucide-react"

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
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
  pageSize?: number
}

export function ActivoCombobox({
  value = "",
  onValueChange,
  onBlur,
  placeholder = "Buscar activo por código, nombre o ubicación…",
  disabled = false,
  className,
  id,
  name,
  "aria-invalid": ariaInvalid,
  pageSize = 7,
}: ActivoComboboxProps) {
  const [page, setPage] = React.useState(0)

  const query = useQuery({
    ...activoQueries.list({ page, size: pageSize, sortBy: "codigo", direction: "ASC" }),
  })

  // Consulta individual si hay un valor seleccionado que quizás no esté en la página actual
  const singleQuery = useQuery({
    ...activoQueries.detail(value ?? ""),
    enabled: Boolean(value),
  })

  const activos = React.useMemo(
    () => query.data?.content ?? [],
    [query.data?.content],
  )
  const totalPages = query.data?.totalPages ?? 1
  const totalElements = query.data?.totalElements ?? activos.length

  const selectedActivo = React.useMemo(() => {
    if (!value) return null
    return (
      activos.find((a) => a.id === value) ??
      (singleQuery.data?.id === value ? singleQuery.data : null)
    )
  }, [value, activos, singleQuery.data])

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    query.refetch()
  }

  if (selectedActivo) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 p-2.5 shadow-2xs hover:border-primary/40 hover:bg-muted/30 transition-all",
          ariaInvalid && "border-destructive ring-1 ring-destructive/20",
          className,
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Foto / Miniatura */}
          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-background flex items-center justify-center shadow-xs">
            {selectedActivo.urlImagen ? (
              <AuthenticatedImage
                src={selectedActivo.urlImagen}
                alt={selectedActivo.nombre}
                className="size-full object-cover"
                fallback={<Box className="size-5 text-muted-foreground/60" />}
              />
            ) : (
              <Box className="size-5 text-muted-foreground/60" />
            )}
          </div>

          {/* Datos del Activo */}
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <code className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                {selectedActivo.codigo}
              </code>
              <span className="font-semibold text-xs text-foreground truncate">
                {selectedActivo.nombre}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
              <div className="flex items-center gap-1 truncate">
                <MapPin className="size-3 text-primary shrink-0" />
                <span className="truncate font-medium">
                  {selectedActivo.ubicacion?.nombre || "Sin ubicación"}
                </span>
              </div>
              {selectedActivo.tipoActivo?.nombre ? (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-[10px] bg-background border border-border/60 px-1.5 py-0.2 rounded shrink-0">
                    {selectedActivo.tipoActivo.nombre}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onValueChange?.("", null)}
            className="size-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
            title="Cambiar activo seleccionado"
          >
            <X className="size-4" />
            <span className="sr-only">Remover</span>
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
          placeholder={query.isLoading && !query.data ? "Cargando activos..." : placeholder}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          className={cn("w-full h-10 text-sm shadow-2xs", className)}
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
            {query.isFetching ? "Actualizando activos..." : `Activos (${totalElements} registros)`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleRefresh}
            disabled={query.isFetching}
            title="Recargar lista de activos"
            className="size-6 text-muted-foreground hover:text-foreground hover:bg-background/80"
          >
            <RefreshCw className={cn("size-3", query.isFetching && "animate-spin")} />
          </Button>
        </div>

        <ComboboxEmpty className="py-5 text-xs text-muted-foreground text-center">
          {query.isLoading
            ? "Cargando activos..."
            : "No se encontraron activos coincidentes."}
        </ComboboxEmpty>

        <ComboboxList className="max-h-52 overflow-y-auto overscroll-contain pr-1 py-1">
          {(item: Activo) => (
            <ComboboxItem
              key={item.id}
              value={item}
              className="text-xs py-2.5 px-3 cursor-pointer hover:bg-accent/60 transition-colors"
            >
              <div className="flex items-center gap-3 w-full min-w-0">
                {/* Miniatura de la Foto */}
                <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/50 flex items-center justify-center">
                  {item.urlImagen ? (
                    <AuthenticatedImage
                      src={item.urlImagen}
                      alt={item.nombre}
                      className="size-full object-cover"
                      fallback={<Box className="size-5 text-muted-foreground/60" />}
                    />
                  ) : (
                    <Box className="size-5 text-muted-foreground/60" />
                  )}
                </div>

                {/* Información del Activo */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <code className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                      {item.codigo}
                    </code>
                    <span className="font-semibold text-foreground truncate text-xs">
                      {item.nombre}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                    <MapPin className="size-3 text-primary/80 shrink-0" />
                    <span className="truncate">
                      {item.ubicacion?.nombre || "Sin ubicación"}
                    </span>
                    {item.tipoActivo?.nombre ? (
                      <>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="truncate text-muted-foreground/80">
                          {item.tipoActivo.nombre}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
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

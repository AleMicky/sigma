import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react"

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
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { cn } from "@/shared/lib/utils"

export interface ReporteVehiculoItemData {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  placa?: string | null
  marca?: string | null
  modelo?: string | null
  tipoVehiculo?: string | null
  urlImagen?: string | null
}

export interface ReporteVehiculoComboboxProps {
  value?: string | null
  onValueChange: (value: string, item?: ReporteVehiculoItemData | null) => void
  placeholder?: string
  className?: string
  id?: string
}

function extractPlaca(descripcion?: string | null): string | null {
  if (!descripcion) return null
  try {
    const match = descripcion.match(
      /PLACA[:\s#-]+([0-9A-Za-z]+(?:[\s-][0-9A-Za-z]+)*)/i
    )
    if (match && match[1]) {
      const clean = match[1].replace(/[,.;-]+$/, "").trim()
      if (clean.length >= 2 && clean.length <= 20) {
        return clean
      }
    }
    return null
  } catch {
    return null
  }
}

function mapActivoToVehiculoData(item: Activo): ReporteVehiculoItemData {
  const placa =
    (item as { placa?: string }).placa || extractPlaca(item.descripcion)

  const tipo =
    item.tipoActivo?.nombre ??
    (item as { tipoActivoNombre?: string }).tipoActivoNombre ??
    null

  return {
    id: item.id,
    codigo: item.codigo,
    nombre: item.nombre,
    descripcion: item.descripcion,
    placa,
    marca: (item as { marca?: string }).marca,
    modelo: (item as { modelo?: string }).modelo,
    tipoVehiculo: tipo,
    urlImagen: item.urlImagen,
  }
}

export function ReporteVehiculoCombobox({
  value = "",
  onValueChange,
  placeholder = "Buscar vehículo por placa, nombre o código...",
  className,
  id = "reporte-vehiculo-combobox",
}: Readonly<ReporteVehiculoComboboxProps>) {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(0)
  const debouncedSearch = useDebouncedValue(search, 250)

  // Consulta de activos/vehículos sin bloqueos de disponibilidad (apto para reportes históricos)
  const activosQuery = useQuery(
    activoQueries.list({
      page,
      size: 50,
      q: debouncedSearch.trim() || undefined,
      sortBy: "codigo",
      direction: "ASC",
    })
  )

  // Consulta del activo seleccionado (para mostrar la tarjeta si ya está cargado)
  const singleActivoQuery = useQuery({
    ...activoQueries.detail(value ?? ""),
    enabled: Boolean(value),
  })

  const activos = React.useMemo<Activo[]>(
    () => activosQuery.data?.content ?? [],
    [activosQuery.data?.content]
  )
  const totalElements = activosQuery.data?.totalElements ?? activos.length
  const totalPages = activosQuery.data?.totalPages ?? 1

  const currentSelectedData = React.useMemo<ReporteVehiculoItemData | null>(() => {
    if (!value) return null
    if (singleActivoQuery.data) {
      return mapActivoToVehiculoData(singleActivoQuery.data)
    }
    const found = activos.find((a) => a.id === value)
    if (found) {
      return mapActivoToVehiculoData(found)
    }
    return null
  }, [value, singleActivoQuery.data, activos])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(0)
  }

  // Si ya hay un vehículo seleccionado, mostrar tarjeta limpia con opción de deseleccionar
  if (currentSelectedData) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2.5 rounded-lg border border-border/80 bg-background/95 p-2 shadow-2xs hover:border-primary/40 transition-all min-h-10",
          className
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative size-8 shrink-0 overflow-hidden rounded-md border border-border bg-muted/40 flex items-center justify-center">
            {currentSelectedData.urlImagen ? (
              <AuthenticatedImage
                src={currentSelectedData.urlImagen}
                alt={currentSelectedData.nombre}
                className="size-full object-cover"
                fallback={<Car className="size-4 text-primary" />}
              />
            ) : (
              <Car className="size-4 text-primary" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <code className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded shrink-0">
                {currentSelectedData.codigo}
              </code>
              <span className="font-semibold text-xs text-foreground truncate">
                {currentSelectedData.nombre}
              </span>
              {currentSelectedData.placa && (
                <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded shrink-0">
                  Placa: {currentSelectedData.placa}
                </span>
              )}
            </div>
            {currentSelectedData.descripcion && (
              <p
                className="text-[10.5px] text-muted-foreground truncate leading-tight mt-0.5"
                title={currentSelectedData.descripcion}
              >
                {currentSelectedData.descripcion}
              </p>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onValueChange("", null)}
          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md shrink-0 cursor-pointer"
          title="Cambiar vehículo seleccionado"
        >
          <X className="size-3.5" />
          <span className="sr-only">Cambiar vehículo</span>
        </Button>
      </div>
    )
  }

  return (
    <Combobox
      items={activos}
      filter={() => true}
      itemToStringLabel={(item: Activo) =>
        item ? `${item.codigo} ${item.nombre} ${item.descripcion ?? ""}` : ""
      }
      itemToStringValue={(item: Activo) => item?.id ?? ""}
      value={null}
      onValueChange={(item: Activo | null) => {
        if (item) {
          onValueChange(item.id, mapActivoToVehiculoData(item))
        } else {
          onValueChange("", null)
        }
        setSearch("")
      }}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={
            activosQuery.isLoading && !activosQuery.data
              ? "Cargando vehículos..."
              : placeholder
          }
          className={cn("w-full h-9 text-xs shadow-2xs pr-8", className)}
        />
        {activosQuery.isFetching && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <ComboboxContent className="z-50 w-(--anchor-width) min-w-[min(100vw-2rem,var(--anchor-width))] max-w-[var(--anchor-width)] p-1 rounded-xl shadow-lg border border-border/80 bg-popover overflow-hidden flex flex-col">
        {/* Cabecera con conteo y botón de recarga */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 text-[11px] text-muted-foreground bg-muted/30 select-none">
          <span className="font-medium truncate">
            {activosQuery.isFetching
              ? "Buscando en servidor..."
              : debouncedSearch.trim()
                ? `Resultados (${totalElements} encontrados)`
                : `Todos los vehículos (${totalElements} registrados)`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => void activosQuery.refetch()}
            disabled={activosQuery.isFetching}
            title="Recargar lista de vehículos"
            className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RefreshCw
              className={cn("size-3", activosQuery.isFetching && "animate-spin")}
            />
          </Button>
        </div>

        <ComboboxEmpty className="py-6 text-xs text-muted-foreground text-center">
          {activosQuery.isLoading
            ? "Buscando vehículos..."
            : "No se encontraron vehículos coincidentes."}
        </ComboboxEmpty>

        <ComboboxList className="max-h-56 overflow-y-auto overscroll-contain pr-1 py-1">
          {(item: Activo) => {
            const placa =
              (item as { placa?: string }).placa || extractPlaca(item.descripcion)
            const tipo =
              item.tipoActivo?.nombre ??
              (item as { tipoActivoNombre?: string }).tipoActivoNombre

            return (
              <ComboboxItem
                key={item.id}
                value={item}
                className="cursor-pointer py-2 px-2.5 rounded-lg hover:bg-accent/60 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="relative size-8 rounded-md border border-border/60 bg-muted/40 overflow-hidden flex items-center justify-center shrink-0 mt-0.5">
                    {item.urlImagen ? (
                      <AuthenticatedImage
                        src={item.urlImagen}
                        alt={item.nombre}
                        className="size-full object-cover"
                        fallback={<Car className="size-4 text-muted-foreground" />}
                      />
                    ) : (
                      <Car className="size-4 text-primary" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <code className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1 py-0.2 rounded shrink-0">
                        {item.codigo}
                      </code>
                      <span className="truncate text-xs font-semibold text-foreground">
                        {item.nombre}
                      </span>
                      {placa && (
                        <span className="font-mono text-[9.5px] font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1 rounded shrink-0">
                          {placa}
                        </span>
                      )}
                      {tipo && (
                        <span className="text-[9px] text-muted-foreground font-medium px-1 rounded bg-muted/60 border border-border/50 shrink-0">
                          {tipo}
                        </span>
                      )}
                    </div>
                    {item.descripcion && (
                      <p
                        className="text-[10.5px] text-muted-foreground truncate mt-0.5 leading-snug"
                        title={item.descripcion}
                      >
                        {item.descripcion}
                      </p>
                    )}
                  </div>
                </div>
              </ComboboxItem>
            )
          }}
        </ComboboxList>

        {/* Paginación si hay más de 1 página */}
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
                disabled={page === 0 || activosQuery.isFetching}
                className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
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
                disabled={page >= totalPages - 1 || activosQuery.isFetching}
                className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
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

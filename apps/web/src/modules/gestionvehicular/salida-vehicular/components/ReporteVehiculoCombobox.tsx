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

import { vehiculoQueries } from "@/modules/gestionvehicular/vehiculo/api/vehiculo.queries"
import type { VehiculoCatalogo } from "@/modules/gestionvehicular/vehiculo/api/vehiculo.types"
import {
  getAtributoValorByCode,
  getPlacaFromAtributos,
  getVehiculoTituloDinamico,
} from "@/modules/gestionvehicular/vehiculo/lib/vehiculo-atributos.utils"
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

function mapVehiculoToItemData(item: VehiculoCatalogo): ReporteVehiculoItemData {
  const { valor: placa } = getPlacaFromAtributos(item)
  const titulo = getVehiculoTituloDinamico(item)
  const marca = getAtributoValorByCode(item, ["MARCA"])
  const modelo = getAtributoValorByCode(item, ["MODELO"])
  const tipoVehiculo =
    getAtributoValorByCode(item, ["TIPO_VEHICULO", "TIPO", "CLASE"]) ??
    item.tipoActivo?.nombre ??
    null

  return {
    id: item.id,
    codigo: item.codigo,
    nombre: titulo,
    descripcion: item.descripcion,
    placa,
    marca,
    modelo,
    tipoVehiculo,
    urlImagen: item.urlImagen,
  }
}

export function ReporteVehiculoCombobox({
  value = "",
  onValueChange,
  placeholder = "Buscar vehículo por placa, marca o modelo...",
  className,
  id = "reporte-vehiculo-combobox",
}: Readonly<ReporteVehiculoComboboxProps>) {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(0)
  const debouncedSearch = useDebouncedValue(search, 250)

  // Consulta desde el endpoint propio de gestión vehicular (solo tipo Vehículo + atributos visibles)
  const vehiculosQuery = useQuery(
    vehiculoQueries.list({
      page,
      size: 50,
      q: debouncedSearch.trim() || undefined,
      sortBy: "nombre",
      direction: "ASC",
    })
  )

  const singleVehiculoQuery = useQuery({
    ...vehiculoQueries.detail(value ?? ""),
    enabled: Boolean(value),
  })

  const vehiculos = React.useMemo<VehiculoCatalogo[]>(
    () => vehiculosQuery.data?.content ?? [],
    [vehiculosQuery.data?.content]
  )
  const totalElements = vehiculosQuery.data?.totalElements ?? vehiculos.length
  const totalPages = vehiculosQuery.data?.totalPages ?? 1

  const currentSelectedData = React.useMemo<ReporteVehiculoItemData | null>(() => {
    if (!value) return null
    if (singleVehiculoQuery.data) {
      return mapVehiculoToItemData(singleVehiculoQuery.data)
    }
    const found = vehiculos.find((v) => v.id === value)
    if (found) {
      return mapVehiculoToItemData(found)
    }
    return null
  }, [value, singleVehiculoQuery.data, vehiculos])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(0)
  }

  // Tarjeta limpia del vehículo seleccionado (destacando Placa, sin código de activo)
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
              {currentSelectedData.placa ? (
                <span className="inline-flex items-center gap-1 rounded border-2 border-cyan-600/45 dark:border-cyan-400/45 bg-cyan-500/12 px-1.5 py-0.5 font-mono text-[11px] font-black tracking-wider text-foreground shrink-0 uppercase">
                  {currentSelectedData.placa}
                </span>
              ) : null}
              {currentSelectedData.nombre !== currentSelectedData.placa ? (
                <span className="font-semibold text-xs text-foreground truncate">
                  {currentSelectedData.nombre}
                </span>
              ) : null}
            </div>
            {currentSelectedData.tipoVehiculo ? (
              <p className="text-[10.5px] text-muted-foreground truncate leading-tight mt-0.5">
                {currentSelectedData.tipoVehiculo}
              </p>
            ) : null}
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
      items={vehiculos}
      filter={() => true}
      itemToStringLabel={(item: VehiculoCatalogo) => {
        if (!item) return ""
        const { valor: placa } = getPlacaFromAtributos(item)
        const titulo = getVehiculoTituloDinamico(item)
        return [placa, titulo].filter(Boolean).join(" ")
      }}
      itemToStringValue={(item: VehiculoCatalogo) => item?.id ?? ""}
      value={null}
      onValueChange={(item: VehiculoCatalogo | null) => {
        if (item) {
          onValueChange(item.id, mapVehiculoToItemData(item))
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
            vehiculosQuery.isLoading && !vehiculosQuery.data
              ? "Cargando vehículos..."
              : placeholder
          }
          className={cn("w-full h-9 text-xs shadow-2xs pr-8", className)}
        />
        {vehiculosQuery.isFetching && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <ComboboxContent className="z-50 w-(--anchor-width) min-w-[min(100vw-2rem,var(--anchor-width))] max-w-[var(--anchor-width)] p-1 rounded-xl shadow-lg border border-border/80 bg-popover overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 text-[11px] text-muted-foreground bg-muted/30 select-none">
          <span className="font-medium truncate">
            {vehiculosQuery.isFetching
              ? "Buscando en servidor..."
              : debouncedSearch.trim()
                ? `Resultados (${totalElements} encontrados)`
                : `Todos los vehículos (${totalElements} registrados)`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => void vehiculosQuery.refetch()}
            disabled={vehiculosQuery.isFetching}
            title="Recargar lista de vehículos"
            className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RefreshCw
              className={cn("size-3", vehiculosQuery.isFetching && "animate-spin")}
            />
          </Button>
        </div>

        {/* Opción rápida: Todos los vehículos */}
        {!search.trim() && (
          <button
            type="button"
            onClick={() => {
              onValueChange("", null)
              setSearch("")
            }}
            className="flex items-center gap-2.5 px-2.5 py-2 mx-1 my-1 rounded-lg text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left cursor-pointer border border-dashed border-border hover:border-primary/40 bg-muted/20"
          >
            <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Car className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold block truncate">
                Todos los vehículos (Reporte Consolidado)
              </span>
              <span className="block text-[10.5px] text-muted-foreground truncate font-normal">
                Mostrar registros de cualquier vehículo en el período
              </span>
            </div>
          </button>
        )}

        <ComboboxEmpty className="py-6 text-xs text-muted-foreground text-center">
          {vehiculosQuery.isLoading
            ? "Buscando vehículos..."
            : "No se encontraron vehículos coincidentes."}
        </ComboboxEmpty>

        <ComboboxList className="max-h-56 overflow-y-auto overscroll-contain pr-1 py-1">
          {(item: VehiculoCatalogo) => {
            const { valor: placa } = getPlacaFromAtributos(item)
            const titulo = getVehiculoTituloDinamico(item)
            const ubicacion = item.ubicacion?.nombre

            return (
              <ComboboxItem
                key={item.id}
                value={item}
                className="cursor-pointer py-2 px-2.5 rounded-lg hover:bg-accent/60 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative size-8 rounded-md border border-border/60 bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
                    {item.urlImagen ? (
                      <AuthenticatedImage
                        src={item.urlImagen}
                        alt={titulo}
                        className="size-full object-cover"
                        fallback={<Car className="size-4 text-muted-foreground" />}
                      />
                    ) : (
                      <Car className="size-4 text-primary" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {placa ? (
                        <span className="inline-flex items-center rounded border-2 border-cyan-600/45 dark:border-cyan-400/45 bg-cyan-500/12 px-1.5 py-0.2 font-mono text-[11px] font-black tracking-wider text-foreground shrink-0 uppercase">
                          {placa}
                        </span>
                      ) : (
                        <span className="text-[10px] italic text-muted-foreground shrink-0">
                          Sin placa
                        </span>
                      )}
                      {titulo !== placa ? (
                        <span className="truncate text-xs font-semibold text-foreground">
                          {titulo}
                        </span>
                      ) : null}
                    </div>
                    {ubicacion ? (
                      <span className="text-[10.5px] text-muted-foreground truncate mt-0.5 leading-snug">
                        {ubicacion}
                      </span>
                    ) : null}
                  </div>
                </div>
              </ComboboxItem>
            )
          }}
        </ComboboxList>

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
                disabled={page === 0 || vehiculosQuery.isFetching}
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
                disabled={page >= totalPages - 1 || vehiculosQuery.isFetching}
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

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Car, Layers, Loader2, RefreshCw, X } from "lucide-react"

import { flotaQueries } from "@/modules/gestionvehicular/flota-vehicular/api/flota.queries"
import type { FlotaVehiculo } from "@/modules/gestionvehicular/flota-vehicular/api/flota.service"
import { vehiculoQueries } from "@/modules/gestionvehicular/vehiculo/api/vehiculo.queries"
import type { VehiculoCatalogo } from "@/modules/gestionvehicular/vehiculo/api/vehiculo.types"
import {
  getPlacaFromAtributos,
  getVehiculoTituloDinamico,
} from "@/modules/gestionvehicular/vehiculo/lib/vehiculo-atributos.utils"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { Badge } from "@/shared/components/ui/badge"
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

import {
  extractPlaca,
  isVehiculoDisponible,
} from "../lib/vehiculo-responsable.utils"

export type VehiculoResponsableItem = FlotaVehiculo | VehiculoCatalogo

export type VehiculoResponsableComboboxProps = {
  value?: string | null
  empleadoId?: string | null
  onValueChange?: (value: string, item?: VehiculoResponsableItem | null) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  "aria-invalid"?: boolean
}

interface SelectedVehicleData {
  id: string
  titulo: string
  urlImagen?: string | null
  flotaNombre?: string
  placa: string | null
  estadoOperativoNombre?: string | null
  estadoOperativoColor?: string | null
}

function resolveFlotaVehiculoPlaca(fv: FlotaVehiculo): string | null {
  const veh = fv.vehiculo
  if (!veh) return null
  if (veh.placa?.trim()) return veh.placa.trim()
  if (veh.atributos) {
    for (const [key, val] of Object.entries(veh.atributos)) {
      if (key.toUpperCase().includes("PLACA") && val?.trim()) {
        return val.trim()
      }
    }
  }
  return extractPlaca(veh.descripcion)
}

function resolveFlotaVehiculoTitulo(fv: FlotaVehiculo): string {
  const veh = fv.vehiculo
  if (!veh) return "Vehículo"
  const parts = [veh.marca, veh.modelo].filter((p) => Boolean(p?.trim()))
  if (parts.length > 0) return parts.join(" · ")
  return veh.nombre || "Vehículo"
}

function resolveSelectedVehicle(
  value: string | null | undefined,
  flotaVehiculos: FlotaVehiculo[],
  generalVehiculos: VehiculoCatalogo[],
  singleVehiculo?: VehiculoCatalogo | null
): SelectedVehicleData | null {
  if (!value) return null

  const fv = flotaVehiculos.find((item) => item.activoId === value)
  if (fv?.vehiculo) {
    return {
      id: fv.activoId,
      titulo: resolveFlotaVehiculoTitulo(fv),
      urlImagen: fv.vehiculo.urlImagen,
      flotaNombre: fv.flota?.nombre,
      placa: resolveFlotaVehiculoPlaca(fv),
      estadoOperativoNombre: fv.vehiculo.estadoOperativoNombre,
      estadoOperativoColor: fv.vehiculo.estadoOperativoColor,
    }
  }

  const v = singleVehiculo || generalVehiculos.find((item) => item.id === value)
  if (v) {
    const { valor: placa } = getPlacaFromAtributos(v)
    return {
      id: v.id,
      titulo: getVehiculoTituloDinamico(v),
      urlImagen: v.urlImagen,
      flotaNombre: v.flotas.length > 0 ? v.flotas.map((f) => f.nombre).join(", ") : undefined,
      placa,
      estadoOperativoNombre: v.estadoOperativo?.nombre,
      estadoOperativoColor: v.estadoOperativo?.color,
    }
  }

  return null
}

function filterFlotaVehiculos(items: FlotaVehiculo[], search: string): FlotaVehiculo[] {
  const q = search.toLowerCase().trim()
  if (!q) return items
  return items.filter((fv) => {
    const veh = fv.vehiculo
    const placa = resolveFlotaVehiculoPlaca(fv)?.toLowerCase() ?? ""
    const titulo = resolveFlotaVehiculoTitulo(fv).toLowerCase()
    return (
      placa.includes(q) ||
      titulo.includes(q) ||
      veh?.nombre?.toLowerCase().includes(q) ||
      veh?.descripcion?.toLowerCase().includes(q) ||
      fv.flota?.nombre?.toLowerCase().includes(q)
    )
  })
}

function getFlotaVehiculoLabel(item: FlotaVehiculo): string {
  if (!item?.vehiculo) return ""
  const placa = resolveFlotaVehiculoPlaca(item)
  const titulo = resolveFlotaVehiculoTitulo(item)
  return [placa, titulo, item.flota?.nombre].filter(Boolean).join(" ")
}

function getGeneralVehiculoLabel(item: VehiculoCatalogo): string {
  if (!item) return ""
  const { valor: placa } = getPlacaFromAtributos(item)
  const titulo = getVehiculoTituloDinamico(item)
  return [placa, titulo].filter(Boolean).join(" ")
}

function getFlotaEmptyMessage(isLoading: boolean, totalCount: number): string {
  if (isLoading) return "Cargando vehículos..."
  if (totalCount === 0) {
    return "El empleado seleccionado no tiene vehículos en sus flotas asignadas."
  }
  return "No se encontraron vehículos coincidentes."
}

interface SelectedVehiculoCardProps {
  selectedInfo: SelectedVehicleData
  disabled?: boolean
  ariaInvalid?: boolean
  className?: string
  onClear: () => void
}

function SelectedVehiculoCard({
  selectedInfo,
  disabled,
  ariaInvalid,
  className,
  onClear,
}: Readonly<SelectedVehiculoCardProps>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2.5 sm:gap-3 rounded-xl border border-border/80 bg-background/95 p-2 sm:p-2.5 shadow-2xs hover:border-primary/40 hover:bg-muted/30 transition-all min-h-12",
        ariaInvalid && "border-destructive ring-1 ring-destructive/20",
        className?.replace(/\bh-\S+/g, "")
      )}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <div className="relative size-9 sm:size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40 flex items-center justify-center shadow-xs">
          {selectedInfo.urlImagen ? (
            <AuthenticatedImage
              src={selectedInfo.urlImagen}
              alt={selectedInfo.titulo}
              className="size-full object-cover"
              fallback={<Car className="size-4.5 text-primary/70" />}
            />
          ) : (
            <Car className="size-4.5 text-primary/70" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            {selectedInfo.placa ? (
              <span className="inline-flex items-center rounded border-2 border-cyan-600/45 dark:border-cyan-400/45 bg-cyan-500/12 px-1.5 py-0.5 font-mono text-[11px] font-black tracking-wider text-foreground shrink-0 uppercase">
                {selectedInfo.placa}
              </span>
            ) : null}
            {selectedInfo.titulo !== selectedInfo.placa ? (
              <span className="font-semibold text-xs text-foreground truncate">
                {selectedInfo.titulo}
              </span>
            ) : null}
            {selectedInfo.estadoOperativoNombre && (
              <span
                className="text-[9.5px] font-medium px-1.5 py-0.2 rounded border inline-flex items-center gap-1 shrink-0"
                style={{
                  backgroundColor: `${selectedInfo.estadoOperativoColor || "#10b981"}18`,
                  color: selectedInfo.estadoOperativoColor || "#10b981",
                  borderColor: `${selectedInfo.estadoOperativoColor || "#10b981"}40`,
                }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{
                    backgroundColor: selectedInfo.estadoOperativoColor || "#10b981",
                  }}
                />
                {selectedInfo.estadoOperativoNombre}
              </span>
            )}
          </div>

          {selectedInfo.flotaNombre && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
              <Layers className="size-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span className="font-medium text-cyan-700 dark:text-cyan-300 truncate">
                Flota: {selectedInfo.flotaNombre}
              </span>
            </div>
          )}
        </div>
      </div>

      {!disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onClear}
          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0 cursor-pointer transition-colors"
          title="Cambiar vehículo seleccionado"
        >
          <X className="size-3.5" />
          <span className="sr-only">Remover</span>
        </Button>
      )}
    </div>
  )
}

interface FlotaVehiculoItemRowProps {
  item: FlotaVehiculo
}

function FlotaVehiculoItemRow({ item }: Readonly<FlotaVehiculoItemRowProps>) {
  const veh = item.vehiculo
  if (!veh) return null
  const placa = resolveFlotaVehiculoPlaca(item)
  const titulo = resolveFlotaVehiculoTitulo(item)
  const disponible = isVehiculoDisponible(veh.estadoOperativoNombre)

  return (
    <ComboboxItem
      key={item.id}
      value={item}
      disabled={!disponible}
      className={cn(
        "text-xs py-2 px-2.5 transition-colors rounded-lg",
        disponible
          ? "cursor-pointer hover:bg-accent/60"
          : "cursor-not-allowed opacity-55 bg-muted/20"
      )}
    >
      <div className="flex items-center gap-2.5 w-full min-w-0">
        <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/50 flex items-center justify-center">
          {veh.urlImagen ? (
            <AuthenticatedImage
              src={veh.urlImagen}
              alt={titulo}
              className="size-full object-cover"
              fallback={<Car className="size-4 text-muted-foreground/60" />}
            />
          ) : (
            <Car className="size-4 text-muted-foreground/60" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
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
              <span className="font-semibold text-foreground truncate text-xs">
                {titulo}
              </span>
            ) : null}
            {veh.estadoOperativoNombre && (
              <span
                className="text-[9px] font-medium px-1.5 py-0.2 rounded border inline-flex items-center gap-1 shrink-0"
                style={{
                  backgroundColor: `${veh.estadoOperativoColor || "#10b981"}18`,
                  color: veh.estadoOperativoColor || "#10b981",
                  borderColor: `${veh.estadoOperativoColor || "#10b981"}40`,
                }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{
                    backgroundColor: veh.estadoOperativoColor || "#10b981",
                  }}
                />
                {veh.estadoOperativoNombre}
              </span>
            )}
            {!disponible && (
              <span className="text-[9px] font-semibold text-destructive bg-destructive/10 border border-destructive/25 px-1 py-0.2 rounded shrink-0">
                No disponible
              </span>
            )}
          </div>

          {item.flota && (
            <div className="flex items-center gap-1 text-[10.5px] text-muted-foreground truncate">
              <Badge
                variant="outline"
                className="text-[9.5px] px-1.5 py-0 h-4 border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-medium"
              >
                {item.flota.nombre}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </ComboboxItem>
  )
}

interface GeneralVehiculoItemRowProps {
  item: VehiculoCatalogo
}

function GeneralVehiculoItemRow({ item }: Readonly<GeneralVehiculoItemRowProps>) {
  const { valor: placa } = getPlacaFromAtributos(item)
  const titulo = getVehiculoTituloDinamico(item)
  const disponible = isVehiculoDisponible(item.estadoOperativo?.nombre)

  return (
    <ComboboxItem
      key={item.id}
      value={item}
      disabled={!disponible}
      className={cn(
        "text-xs py-2 px-2.5 transition-colors rounded-lg",
        disponible
          ? "cursor-pointer hover:bg-accent/60"
          : "cursor-not-allowed opacity-55 bg-muted/20"
      )}
    >
      <div className="flex items-center gap-2.5 w-full min-w-0">
        <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/50 flex items-center justify-center">
          {item.urlImagen ? (
            <AuthenticatedImage
              src={item.urlImagen}
              alt={titulo}
              className="size-full object-cover"
              fallback={<Car className="size-4 text-muted-foreground/60" />}
            />
          ) : (
            <Car className="size-4 text-muted-foreground/60" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
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
              <span className="font-semibold text-foreground truncate text-xs">
                {titulo}
              </span>
            ) : null}
            {item.estadoOperativo?.nombre && (
              <span
                className="text-[9px] font-medium px-1.5 py-0.2 rounded border inline-flex items-center gap-1 shrink-0"
                style={{
                  backgroundColor: `${item.estadoOperativo.color || "#10b981"}18`,
                  color: item.estadoOperativo.color || "#10b981",
                  borderColor: `${item.estadoOperativo.color || "#10b981"}40`,
                }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{
                    backgroundColor: item.estadoOperativo.color || "#10b981",
                  }}
                />
                {item.estadoOperativo.nombre}
              </span>
            )}
            {!disponible && (
              <span className="text-[9px] font-semibold text-destructive bg-destructive/10 border border-destructive/25 px-1 py-0.2 rounded shrink-0">
                No disponible
              </span>
            )}
          </div>
          {item.flotas.length > 0 ? (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
              <Layers className="size-2.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span className="truncate">
                {item.flotas.map((f) => f.nombre).join(", ")}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </ComboboxItem>
  )
}

interface FlotaVehiculosComboboxProps {
  id?: string
  name?: string
  className?: string
  placeholder?: string
  disabled?: boolean
  ariaInvalid?: boolean
  onBlur?: () => void
  onValueChange?: (value: string, item?: FlotaVehiculo | null) => void
  onSearchChange: (value: string) => void
  items: FlotaVehiculo[]
  rawCount: number
  isLoading: boolean
  isFetching: boolean
  onRefresh: () => void
}

function FlotaVehiculosCombobox({
  id,
  name,
  className,
  placeholder,
  disabled,
  ariaInvalid,
  onBlur,
  onValueChange,
  onSearchChange,
  items,
  rawCount,
  isLoading,
  isFetching,
  onRefresh,
}: Readonly<FlotaVehiculosComboboxProps>) {
  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRefresh()
  }

  const placeholderText = isLoading
    ? "Cargando vehículos de las flotas del responsable..."
    : placeholder || "Buscar vehículo por placa, marca o modelo..."

  return (
    <Combobox
      items={items}
      filter={() => true}
      itemToStringLabel={getFlotaVehiculoLabel}
      itemToStringValue={(item: FlotaVehiculo) => item?.activoId ?? ""}
      value={null}
      onValueChange={(val: FlotaVehiculo | null) => {
        onValueChange?.(val?.activoId ?? "", val)
        onSearchChange("")
      }}
      disabled={disabled || isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholderText}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          className={cn("w-full h-10 text-sm shadow-2xs", className)}
        />
        {isFetching && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <ComboboxContent className="z-50 w-(--anchor-width) min-w-[min(100vw-2rem,var(--anchor-width))] max-w-[var(--anchor-width)] p-1 rounded-xl shadow-lg border border-border/80 bg-popover overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 text-[11px] text-muted-foreground bg-muted/30 select-none">
          <span className="font-medium truncate flex items-center gap-1.5">
            <Layers className="size-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
            {isFetching
              ? "Actualizando vehículos de flota..."
              : `Vehículos en flotas del responsable (${items.length})`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleRefresh}
            disabled={isFetching}
            title="Recargar vehículos"
            className="size-6 text-muted-foreground hover:text-foreground hover:bg-background/80"
          >
            <RefreshCw className={cn("size-3", isFetching && "animate-spin")} />
          </Button>
        </div>

        <ComboboxEmpty className="py-5 text-xs text-muted-foreground text-center">
          {getFlotaEmptyMessage(isLoading, rawCount)}
        </ComboboxEmpty>

        <ComboboxList className="max-h-56 overflow-y-auto overscroll-contain pr-1 py-1">
          {(item: FlotaVehiculo) => (
            <FlotaVehiculoItemRow key={item.id} item={item} />
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

interface GeneralVehiculosComboboxProps {
  id?: string
  name?: string
  className?: string
  placeholder?: string
  disabled?: boolean
  ariaInvalid?: boolean
  onBlur?: () => void
  onValueChange?: (value: string, item?: VehiculoCatalogo | null) => void
  onSearchChange: (value: string) => void
  items: VehiculoCatalogo[]
  isLoading: boolean
  isFetching: boolean
  onRefresh: () => void
}

function GeneralVehiculosCombobox({
  id,
  name,
  className,
  placeholder,
  disabled,
  ariaInvalid,
  onBlur,
  onValueChange,
  onSearchChange,
  items,
  isLoading,
  isFetching,
  onRefresh,
}: Readonly<GeneralVehiculosComboboxProps>) {
  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRefresh()
  }

  const placeholderText = isLoading
    ? "Cargando vehículos..."
    : placeholder || "Buscar vehículo por placa, marca o modelo..."

  return (
    <Combobox
      items={items}
      filter={() => true}
      itemToStringLabel={getGeneralVehiculoLabel}
      itemToStringValue={(item: VehiculoCatalogo) => item?.id ?? ""}
      value={null}
      onValueChange={(val: VehiculoCatalogo | null) => {
        onValueChange?.(val?.id ?? "", val)
        onSearchChange("")
      }}
      disabled={disabled || isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholderText}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          className={cn("w-full h-10 text-sm shadow-2xs", className)}
        />
        {isFetching && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <ComboboxContent className="z-50 w-(--anchor-width) min-w-[min(100vw-2rem,var(--anchor-width))] max-w-[var(--anchor-width)] p-1 rounded-xl shadow-lg border border-border/80 bg-popover overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 text-[11px] text-muted-foreground bg-muted/30 select-none">
          <span className="font-medium truncate">
            {isFetching ? "Actualizando..." : `Vehículos (${items.length})`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleRefresh}
            disabled={isFetching}
            className="size-6 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("size-3", isFetching && "animate-spin")} />
          </Button>
        </div>

        <ComboboxEmpty className="py-5 text-xs text-muted-foreground text-center">
          {isLoading
            ? "Cargando vehículos..."
            : "No se encontraron vehículos coincidentes."}
        </ComboboxEmpty>

        <ComboboxList className="max-h-56 overflow-y-auto overscroll-contain pr-1 py-1">
          {(item: VehiculoCatalogo) => (
            <GeneralVehiculoItemRow key={item.id} item={item} />
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function VehiculoResponsableCombobox({
  value = "",
  empleadoId,
  onValueChange,
  onBlur,
  placeholder,
  disabled = false,
  className,
  id,
  name,
  "aria-invalid": ariaInvalid,
}: Readonly<VehiculoResponsableComboboxProps>) {
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search, 250)

  const hasEmpleado = Boolean(empleadoId)

  // 1. Consulta de vehículos asociados al empleado responsable de flota
  const flotaVehiculosQuery = useQuery({
    ...flotaQueries.vehiculosByEmpleado(empleadoId ?? "", true),
    enabled: hasEmpleado,
  })

  // 2. Consulta propia de gestión vehicular (solo tipo Vehículo con atributos visibles)
  const generalVehiculosQuery = useQuery({
    ...vehiculoQueries.list({
      page: 0,
      size: 30,
      q: debouncedSearch.trim() || undefined,
      sortBy: "nombre",
      direction: "ASC",
    }),
    enabled: !hasEmpleado,
  })

  // 3. Consulta individual propia del vehículo seleccionado
  const singleVehiculoQuery = useQuery({
    ...vehiculoQueries.detail(value ?? ""),
    enabled: Boolean(value),
  })

  const rawFlotaVehiculos = React.useMemo<FlotaVehiculo[]>(
    () => flotaVehiculosQuery.data ?? [],
    [flotaVehiculosQuery.data]
  )
  const rawGeneralVehiculos = React.useMemo<VehiculoCatalogo[]>(
    () => generalVehiculosQuery.data?.content ?? [],
    [generalVehiculosQuery.data?.content]
  )

  const filteredFlotaVehiculos = React.useMemo(
    () => filterFlotaVehiculos(rawFlotaVehiculos, debouncedSearch),
    [rawFlotaVehiculos, debouncedSearch]
  )

  const selectedInfo = React.useMemo(
    () =>
      resolveSelectedVehicle(
        value,
        rawFlotaVehiculos,
        rawGeneralVehiculos,
        singleVehiculoQuery.data
      ),
    [value, rawFlotaVehiculos, rawGeneralVehiculos, singleVehiculoQuery.data]
  )

  if (selectedInfo) {
    return (
      <SelectedVehiculoCard
        selectedInfo={selectedInfo}
        disabled={disabled}
        ariaInvalid={ariaInvalid}
        className={className}
        onClear={() => onValueChange?.("", null)}
      />
    )
  }

  if (hasEmpleado) {
    return (
      <FlotaVehiculosCombobox
        id={id}
        name={name}
        className={className}
        placeholder={placeholder}
        disabled={disabled}
        ariaInvalid={ariaInvalid}
        onBlur={onBlur}
        onValueChange={onValueChange}
        onSearchChange={setSearch}
        items={filteredFlotaVehiculos}
        rawCount={rawFlotaVehiculos.length}
        isLoading={flotaVehiculosQuery.isLoading}
        isFetching={flotaVehiculosQuery.isFetching}
        onRefresh={() => void flotaVehiculosQuery.refetch()}
      />
    )
  }

  return (
    <GeneralVehiculosCombobox
      id={id}
      name={name}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      ariaInvalid={ariaInvalid}
      onBlur={onBlur}
      onValueChange={onValueChange}
      onSearchChange={setSearch}
      items={rawGeneralVehiculos}
      isLoading={generalVehiculosQuery.isLoading}
      isFetching={generalVehiculosQuery.isFetching}
      onRefresh={() => void generalVehiculosQuery.refetch()}
    />
  )
}

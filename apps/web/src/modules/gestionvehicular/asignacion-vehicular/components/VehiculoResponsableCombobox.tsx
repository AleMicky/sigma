import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Box, Car, Layers, Loader2, RefreshCw, X } from "lucide-react"

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
import { flotaQueries } from "@/modules/gestionvehicular/flota-vehicular/api/flota.queries"
import type { FlotaVehiculo } from "@/modules/gestionvehicular/flota-vehicular/api/flota.service"
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

export type VehiculoResponsableComboboxProps = {
  value?: string | null
  empleadoId?: string | null
  onValueChange?: (value: string, item?: FlotaVehiculo | Activo | null) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  "aria-invalid"?: boolean
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
}: VehiculoResponsableComboboxProps) {
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search, 250)

  const hasEmpleado = Boolean(empleadoId)

  // 1. Consulta de vehículos asociados al empleado responsable de flota
  const flotaVehiculosQuery = useQuery({
    ...flotaQueries.vehiculosByEmpleado(empleadoId ?? "", true),
    enabled: hasEmpleado,
  })

  // 2. Consulta de respaldo general si no hay empleado seleccionado
  const generalActivosQuery = useQuery({
    ...activoQueries.list({ page: 0, size: 30, sortBy: "codigo", direction: "ASC" }),
    enabled: !hasEmpleado,
  })

  // 3. Consulta individual si hay un valor seleccionado
  const singleActivoQuery = useQuery({
    ...activoQueries.detail(value ?? ""),
    enabled: Boolean(value),
  })

  const rawFlotaVehiculos: FlotaVehiculo[] = flotaVehiculosQuery.data ?? []
  const rawGeneralActivos: Activo[] = generalActivosQuery.data?.content ?? []

  // Filtrado reactivo en memoria
  const filteredFlotaVehiculos = React.useMemo(() => {
    if (!debouncedSearch.trim()) return rawFlotaVehiculos
    const q = debouncedSearch.toLowerCase().trim()
    return rawFlotaVehiculos.filter((fv) => {
      const veh = fv.vehiculo
      const matchCodigo = veh?.codigo?.toLowerCase().includes(q)
      const matchNombre = veh?.nombre?.toLowerCase().includes(q)
      const matchDesc = veh?.descripcion?.toLowerCase().includes(q)
      const matchFlota = fv.flota?.nombre?.toLowerCase().includes(q)
      return matchCodigo || matchNombre || matchDesc || matchFlota
    })
  }, [rawFlotaVehiculos, debouncedSearch])

  const filteredGeneralActivos = React.useMemo(() => {
    if (!debouncedSearch.trim()) return rawGeneralActivos
    const q = debouncedSearch.toLowerCase().trim()
    return rawGeneralActivos.filter((a) => {
      const matchCodigo = a.codigo?.toLowerCase().includes(q)
      const matchNombre = a.nombre?.toLowerCase().includes(q)
      const matchDesc = a.descripcion?.toLowerCase().includes(q)
      return matchCodigo || matchNombre || matchDesc
    })
  }, [rawGeneralActivos, debouncedSearch])

  // Obtener info del vehículo actualmente seleccionado
  const selectedInfo = React.useMemo(() => {
    if (!value) return null

    // Buscar primero en la lista de flota
    const fv = rawFlotaVehiculos.find((item) => item.activoId === value)
    if (fv && fv.vehiculo) {
      return {
        id: fv.activoId,
        codigo: fv.vehiculo.codigo,
        nombre: fv.vehiculo.nombre,
        descripcion: fv.vehiculo.descripcion,
        urlImagen: fv.vehiculo.urlImagen,
        flotaNombre: fv.flota?.nombre,
        placa: extractPlaca(fv.vehiculo.descripcion),
      }
    }

    // Buscar en el detalle individual o en lista general
    const a = singleActivoQuery.data || rawGeneralActivos.find((item) => item.id === value)
    if (a) {
      return {
        id: a.id,
        codigo: a.codigo,
        nombre: a.nombre,
        descripcion: a.descripcion,
        urlImagen: a.urlImagen,
        flotaNombre: undefined,
        placa: extractPlaca(a.descripcion),
      }
    }

    return null
  }, [value, rawFlotaVehiculos, rawGeneralActivos, singleActivoQuery.data])

  const isLoading = hasEmpleado ? flotaVehiculosQuery.isLoading : generalActivosQuery.isLoading
  const isFetching = hasEmpleado ? flotaVehiculosQuery.isFetching : generalActivosQuery.isFetching

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasEmpleado) {
      flotaVehiculosQuery.refetch()
    } else {
      generalActivosQuery.refetch()
    }
  }

  // Vista cuando ya está seleccionado un vehículo
  if (selectedInfo) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2.5 sm:gap-3 rounded-xl border border-border/80 bg-background/95 p-2 sm:p-2.5 shadow-2xs hover:border-primary/40 hover:bg-muted/30 transition-all min-h-12",
          ariaInvalid && "border-destructive ring-1 ring-destructive/20",
          className?.replace(/\bh-\S+/g, "")
        )}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {/* Miniatura */}
          <div className="relative size-9 sm:size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40 flex items-center justify-center shadow-xs">
            {selectedInfo.urlImagen ? (
              <AuthenticatedImage
                src={selectedInfo.urlImagen}
                alt={selectedInfo.nombre}
                className="size-full object-cover"
                fallback={<Car className="size-4.5 text-primary/70" />}
              />
            ) : (
              <Car className="size-4.5 text-primary/70" />
            )}
          </div>

          {/* Datos del Activo / Vehículo */}
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <code className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                {selectedInfo.codigo}
              </code>
              <span className="font-semibold text-xs text-foreground truncate">
                {selectedInfo.nombre}
              </span>
              {selectedInfo.placa && (
                <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded shrink-0">
                  Placa: {selectedInfo.placa}
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
            onClick={() => onValueChange?.("", null)}
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

  // Combobox si usa lista de flota de responsable
  if (hasEmpleado) {
    return (
      <Combobox
        items={filteredFlotaVehiculos}
        filter={() => true}
        itemToStringLabel={(item: FlotaVehiculo) => {
          if (!item || !item.vehiculo) return ""
          const placa = extractPlaca(item.vehiculo.descripcion)
          return `${item.vehiculo.codigo} ${item.vehiculo.nombre} ${item.flota?.nombre ?? ""} ${placa ? `placa ${placa}` : ""} ${item.vehiculo.descripcion ?? ""}`
        }}
        itemToStringValue={(item: FlotaVehiculo) => item?.activoId ?? ""}
        value={null}
        onValueChange={(val: FlotaVehiculo | null) => {
          onValueChange?.(val?.activoId ?? "", val)
          setSearch("")
        }}
        disabled={disabled || isLoading}
      >
        <div className="relative w-full">
          <ComboboxInput
            id={id}
            name={name}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isLoading
                ? "Cargando vehículos de las flotas del responsable..."
                : placeholder || "Seleccionar vehículo de las flotas asignadas..."
            }
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
                : `Vehículos en flotas del responsable (${filteredFlotaVehiculos.length})`}
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
            {isLoading
              ? "Cargando vehículos..."
              : rawFlotaVehiculos.length === 0
              ? "El empleado seleccionado no tiene vehículos en sus flotas asignadas."
              : "No se encontraron vehículos coincidentes."}
          </ComboboxEmpty>

          <ComboboxList className="max-h-56 overflow-y-auto overscroll-contain pr-1 py-1">
            {(item: FlotaVehiculo) => {
              const veh = item.vehiculo
              if (!veh) return null
              const placa = extractPlaca(veh.descripcion)

              return (
                <ComboboxItem
                  key={item.id}
                  value={item}
                  className="text-xs py-2 px-2.5 cursor-pointer hover:bg-accent/60 transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-2.5 w-full min-w-0">
                    <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/50 flex items-center justify-center">
                      {veh.urlImagen ? (
                        <AuthenticatedImage
                          src={veh.urlImagen}
                          alt={veh.nombre}
                          className="size-full object-cover"
                          fallback={<Car className="size-4 text-muted-foreground/60" />}
                        />
                      ) : (
                        <Car className="size-4 text-muted-foreground/60" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <code className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                          {veh.codigo}
                        </code>
                        <span className="font-semibold text-foreground truncate text-xs">
                          {veh.nombre}
                        </span>
                        {placa && (
                          <span className="text-[9.5px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded shrink-0">
                            {placa}
                          </span>
                        )}
                      </div>

                      {item.flota && (
                        <div className="flex items-center gap-1 text-[10.5px] text-muted-foreground truncate">
                          <Badge variant="outline" className="text-[9.5px] px-1.5 py-0 h-4 border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-medium">
                            {item.flota.nombre}
                          </Badge>
                        </div>
                      )}
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

  // Fallback cuando no hay empleadoId especificado aún
  return (
    <Combobox
      items={filteredGeneralActivos}
      filter={() => true}
      itemToStringLabel={(item: Activo) => {
        if (!item) return ""
        const placa = extractPlaca(item.descripcion)
        return `${item.codigo} ${item.nombre} ${placa ? `placa ${placa}` : ""} ${item.descripcion ?? ""}`
      }}
      itemToStringValue={(item: Activo) => item?.id ?? ""}
      value={null}
      onValueChange={(val: Activo | null) => {
        onValueChange?.(val?.id ?? "", val)
        setSearch("")
      }}
      disabled={disabled || isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            isLoading
              ? "Cargando vehículos..."
              : placeholder || "Buscar vehículo por código o placa..."
          }
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
            {isFetching ? "Actualizando..." : `Vehículos generales (${filteredGeneralActivos.length})`}
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
          {isLoading ? "Cargando vehículos..." : "No se encontraron vehículos coincidentes."}
        </ComboboxEmpty>

        <ComboboxList className="max-h-56 overflow-y-auto overscroll-contain pr-1 py-1">
          {(item: Activo) => {
            const placa = extractPlaca(item.descripcion)

            return (
              <ComboboxItem
                key={item.id}
                value={item}
                className="text-xs py-2 px-2.5 cursor-pointer hover:bg-accent/60 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-2.5 w-full min-w-0">
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/50 flex items-center justify-center">
                    {item.urlImagen ? (
                      <AuthenticatedImage
                        src={item.urlImagen}
                        alt={item.nombre}
                        className="size-full object-cover"
                        fallback={<Box className="size-4 text-muted-foreground/60" />}
                      />
                    ) : (
                      <Box className="size-4 text-muted-foreground/60" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <code className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                        {item.codigo}
                      </code>
                      <span className="font-semibold text-foreground truncate text-xs">
                        {item.nombre}
                      </span>
                      {placa && (
                        <span className="text-[9.5px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded shrink-0">
                          {placa}
                        </span>
                      )}
                    </div>
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

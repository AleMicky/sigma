import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react"

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { cn } from "@/shared/lib/utils"

import { useSincronizarVehiculos } from "../api/flota.mutations"
import type { FlotaVehicular, FlotaVehiculo } from "../api/flota.service"

interface FlotaAsignarVehiculosDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flota: FlotaVehicular
  assignedVehiculos: FlotaVehiculo[]
  onSuccess?: () => void
}

export function FlotaAsignarVehiculosDialog(
  props: Readonly<FlotaAsignarVehiculosDialogProps>
) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.open && <FlotaAsignarVehiculosContent {...props} />}
    </Dialog>
  )
}

function FlotaAsignarVehiculosContent({
  onOpenChange,
  flota,
  assignedVehiculos,
  onSuccess,
}: Readonly<FlotaAsignarVehiculosDialogProps>) {
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search, 250)
  const [page, setPage] = React.useState(0)
  const [prevSearch, setPrevSearch] = React.useState(debouncedSearch)
  const pageSize = 10

  if (prevSearch !== debouncedSearch) {
    setPrevSearch(debouncedSearch)
    setPage(0)
  }

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    () =>
      new Set(assignedVehiculos.filter((v) => v.activo).map((v) => v.activoId))
  )

  const query = useQuery({
    ...vehiculoQueries.list({
      page,
      size: pageSize,
      q: debouncedSearch.trim() || undefined,
      activo: true,
      sortBy: "nombre",
      direction: "ASC",
    }),
  })

  const vehiculos = React.useMemo<VehiculoCatalogo[]>(
    () => query.data?.content ?? [],
    [query.data?.content]
  )
  const totalPages = query.data?.totalPages ?? 1
  const totalElements = query.data?.totalElements ?? vehiculos.length

  const toggleSelect = (activoId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(activoId)) {
        next.delete(activoId)
      } else {
        next.add(activoId)
      }
      return next
    })
  }

  const selectAllCurrent = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      vehiculos.forEach((v) => next.add(v.id))
      return next
    })
  }

  const deselectAllCurrent = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      vehiculos.forEach((v) => next.delete(v.id))
      return next
    })
  }

  const syncMutation = useSincronizarVehiculos()

  const handleSave = async () => {
    try {
      await syncMutation.mutateAsync({
        flotaId: flota.id,
        data: {
          activoIds: Array.from(selectedIds),
        },
      })
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // Handled by mutation toast
    }
  }

  const allCurrentSelected =
    vehiculos.length > 0 && vehiculos.every((v) => selectedIds.has(v.id))

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
      <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/70">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Truck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Gestionar Vehículos de la Flota
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Selecciona los vehículos que formarán parte de{" "}
                <span className="font-semibold text-foreground">
                  {flota.nombre}
                </span>
              </DialogDescription>
            </div>
          </div>

          <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">
            {selectedIds.size}{" "}
            {selectedIds.size === 1 ? "vehículo" : "vehículos"} seleccionados
          </Badge>
        </div>
      </DialogHeader>

      {/* Barra de búsqueda y acciones rápidas */}
      <div className="px-6 py-3 bg-muted/20 border-b border-border/50 flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por placa, marca, modelo o atributo…"
            className="pl-8 text-xs h-8.5 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={allCurrentSelected ? deselectAllCurrent : selectAllCurrent}
            className="h-8.5 text-xs gap-1.5"
          >
            <Check className="size-3.5" />
            {allCurrentSelected ? "Deseleccionar vista" : "Seleccionar vista"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
            className="size-8.5"
            title="Refrescar catálogo de vehículos"
          >
            <RefreshCw
              className={cn("size-3.5", query.isFetching && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {/* Lista de vehículos (desde /gestion-vehicular/vehiculos, sin código de activo) */}
      <div className="flex-1 overflow-y-auto px-6 py-3 min-h-[260px] max-h-[380px] space-y-2">
        {query.isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-cyan-500" />
            <p className="text-xs">Cargando vehículos disponibles…</p>
          </div>
        ) : vehiculos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground text-center">
            <Car className="size-8 opacity-40" />
            <p className="text-xs font-medium">
              No se encontraron vehículos coincidentes
            </p>
          </div>
        ) : (
          vehiculos.map((v) => {
            const isSelected = selectedIds.has(v.id)
            const { valor: placa } = getPlacaFromAtributos(v)
            const titulo = getVehiculoTituloDinamico(v)

            return (
              <div
                key={v.id}
                onClick={() => toggleSelect(v.id)}
                className={cn(
                  "flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none",
                  isSelected
                    ? "border-cyan-500/50 bg-cyan-500/5 dark:bg-cyan-950/20 shadow-xs"
                    : "border-border/70 hover:border-border hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(v.id)}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    className="size-4 rounded accent-cyan-600 cursor-pointer"
                  />

                  {/* Foto */}
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-background flex items-center justify-center">
                    {v.urlImagen ? (
                      <AuthenticatedImage
                        src={v.urlImagen}
                        alt={titulo}
                        className="size-full object-cover"
                        fallback={
                          <Car className="size-4 text-muted-foreground/60" />
                        }
                      />
                    ) : (
                      <Car className="size-4 text-muted-foreground/60" />
                    )}
                  </div>

                  {/* Info destacada con Placa (sin código de activo) */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {placa ? (
                        <span className="inline-flex items-center rounded border-2 border-cyan-600/45 dark:border-cyan-400/45 bg-cyan-500/12 px-1.5 py-0.5 font-mono text-[11px] font-black tracking-wider text-foreground shadow-2xs shrink-0 uppercase">
                          {placa}
                        </span>
                      ) : (
                        <span className="text-[10px] italic text-muted-foreground shrink-0">
                          Sin placa
                        </span>
                      )}
                      {titulo !== placa ? (
                        <span className="font-semibold text-xs text-foreground truncate">
                          {titulo}
                        </span>
                      ) : null}
                      {v.estadoOperativo?.nombre ? (
                        <span
                          className="text-[9.5px] font-medium px-1.5 py-0.2 rounded border inline-flex items-center gap-1 shrink-0"
                          style={{
                            backgroundColor: `${v.estadoOperativo.color || "#10b981"}18`,
                            color: v.estadoOperativo.color || "#10b981",
                            borderColor: `${v.estadoOperativo.color || "#10b981"}40`,
                          }}
                        >
                          <span
                            className="size-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                v.estadoOperativo.color || "#10b981",
                            }}
                          />
                          {v.estadoOperativo.nombre}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="size-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <span className="truncate">
                          {v.ubicacion?.nombre || "Sin ubicación"}
                        </span>
                      </div>
                      {v.flotas.length > 0 ? (
                        <>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="truncate text-muted-foreground/80">
                            {v.flotas.map((f) => f.nombre).join(", ")}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer con Paginación y Guardar */}
      <div className="px-6 py-3 border-t border-border/70 bg-muted/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {totalPages > 1 && (
            <>
              <span className="tabular-nums">
                Página {page + 1} de {totalPages} ({totalElements} total)
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || query.isFetching}
                  className="size-6"
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || query.isFetching}
                  className="size-6"
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={syncMutation.isPending}
            className="text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={syncMutation.isPending}
            className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {syncMutation.isPending && (
              <Loader2 className="mr-2 size-3.5 animate-spin" />
            )}
            Guardar Asignación ({selectedIds.size})
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  )
}

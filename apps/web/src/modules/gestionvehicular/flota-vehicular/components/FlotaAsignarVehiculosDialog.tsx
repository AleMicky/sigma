import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
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

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
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

function extractPlaca(activo?: Activo | null): string | null {
  try {
    if (!activo || typeof activo !== "object") return null
    if (!activo.descripcion || typeof activo.descripcion !== "string") return null
    const match = activo.descripcion.match(
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

export function FlotaAsignarVehiculosDialog({
  open,
  onOpenChange,
  flota,
  assignedVehiculos,
  onSuccess,
}: FlotaAsignarVehiculosDialogProps) {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(0)
  const pageSize = 10

  // Guardamos un Set de los IDs seleccionados
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    if (open) {
      const currentIds = new Set(
        assignedVehiculos.filter((v) => v.activo).map((v) => v.activoId)
      )
      setSelectedIds(currentIds)
      setSearch("")
      setPage(0)
    }
  }, [open, assignedVehiculos])

  const query = useQuery({
    ...activoQueries.list({
      page,
      size: pageSize,
      sortBy: "codigo",
      direction: "ASC",
    }),
    enabled: open,
  })

  const activos = query.data?.content ?? []
  const totalPages = query.data?.totalPages ?? 1
  const totalElements = query.data?.totalElements ?? activos.length

  const filteredActivos = React.useMemo(() => {
    if (!search.trim()) return activos
    const term = search.toLowerCase().trim()
    return activos.filter((a: Activo) => {
      const placa = extractPlaca(a)?.toLowerCase() ?? ""
      return (
        a.codigo?.toLowerCase().includes(term) ||
        a.nombre?.toLowerCase().includes(term) ||
        a.descripcion?.toLowerCase().includes(term) ||
        a.ubicacion?.nombre?.toLowerCase().includes(term) ||
        placa.includes(term)
      )
    })
  }, [activos, search])

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
      filteredActivos.forEach((a: Activo) => next.add(a.id))
      return next
    })
  }

  const deselectAllCurrent = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      filteredActivos.forEach((a: Activo) => next.delete(a.id))
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

  const allFilteredSelected =
    filteredActivos.length > 0 &&
    filteredActivos.every((a: Activo) => selectedIds.has(a.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              {selectedIds.size} {selectedIds.size === 1 ? "vehículo" : "vehículos"} seleccionados
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
              placeholder="Filtrar por placa, código, modelo…"
              className="pl-8 text-xs h-8.5 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={allFilteredSelected ? deselectAllCurrent : selectAllCurrent}
              className="h-8.5 text-xs gap-1.5"
            >
              <Check className="size-3.5" />
              {allFilteredSelected ? "Deseleccionar vista" : "Seleccionar vista"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
              className="size-8.5"
              title="Refrescar catálogo"
            >
              <RefreshCw className={cn("size-3.5", query.isFetching && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Lista con scroll de vehículos */}
        <div className="flex-1 overflow-y-auto px-6 py-3 min-h-[260px] max-h-[380px] space-y-2">
          {query.isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-cyan-500" />
              <p className="text-xs">Cargando vehículos disponibles…</p>
            </div>
          ) : filteredActivos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground text-center">
              <Car className="size-8 opacity-40" />
              <p className="text-xs font-medium">No se encontraron vehículos coincidentes</p>
            </div>
          ) : (
            filteredActivos.map((activo: Activo) => {
              const isSelected = selectedIds.has(activo.id)
              const placa = extractPlaca(activo)

              return (
                <div
                  key={activo.id}
                  onClick={() => toggleSelect(activo.id)}
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
                      onChange={() => toggleSelect(activo.id)}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      className="size-4 rounded accent-cyan-600 cursor-pointer"
                    />

                    {/* Foto / Icono */}
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-background flex items-center justify-center">
                      {activo.urlImagen ? (
                        <AuthenticatedImage
                          src={activo.urlImagen}
                          alt={activo.nombre}
                          className="size-full object-cover"
                          fallback={<Box className="size-4 text-muted-foreground/60" />}
                        />
                      ) : (
                        <Box className="size-4 text-muted-foreground/60" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <code className="text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                          {activo.codigo}
                        </code>
                        <span className="font-semibold text-xs text-foreground truncate">
                          {activo.nombre}
                        </span>
                        {placa && (
                          <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded shrink-0">
                            Placa: {placa}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="size-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          <span className="truncate">
                            {activo.ubicacion?.nombre || "Sin ubicación"}
                          </span>
                        </div>
                        {activo.tipoActivo?.nombre && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="truncate text-muted-foreground/80">
                              {activo.tipoActivo.nombre}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer con Paginación y Botón Guardar */}
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
              {syncMutation.isPending && <Loader2 className="mr-2 size-3.5 animate-spin" />}
              Guardar Asignación ({selectedIds.size})
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

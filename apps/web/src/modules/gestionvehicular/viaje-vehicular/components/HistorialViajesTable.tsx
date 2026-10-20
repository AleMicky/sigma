import * as React from "react"
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Eye,
  Gauge,
  Inbox,
  MapPin,
  User,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { formatDate } from "@/shared/lib/format-date"
import type { ViajeVehicular } from "../api/viaje-vehicular.service"
import { HistorialViajeDetalleDialog } from "./HistorialViajeDetalleDialog"

export interface HistorialViajesTableProps {
  viajes: ViajeVehicular[]
  isLoading?: boolean
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

function getEstadoBadge(estado: string) {
  switch (estado) {
    case "FINALIZADO":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-medium">
          ● Finalizado
        </Badge>
      )
    case "EN_CURSO":
      return (
        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[11px] font-medium">
          <span className="relative flex h-1.5 w-1.5 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
          </span>
          En Tránsito
        </Badge>
      )
    case "PROGRAMADO":
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[11px] font-medium">
          ● Programado
        </Badge>
      )
    case "CANCELADO":
      return (
        <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[11px] font-medium">
          ● Cancelado
        </Badge>
      )
    default:
      return <Badge variant="outline" className="text-[11px]">{estado}</Badge>
  }
}

export function HistorialViajesTable({
  viajes,
  isLoading = false,
  currentPage,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: Readonly<HistorialViajesTableProps>) {
  const [selectedViaje, setSelectedViaje] = React.useState<ViajeVehicular | null>(null)
  const [detalleOpen, setDetalleOpen] = React.useState(false)

  const handleVerDetalle = (viaje: ViajeVehicular) => {
    setSelectedViaje(viaje)
    setDetalleOpen(true)
  }

  return (
    <>
      <Card className="border-border/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px] text-xs font-semibold">Nº Solicitud</TableHead>
                <TableHead className="min-w-[170px] text-xs font-semibold">Vehículo</TableHead>
                <TableHead className="min-w-[180px] text-xs font-semibold">Conductor</TableHead>
                <TableHead className="min-w-[200px] text-xs font-semibold">Destino / Motivo</TableHead>
                <TableHead className="min-w-[150px] text-xs font-semibold">Salida Real</TableHead>
                <TableHead className="min-w-[150px] text-xs font-semibold">Retorno Real</TableHead>
                <TableHead className="min-w-[110px] text-xs font-semibold text-right">Km Recorrido</TableHead>
                <TableHead className="w-[120px] text-xs font-semibold text-center">Estado</TableHead>
                <TableHead className="w-[70px] text-xs font-semibold text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`skeleton-row-${i}`}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : viajes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Inbox className="h-8 w-8 text-muted-foreground/60" />
                      <p className="text-sm font-medium">No se encontraron viajes con los filtros seleccionados</p>
                      <p className="text-xs text-muted-foreground/80">
                        Pruebe ajustando el rango de fechas o los términos de búsqueda
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                viajes.map((viaje) => {
                  const asig = viaje.asignacionVehicular
                  const sol = asig?.solicitudVehicular
                  const act = asig?.activo
                  const cond = asig?.conductor

                  const kmSalida = viaje.kilometrajeSalida
                  const kmRetorno = viaje.kilometrajeRetorno
                  const kmRecorrido =
                    kmRetorno != null && kmSalida != null && kmRetorno >= kmSalida
                      ? kmRetorno - kmSalida
                      : null

                  return (
                    <TableRow
                      key={viaje.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => handleVerDetalle(viaje)}
                    >
                      {/* Nº Solicitud */}
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {sol?.numero || "S/N"}
                      </TableCell>

                      {/* Vehículo */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
                            <Car className="h-3.5 w-3.5" />
                          </div>
                          <div className="text-xs">
                            <span className="font-semibold text-foreground">
                              {act?.placa ? act.placa : act?.nombre || "Sin placa"}
                            </span>
                            {act?.codigo && (
                              <span className="block text-[11px] text-muted-foreground font-mono">
                                {act.codigo}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Conductor */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <div className="text-xs">
                            <p className="font-medium text-foreground truncate max-w-[170px]">
                              {cond?.nombreCompleto || "N/D"}
                            </p>
                            {cond?.numeroLicencia && (
                              <span className="text-[10px] text-muted-foreground">
                                Lic: {cond.numeroLicencia}
                                {cond.categoriaLicencia && ` (${cond.categoriaLicencia})`}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Destino y Motivo */}
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <p className="font-medium text-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                            <span className="truncate max-w-[200px]">
                              {sol?.destino || "Sin destino"}
                            </span>
                          </p>
                          {sol?.motivo && (
                            <p className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                              {sol.motivo}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Salida Real */}
                      <TableCell className="text-xs">
                        {viaje.fechaSalidaReal ? (
                          <div className="space-y-0.5">
                            <span className="font-medium text-foreground">
                              {formatDate(viaje.fechaSalidaReal, "dd/MM/yyyy HH:mm")}
                            </span>
                            {kmSalida != null && (
                              <span className="block text-[10px] text-muted-foreground font-mono">
                                Km: {kmSalida.toLocaleString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic text-[11px]">-</span>
                        )}
                      </TableCell>

                      {/* Retorno Real */}
                      <TableCell className="text-xs">
                        {viaje.fechaRetornoReal ? (
                          <div className="space-y-0.5">
                            <span className="font-medium text-foreground">
                              {formatDate(viaje.fechaRetornoReal, "dd/MM/yyyy HH:mm")}
                            </span>
                            {kmRetorno != null && (
                              <span className="block text-[10px] text-muted-foreground font-mono">
                                Km: {kmRetorno.toLocaleString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic text-[11px]">-</span>
                        )}
                      </TableCell>

                      {/* Km Recorrido */}
                      <TableCell className="text-right text-xs">
                        {kmRecorrido != null ? (
                          <Badge
                            variant="secondary"
                            className="bg-sky-500/10 text-sky-700 dark:text-sky-300 font-mono font-semibold"
                          >
                            <Gauge className="h-3 w-3 mr-1" />
                            {kmRecorrido.toLocaleString()} km
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground/60 text-[11px]">-</span>
                        )}
                      </TableCell>

                      {/* Estado */}
                      <TableCell className="text-center">
                        {getEstadoBadge(viaje.estado)}
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleVerDetalle(viaje)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Ver detalle del viaje"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Barra de paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/40 bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Mostrar</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-7 w-[70px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span>por página</span>
            <span className="hidden sm:inline-block text-border/80">|</span>
            <span className="hidden sm:inline-block">
              Total: <strong className="text-foreground">{totalElements}</strong> viajes
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mr-2">
              Página <strong className="text-foreground">{currentPage + 1}</strong> de{" "}
              <strong className="text-foreground">{Math.max(1, totalPages)}</strong>
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage <= 0 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage >= totalPages - 1 || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Diálogo de Detalle */}
      <HistorialViajeDetalleDialog
        viaje={selectedViaje}
        open={detalleOpen}
        onOpenChange={setDetalleOpen}
      />
    </>
  )
}

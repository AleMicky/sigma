import {
  Ban,
  Car,
  ChevronRight,
  Eye,
  FilePlus2,
  GitBranch,
  MapPin,
  Navigation,
  User,
} from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/shared/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

import type { SalidaVehicular } from "../api/salida-vehicular.types"
import { SalidaVehicularStatusBadge } from "./SalidaVehicularStatusBadge"

interface SalidaVehicularTableProps {
  items: SalidaVehicular[]
  isLoading?: boolean
  onExecuteAction: (salida: SalidaVehicular) => void
  onAddBitacora: (salida: SalidaVehicular) => void
  onCancel: (salida: SalidaVehicular) => void
}

export function SalidaVehicularTable({
  items,
  isLoading,
  onExecuteAction,
  onAddBitacora,
  onCancel,
}: SalidaVehicularTableProps) {
  const navigate = useNavigate()

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="text-xs hover:bg-transparent">
            <TableHead className="w-[120px] font-semibold">N° Salida</TableHead>
            <TableHead className="font-semibold">Vehículo</TableHead>
            <TableHead className="font-semibold">Conductor / Asignado</TableHead>
            <TableHead className="font-semibold">Ruta (Origen &rarr; Destino)</TableHead>
            <TableHead className="font-semibold">Estado</TableHead>
            <TableHead className="font-semibold">Fecha Registro</TableHead>
            <TableHead className="text-right font-semibold">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx} className="animate-pulse">
                <TableCell colSpan={7} className="h-12 bg-muted/20" />
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs">
                No se encontraron salidas vehiculares con los filtros seleccionados.
              </TableCell>
            </TableRow>
          ) : (
            items.map((salida) => {
              const isFinalizado = salida.estado?.toUpperCase().includes("FINALIZ")
              const isCancelado = salida.estado?.toUpperCase().includes("CANCEL")
              const isInactive = isFinalizado || isCancelado

              return (
                <TableRow
                  key={salida.id}
                  className="text-xs hover:bg-muted/40 transition-colors group"
                >
                  {/* Número */}
                  <TableCell className="font-semibold font-mono text-primary">
                    <button
                      onClick={() =>
                        void navigate({
                          to: "/gestion-vehicular/salidas/$salidaId",
                          params: { salidaId: salida.id },
                        })
                      }
                      className="hover:underline flex items-center gap-1 text-left"
                    >
                      {salida.numero}
                    </button>
                  </TableCell>

                  {/* Vehículo */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Car className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{salida.placa ?? salida.activoCodigo ?? "S/P"}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {salida.marca ? `${salida.marca} ${salida.modelo ?? ""}` : salida.activoDescripcion}
                      </p>
                    </div>
                  </TableCell>

                  {/* Conductor */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">
                          {salida.empleadoNombre ?? "Conductor Asignado"}
                        </p>
                        {salida.empleadoCodigo && (
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {salida.empleadoCodigo}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Ruta */}
                  <TableCell>
                    <div className="space-y-0.5 max-w-[200px]">
                      <div className="flex items-center gap-1 text-muted-foreground text-[11px] truncate">
                        <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{salida.origen}</span>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-foreground text-[11px] truncate">
                        <Navigation className="h-3 w-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{salida.destino}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <SalidaVehicularStatusBadge status={salida.estado} />
                  </TableCell>

                  {/* Fecha */}
                  <TableCell className="text-muted-foreground text-[11px]">
                    {formatDate(salida.createdAt)}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Ver Detalle */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Ver Detalle"
                        onClick={() =>
                          void navigate({
                            to: "/gestion-vehicular/salidas/$salidaId",
                            params: { salidaId: salida.id },
                          })
                        }
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      {/* Gestionar BPMN */}
                      {!isInactive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-500/10"
                          title="Transición BPMN Flowable"
                          onClick={() => onExecuteAction(salida)}
                        >
                          <GitBranch className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {/* Nueva Bitácora */}
                      {!isCancelado && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                          title="Registrar Bitácora"
                          onClick={() => onAddBitacora(salida)}
                        >
                          <FilePlus2 className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {/* Cancelar */}
                      {!isInactive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                          title="Cancelar Salida"
                          onClick={() => onCancel(salida)}
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100"
                        onClick={() =>
                          void navigate({
                            to: "/gestion-vehicular/salidas/$salidaId",
                            params: { salidaId: salida.id },
                          })
                        }
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

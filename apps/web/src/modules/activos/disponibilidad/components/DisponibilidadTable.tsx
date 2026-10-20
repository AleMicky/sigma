import * as React from "react"
import {
  Activity,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Eye,
  Inbox,
  MapPin,
  Tag,
} from "lucide-react"

import type { Activo } from "@/modules/activos/activo/api/activo.service"
import { CambiarEstadoOperativoDialog } from "@/modules/activos/activo/components/CambiarEstadoOperativoDialog"
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
import { DisponibilidadActivoDetalleDialog } from "./DisponibilidadActivoDetalleDialog"

export interface DisponibilidadTableProps {
  activos: Activo[]
  isLoading?: boolean
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onActivoUpdated?: () => void
}

export function DisponibilidadTable({
  activos,
  isLoading = false,
  currentPage,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onActivoUpdated,
}: Readonly<DisponibilidadTableProps>) {
  const [selectedActivo, setSelectedActivo] = React.useState<Activo | null>(null)
  const [detalleOpen, setDetalleOpen] = React.useState(false)
  const [cambiarEstadoOpen, setCambiarEstadoOpen] = React.useState(false)

  const handleVerDetalle = (activo: Activo) => {
    setSelectedActivo(activo)
    setDetalleOpen(true)
  }

  const handleCambiarEstado = (activo: Activo) => {
    setSelectedActivo(activo)
    setCambiarEstadoOpen(true)
  }

  return (
    <>
      <Card className="border-border/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <TableRow>
                <TableHead className="w-12 text-center">Nº</TableHead>
                <TableHead className="min-w-[120px]">Código</TableHead>
                <TableHead className="min-w-[200px]">Nombre del Activo</TableHead>
                <TableHead className="min-w-[150px]">Tipo de Activo</TableHead>
                <TableHead className="min-w-[160px]">Ubicación</TableHead>
                <TableHead className="min-w-[150px]">Estado Operativo</TableHead>
                <TableHead className="min-w-[120px] text-center">Adquisición</TableHead>
                <TableHead className="min-w-[90px] text-center">Registro</TableHead>
                <TableHead className="w-24 text-center print:hidden">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-xs divide-y divide-border/40">
              {isLoading && (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={`skeleton-activo-${i}`}>
                    <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-14 mx-auto" /></TableCell>
                  </TableRow>
                ))
              )}

              {!isLoading && activos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="p-3 rounded-full bg-muted/60">
                        <Inbox className="h-6 w-6 stroke-[1.5]" />
                      </div>
                      <p className="font-medium text-sm text-foreground">
                        No se encontraron activos
                      </p>
                      <p className="text-xs max-w-sm">
                        No hay activos que coincidan con los filtros de estado operativo, tipología o búsqueda seleccionados.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                activos.map((activo, index) => {
                  const itemIndex = currentPage * pageSize + index + 1
                  const estadoColor = activo.estadoOperativo?.color || "#6B7280"
                  const estadoNombre = activo.estadoOperativo?.nombre || "Sin Estado"

                  return (
                    <TableRow
                      key={activo.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Nº */}
                      <TableCell className="text-center font-mono text-[11px] text-muted-foreground">
                        {itemIndex}
                      </TableCell>

                      {/* Código */}
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-foreground/90 bg-muted/60 px-1.5 py-0.5 rounded">
                          {activo.codigo}
                        </span>
                      </TableCell>

                      {/* Nombre */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {activo.urlImagen ? (
                            <img
                              src={activo.urlImagen}
                              alt={activo.nombre}
                              className="h-7 w-7 rounded object-cover border border-border/50 shrink-0"
                            />
                          ) : (
                            <div className="h-7 w-7 rounded bg-muted/60 border border-border/40 flex items-center justify-center text-muted-foreground shrink-0">
                              <Boxes className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <div className="flex flex-col truncate">
                            <span className="font-medium text-foreground truncate" title={activo.nombre}>
                              {activo.nombre}
                            </span>
                            {activo.descripcion && (
                              <span className="text-[10px] text-muted-foreground truncate max-w-xs" title={activo.descripcion}>
                                {activo.descripcion}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Tipo de Activo */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-foreground/85">
                          <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{activo.tipoActivo?.nombre || "-"}</span>
                        </div>
                      </TableCell>

                      {/* Ubicación */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                          <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                          <span className="truncate text-foreground/80">{activo.ubicacion?.nombre || "-"}</span>
                        </div>
                      </TableCell>

                      {/* Estado Operativo */}
                      <TableCell>
                        <Badge
                          className="text-[11px] font-medium px-2 py-0.5 border inline-flex items-center gap-1.5"
                          style={{
                            backgroundColor: `${estadoColor}15`,
                            color: estadoColor,
                            borderColor: `${estadoColor}40`,
                          }}
                        >
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: estadoColor }}
                          />
                          {estadoNombre}
                        </Badge>
                      </TableCell>

                      {/* Fecha Adquisición */}
                      <TableCell className="text-center font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {activo.fechaAdquisicion ? formatDate(activo.fechaAdquisicion) : "-"}
                      </TableCell>

                      {/* Estado Registro */}
                      <TableCell className="text-center">
                        <Badge
                          variant={activo.activo ? "outline" : "secondary"}
                          className={`text-[10px] ${
                            activo.activo
                              ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                              : "text-muted-foreground"
                          }`}
                        >
                          {activo.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="text-center print:hidden">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVerDetalle(activo)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Ver ficha técnica"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCambiarEstado(activo)}
                            className="h-7 w-7 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
                            title="Cambiar estado operativo"
                          >
                            <Activity className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border/40 bg-muted/20 text-xs text-muted-foreground print:hidden">
          <div className="flex items-center gap-3">
            <span>
              Mostrando{" "}
              <strong className="text-foreground">
                {activos.length > 0 ? currentPage * pageSize + 1 : 0}
              </strong>{" "}
              a{" "}
              <strong className="text-foreground">
                {Math.min((currentPage + 1) * pageSize, totalElements)}
              </strong>{" "}
              de <strong className="text-foreground">{totalElements}</strong> activos
            </span>

            <div className="flex items-center gap-1.5 pl-3 border-l border-border/50">
              <span>Por página:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => onPageSizeChange(Number(val))}
              >
                <SelectTrigger className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 0 || isLoading}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <span className="px-2 text-xs font-medium text-foreground">
              Página {totalPages === 0 ? 0 : currentPage + 1} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage + 1 >= totalPages || isLoading}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Diálogo Detalle */}
      <DisponibilidadActivoDetalleDialog
        activo={selectedActivo}
        open={detalleOpen}
        onOpenChange={setDetalleOpen}
        onCambiarEstado={(act) => {
          setSelectedActivo(act)
          setCambiarEstadoOpen(true)
        }}
      />

      {/* Diálogo Cambiar Estado Operativo */}
      <CambiarEstadoOperativoDialog
        activo={selectedActivo}
        open={cambiarEstadoOpen}
        onOpenChange={setCambiarEstadoOpen}
        onSuccess={() => {
          setCambiarEstadoOpen(false)
          onActivoUpdated?.()
        }}
      />
    </>
  )
}

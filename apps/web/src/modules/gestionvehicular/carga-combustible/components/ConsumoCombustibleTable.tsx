import * as React from "react"
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Eye,
  Fuel,
  Inbox,
  User,
} from "lucide-react"

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
import type { CargaCombustible } from "../api/carga-combustible.service"
import { ConsumoCombustibleDetalleDialog } from "./ConsumoCombustibleDetalleDialog"

export interface ConsumoCombustibleTableProps {
  cargas: CargaCombustible[]
  isLoading?: boolean
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function ConsumoCombustibleTable({
  cargas,
  isLoading = false,
  currentPage,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: Readonly<ConsumoCombustibleTableProps>) {
  const [selectedCarga, setSelectedCarga] = React.useState<CargaCombustible | null>(null)
  const [detalleOpen, setDetalleOpen] = React.useState(false)

  const handleVerDetalle = (carga: CargaCombustible) => {
    setSelectedCarga(carga)
    setDetalleOpen(true)
  }

  return (
    <>
      <Card className="border-border/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <TableRow>
                <TableHead className="w-12 text-center">Nº</TableHead>
                <TableHead className="min-w-[130px]">Fecha Carga</TableHead>
                <TableHead className="min-w-[120px]">Factura / Vale</TableHead>
                <TableHead className="min-w-[180px]">Vehículo / Activo</TableHead>
                <TableHead className="min-w-[130px]">Combustible</TableHead>
                <TableHead className="min-w-[100px] text-right">Litros</TableHead>
                <TableHead className="min-w-[100px] text-right">Bs./Litro</TableHead>
                <TableHead className="min-w-[110px] text-right">Importe Bs.</TableHead>
                <TableHead className="min-w-[160px]">Responsable</TableHead>
                <TableHead className="w-16 text-center print:hidden">Acción</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-xs divide-y divide-border/40">
              {isLoading && (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`skeleton-row-${i}`}>
                    <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                  </TableRow>
                ))
              )}

              {!isLoading && cargas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="p-3 rounded-full bg-muted/60">
                        <Inbox className="h-6 w-6 stroke-[1.5]" />
                      </div>
                      <p className="font-medium text-sm text-foreground">
                        No se encontraron registros de combustible
                      </p>
                      <p className="text-xs max-w-sm">
                        No hay cargas que coincidan con los filtros seleccionados o el periodo de fechas indicado.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                cargas.map((carga, index) => {
                  const itemIndex = currentPage * pageSize + index + 1
                  const litros = Number(carga.litros) || 0
                  const precioTotal = Number(carga.precioTotal) || 0
                  const precioPorLitro = litros > 0 ? (precioTotal / litros).toFixed(2) : "-"

                  return (
                    <TableRow
                      key={carga.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Nº */}
                      <TableCell className="text-center font-mono text-[11px] text-muted-foreground">
                        {itemIndex}
                      </TableCell>

                      {/* Fecha Carga */}
                      <TableCell className="whitespace-nowrap font-medium text-foreground">
                        {carga.fechaCarga ? formatDate(carga.fechaCarga) : "-"}
                      </TableCell>

                      {/* Factura / Vale */}
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-foreground/90 bg-muted/60 px-1.5 py-0.5 rounded">
                          {carga.numeroFactura || "S/N"}
                        </span>
                      </TableCell>

                      {/* Vehículo */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground flex items-center gap-1.5 truncate">
                            <Car className="h-3.5 w-3.5 text-primary shrink-0" />
                            {carga.activo?.nombre || "Vehículo sin nombre"}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground pl-5">
                            {carga.activo?.codigo || "S/C"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Insumo */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-foreground/90">
                          <Fuel className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{carga.insumo?.nombre || "Combustible"}</span>
                        </div>
                      </TableCell>

                      {/* Litros */}
                      <TableCell className="text-right font-mono font-medium text-sky-600 dark:text-sky-400">
                        {litros.toLocaleString("es-BO", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className="text-[10px] text-muted-foreground">L</span>
                      </TableCell>

                      {/* Bs./Litro */}
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {precioPorLitro}
                      </TableCell>

                      {/* Importe Total Bs. */}
                      <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {precioTotal.toLocaleString("es-BO", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className="text-[10px] font-normal text-muted-foreground">Bs.</span>
                      </TableCell>

                      {/* Responsable */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                          <User className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span className="truncate text-foreground/85">
                            {carga.empleado?.nombreCompleto || "No registrado"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="text-center print:hidden">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleVerDetalle(carga)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Ver detalle completo"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
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
                {cargas.length > 0 ? currentPage * pageSize + 1 : 0}
              </strong>{" "}
              a{" "}
              <strong className="text-foreground">
                {Math.min((currentPage + 1) * pageSize, totalElements)}
              </strong>{" "}
              de <strong className="text-foreground">{totalElements}</strong> registros
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

      {/* Diálogo de Detalle */}
      <ConsumoCombustibleDetalleDialog
        carga={selectedCarga}
        open={detalleOpen}
        onOpenChange={setDetalleOpen}
      />
    </>
  )
}

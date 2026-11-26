import { useMemo, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Inbox,
  LogIn,
  LogOut,
  MapPin,
  MessageSquareText,
  Package,
  ShieldCheck,
  Timer,
  UserRound,
  XCircle,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
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
import { cn } from "@/shared/lib/utils"

import type {
  BitacoraPorteriaItem,
  EstadoRegistroPorteria,
} from "../api/porteria.types"

export interface ReporteBitacoraPorteriaTableProps {
  filas: BitacoraPorteriaItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
  isLoading?: boolean
  isError?: boolean
  className?: string
}

function getEstadoBadge(estado?: EstadoRegistroPorteria | string | null) {
  const est = (estado ?? "").toUpperCase()
  if (est === "AFUERA") {
    return (
      <Badge
        variant="outline"
        className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10.5px] font-medium gap-1"
      >
        <Clock className="h-3 w-3" />
        Afuera
      </Badge>
    )
  }
  if (est === "COMPLETADO") {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10.5px] font-medium gap-1"
      >
        <CheckCircle2 className="h-3 w-3" />
        Completado
      </Badge>
    )
  }
  if (est === "ANULADO") {
    return (
      <Badge
        variant="outline"
        className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[10.5px] font-medium gap-1"
      >
        <XCircle className="h-3 w-3" />
        Anulado
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-[10.5px]">
      {estado || "-"}
    </Badge>
  )
}

export function ReporteBitacoraPorteriaTable({
  filas,
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onSizeChange,
  isLoading = false,
  isError = false,
  className,
}: Readonly<ReporteBitacoraPorteriaTableProps>) {
  const [selectedItem, setSelectedItem] = useState<BitacoraPorteriaItem | null>(
    null
  )

  // `filas` ya viene acotada por el servidor; nunca se hace slicing local.
  const pageItems = filas
  const safePage = Math.min(page, Math.max(0, totalPages - 1))

  // Estos totales son solo de la página actual; las métricas globales
  // proceden de los agregados de `/porteria/reporte` en la página contenedora.
  const totales = useMemo(() => {
    let internos = 0
    let externos = 0
    let afuera = 0
    let completados = 0
    let totalActivos = 0
    let activosNoRetornados = 0

    for (const f of filas) {
      if (f.esExterno) externos++
      else internos++

      if (f.estado === "AFUERA") afuera++
      else if (f.estado === "COMPLETADO") completados++

      totalActivos += f.totalActivos ?? (f.activos?.length || 0)
      activosNoRetornados += f.activosPendientesRetorno ?? 0
    }

    return {
      total: filas.length,
      internos,
      externos,
      afuera,
      completados,
      totalActivos,
      activosNoRetornados,
    }
  }, [filas])

  return (
    <>
      <Card
        aria-busy={isLoading}
        className={cn(
          "border-border/60 shadow-xs overflow-hidden",
          className
        )}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16 text-center font-semibold">
                  Día / Fecha
                </TableHead>
                <TableHead className="w-[120px] font-semibold">
                  Nº Folio / Pase
                </TableHead>
                <TableHead className="min-w-[140px] font-semibold">
                  Salida / Llegada
                </TableHead>
                <TableHead className="min-w-[190px] font-semibold">
                  Funcionario / Persona
                </TableHead>
                <TableHead className="min-w-[230px] font-semibold">
                  Vehículo / Activos Retirados
                </TableHead>
                <TableHead className="min-w-[160px] font-semibold">
                  Origen → Destino
                </TableHead>
                <TableHead className="min-w-[145px] font-semibold">
                  Guardia Portería
                </TableHead>
                <TableHead className="w-[115px] text-center font-semibold">
                  Estado
                </TableHead>
                <TableHead className="min-w-[170px] font-semibold">
                  Observaciones
                </TableHead>
                <TableHead className="w-16 text-center font-semibold print:hidden">
                  Detalle
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-xs divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`skeleton-porteria-${i}`}>
                    <TableCell>
                      <Skeleton className="h-8 w-12 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-36" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-44" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-7 w-7 mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? null : pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="p-3 rounded-full bg-muted/60">
                        <Inbox className="h-6 w-6 stroke-[1.5]" />
                      </div>
                      <p className="font-medium text-sm text-foreground">
                        No se encontraron registros en la bitácora de portería
                      </p>
                      <p className="text-xs max-w-sm">
                        Ajuste los filtros de búsqueda, funcionario, vehículo o rango de fechas.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((fila) => (
                  <TableRow
                    key={fila.id}
                    className={cn(
                      "hover:bg-muted/35 transition-colors cursor-pointer",
                      fila.estado === "ANULADO" && "opacity-70"
                    )}
                    onClick={() => setSelectedItem(fila)}
                  >
                    {/* 1. Día / Fecha */}
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-foreground leading-tight">
                          {fila.dia ?? "-"}
                        </span>
                        {fila.diaSemana && (
                          <span className="text-[9.5px] font-semibold uppercase text-primary">
                            {fila.diaSemana}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {fila.fechaFormateada || "-"}
                        </span>
                      </div>
                    </TableCell>

                    {/* 2. Nº Folio / Tipo */}
                    <TableCell>
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-foreground block">
                          {fila.numero}
                        </span>
                        {fila.esExterno ? (
                          <Badge
                            variant="outline"
                            className="border-purple-500/40 bg-purple-500/10 text-[9.5px] px-1.5 py-0 font-semibold text-purple-700 dark:text-purple-300"
                          >
                            Externo
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-sky-500/30 bg-sky-500/10 text-[9.5px] px-1.5 py-0 font-semibold text-sky-700 dark:text-sky-300"
                          >
                            Interno
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* 3. Hora Salida / Llegada */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                            <LogOut className="h-3 w-3" />
                            {fila.horaSalidaFormateada || "-"}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                          {fila.horaLlegadaFormateada ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                              <LogIn className="h-3 w-3" />
                              {fila.horaLlegadaFormateada}
                            </span>
                          ) : (
                            <span className="text-[11px] font-sans italic text-muted-foreground">
                              {fila.estado === "ANULADO" ? "Sin llegada" : "En curso"}
                            </span>
                          )}
                        </div>
                        {fila.duracionTexto && fila.duracionTexto !== "-" && (
                          <div className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            <Timer className="h-2.5 w-2.5" />
                            {fila.duracionTexto}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* 4. Funcionario / Persona */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <UserRound className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>
                            {fila.empleadoNombre || fila.personaExterna || "-"}
                          </span>
                        </div>
                        {!fila.esExterno &&
                          (fila.empleadoArea || fila.empleadoCargo) && (
                            <p className="text-[10.5px] text-muted-foreground pl-5">
                              {[fila.empleadoArea, fila.empleadoCargo]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          )}
                        {!fila.esExterno && fila.empleadoCodigo && (
                          <p className="text-[10px] font-mono text-muted-foreground pl-5">
                            Cód: {fila.empleadoCodigo}
                          </p>
                        )}
                        {fila.esExterno && fila.placaExterna && (
                          <div className="pl-5 pt-0.5">
                            <span className="rounded border border-purple-500/30 bg-purple-500/5 px-1.5 py-0.5 font-mono text-[10px] font-bold text-purple-700 dark:text-purple-300">
                              Placa: {fila.placaExterna}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* 5. Vehículo / Activos Retirados */}
                    <TableCell>
                      {fila.activos && fila.activos.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {fila.activos.map((act) => {
                            const label = act.activoNombre
                              ? `${act.activoCodigo ? `${act.activoCodigo} · ` : ""}${act.activoNombre}`
                              : act.descripcionItem || "Ítem"
                            const noRetorno = act.retornado === false
                            return (
                              <span
                                key={act.id}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px]",
                                  noRetorno
                                    ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-medium"
                                    : "border-border bg-muted/50 text-foreground/90"
                                )}
                              >
                                <Package className="h-3 w-3 shrink-0 text-muted-foreground" />
                                <span className="max-w-[200px] truncate">
                                  {label}
                                </span>
                                {act.cantidad > 1 && (
                                  <span className="font-mono font-bold">
                                    ×{act.cantidad}
                                  </span>
                                )}
                                {noRetorno && (
                                  <span className="text-[9.5px] font-bold uppercase">
                                    · No retornó
                                  </span>
                                )}
                              </span>
                            )
                          })}
                          {fila.vehiculoPlaca && (
                            <span className="inline-flex items-center rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-800 dark:text-amber-300">
                              Placa: {fila.vehiculoPlaca}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          {fila.activosResumen || "-"}
                        </span>
                      )}
                    </TableCell>

                    {/* 6. Origen -> Destino */}
                    <TableCell>
                      {fila.rutaTexto && fila.rutaTexto !== "-" ? (
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/5 px-2 py-0.5 text-[11px] text-sky-700 dark:text-sky-300">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="font-medium">{fila.rutaTexto}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* 7. Guardia Portería */}
                    <TableCell>
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-amber-600 shrink-0" />
                          <span className="text-muted-foreground text-[10px]">
                            Sal:
                          </span>
                          <span className="font-medium text-foreground truncate max-w-[120px]">
                            {fila.guardiaSalidaNombre || "-"}
                          </span>
                        </div>
                        {fila.guardiaLlegadaNombre && (
                          <div className="flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span className="text-muted-foreground text-[10px]">
                              Lleg:
                            </span>
                            <span className="font-medium text-foreground truncate max-w-[120px]">
                              {fila.guardiaLlegadaNombre}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* 8. Estado */}
                    <TableCell className="text-center">
                      {getEstadoBadge(fila.estado)}
                    </TableCell>

                    {/* 9. Observaciones */}
                    <TableCell className="max-w-[200px]">
                      {fila.observacionesConsolidadas &&
                      fila.observacionesConsolidadas !== "-" ? (
                        <p
                          className="text-[11px] text-muted-foreground line-clamp-2"
                          title={fila.observacionesConsolidadas}
                        >
                          {fila.observacionesConsolidadas}
                        </p>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>

                    {/* 10. Acción Ver Detalle */}
                    <TableCell
                      className="text-center print:hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setSelectedItem(fila)}
                        title="Ver detalle completo del registro"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>

            {/* Pie consolidado de la tabla (sin firmas) */}
            {filas.length > 0 && (
              <tfoot>
                <tr className="bg-muted/60 text-foreground font-semibold border-t border-border/80 text-xs">
                  <td colSpan={3} className="px-3 py-2.5">
                    Total en esta página:{" "}
                    <strong className="text-primary">{totales.total}</strong>{" "}
                    registros
                  </td>
                  <td className="px-3 py-2.5">
                    Internos:{" "}
                    <strong className="text-sky-600 dark:text-sky-400">
                      {totales.internos}
                    </strong>{" "}
                    · Externos:{" "}
                    <strong className="text-purple-600 dark:text-purple-400">
                      {totales.externos}
                    </strong>
                  </td>
                  <td className="px-3 py-2.5">
                    Activos/Ítems:{" "}
                    <strong>{totales.totalActivos}</strong>
                    {totales.activosNoRetornados > 0 && (
                      <span className="ml-1.5 text-rose-600 dark:text-rose-400">
                        ({totales.activosNoRetornados} sin retorno)
                      </span>
                    )}
                  </td>
                  <td colSpan={5} className="px-3 py-2.5 text-right">
                    Completados:{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {totales.completados}
                    </strong>{" "}
                    · Afuera:{" "}
                    <strong className="text-amber-600 dark:text-amber-400">
                      {totales.afuera}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            )}
          </Table>
        </div>

        {/* Barra de Paginación Interactiva */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border/40 bg-muted/20 text-xs text-muted-foreground print:hidden">
          <div className="flex items-center gap-3">
            <span>
              Mostrando{" "}
              <strong className="text-foreground">
                {totalElements > 0 ? safePage * size + 1 : 0}
              </strong>{" "}
              a{" "}
              <strong className="text-foreground">
                {Math.min((safePage + 1) * size, totalElements)}
              </strong>{" "}
              de <strong className="text-foreground">{totalElements}</strong>{" "}
              registros
            </span>

            <div className="flex items-center gap-1.5 pl-3 border-l border-border/50">
              <span>Por página:</span>
              <Select
                value={String(size)}
                onValueChange={(val) => onSizeChange(Number(val))}
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
              type="button"
              variant="outline"
              size="icon"
              aria-label="Página anterior"
              className="h-7 w-7"
              onClick={() => onPageChange(Math.max(0, safePage - 1))}
              disabled={safePage <= 0 || isLoading}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <span className="px-2 text-xs font-medium text-foreground">
              Página {totalElements === 0 ? 0 : safePage + 1} de {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Página siguiente"
              className="h-7 w-7"
              onClick={() =>
                onPageChange(Math.min(Math.max(0, totalPages - 1), safePage + 1))
              }
              disabled={safePage + 1 >= totalPages || isLoading}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal de Detalle Completo del Registro de Portería */}
      <Dialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 pr-6">
                  <DialogTitle className="flex items-center gap-2 text-base">
                    <span>Registro de Portería</span>
                    <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                      {selectedItem.numero}
                    </span>
                  </DialogTitle>
                  {getEstadoBadge(selectedItem.estado)}
                </div>
                <DialogDescription>
                  Detalle completo del movimiento registrado en bitácora de portería.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-xs">
                {/* Funcionario / Persona */}
                <div className="rounded-xl border bg-muted/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      {selectedItem.esExterno
                        ? "Persona / Visita Externa"
                        : "Funcionario Interno"}
                    </span>
                    {selectedItem.esExterno ? (
                      <Badge
                        variant="outline"
                        className="border-purple-500/40 bg-purple-500/10 text-[10px] text-purple-700 dark:text-purple-300"
                      >
                        Externo
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-sky-500/30 bg-sky-500/10 text-[10px] text-sky-700 dark:text-sky-300"
                      >
                        Interno
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedItem.empleadoNombre ||
                      selectedItem.personaExterna ||
                      "-"}
                  </p>
                  {!selectedItem.esExterno && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                      {selectedItem.empleadoCodigo && (
                        <span>
                          <strong>Código:</strong> {selectedItem.empleadoCodigo}
                        </span>
                      )}
                      {selectedItem.empleadoArea && (
                        <span>
                          <strong>Área:</strong> {selectedItem.empleadoArea}
                        </span>
                      )}
                      {selectedItem.empleadoCargo && (
                        <span>
                          <strong>Cargo:</strong> {selectedItem.empleadoCargo}
                        </span>
                      )}
                    </div>
                  )}
                  {selectedItem.placaExterna && (
                    <div>
                      <span className="rounded border border-purple-500/30 bg-purple-500/5 px-2 py-0.5 font-mono text-xs font-bold text-purple-700 dark:text-purple-300">
                        Placa Externa: {selectedItem.placaExterna}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tiempos y Guardias */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <LogOut className="h-3.5 w-3.5" />
                      Salida
                    </span>
                    <p className="font-mono font-semibold text-sm">
                      {selectedItem.fechaFormateada}{" "}
                      {selectedItem.horaSalidaFormateada}
                    </p>
                    <p className="text-muted-foreground">
                      Guardia:{" "}
                      <strong className="text-foreground">
                        {selectedItem.guardiaSalidaNombre || "-"}
                      </strong>
                    </p>
                  </div>

                  <div className="rounded-lg border p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <LogIn className="h-3.5 w-3.5" />
                      Llegada / Retorno
                    </span>
                    <p className="font-mono font-semibold text-sm">
                      {selectedItem.horaLlegadaFormateada || "Pendiente"}
                    </p>
                    <p className="text-muted-foreground">
                      Guardia:{" "}
                      <strong className="text-foreground">
                        {selectedItem.guardiaLlegadaNombre || "-"}
                      </strong>
                    </p>
                    {selectedItem.duracionTexto && (
                      <p className="text-muted-foreground">
                        Duración:{" "}
                        <strong className="text-primary">
                          {selectedItem.duracionTexto}
                        </strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Ruta */}
                {selectedItem.rutaTexto && selectedItem.rutaTexto !== "-" && (
                  <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-3 flex items-center gap-2 text-sky-700 dark:text-sky-300">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase block">
                        Ruta (Origen → Destino)
                      </span>
                      <span className="font-semibold">
                        {selectedItem.rutaTexto}
                      </span>
                    </div>
                  </div>
                )}

                {/* Vehículos / Activos */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    Vehículos / Activos Registrados (
                    {selectedItem.activos?.length || 0})
                  </span>
                  <div className="space-y-1.5">
                    {(selectedItem.activos ?? []).map((act) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between gap-2 rounded-lg border p-2.5"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {act.activoNombre
                              ? `${act.activoCodigo ? `[${act.activoCodigo}] ` : ""}${act.activoNombre}`
                              : act.descripcionItem || "Ítem"}
                            {act.cantidad > 1 && (
                              <span className="ml-1.5 font-mono font-bold">
                                ×{act.cantidad}
                              </span>
                            )}
                          </p>
                          {(act.observacionSalida ||
                            act.observacionLlegada) && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {[
                                act.observacionSalida &&
                                  `Sal: ${act.observacionSalida}`,
                                act.observacionLlegada &&
                                  `Lleg: ${act.observacionLlegada}`,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </div>
                        {act.retornado === true && (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px]"
                          >
                            Retornó
                          </Badge>
                        )}
                        {act.retornado === false && (
                          <Badge
                            variant="outline"
                            className="border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-[10px]"
                          >
                            No retornó
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observaciones */}
                {(selectedItem.observacionSalida ||
                  selectedItem.observacionLlegada) && (
                  <div className="rounded-lg border bg-muted/20 p-3 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <MessageSquareText className="h-3.5 w-3.5" />
                      Observaciones
                    </span>
                    {selectedItem.observacionSalida && (
                      <p>
                        <strong>Salida:</strong>{" "}
                        {selectedItem.observacionSalida}
                      </p>
                    )}
                    {selectedItem.observacionLlegada && (
                      <p>
                        <strong>Llegada:</strong>{" "}
                        {selectedItem.observacionLlegada}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

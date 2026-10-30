import { useMemo } from "react"
import logoEndeCorani from "@/assets/logo-ende-corani.png"
import type { ReporteSolicitudItem } from "../api/solicitud-vehicular.service"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

export interface ReporteSolicitudesVehicularesTableProps {
  filas: ReporteSolicitudItem[]
  vehiculoTexto?: string
  estadoTexto?: string
  periodoTexto?: string
  totalPasajeros?: number
  className?: string
}

function getEstadoBadgeClass(estado?: string | null): string {
  const est = (estado ?? "").toUpperCase()
  if (est.includes("BORRADOR")) {
    return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30"
  }
  if (est.includes("SOLICITAD") || est.includes("PENDIENTE")) {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
  }
  if (est.includes("ASIGNAD")) {
    return "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
  }
  if (est.includes("CURSO") || est.includes("VIAJE")) {
    return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
  }
  if (est.includes("FINALIZ")) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
  }
  if (est.includes("RECHAZ") || est.includes("CANCEL") || est.includes("OBSERV")) {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
  }
  return "bg-muted text-muted-foreground border-border"
}

function formatFecha(fechaStr?: string | null, includeTime = true): string {
  if (!fechaStr) return "-"
  try {
    const d = new Date(fechaStr)
    if (Number.isNaN(d.getTime())) return fechaStr
    return d.toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
    })
  } catch {
    return fechaStr
  }
}

export function ReporteSolicitudesVehicularesTable({
  filas,
  vehiculoTexto = "TODOS LOS VEHÍCULOS",
  estadoTexto = "TODOS",
  periodoTexto,
  totalPasajeros = 0,
  className,
}: Readonly<ReporteSolicitudesVehicularesTableProps>) {
  const totales = useMemo(() => {
    let asignadas = 0
    let finalizadas = 0
    let pendientes = 0
    let rechazadas = 0

    for (const f of filas) {
      const e = (f.estado ?? "").toUpperCase()
      if (e.includes("ASIGNAD") || e.includes("CURSO") || e.includes("VIAJE")) {
        asignadas++
      } else if (e.includes("FINALIZ")) {
        finalizadas++
      } else if (e.includes("SOLICITAD") || e.includes("PENDIENTE")) {
        pendientes++
      } else if (e.includes("RECHAZ") || e.includes("CANCEL") || e.includes("OBSERV")) {
        rechazadas++
      }
    }

    return {
      total: filas.length,
      asignadas,
      finalizadas,
      pendientes,
      rechazadas,
    }
  }, [filas])

  return (
    <div
      className={cn(
        "bitacora-reporte-hoja w-full bg-white dark:bg-card text-foreground border border-slate-700/80 dark:border-border rounded-lg shadow-sm overflow-hidden text-xs",
        className
      )}
    >
      {/* ========================================================= */}
      {/* 1. ENCABEZADO OFICIAL ENDE CORANI                         */}
      {/* ========================================================= */}
      <div className="border-b border-slate-700/80 dark:border-border p-2.5 sm:p-3 bg-slate-50/50 dark:bg-muted/20">
        <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center">
          {/* Logo Empresa Izquierda */}
          <div className="col-span-3 flex items-center justify-start">
            <img
              src={logoEndeCorani}
              alt="ENDE CORANI"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </div>

          {/* Título Central */}
          <div className="col-span-6 text-center space-y-0.5">
            <span className="text-[10px] tracking-wider uppercase text-muted-foreground font-semibold block">
              SISTEMA DE GESTIÓN VEHICULAR
            </span>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-foreground uppercase">
              REPORTE DE SOLICITUDES Y ASIGNACIONES VEHICULARES
            </h2>
            <span className="text-[9px] font-semibold text-primary block tracking-wide">
              ENDE CORANI S.A. • CONTROL OPERATIVO Y LOGÍSTICA DE TRANSPORTE
            </span>
          </div>

          {/* Recuadro Código y Versión Oficial */}
          <div className="col-span-3 flex flex-col items-end justify-center text-[10px]">
            <div className="border border-slate-400 dark:border-border rounded px-2.5 py-1 bg-white dark:bg-card text-right shadow-2xs space-y-0.5">
              <div>
                <span className="text-muted-foreground font-semibold">Código:</span>{" "}
                <strong className="text-foreground font-mono">GV-REP-01</strong>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Versión:</span>{" "}
                <strong className="text-foreground font-mono">01</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SUB-BARRA DE METADATOS Y FILTROS                       */}
      {/* ========================================================= */}
      <div className="border-b border-slate-700/80 dark:border-border bg-slate-100/70 dark:bg-muted/30 px-3 py-2 text-[11px]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <span className="text-muted-foreground font-semibold block text-[10px] uppercase">
              Período Consultado:
            </span>
            <strong className="text-foreground truncate block">
              {periodoTexto || "TODOS LOS REGISTROS"}
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground font-semibold block text-[10px] uppercase">
              Vehículo Asignado / Filtro:
            </span>
            <strong className="text-primary truncate block">
              {vehiculoTexto}
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground font-semibold block text-[10px] uppercase">
              Filtro Estado:
            </span>
            <strong className="text-foreground truncate block">
              {estadoTexto}
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground font-semibold block text-[10px] uppercase">
              Resumen Rápido:
            </span>
            <strong className="text-foreground truncate block">
              {totales.total} Solicitudes • {totalPasajeros} Pasajeros
            </strong>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TABLA PRINCIPAL DE DATOS                               */}
      {/* ========================================================= */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-200/90 dark:bg-muted/60 text-foreground border-b border-slate-700/80 dark:border-border text-[10.5px]">
              <th className="p-2 text-center font-bold border-r border-slate-300 dark:border-border w-10">
                Nº
              </th>
              <th className="p-2 font-bold border-r border-slate-300 dark:border-border min-w-[120px]">
                SOLICITUD
              </th>
              <th className="p-2 font-bold border-r border-slate-300 dark:border-border min-w-[140px]">
                SOLICITANTE
              </th>
              <th className="p-2 font-bold border-r border-slate-300 dark:border-border min-w-[120px]">
                TIPO
              </th>
              <th className="p-2 font-bold border-r border-slate-300 dark:border-border min-w-[170px]">
                DESTINO Y MOTIVO
              </th>
              <th className="p-2 font-bold border-r border-slate-300 dark:border-border min-w-[130px]">
                SALIDA / RETORNO
              </th>
              <th className="p-2 text-center font-bold border-r border-slate-300 dark:border-border w-12">
                PAS.
              </th>
              <th className="p-2 font-bold border-r border-slate-300 dark:border-border min-w-[150px]">
                VEHÍCULO ASIGNADO
              </th>
              <th className="p-2 font-bold border-r border-slate-300 dark:border-border min-w-[140px]">
                CONDUCTOR ASIGNADO
              </th>
              <th className="p-2 text-center font-bold border-r border-slate-300 dark:border-border min-w-[100px]">
                ESTADO
              </th>
              <th className="p-2 font-bold min-w-[150px]">
                OBSERVACIONES
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-border/60 text-[11px]">
            {filas.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="py-10 text-center text-muted-foreground font-medium"
                >
                  No se encontraron solicitudes registradas para los filtros especificados.
                </td>
              </tr>
            ) : (
              filas.map((fila, index) => {
                const vehiculoInfo = fila.activoPlaca
                  ? `${fila.activoPlaca} ${fila.activoModelo ? `(${fila.activoModelo})` : ""}`
                  : fila.activoNombre || "PENDIENTE"

                return (
                  <tr
                    key={fila.id}
                    className="hover:bg-slate-50 dark:hover:bg-muted/30 transition-colors"
                  >
                    {/* Index */}
                    <td className="p-2 text-center font-mono text-muted-foreground border-r border-slate-200 dark:border-border/60">
                      {index + 1}
                    </td>

                    {/* Folio + Fecha Creación */}
                    <td className="p-2 border-r border-slate-200 dark:border-border/60">
                      <div className="font-bold text-foreground font-mono">
                        {fila.numero}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Reg: {formatFecha(fila.fechaSolicitud, false)}
                      </div>
                    </td>

                    {/* Solicitante */}
                    <td className="p-2 border-r border-slate-200 dark:border-border/60">
                      <div className="font-semibold text-foreground">
                        {fila.solicitanteNombre || "-"}
                      </div>
                      {fila.solicitanteArea && (
                        <div className="text-[10px] text-muted-foreground truncate">
                          {fila.solicitanteArea}
                        </div>
                      )}
                    </td>

                    {/* Tipo Solicitud */}
                    <td className="p-2 border-r border-slate-200 dark:border-border/60">
                      <span className="font-medium text-foreground">
                        {fila.tipoSolicitudNombre || "-"}
                      </span>
                    </td>

                    {/* Destino y Motivo */}
                    <td className="p-2 border-r border-slate-200 dark:border-border/60">
                      <div className="font-semibold text-foreground">
                        {fila.destino}
                      </div>
                      <div className="text-[10px] text-muted-foreground line-clamp-2">
                        {fila.motivo}
                      </div>
                    </td>

                    {/* Fechas de Salida y Retorno */}
                    <td className="p-2 border-r border-slate-200 dark:border-border/60">
                      <div className="font-medium text-foreground">
                        Salida: {formatFecha(fila.fechaSalida)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Ret: {formatFecha(fila.fechaRetornoEstimada)}
                      </div>
                    </td>

                    {/* Cantidad Pasajeros */}
                    <td className="p-2 text-center font-mono font-bold text-foreground border-r border-slate-200 dark:border-border/60">
                      {fila.cantidadPasajeros ?? 1}
                    </td>

                    {/* Vehículo Asignado */}
                    <td className="p-2 border-r border-slate-200 dark:border-border/60">
                      {fila.activoId ? (
                        <div>
                          <span className="font-bold text-sky-700 dark:text-sky-300 font-mono">
                            {vehiculoInfo}
                          </span>
                          {fila.activoCodigo && (
                            <div className="text-[10px] text-muted-foreground">
                              Cód: {fila.activoCodigo}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">
                          Sin asignar
                        </span>
                      )}
                    </td>

                    {/* Conductor Asignado */}
                    <td className="p-2 border-r border-slate-200 dark:border-border/60">
                      {fila.conductorNombre ? (
                        <div>
                          <span className="font-semibold text-foreground">
                            {fila.conductorNombre}
                          </span>
                          {fila.conductorLicencia && (
                            <div className="text-[10px] text-muted-foreground font-mono">
                              Lic: {fila.conductorLicencia}
                              {fila.conductorCategoria && ` (Cat. ${fila.conductorCategoria})`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">
                          Sin asignar
                        </span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="p-2 text-center border-r border-slate-200 dark:border-border/60">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9.5px] px-1.5 py-0 font-semibold uppercase",
                          getEstadoBadgeClass(fila.estado)
                        )}
                      >
                        {fila.estado}
                      </Badge>
                      {fila.fechaAsignacion && (
                        <div className="text-[9.5px] text-muted-foreground mt-0.5">
                          Asig: {formatFecha(fila.fechaAsignacion, false)}
                        </div>
                      )}
                    </td>

                    {/* Observaciones */}
                    <td className="p-2 text-muted-foreground text-[10.5px]">
                      {fila.observacion || fila.observacionAsignacion || "-"}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================= */}
      {/* 4. TOTALES DEL REPORTE                                    */}
      {/* ========================================================= */}
      <div className="border-t border-slate-700/80 dark:border-border bg-slate-100/90 dark:bg-muted/40 p-2.5 px-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 flex-wrap">
            <strong className="text-foreground uppercase">
              RESUMEN DEL PERÍODO:
            </strong>
            <span className="text-muted-foreground">
              Total Solicitudes: <strong className="text-foreground">{totales.total}</strong>
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Asignadas/En Curso: <strong className="text-sky-600 dark:text-sky-400">{totales.asignadas}</strong>
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Finalizadas: <strong className="text-emerald-600 dark:text-emerald-400">{totales.finalizadas}</strong>
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Pasajeros: <strong className="text-foreground">{totalPasajeros}</strong>
            </span>
          </div>

          <div className="text-muted-foreground text-[10px] text-right font-mono">
            ENDE CORANI S.A. • Gestión Vehicular Oficial
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. FIRMAS OFICIALES INSTITUCIONALES (Para impresión)      */}
      {/* ========================================================= */}
      <div className="p-4 sm:p-6 pt-10 sm:pt-14 border-t border-slate-200 dark:border-border/60 bg-white dark:bg-card">
        <div className="grid grid-cols-3 gap-6 sm:gap-12 text-center text-[10.5px]">
          <div className="space-y-1">
            <div className="border-t border-slate-400 dark:border-border/80 pt-1.5 mx-auto w-4/5 font-semibold text-foreground">
              SOLICITANTE / INTERESADO
            </div>
            <div className="text-[9.5px] text-muted-foreground">
              Firma y Aclaración
            </div>
          </div>

          <div className="space-y-1">
            <div className="border-t border-slate-400 dark:border-border/80 pt-1.5 mx-auto w-4/5 font-semibold text-foreground">
              RESPONSABLE DE ASIGNACIÓN
            </div>
            <div className="text-[9.5px] text-muted-foreground">
              Control de Transporte / Asignación
            </div>
          </div>

          <div className="space-y-1">
            <div className="border-t border-slate-400 dark:border-border/80 pt-1.5 mx-auto w-4/5 font-semibold text-foreground">
              VO.BO. ADMINISTRACIÓN / CONTROL
            </div>
            <div className="text-[9.5px] text-muted-foreground">
              Jefatura / Fiscalización
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


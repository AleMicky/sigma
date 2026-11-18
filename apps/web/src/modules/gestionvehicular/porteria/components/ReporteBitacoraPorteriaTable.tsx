import { useMemo } from "react"
import { ArrowRight, MapPin, Package } from "lucide-react"

import logoEndeCorani from "@/assets/logo-ende-corani.png"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

import type {
  BitacoraPorteriaItem,
  EstadoRegistroPorteria,
} from "../api/porteria.types"

export interface ReporteBitacoraPorteriaTableProps {
  filas: BitacoraPorteriaItem[]
  activoTexto?: string
  tipoTexto?: string
  estadoTexto?: string
  ubicacion?: string
  anio: string | number
  mes: string
  periodoTexto?: string
  className?: string
}

function getEstadoBadgeClass(estado?: EstadoRegistroPorteria | string | null): string {
  const est = (estado ?? "").toUpperCase()
  if (est === "AFUERA") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
  }
  if (est === "COMPLETADO") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
  }
  if (est === "ANULADO") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
  }
  return "bg-muted text-muted-foreground border-border"
}

export function ReporteBitacoraPorteriaTable({
  filas,
  activoTexto = "TODOS LOS VEHÍCULOS Y ACTIVOS",
  tipoTexto = "INTERNOS Y EXTERNOS",
  estadoTexto = "TODOS",
  ubicacion = "CORANI",
  anio,
  mes,
  periodoTexto,
  className,
}: Readonly<ReporteBitacoraPorteriaTableProps>) {
  const totales = useMemo(() => {
    let internos = 0
    let externos = 0
    let afuera = 0
    let completados = 0
    let anulados = 0
    let totalActivos = 0
    let activosNoRetornados = 0

    for (const f of filas) {
      if (f.esExterno) {
        externos++
      } else {
        internos++
      }

      if (f.estado === "AFUERA") afuera++
      else if (f.estado === "COMPLETADO") completados++
      else if (f.estado === "ANULADO") anulados++

      totalActivos += f.totalActivos ?? (f.activos?.length || 0)
      activosNoRetornados += f.activosPendientesRetorno ?? 0
    }

    return {
      total: filas.length,
      internos,
      externos,
      afuera,
      completados,
      anulados,
      totalActivos,
      activosNoRetornados,
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
      {/* 1. ENCABEZADO OFICIAL ENDE CORANI (Estilo Bitácora)       */}
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
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              FORMULARIO DE CONTROL Y REGISTRO
            </span>
            <h1 className="text-sm sm:text-lg font-black uppercase tracking-wide text-foreground leading-tight">
              BITÁCORA DE CONTROL DE PORTERÍA
            </h1>
            <span className="text-[9px] font-semibold text-primary block tracking-wide">
              ENDE CORANI S.A. • SISTEMA INTEGRADO DE GESTIÓN VEHICULAR Y PORTERÍA
            </span>
          </div>

          {/* Metadatos Documentales Derecha */}
          <div className="col-span-3 flex flex-col items-end justify-center">
            <div className="border border-slate-400 dark:border-border rounded px-2.5 py-1 text-right text-[9.5px] font-semibold bg-white dark:bg-background/80 shadow-2xs space-y-0.5">
              <div>
                <span className="text-muted-foreground">Código: </span>
                <span className="font-mono text-foreground font-bold">GV-PRT-01</span>
              </div>
              <div>
                <span className="text-muted-foreground">Versión: </span>
                <span className="font-mono text-foreground font-bold">01</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-barra de Metadatos de la Bitácora */}
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 border border-slate-700/80 dark:border-border rounded overflow-hidden text-[10.5px]">
          {/* VEHÍCULO / ACTIVO */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-3 p-1.5 sm:p-2 border-b lg:border-b-0 lg:border-r border-slate-300 dark:border-border bg-white dark:bg-card">
            <span className="font-bold text-muted-foreground uppercase text-[9px] block">
              VEHÍCULO / ACTIVO:
            </span>
            <span className="font-semibold text-foreground uppercase block mt-0.5 leading-snug break-words">
              {activoTexto}
            </span>
          </div>

          {/* PERSONAL / TIPO DE PASE */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-3 p-1.5 sm:p-2 border-b lg:border-b-0 lg:border-r border-slate-300 dark:border-border bg-white dark:bg-card">
            <span className="font-bold text-muted-foreground uppercase text-[9px] block">
              TIPO DE REGISTRO:
            </span>
            <span className="font-semibold text-primary uppercase block mt-0.5 leading-tight break-words">
              {tipoTexto}
            </span>
          </div>

          {/* PERÍODO */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-2 p-1.5 sm:p-2 border-b lg:border-b-0 lg:border-r border-slate-300 dark:border-border bg-white dark:bg-card">
            <span className="font-bold text-muted-foreground uppercase text-[9px] block">
              PERÍODO CONSULTADO:
            </span>
            <span className="font-medium text-foreground block mt-0.5 leading-snug break-words">
              {periodoTexto || "TODOS LOS REGISTROS"}
            </span>
          </div>

          {/* ESTADO */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-1 p-1.5 sm:p-2 border-b lg:border-b-0 lg:border-r border-slate-300 dark:border-border bg-white dark:bg-card text-center">
            <span className="font-bold text-muted-foreground uppercase text-[9px] block">
              ESTADO:
            </span>
            <span className="font-semibold text-foreground uppercase block mt-0.5">
              {estadoTexto}
            </span>
          </div>

          {/* UBIC. */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-1 p-1.5 sm:p-2 border-b lg:border-b-0 lg:border-r border-slate-300 dark:border-border bg-white dark:bg-card text-center">
            <span className="font-bold text-muted-foreground uppercase text-[9px] block">
              UBIC.:
            </span>
            <span className="font-semibold text-foreground uppercase block mt-0.5">
              {ubicacion}
            </span>
          </div>

          {/* AÑO */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-1 p-1.5 sm:p-2 border-b lg:border-b-0 lg:border-r border-slate-300 dark:border-border bg-white dark:bg-card text-center">
            <span className="font-bold text-muted-foreground uppercase text-[9px] block">
              AÑO:
            </span>
            <span className="font-mono font-bold text-foreground block mt-0.5">
              {anio}
            </span>
          </div>

          {/* MES */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-1 p-1.5 sm:p-2 bg-white dark:bg-card text-center">
            <span className="font-bold text-muted-foreground uppercase text-[9px] block">
              MES:
            </span>
            <span className="font-bold text-primary uppercase block mt-0.5">
              {mes}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TABLA OFICIAL DE BITÁCORA DE PORTERÍA                  */}
      {/* ========================================================= */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[11px] select-text">
          <thead>
            <tr className="bg-slate-100 dark:bg-muted/80 text-foreground border-b-2 border-slate-700/80 dark:border-border font-bold uppercase tracking-wider text-center text-[10px]">
              {/* DÍA */}
              <th
                scope="col"
                className="px-1.5 py-2 border-r border-slate-300 dark:border-border w-11 text-center"
              >
                DÍA
              </th>

              {/* Nº FOLIO */}
              <th
                scope="col"
                className="px-2 py-2 border-r border-slate-300 dark:border-border min-w-[95px] text-center"
              >
                Nº FOLIO / TIPO
              </th>

              {/* HORA SALIDA / LLEGADA / TIEMPO */}
              <th
                scope="col"
                className="px-2 py-2 border-r border-slate-300 dark:border-border min-w-[125px] text-center"
              >
                SALIDA / LLEGADA
              </th>

              {/* FUNCIONARIO / PERSONA */}
              <th
                scope="col"
                className="px-2.5 py-2 border-r border-slate-300 dark:border-border min-w-[160px] text-left"
              >
                FUNCIONARIO / PERSONA
              </th>

              {/* VEHÍCULO / ACTIVOS RETIRADOS */}
              <th
                scope="col"
                className="px-2.5 py-2 border-r border-slate-300 dark:border-border min-w-[210px] text-left"
              >
                VEHÍCULO / ACTIVOS RETIRADOS
              </th>

              {/* ORIGEN -> DESTINO (RUTA) */}
              <th
                scope="col"
                className="px-2.5 py-2 border-r border-slate-300 dark:border-border min-w-[140px] text-left"
              >
                ORIGEN / DESTINO
              </th>

              {/* GUARDIA DE PORTERÍA */}
              <th
                scope="col"
                className="px-2.5 py-2 border-r border-slate-300 dark:border-border min-w-[130px] text-left"
              >
                GUARDIA PORTERÍA
              </th>

              {/* ESTADO */}
              <th
                scope="col"
                className="px-2 py-2 border-r border-slate-300 dark:border-border min-w-[95px] text-center"
              >
                ESTADO
              </th>

              {/* OBSERVACIONES */}
              <th
                scope="col"
                className="px-2.5 py-2 min-w-[170px] text-left"
              >
                OBSERVACIONES / NOVEDADES
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-300 dark:divide-border text-foreground font-sans">
            {filas.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-1.5 py-3">
                    <p className="font-semibold text-xs sm:text-sm">
                      No se encontraron registros de portería para los filtros seleccionados
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Ajuste el rango de fechas, estado o filtro de búsqueda.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filas.map((fila, index) => {
                const isEven = index % 2 === 0
                return (
                  <tr
                    key={fila.id}
                    className={cn(
                      "hover:bg-slate-50/80 dark:hover:bg-muted/40 transition-colors",
                      isEven
                        ? "bg-white dark:bg-card"
                        : "bg-slate-50/40 dark:bg-muted/15",
                      fila.estado === "ANULADO" && "opacity-75"
                    )}
                  >
                    {/* 1. DÍA */}
                    <td className="px-1.5 py-1.5 border-r border-slate-300 dark:border-border text-center font-bold text-foreground">
                      <span className="text-xs sm:text-sm">
                        {fila.dia ?? "-"}
                      </span>
                      {fila.diaSemana && (
                        <span className="block text-[8.5px] uppercase text-primary font-semibold">
                          {fila.diaSemana}
                        </span>
                      )}
                      {fila.fechaFormateada && (
                        <span className="block text-[8.5px] text-muted-foreground font-mono font-normal">
                          {fila.fechaFormateada}
                        </span>
                      )}
                    </td>

                    {/* 2. Nº FOLIO / TIPO */}
                    <td className="px-2 py-1.5 border-r border-slate-300 dark:border-border text-center">
                      <div className="font-mono font-bold text-foreground text-[10.5px]">
                        {fila.numero}
                      </div>
                      <div className="mt-0.5 flex items-center justify-center gap-1 flex-wrap">
                        {fila.esExterno ? (
                          <span className="inline-block rounded border border-purple-500/40 bg-purple-500/10 px-1.5 py-0 text-[8.5px] font-bold uppercase text-purple-700 dark:text-purple-300">
                            Externo
                          </span>
                        ) : (
                          <span className="inline-block rounded border border-sky-500/30 bg-sky-500/10 px-1.5 py-0 text-[8.5px] font-semibold uppercase text-sky-700 dark:text-sky-300">
                            Interno
                          </span>
                        )}
                      </div>
                      {fila.salidaVehicularNumero && (
                        <div className="text-[8.5px] text-muted-foreground font-mono mt-0.5">
                          Sal: {fila.salidaVehicularNumero}
                        </div>
                      )}
                    </td>

                    {/* 3. HORA SALIDA / LLEGADA / TIEMPO */}
                    <td className="px-2 py-1.5 border-r border-slate-300 dark:border-border text-center font-mono text-[10px]">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-bold text-amber-700 dark:text-amber-400">
                          {fila.horaSalidaFormateada || "-"}
                        </span>
                        <ArrowRight className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                        <span
                          className={cn(
                            "font-bold",
                            fila.horaLlegadaFormateada
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-muted-foreground italic font-sans text-[9px]"
                          )}
                        >
                          {fila.horaLlegadaFormateada ||
                            (fila.estado === "ANULADO" ? "Anulado" : "Afuera")}
                        </span>
                      </div>
                      {fila.duracionTexto && fila.duracionTexto !== "-" && (
                        <div className="mt-0.5 inline-block rounded bg-slate-100 dark:bg-muted px-1.5 py-0.5 text-[9px] font-sans font-semibold text-muted-foreground">
                          ⏱ {fila.duracionTexto}
                        </div>
                      )}
                    </td>

                    {/* 4. FUNCIONARIO / PERSONA */}
                    <td className="px-2.5 py-1.5 border-r border-slate-300 dark:border-border">
                      <div className="font-semibold text-foreground leading-snug">
                        {fila.empleadoNombre || fila.personaExterna || "-"}
                      </div>
                      {!fila.esExterno && (fila.empleadoArea || fila.empleadoCargo) && (
                        <div className="text-[9.5px] text-muted-foreground leading-tight mt-0.5">
                          {[fila.empleadoArea, fila.empleadoCargo]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                      )}
                      {!fila.esExterno && fila.empleadoCodigo && (
                        <div className="text-[9px] font-mono text-muted-foreground">
                          Cód: {fila.empleadoCodigo}
                        </div>
                      )}
                      {fila.esExterno && fila.placaExterna && (
                        <div className="mt-0.5">
                          <span className="inline-block rounded border border-purple-500/30 bg-purple-500/5 px-1.5 py-0 font-mono text-[9.5px] font-bold text-purple-700 dark:text-purple-300">
                            Placa: {fila.placaExterna}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 5. VEHÍCULO / ACTIVOS RETIRADOS */}
                    <td className="px-2.5 py-1.5 border-r border-slate-300 dark:border-border">
                      {fila.activos && fila.activos.length > 0 ? (
                        <div className="space-y-1">
                          {fila.activos.map((act) => {
                            const label = act.activoNombre
                              ? `${act.activoCodigo ? `[${act.activoCodigo}] ` : ""}${act.activoNombre}`
                              : act.descripcionItem || "Ítem"
                            const noRetorno = act.retornado === false
                            return (
                              <div
                                key={act.id}
                                className={cn(
                                  "flex items-start gap-1 text-[10px] leading-snug",
                                  noRetorno &&
                                    "text-rose-600 dark:text-rose-400 font-semibold"
                                )}
                              >
                                <Package className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                  <span>{label}</span>
                                  {act.cantidad > 1 && (
                                    <span className="ml-1 font-mono font-bold">
                                      ×{act.cantidad}
                                    </span>
                                  )}
                                  {noRetorno && (
                                    <span className="ml-1 rounded bg-rose-500/15 px-1 py-0 text-[8.5px] font-bold uppercase text-rose-700 dark:text-rose-300">
                                      No retornó
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                          {fila.vehiculoPlaca && (
                            <div className="pt-0.5">
                              <span className="text-[9px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0 rounded">
                                Placa: {fila.vehiculoPlaca}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          {fila.activosResumen || "-"}
                        </span>
                      )}
                    </td>

                    {/* 6. ORIGEN -> DESTINO */}
                    <td className="px-2.5 py-1.5 border-r border-slate-300 dark:border-border text-[10px]">
                      {fila.rutaTexto && fila.rutaTexto !== "-" ? (
                        <div className="flex items-start gap-1 leading-snug">
                          <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-sky-600 dark:text-sky-400" />
                          <span className="font-medium text-foreground">
                            {fila.rutaTexto}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    {/* 7. GUARDIA PORTERÍA */}
                    <td className="px-2.5 py-1.5 border-r border-slate-300 dark:border-border text-[10px] leading-snug">
                      <div>
                        <span className="text-[9px] font-semibold uppercase text-muted-foreground">
                          Sal:{" "}
                        </span>
                        <span className="font-medium text-foreground">
                          {fila.guardiaSalidaNombre || "-"}
                        </span>
                      </div>
                      {fila.guardiaLlegadaNombre && (
                        <div className="mt-0.5">
                          <span className="text-[9px] font-semibold uppercase text-muted-foreground">
                            Lleg:{" "}
                          </span>
                          <span className="font-medium text-foreground">
                            {fila.guardiaLlegadaNombre}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 8. ESTADO */}
                    <td className="px-2 py-1.5 border-r border-slate-300 dark:border-border text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] px-1.5 py-0 font-semibold uppercase",
                          getEstadoBadgeClass(fila.estado)
                        )}
                      >
                        {fila.estado}
                      </Badge>
                    </td>

                    {/* 9. OBSERVACIONES / NOVEDADES */}
                    <td className="px-2.5 py-1.5 text-[10px] leading-snug whitespace-normal break-words">
                      {fila.observacionesConsolidadas &&
                      fila.observacionesConsolidadas !== "-" ? (
                        <span>{fila.observacionesConsolidadas}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>

          {/* ========================================================= */}
          {/* 3. FILA DE TOTALES / RESUMEN INFERIOR                     */}
          {/* ========================================================= */}
          {filas.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100 dark:bg-muted/80 text-foreground font-bold border-t-2 border-slate-700/80 dark:border-border text-[10.5px]">
                <td
                  colSpan={3}
                  className="px-2.5 py-2 border-r border-slate-300 dark:border-border text-center uppercase tracking-wide"
                >
                  TOTALES ({totales.total} registros)
                </td>
                <td className="px-2.5 py-2 border-r border-slate-300 dark:border-border text-left">
                  Internos: <span className="text-sky-600 dark:text-sky-400">{totales.internos}</span>
                  {" • "}
                  Externos: <span className="text-purple-600 dark:text-purple-400">{totales.externos}</span>
                </td>
                <td className="px-2.5 py-2 border-r border-slate-300 dark:border-border text-left">
                  {totales.totalActivos} activo(s) / ítem(s) movilizados
                  {totales.activosNoRetornados > 0 && (
                    <span className="ml-1 text-rose-600 dark:text-rose-400">
                      ({totales.activosNoRetornados} sin retorno)
                    </span>
                  )}
                </td>
                <td
                  colSpan={2}
                  className="px-2.5 py-2 border-r border-slate-300 dark:border-border text-center"
                >
                  Completados:{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {totales.completados}
                  </span>{" "}
                  • Afuera:{" "}
                  <span className="text-amber-600 dark:text-amber-400">
                    {totales.afuera}
                  </span>
                </td>
                <td
                  colSpan={2}
                  className="px-2.5 py-2 text-right font-mono text-[10px] text-muted-foreground"
                >
                  ENDE CORANI S.A. • Bitácora Oficial de Portería
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ========================================================= */}
      {/* 4. FIRMAS OFICIALES INSTITUCIONALES                       */}
      {/* ========================================================= */}
      <div className="p-4 sm:p-6 pt-10 sm:pt-14 border-t border-slate-200 dark:border-border/60 bg-white dark:bg-card">
        <div className="grid grid-cols-3 gap-6 sm:gap-12 text-center text-[10.5px]">
          <div className="space-y-1">
            <div className="border-t border-slate-400 dark:border-border/80 pt-1.5 mx-auto w-4/5 font-semibold text-foreground">
              GUARDIA / CONTROL DE PORTERÍA
            </div>
            <div className="text-[9.5px] text-muted-foreground">
              Firma y Aclaración de Turno
            </div>
          </div>

          <div className="space-y-1">
            <div className="border-t border-slate-400 dark:border-border/80 pt-1.5 mx-auto w-4/5 font-semibold text-foreground">
              SUPERVISOR / RESPONSABLE DE ÁREA
            </div>
            <div className="text-[9.5px] text-muted-foreground">
              Verificación de Salidas y Activos
            </div>
          </div>

          <div className="space-y-1">
            <div className="border-t border-slate-400 dark:border-border/80 pt-1.5 mx-auto w-4/5 font-semibold text-foreground">
              VO.BO. ADMINISTRACIÓN Y LOGÍSTICA
            </div>
            <div className="text-[9.5px] text-muted-foreground">
              Jefatura / Control Patrimonial
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

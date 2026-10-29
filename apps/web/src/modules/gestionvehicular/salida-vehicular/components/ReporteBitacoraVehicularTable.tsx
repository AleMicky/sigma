import { useMemo } from "react"
import logoEndeCorani from "@/assets/logo-ende-corani.png"
import { cn } from "@/shared/lib/utils"

export interface FilaReporteBitacoraSalida {
  id: string
  numero: string
  fecha: string
  dia: number
  fechaFormateada: string
  descripcionActividad: string
  kmSalida: number | null
  kmLlegada: number | null
  kmRecorrido: number | null
  combustibleTexto: string
  combustibleLitros: number | null
  combustibleFactura: string | null
  conductorNombre: string
  observaciones: string
  estado: string
}

export interface ReporteBitacoraVehicularTableProps {
  filas: FilaReporteBitacoraSalida[]
  tipoVehiculo?: string | null
  placa?: string | null
  responsableVehiculo?: string | null
  ubicacion?: string | null
  anio: string | number
  mes: string
  periodoTexto?: string
  className?: string
}

export function ReporteBitacoraVehicularTable({
  filas,
  tipoVehiculo = "VEHICULO OFICIAL",
  placa = "S/P",
  responsableVehiculo = "",
  ubicacion = "CORANI",
  anio,
  mes,
  periodoTexto,
  className,
}: Readonly<ReporteBitacoraVehicularTableProps>) {
  // Totales
  const totales = useMemo(() => {
    let totalKm = 0
    let totalLitros = 0
    let minKm: number | null = null
    let maxKm: number | null = null

    for (const f of filas) {
      if (typeof f.kmRecorrido === "number" && !Number.isNaN(f.kmRecorrido)) {
        totalKm += f.kmRecorrido
      }
      if (typeof f.kmSalida === "number" && !Number.isNaN(f.kmSalida)) {
        if (minKm === null || f.kmSalida < minKm) minKm = f.kmSalida
      }
      if (typeof f.kmLlegada === "number" && !Number.isNaN(f.kmLlegada)) {
        if (maxKm === null || f.kmLlegada > maxKm) maxKm = f.kmLlegada
      }
      if (typeof f.combustibleLitros === "number" && !Number.isNaN(f.combustibleLitros)) {
        totalLitros += f.combustibleLitros
      }
    }

    return {
      totalSalidas: filas.length,
      totalKm,
      totalLitros,
      minKm,
      maxKm,
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
      {/* ENCABEZADO OFICIAL ENDE CORANI (Fiel al formulario físico) */}
      {/* ========================================================= */}
      <div className="border-b border-slate-700/80 dark:border-border p-3 sm:p-4 bg-slate-50/50 dark:bg-muted/20">
        <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center">
          {/* Logo Empresa Izquierda */}
          <div className="col-span-3 flex items-center justify-start">
            <img
              src={logoEndeCorani}
              alt="ENDE CORANI"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>

          {/* Título Central */}
          <div className="col-span-6 text-center">
            <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              FORMULARIO
            </h2>
            <h1 className="text-base sm:text-xl font-black uppercase tracking-wide text-foreground">
              BITACORA DE VEHICULOS
            </h1>
            {periodoTexto && (
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                Período: {periodoTexto}
              </p>
            )}
          </div>

          {/* Metadatos Documentales Derecha */}
          <div className="col-span-3 flex flex-col items-end justify-center">
            <div className="border border-slate-400 dark:border-border rounded px-2.5 py-1 text-right text-[10px] font-semibold bg-white dark:bg-background/80 shadow-2xs">
              <div>
                <span className="text-muted-foreground">Código: </span>
                <span className="font-mono text-foreground font-bold">GA-IN7-04</span>
              </div>
              <div>
                <span className="text-muted-foreground">Versión: </span>
                <span className="font-mono text-foreground font-bold">01</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fila de Campos de Metadatos del Vehículo (Idéntico a la cabecera física) */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-12 border border-slate-700/80 dark:border-border rounded overflow-hidden text-[11px]">
          {/* TIPO DE VEHICULO */}
          <div className="md:col-span-4 p-2 border-b md:border-b-0 md:border-r border-slate-300 dark:border-border bg-white dark:bg-card">
            <span className="font-bold text-muted-foreground uppercase text-[10px] block">
              TIPO DE VEHICULO:
            </span>
            <span className="font-semibold text-foreground uppercase truncate block mt-0.5">
              {tipoVehiculo || "CAMIONETA TOYOTA HILUX"}
            </span>
          </div>

          {/* Nº PLACA */}
          <div className="md:col-span-2 p-2 border-b md:border-b-0 md:border-r border-slate-300 dark:border-border bg-white dark:bg-card">
            <span className="font-bold text-muted-foreground uppercase text-[10px] block">
              Nº PLACA:
            </span>
            <span className="font-mono font-black text-sm text-primary block mt-0.5">
              {placa || "5203 - AZR"}
            </span>
          </div>

          {/* RESPONSABLE VEH. */}
          <div className="md:col-span-3 p-2 border-b md:border-b-0 md:border-r border-slate-300 dark:border-border bg-white dark:bg-card">
            <span className="font-bold text-muted-foreground uppercase text-[10px] block">
              RESPONSABLE VEH.:
            </span>
            <span className="font-medium text-foreground uppercase truncate block mt-0.5">
              {responsableVehiculo || "-"}
            </span>
          </div>

          {/* UBIC. */}
          <div className="md:col-span-1 p-2 border-b md:border-b-0 md:border-r border-slate-300 dark:border-border bg-white dark:bg-card">
            <span className="font-bold text-muted-foreground uppercase text-[10px] block">
              UBIC.:
            </span>
            <span className="font-semibold text-foreground uppercase block mt-0.5">
              {ubicacion || "CORANI"}
            </span>
          </div>

          {/* AÑO */}
          <div className="md:col-span-1 p-2 border-b md:border-b-0 md:border-r border-slate-300 dark:border-border bg-white dark:bg-card text-center">
            <span className="font-bold text-muted-foreground uppercase text-[10px] block">
              AÑO:
            </span>
            <span className="font-mono font-bold text-foreground block mt-0.5">
              {anio}
            </span>
          </div>

          {/* MES */}
          <div className="md:col-span-1 p-2 bg-white dark:bg-card text-center">
            <span className="font-bold text-muted-foreground uppercase text-[10px] block">
              MES:
            </span>
            <span className="font-bold text-primary uppercase block mt-0.5">
              {mes}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TABLA OFICIAL (Sin columna de firma según requerimiento)   */}
      {/* ========================================================= */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[11px] select-text">
          <thead>
            <tr className="bg-slate-100 dark:bg-muted/80 text-foreground border-b-2 border-slate-700/80 dark:border-border font-bold uppercase tracking-wider text-center">
              {/* DIA */}
              <th scope="col" className="px-2 py-2.5 border-r border-slate-300 dark:border-border w-12 text-center">
                DIA
              </th>

              {/* DESCRIPCIÓN DE ACTIVIDAD */}
              <th scope="col" className="px-3 py-2.5 border-r border-slate-300 dark:border-border min-w-[220px] text-left">
                DESCRIPCIÓN DE ACTIVIDAD
              </th>

              {/* KM. SALIDA */}
              <th scope="col" className="px-2.5 py-2.5 border-r border-slate-300 dark:border-border min-w-[85px] text-right font-mono">
                KM. SALIDA
              </th>

              {/* KM. LLEGADA */}
              <th scope="col" className="px-2.5 py-2.5 border-r border-slate-300 dark:border-border min-w-[85px] text-right font-mono">
                KM. LLEGADA
              </th>

              {/* KM. REC. (columna calculada auxiliar) */}
              <th scope="col" className="px-2 py-2.5 border-r border-slate-300 dark:border-border min-w-[70px] text-right font-mono text-primary print:hidden">
                KM. REC.
              </th>

              {/* NRO. FACTURA / LITROS DE COMBUSTIBLE */}
              <th scope="col" className="px-3 py-2.5 border-r border-slate-300 dark:border-border min-w-[140px] text-center bg-amber-500/5">
                NRO. FACTURA / LITROS DE COMBUSTIBLE
              </th>

              {/* CONDUCTOR */}
              <th scope="col" className="px-3 py-2.5 border-r border-slate-300 dark:border-border min-w-[150px] text-left">
                CONDUCTOR
              </th>

              {/* (FIRMA OMITIDA POR INSTRUCCIÓN DIRECTA DEL USUARIO) */}

              {/* OBSERVACIONES / COMENTARIOS */}
              <th scope="col" className="px-3 py-2.5 min-w-[180px] text-left">
                OBSERVACIONES / COMENTARIOS
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-300 dark:divide-border text-foreground font-sans">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                    <p className="font-semibold text-sm">
                      No se encontraron salidas para este vehículo en las fechas seleccionadas
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ajuste el rango de fechas o seleccione otro vehículo activo.
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
                      isEven ? "bg-white dark:bg-card" : "bg-slate-50/40 dark:bg-muted/15"
                    )}
                  >
                    {/* DIA */}
                    <td className="px-2 py-2 border-r border-slate-300 dark:border-border text-center font-bold text-foreground">
                      <span className="text-xs sm:text-sm">{fila.dia}</span>
                      <span className="block text-[9px] text-muted-foreground font-normal print:hidden">
                        {fila.fechaFormateada.slice(0, 5)}
                      </span>
                    </td>

                    {/* DESCRIPCIÓN DE ACTIVIDAD */}
                    <td className="px-3 py-2 border-r border-slate-300 dark:border-border text-foreground leading-snug font-medium">
                      <div className="line-clamp-2" title={fila.descripcionActividad}>
                        {fila.descripcionActividad}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono print:hidden">
                        Folio: {fila.numero}
                      </span>
                    </td>

                    {/* KM. SALIDA */}
                    <td className="px-2.5 py-2 border-r border-slate-300 dark:border-border text-right font-mono font-semibold text-foreground">
                      {fila.kmSalida != null ? fila.kmSalida.toLocaleString() : "-"}
                    </td>

                    {/* KM. LLEGADA */}
                    <td className="px-2.5 py-2 border-r border-slate-300 dark:border-border text-right font-mono font-semibold text-foreground">
                      {fila.kmLlegada != null ? (
                        fila.kmLlegada.toLocaleString()
                      ) : (
                        <span className="text-muted-foreground italic font-sans text-[10px]">
                          {fila.estado.toUpperCase().includes("LLEGAD") ? "-" : "En curso"}
                        </span>
                      )}
                    </td>

                    {/* KM. REC. (auxiliar en pantalla) */}
                    <td className="px-2 py-2 border-r border-slate-300 dark:border-border text-right font-mono font-bold text-primary print:hidden">
                      {fila.kmRecorrido != null ? (
                        `+${fila.kmRecorrido.toLocaleString()}`
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* NRO. FACTURA / LITROS DE COMBUSTIBLE */}
                    <td className="px-3 py-2 border-r border-slate-300 dark:border-border text-center font-medium bg-amber-500/5">
                      {fila.combustibleTexto !== "-" ? (
                        <span className="font-semibold text-foreground">
                          {fila.combustibleTexto}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    {/* CONDUCTOR */}
                    <td className="px-3 py-2 border-r border-slate-300 dark:border-border text-foreground font-medium">
                      {fila.conductorNombre}
                    </td>

                    {/* OBSERVACIONES / COMENTARIOS */}
                    <td className="px-3 py-2 text-foreground text-[10px] sm:text-[11px] leading-snug">
                      {fila.observaciones !== "-" ? (
                        <span>{fila.observaciones}</span>
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
          {/* FILA DE TOTALES / RESUMEN INFERIOR                        */}
          {/* ========================================================= */}
          {filas.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100 dark:bg-muted/80 text-foreground font-bold border-t-2 border-slate-700/80 dark:border-border">
                {/* Etiqueta Totales */}
                <td
                  colSpan={2}
                  className="px-3 py-2.5 border-r border-slate-300 dark:border-border text-center uppercase tracking-wide text-xs"
                >
                  TOTALES DEL PERÍODO ({totales.totalSalidas} salidas)
                </td>

                {/* Min Km */}
                <td className="px-2.5 py-2.5 border-r border-slate-300 dark:border-border text-right font-mono text-[11px]">
                  {totales.minKm != null ? totales.minKm.toLocaleString() : "-"}
                </td>

                {/* Max Km */}
                <td className="px-2.5 py-2.5 border-r border-slate-300 dark:border-border text-right font-mono text-[11px]">
                  {totales.maxKm != null ? totales.maxKm.toLocaleString() : "-"}
                </td>

                {/* Km Total Recorrido (en pantalla) */}
                <td className="px-2 py-2.5 border-r border-slate-300 dark:border-border text-right font-mono text-xs font-black text-primary print:hidden">
                  {totales.totalKm.toLocaleString()} km
                </td>

                {/* Total Combustible */}
                <td className="px-3 py-2.5 border-r border-slate-300 dark:border-border text-center font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs">
                  {totales.totalLitros > 0 ? `${totales.totalLitros.toFixed(1)} lts` : "-"}
                </td>

                {/* Conductor footer */}
                <td className="px-3 py-2.5 border-r border-slate-300 dark:border-border text-muted-foreground font-normal text-[10px]">
                  Total {totales.totalKm.toLocaleString()} km recorridos
                </td>

                {/* Observaciones footer */}
                <td className="px-3 py-2.5 text-muted-foreground font-normal text-[10px]">
                  Bitácora consolidada de salidas vehiculares
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

import { Check, Fuel, MapPin } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import type {
  BitacoraVehicularItem,
  BitacoraVehicularResumen,
  BitacoraVehicularVehiculoInfo,
} from "../api/bitacora.service"

export interface BitacoraDataTableProps {
  items: BitacoraVehicularItem[]
  resumen: BitacoraVehicularResumen
  vehiculo: BitacoraVehicularVehiculoInfo
}

export function BitacoraDataTable({
  items,
  resumen,
  vehiculo,
}: BitacoraDataTableProps) {
  return (
    <div className="bg-card text-card-foreground border border-border/80 rounded-xl overflow-hidden shadow-sm">
      {/* Contenedor con scroll horizontal para tablas anchas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs select-text">
          {/* Encabezados Agrupados (exacto al formulario físico ENDE CORANI) */}
          <thead>
            {/* Nivel Superior de Cabecera */}
            <tr className="bg-muted/70 text-muted-foreground border-b border-border/80 font-bold uppercase text-[11px] tracking-wider text-center">
              <th scope="col" rowSpan={2} className="px-2.5 py-2.5 border-r border-border/60 w-12 text-center">
                Día
              </th>
              <th scope="col" rowSpan={2} className="px-3 py-2.5 border-r border-border/60 min-w-[90px] text-right">
                Km. Salida
              </th>
              <th scope="col" rowSpan={2} className="px-3 py-2.5 border-r border-border/60 min-w-[90px] text-right">
                Km. Llegada
              </th>
              <th scope="col" rowSpan={2} className="px-2.5 py-2.5 border-r border-border/60 min-w-[75px] text-right text-primary">
                Km. Rec.
              </th>
              <th scope="col" rowSpan={2} className="px-3 py-2.5 border-r border-border/60 min-w-[200px] text-left">
                Descripción Trabajo / Ruta
              </th>

              {/* Agrupador Combustible */}
              <th scope="col" colSpan={3} className="px-3 py-1.5 border-r border-border/60 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-center">
                Combustible
              </th>

              {/* Agrupador Supervisor */}
              <th scope="col" colSpan={2} className="px-3 py-1.5 border-r border-border/60 bg-sky-500/10 text-sky-700 dark:text-sky-300 text-center">
                Supervisor
              </th>

              <th scope="col" rowSpan={2} className="px-3 py-2.5 border-r border-border/60 min-w-[130px] text-left">
                Observaciones
              </th>

              {/* Conductor */}
              <th scope="col" rowSpan={2} className="px-3 py-2.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-left min-w-[160px]">
                Conductor
              </th>
            </tr>

            {/* Sub-nivel de Cabecera */}
            <tr className="bg-muted/50 text-muted-foreground border-b border-border/80 text-[10px] font-semibold uppercase">
              {/* Sub-columnas Combustible */}
              <th scope="col" className="px-2.5 py-1.5 border-r border-border/60 min-w-[85px] text-center bg-amber-500/5">
                No. Factura
              </th>
              <th scope="col" className="px-2.5 py-1.5 border-r border-border/60 min-w-[75px] text-right bg-amber-500/5">
                Litros
              </th>
              <th scope="col" className="px-2.5 py-1.5 border-r border-border/60 min-w-[80px] text-right bg-amber-500/5">
                Importe Bs.
              </th>

              {/* Sub-columnas Supervisor */}
              <th scope="col" className="px-2 py-1.5 border-r border-border/60 w-12 text-center bg-sky-500/5">
                V°B°
              </th>
              <th scope="col" className="px-2.5 py-1.5 border-r border-border/60 min-w-[120px] text-left bg-sky-500/5">
                Nombre Supervisor
              </th>
            </tr>
          </thead>

          {/* Cuerpo de Filas */}
          <tbody className="divide-y divide-border/50 text-foreground">
            {items.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <MapPin className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">
                      No se registraron viajes ni cargas de combustible en el rango de fechas seleccionado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Modifique el período o verifique que el vehículo tenga viajes activos registrados
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const isCarga = item.tipoRegistro === "CARGA_COMBUSTIBLE"

                return (
                  <tr
                    key={item.id || index}
                    className="hover:bg-muted/40 transition-colors group"
                  >
                    {/* DÍA */}
                    <td className="px-2.5 py-2.5 border-r border-border/50 text-center font-bold text-foreground">
                      <div className="flex flex-col items-center">
                        <span className="text-sm leading-tight">{item.dia ?? "-"}</span>
                        {item.diaSemana && (
                          <span className="text-[9px] text-muted-foreground uppercase">
                            {item.diaSemana}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* KM. SALIDA */}
                    <td className="px-3 py-2.5 border-r border-border/50 text-right font-mono text-xs">
                      {item.kmSalida != null ? (
                        item.kmSalida.toLocaleString()
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>

                    {/* KM. LLEGADA */}
                    <td className="px-3 py-2.5 border-r border-border/50 text-right font-mono text-xs">
                      {item.kmLlegada != null ? (
                        item.kmLlegada.toLocaleString()
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>

                    {/* KM. RECORRIDO */}
                    <td className="px-2.5 py-2.5 border-r border-border/50 text-right font-mono text-xs font-semibold text-primary">
                      {item.kmRecorrido != null && item.kmRecorrido > 0 ? (
                        item.kmRecorrido.toLocaleString()
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>

                    {/* DESCRIPCIÓN TRABAJO */}
                    <td className="px-3 py-2.5 border-r border-border/50 font-medium">
                      <div className="flex items-center gap-1.5">
                        {isCarga ? (
                          <Badge variant="outline" className="text-[9px] h-4.5 px-1.5 border-amber-500/40 text-amber-600 dark:text-amber-400 gap-1 bg-amber-500/10">
                            <Fuel className="h-2.5 w-2.5" />
                            Carga
                          </Badge>
                        ) : null}
                        <span className="truncate max-w-[240px]" title={item.descripcionTrabajo ?? ""}>
                          {item.descripcionTrabajo || "Servicio Oficial"}
                        </span>
                      </div>
                      {item.solicitudNumero && (
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          Sol: {item.solicitudNumero}
                        </span>
                      )}
                    </td>

                    {/* COMBUSTIBLE: NO. FACTURA */}
                    <td className="px-2.5 py-2.5 border-r border-border/50 text-center font-mono text-xs">
                      {item.combustibleFactura ? (
                        <span className="font-semibold text-foreground">
                          {item.combustibleFactura}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">-</span>
                      )}
                    </td>

                    {/* COMBUSTIBLE: LITROS */}
                    <td className="px-2.5 py-2.5 border-r border-border/50 text-right font-mono text-xs">
                      {item.combustibleLitros != null ? (
                        <span className="text-foreground font-medium">
                          {item.combustibleLitros.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">-</span>
                      )}
                    </td>

                    {/* COMBUSTIBLE: IMPORTE BS. */}
                    <td className="px-2.5 py-2.5 border-r border-border/50 text-right font-mono text-xs">
                      {item.combustibleImporte != null ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {item.combustibleImporte.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">-</span>
                      )}
                    </td>

                    {/* SUPERVISOR: V°B° */}
                    <td className="px-2 py-2.5 border-r border-border/50 text-center">
                      {item.supervisorVoBo ? (
                        <div className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" title="Visto Bueno Aprobado">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40">-</span>
                      )}
                    </td>

                    {/* SUPERVISOR: NOMBRE */}
                    <td className="px-2.5 py-2.5 border-r border-border/50 text-xs">
                      <span className="truncate max-w-[140px] block" title={item.supervisorNombre ?? ""}>
                        {item.supervisorNombre || "-"}
                      </span>
                    </td>

                    {/* OBSERVACIONES */}
                    <td className="px-3 py-2.5 border-r border-border/50 text-xs text-muted-foreground">
                      <span className="truncate max-w-[150px] block" title={item.observaciones ?? ""}>
                        {item.observaciones || "-"}
                      </span>
                    </td>

                    {/* CONDUCTOR */}
                    <td className="px-2.5 py-2.5 text-xs font-medium">
                      <span className="truncate max-w-[150px] block" title={item.conductorNombre ?? ""}>
                        {item.conductorNombre || "-"}
                      </span>
                      {item.conductorLicencia && (
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {item.conductorLicencia}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>

          {/* Fila de Totales Consolidados en el Pie de la Tabla */}
          {items.length > 0 && (
            <tfoot>
              <tr className="bg-muted/80 text-foreground font-bold border-t-2 border-border/80 text-xs">
                <td colSpan={3} className="px-3 py-3 border-r border-border/60 text-right uppercase text-[11px] tracking-wider text-muted-foreground">
                  TOTALES CONSOLIDADOS:
                </td>
                <td className="px-2.5 py-3 border-r border-border/60 text-right font-mono text-sm text-primary">
                  {resumen.totalKmRecorridos?.toLocaleString() ?? 0}
                </td>
                <td className="px-3 py-3 border-r border-border/60 text-left text-xs text-muted-foreground font-normal">
                  Km totales recorridos ({resumen.totalViajes} {resumen.totalViajes === 1 ? "viaje" : "viajes"})
                </td>
                <td className="px-2.5 py-3 border-r border-border/60 text-center font-mono text-xs text-muted-foreground">
                  {resumen.totalCargasCombustible} {resumen.totalCargasCombustible === 1 ? "recarga" : "recargas"}
                </td>
                <td className="px-2.5 py-3 border-r border-border/60 text-right font-mono text-xs text-foreground font-semibold">
                  {resumen.totalLitrosCombustible != null
                    ? `${resumen.totalLitrosCombustible.toFixed(2)} L`
                    : "0.00 L"}
                </td>
                <td className="px-2.5 py-3 border-r border-border/60 text-right font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  {resumen.totalImporteCombustible != null
                    ? `Bs. ${resumen.totalImporteCombustible.toFixed(2)}`
                    : "Bs. 0.00"}
                </td>
                <td colSpan={4} className="px-3 py-3 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {resumen.rendimientoKmPorLitro && (
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        Rendimiento: <span className="text-primary font-mono">{resumen.rendimientoKmPorLitro.toFixed(2)} Km/L</span>
                      </span>
                    )}
                    {resumen.costoPromedioPorKm && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        Costo: <span className="font-mono font-medium">Bs. {resumen.costoPromedioPorKm.toFixed(2)} / Km</span>
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Resumen Técnico Consolidado al Pie del Reporte (sin recuadros de firmas manuscritas) */}
      <div className="p-4 bg-muted/20 border-t border-border/60">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-card border border-border/60 rounded-lg p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Odómetro Salida Inicial
            </span>
            <div className="font-mono text-sm font-semibold text-foreground">
              {resumen.kmSalidaInicial != null ? `${resumen.kmSalidaInicial.toLocaleString()} km` : "-"}
            </div>
            <span className="text-[10px] text-muted-foreground">Primer registro del período</span>
          </div>

          <div className="bg-card border border-border/60 rounded-lg p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Odómetro Retorno Final
            </span>
            <div className="font-mono text-sm font-semibold text-foreground">
              {resumen.kmRetornoFinal != null ? `${resumen.kmRetornoFinal.toLocaleString()} km` : "-"}
            </div>
            <span className="text-[10px] text-muted-foreground">Último retorno registrado</span>
          </div>

          <div className="bg-card border border-border/60 rounded-lg p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Rendimiento Promedio
            </span>
            <div className="font-mono text-sm font-bold text-primary">
              {resumen.rendimientoKmPorLitro ? `${resumen.rendimientoKmPorLitro.toFixed(2)} Km/L` : "-"}
            </div>
            <span className="text-[10px] text-muted-foreground">Eficiencia combustible/distancia</span>
          </div>

          <div className="bg-card border border-border/60 rounded-lg p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Próximo Mantenimiento
            </span>
            <div className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
              {vehiculo.proximoMantenimientoKm ? `${vehiculo.proximoMantenimientoKm.toLocaleString()} KM` : "-"}
            </div>
            <span className="text-[10px] text-muted-foreground">Control de odómetro preventivo</span>
          </div>
        </div>
      </div>
    </div>
  )
}

import logoEnde from "@/assets/logo-ende-corani.png"
import type {
  BitacoraVehicularPeriodoInfo,
  BitacoraVehicularVehiculoInfo,
} from "../api/bitacora.service"

export interface BitacoraHeaderCardProps {
  vehiculo: BitacoraVehicularVehiculoInfo
  periodo: BitacoraVehicularPeriodoInfo
  conductorFiltroNombre?: string | null
}

export function BitacoraHeaderCard({
  vehiculo,
  periodo,
  conductorFiltroNombre,
}: BitacoraHeaderCardProps) {
  return (
    <div className="bg-card text-card-foreground border border-border/80 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Cabecera Superior: Logo + Título Central + AÑO y MES */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-border/60 pb-4">
        {/* Logo Empresa */}
        <div className="md:col-span-3 flex items-center justify-center md:justify-start">
          <img
            src={logoEnde}
            alt="Logo ENDE CORANI"
            className="h-12 object-contain"
          />
        </div>

        {/* Título Principal */}
        <div className="md:col-span-6 text-center space-y-1">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground uppercase">
            BITÁCORA MENSUAL DE VEHÍCULOS
          </h1>
          <p className="text-xs font-semibold text-primary uppercase">
            ENDE CORANI S.A. &bull; GESTIÓN Y CONTROL VEHICULAR
          </p>
          <p className="text-[11px] text-muted-foreground">
            Período: {periodo.fechaInicio} al {periodo.fechaFin}
          </p>
        </div>

        {/* Cuadros AÑO y MES */}
        <div className="md:col-span-3 flex items-center justify-center md:justify-end gap-2">
          <div className="bg-muted/50 border border-border/70 rounded-lg px-3 py-2 text-center min-w-[70px]">
            <span className="text-[10px] font-semibold text-muted-foreground block uppercase">
              AÑO
            </span>
            <span className="text-base font-bold text-foreground">
              {periodo.anio}
            </span>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 text-center min-w-[110px]">
            <span className="text-[10px] font-semibold text-primary block uppercase">
              MES
            </span>
            <span className="text-base font-bold text-primary uppercase">
              {periodo.mes}
            </span>
          </div>
        </div>
      </div>

      {/* Fila de Datos del Vehículo, Placa y Conductor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* VEHÍCULO */}
        <div className="bg-muted/30 border border-border/50 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">
            VEHÍCULO
          </span>
          <div className="font-semibold text-foreground text-sm truncate mt-0.5" title={vehiculo.nombre}>
            {vehiculo.tipoVehiculo || "Vehículo"} &bull; {vehiculo.nombre}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5">
            Cód: {vehiculo.codigo}
          </span>
        </div>

        {/* PLACA */}
        <div className="bg-muted/30 border border-border/50 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">
            PLACA DE CONTROL
          </span>
          <div className="font-mono text-base font-bold text-primary mt-0.5">
            {vehiculo.placa || "S/P"}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5">
            {vehiculo.marca ? `${vehiculo.marca} ${vehiculo.modelo || ""}` : "Oficial ENDE"}
          </span>
        </div>

        {/* CONDUCTOR ASIGNADO */}
        <div className="bg-muted/30 border border-border/50 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">
            CONDUCTOR REGISTRADO
          </span>
          <div className="font-semibold text-foreground text-sm truncate mt-0.5">
            {conductorFiltroNombre || "Varios / Todos"}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5">
            {conductorFiltroNombre ? "Filtro activo" : "Mostrando todos los conductores"}
          </span>
        </div>

        {/* PRÓXIMO MANTENIMIENTO */}
        <div className="bg-muted/30 border border-border/50 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">
            PRÓXIMO MANTENIMIENTO
          </span>
          <div className="font-mono text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
            {vehiculo.proximoMantenimientoKm ? `${vehiculo.proximoMantenimientoKm.toLocaleString()} KM` : "-"}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5">
            Control de odómetro
          </span>
        </div>
      </div>
    </div>
  )
}

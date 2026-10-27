import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  FileText,
  Flag,
  Gauge,
  Map,
  MapPin,
  Navigation,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { PageShell } from "@/shared/components/page-shell"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { cn } from "@/shared/lib/utils"

import { salidaVehicularQueries } from "../api/salida-vehicular.queries"
import type { SalidaVehicularEvento } from "../api/salida-vehicular.types"
import { CancelarSalidaDialog } from "../components/CancelarSalidaDialog"
import { EjecutarAccionFlowableDialog } from "../components/EjecutarAccionFlowableDialog"
import { RegistrarBitacoraModal } from "../components/RegistrarBitacoraModal"
import { SalidaVehicularRouteMap } from "../components/SalidaVehicularRouteMap"
import { SalidaVehicularStatusBadge } from "../components/SalidaVehicularStatusBadge"
import { getSalidaNextActionConfig } from "../components/salida-action.utils"

interface SalidaVehicularDetailPageProps {
  salidaId: string
}

interface StepConfig {
  step: number
  key: string
  label: string
  sublabel: string
  icon: typeof Play
}

export function SalidaVehicularDetailPage({ salidaId }: SalidaVehicularDetailPageProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>("general")
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isBitacoraDialogOpen, setIsBitacoraDialogOpen] = useState(false)

  // Queries
  const salidaQuery = useQuery(salidaVehicularQueries.detail(salidaId))
  const eventosQuery = useQuery(salidaVehicularQueries.eventos(salidaId))
  const bitacorasQuery = useQuery(salidaVehicularQueries.bitacoras(salidaId))

  const salida = salidaQuery.data
  const eventos = useMemo(() => eventosQuery.data ?? [], [eventosQuery.data])
  const bitacoras = useMemo(() => bitacorasQuery.data ?? [], [bitacorasQuery.data])

  const isFetchingAny =
    salidaQuery.isFetching || eventosQuery.isFetching || bitacorasQuery.isFetching

  const handleRefresh = async () => {
    await Promise.all([
      salidaQuery.refetch(),
      eventosQuery.refetch(),
      bitacorasQuery.refetch(),
    ])
    toast.success("Información actualizada")
  }

  const handleCopyNumero = () => {
    if (!salida?.numero) return
    void navigator.clipboard.writeText(salida.numero)
    toast.success(`Folio ${salida.numero} copiado al portapapeles`)
  }

  const estadoNorm = (salida?.estado ?? "").trim().toUpperCase()
  const isFinalizado = estadoNorm.includes("FINALIZ") || estadoNorm.includes("COMPLET")
  const isCancelado = estadoNorm.includes("CANCEL") || estadoNorm.includes("ANULAD")
  const isInactive = isFinalizado || isCancelado

  const nextAction = getSalidaNextActionConfig(salida?.estado, salida?.destino)
  const ActionIcon = nextAction.icon

  // Ciclo de vida del viaje (5 fases operativas)
  const currentStep = useMemo(() => {
    if (isCancelado) return -1
    if (isFinalizado) return 4
    if (estadoNorm.includes("RETORN")) return 3
    if (estadoNorm.includes("DESTINO") || estadoNorm.includes("LLEGAD")) return 2
    if (estadoNorm.includes("TRANSIT") || estadoNorm.includes("CURSO")) return 1
    return 0 // Creada / Inicial
  }, [estadoNorm, isCancelado, isFinalizado])

  const destino = salida?.destino
  const origen = salida?.origen

  const steps: StepConfig[] = useMemo(
    () => [
      {
        step: 0,
        key: "registro",
        label: "Registro",
        sublabel: "Salida programada",
        icon: Play,
      },
      {
        step: 1,
        key: "transito",
        label: "En Tránsito",
        sublabel: destino ? `Hacia ${destino}` : "En viaje al destino",
        icon: Navigation,
      },
      {
        step: 2,
        key: "destino",
        label: "En Destino",
        sublabel: destino ?? "Llegada al punto",
        icon: MapPin,
      },
      {
        step: 3,
        key: "retorno",
        label: "En Retorno",
        sublabel: origen ? `Hacia ${origen}` : "Viaje de vuelta",
        icon: RotateCcw,
      },
      {
        step: 4,
        key: "finalizada",
        label: "Finalizada",
        sublabel: "Retorno y cierre",
        icon: Flag,
      },
    ],
    [destino, origen]
  )

  // Métricas de Odómetro
  const odometroStats = useMemo(() => {
    const kmEvents = eventos
      .filter((e) => typeof e.kilometraje === "number" && !Number.isNaN(e.kilometraje))
      .sort(
        (a, b) =>
          new Date(a.fechaHora || a.createdAt).getTime() -
          new Date(b.fechaHora || b.createdAt).getTime()
      )

    const initialKm = kmEvents.length > 0 ? kmEvents[0].kilometraje : null
    const latestKm = kmEvents.length > 0 ? kmEvents[kmEvents.length - 1].kilometraje : null
    const totalRecorrido =
      initialKm != null && latestKm != null && latestKm >= initialKm
        ? latestKm - initialKm
        : null

    return { initialKm, latestKm, totalRecorrido, totalEvents: eventos.length }
  }, [eventos])

  // Última ubicación GPS conocida
  const ultimaUbicacion = useMemo(() => {
    // Buscar en eventos ordenados por fecha descendente
    const evWithGps = [...eventos]
      .reverse()
      .find((e) => e.latitud != null && e.longitud != null)

    if (evWithGps?.latitud != null && evWithGps?.longitud != null) {
      return {
        latitud: evWithGps.latitud,
        longitud: evWithGps.longitud,
        fecha: evWithGps.fechaHora || evWithGps.createdAt,
        origen: evWithGps.tipoEvento,
      }
    }

    const bitWithGps = [...bitacoras]
      .reverse()
      .find((b) => b.latitud != null && b.longitud != null)

    if (bitWithGps?.latitud != null && bitWithGps?.longitud != null) {
      return {
        latitud: bitWithGps.latitud,
        longitud: bitWithGps.longitud,
        fecha: bitWithGps.fechaHora || bitWithGps.createdAt,
        origen: bitWithGps.tipo,
      }
    }

    return null
  }, [eventos, bitacoras])

  // Contador total de puntos geolocalizados
  const totalGpsPoints = useMemo(() => {
    const evCount = eventos.filter((e) => e.latitud != null && e.longitud != null).length
    const bitCount = bitacoras.filter((b) => b.latitud != null && b.longitud != null).length
    return evCount + bitCount
  }, [eventos, bitacoras])

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-"
    try {
      return new Date(dateStr).toLocaleString("es-BO", {
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

  const getEventBadgeClass = (tipo: string) => {
    const t = tipo.toUpperCase()
    if (t.includes("SALIDA") || t.includes("INICIO") || t.includes("PARTIDA")) {
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25"
    }
    if (t.includes("LLEGAD") || t.includes("DESTINO")) {
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25"
    }
    if (t.includes("RETORN")) {
      return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25"
    }
    if (t.includes("FINALIZ") || t.includes("CIERRE")) {
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
    }
    if (t.includes("CANCEL") || t.includes("INCIDENTE")) {
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25"
    }
    return "bg-muted text-foreground border-border/60"
  }

  if (salidaQuery.isLoading) {
    return (
      <PageShell size="full" padding="none" layout="auto" className="w-full p-8">
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
          <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-medium text-muted-foreground">
            Cargando información de la salida vehicular...
          </p>
        </div>
      </PageShell>
    )
  }

  if (!salida) {
    return (
      <PageShell size="full" padding="none" layout="auto" className="w-full p-8">
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 max-w-md mx-auto rounded-2xl border border-dashed border-border/80 bg-muted/20">
          <div className="size-12 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground">
            <Car className="size-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Salida no encontrada</h2>
            <p className="text-xs text-muted-foreground mt-1">
              No se encontró la salida vehicular solicitada o fue dada de baja.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void navigate({ to: "/gestion-vehicular/salidas" })}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            Volver a Salidas
          </Button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell size="full" padding="none" layout="auto" className="w-full space-y-5 pb-16">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col gap-3 border-b border-border/70 pb-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => void navigate({ to: "/gestion-vehicular/salidas" })}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Salidas Vehiculares</span>
          </button>
          <span>/</span>
          <span className="font-semibold text-foreground font-mono">#{salida.numero}</span>
        </div>

        {/* Title, Badges & Action Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono flex items-center gap-2">
                Salida #{salida.numero}
                <button
                  type="button"
                  onClick={handleCopyNumero}
                  title="Copiar folio"
                  className="size-7 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                >
                  <Copy className="size-3.5" />
                </button>
              </h1>
              <SalidaVehicularStatusBadge status={salida.estado} />
              {!isInactive && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  En Curso Activo
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground">
                {salida.placa ?? salida.activoCodigo ?? "S/P"}
              </span>
              <span>&bull;</span>
              <span>
                {salida.marca ? `${salida.marca} ${salida.modelo ?? ""}` : salida.activoDescripcion}
              </span>
              <span>&bull;</span>
              <span>Conductor: {salida.empleadoNombre ?? "Sin asignar"}</span>
              <span>&bull;</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground/70" />
                Registrado {formatDate(salida.createdAt)}
              </span>
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetchingAny}
              className="h-8 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
              title="Actualizar datos"
            >
              <RefreshCw className={cn("size-3.5", isFetchingAny && "animate-spin")} />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBitacoraDialogOpen(true)}
              className="h-8 text-xs gap-1.5 cursor-pointer font-medium border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 shadow-2xs"
            >
              <Plus className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Nueva Bitácora</span>
            </Button>

            {!isInactive && (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsActionDialogOpen(true)}
                className={cn(
                  "h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs transition-all active:scale-[0.98]",
                  nextAction.buttonClassName
                )}
                title={nextAction.title}
              >
                <span
                  className={cn(
                    "size-2 rounded-full animate-pulse shrink-0",
                    nextAction.dotClassName
                  )}
                />
                <ActionIcon className={cn("size-3.5", nextAction.iconClassName)} />
                <span>{nextAction.label}</span>
              </Button>
            )}

            {!isInactive && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCancelDialogOpen(true)}
                className="h-8 text-xs gap-1.5 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 border-rose-300/40 cursor-pointer shadow-2xs"
              >
                <AlertTriangle className="size-3.5" />
                <span>Cancelar</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. TRIP LIFECYCLE STEPPER (Rastreo Visual de Fases) */}
      <Card className="border-border/70 bg-gradient-to-br from-card via-card to-muted/20 shadow-2xs overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          {isCancelado ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs">
              <AlertTriangle className="size-5 shrink-0 text-rose-600" />
              <div className="space-y-0.5">
                <p className="font-bold">Salida Vehicular Cancelada</p>
                <p className="text-[11px] opacity-90">
                  El proceso de movilidad y la salida fueron suspendidos o anulados.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Navigation className="size-3.5 text-primary" />
                  Progreso y Estado Operativo del Viaje
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Fase actual:{" "}
                  <strong className="text-foreground font-semibold">
                    {steps[Math.max(0, currentStep)]?.label ?? "En Curso"}
                  </strong>
                </span>
              </div>

              {/* Stepper Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {steps.map((st) => {
                  const isDone = currentStep > st.step || isFinalizado
                  const isCurrent = currentStep === st.step && !isFinalizado
                  const isPending = currentStep < st.step && !isFinalizado

                  const StepIcon = st.icon

                  return (
                    <div
                      key={st.key}
                      className={cn(
                        "relative flex flex-col p-2.5 rounded-xl border text-xs transition-all",
                        isDone &&
                          "border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200",
                        isCurrent &&
                          "border-primary/50 bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/30",
                        isPending && "border-border/60 bg-muted/20 text-muted-foreground opacity-75"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div
                          className={cn(
                            "size-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                            isDone && "bg-emerald-500 text-white",
                            isCurrent && "bg-primary text-primary-foreground",
                            isPending && "bg-muted text-muted-foreground border border-border/80"
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2 className="size-3.5" />
                          ) : (
                            <StepIcon className="size-3" />
                          )}
                        </div>
                        {isCurrent && (
                          <span className="size-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>

                      <span className="font-bold text-[11.5px] leading-tight text-foreground">
                        {st.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {st.sublabel}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. QUICK STATS & METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Ruta */}
        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-3.5 space-y-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Navigation className="size-3 text-primary" />
              Trayecto
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <span className="truncate max-w-[90px]" title={salida.origen}>
                {salida.origen}
              </span>
              <ArrowRight className="size-3 text-muted-foreground shrink-0" />
              <span className="truncate max-w-[90px]" title={salida.destino}>
                {salida.destino}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate" title={salida.motivo}>
              {salida.motivo}
            </p>
          </CardContent>
        </Card>

        {/* Vehículo */}
        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-3.5 space-y-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Car className="size-3 text-primary" />
              Vehículo
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                {salida.placa ?? "S/P"}
              </span>
              <span className="text-xs font-semibold text-foreground truncate">
                {salida.marca ? `${salida.marca} ${salida.modelo ?? ""}` : "Vehículo Asignado"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono truncate">
              Activo: {salida.activoCodigo ?? "Sin código"}
            </p>
          </CardContent>
        </Card>

        {/* Conductor */}
        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-3.5 space-y-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <User className="size-3 text-primary" />
              Conductor Responsable
            </span>
            <p className="text-xs font-bold text-foreground truncate">
              {salida.empleadoNombre ?? "No asignado"}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">
              Código: {salida.empleadoCodigo ?? "N/A"}
            </p>
          </CardContent>
        </Card>

        {/* Odómetro & Recorrido */}
        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-3.5 space-y-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Gauge className="size-3 text-primary" />
              Kilometraje / Odómetro
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground font-mono">
                {odometroStats.latestKm != null
                  ? `${odometroStats.latestKm.toLocaleString()} km`
                  : "Sin odómetro"}
              </span>
              {odometroStats.totalRecorrido != null && odometroStats.totalRecorrido > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono"
                >
                  +{odometroStats.totalRecorrido.toLocaleString()} km
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {eventos.length} evento{eventos.length === 1 ? "" : "s"} &bull; {bitacoras.length}{" "}
              bitácora{bitacoras.length === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 4. TABS NAVIGATION */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-2xl h-auto sm:h-9 p-0.5 bg-muted/60">
          <TabsTrigger value="general" className="text-xs gap-1.5 cursor-pointer py-1.5 sm:py-0">
            <Navigation className="size-3.5 text-primary" />
            General y Ruta
          </TabsTrigger>
          <TabsTrigger value="mapa" className="text-xs gap-1.5 cursor-pointer py-1.5 sm:py-0">
            <Map className="size-3.5 text-indigo-500" />
            Recorrido GPS ({totalGpsPoints})
          </TabsTrigger>
          <TabsTrigger value="eventos" className="text-xs gap-1.5 cursor-pointer py-1.5 sm:py-0">
            <Activity className="size-3.5 text-blue-500" />
            Eventos ({eventos.length})
          </TabsTrigger>
          <TabsTrigger value="bitacoras" className="text-xs gap-1.5 cursor-pointer py-1.5 sm:py-0">
            <FileText className="size-3.5 text-emerald-500" />
            Bitácora ({bitacoras.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: INFORMACIÓN GENERAL Y RUTA */}
        <TabsContent value="general" className="space-y-4 pt-1">
          {/* Banner de Siguiente Paso Operativo */}
          {!isInactive && (
            <Card className="border-primary/30 bg-primary/5 shadow-2xs">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      Próxima Acción Operativa Requerida
                    </span>
                    <Badge variant="outline" className="text-[10px] font-medium border-primary/30">
                      {salida.estado}
                    </Badge>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    {nextAction.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Al confirmar esta acción se registrará automáticamente la geolocalización GPS y
                    el nuevo kilometraje en el libro de eventos y bitácora.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsActionDialogOpen(true)}
                    className={cn(
                      "text-xs font-semibold gap-1.5 cursor-pointer shadow-xs",
                      nextAction.buttonClassName
                    )}
                  >
                    <ActionIcon className={cn("size-3.5", nextAction.iconClassName)} />
                    <span>{nextAction.label}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cards Grid: Detalles de Ruta + Ficha de Vehículo y Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Detalle de Ruta y Misión */}
            <Card className="border-border/70 shadow-2xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  Detalle del Viaje y Destino
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1">
                    <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                      Punto de Origen
                    </span>
                    <p className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                      <MapPin className="size-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{salida.origen}</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1">
                    <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                      Punto de Destino
                    </span>
                    <p className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                      <Navigation className="size-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{salida.destino}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                    Motivo / Justificación del Traslado
                  </span>
                  <div className="p-3 bg-muted/30 rounded-xl border border-border/60 text-foreground leading-relaxed">
                    {salida.motivo}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Fecha de Solicitud:</span>
                    <p className="font-medium text-foreground mt-0.5">
                      {formatDate(salida.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Última Actualización:</span>
                    <p className="font-medium text-foreground mt-0.5">
                      {formatDate(salida.updatedAt || salida.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ficha de Vehículo y Asignación */}
            <Card className="border-border/70 shadow-2xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Car className="size-4 text-primary" />
                  Vehículo y Personal Asignado
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5 text-xs">
                {/* Datos Vehículo */}
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                      Ficha del Vehículo
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {salida.placa ?? "S/P"}
                    </span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {salida.marca ? `${salida.marca} ${salida.modelo ?? ""}` : salida.activoDescripcion}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Código de Activo Fijo: {salida.activoCodigo ?? "N/A"}
                  </p>
                </div>

                {/* Datos Conductor */}
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                  <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                    Conductor Designado
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      <User className="size-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground">
                        {salida.empleadoNombre ?? "Sin conductor asignado"}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Código: {salida.empleadoCodigo ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Última Ubicación GPS si existe */}
                {ultimaUbicacion && (
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Compass className="size-3 text-primary" />
                      Última posición GPS ({ultimaUbicacion.origen}):
                    </span>
                    <a
                      href={`https://maps.google.com/?q=${ultimaUbicacion.latitud},${ultimaUbicacion.longitud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>
                        {ultimaUbicacion.latitud.toFixed(4)}, {ultimaUbicacion.longitud.toFixed(4)}
                      </span>
                      <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mapa Interactivo de Seguimiento en General */}
          <SalidaVehicularRouteMap
            salida={salida}
            eventos={eventos}
            bitacoras={bitacoras}
            height="h-[360px]"
          />
        </TabsContent>

        {/* TAB 2: RECORRIDO Y GEOLOCALIZACIÓN GPS COMPLETA */}
        <TabsContent value="mapa" className="space-y-4 pt-1">
          <SalidaVehicularRouteMap
            salida={salida}
            eventos={eventos}
            bitacoras={bitacoras}
            height="h-[600px]"
          />
        </TabsContent>

        {/* TAB 2: EVENTOS Y ODÓMETRO */}
        <TabsContent value="eventos" className="space-y-4 pt-1">
          <Card className="border-border/70 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Activity className="size-4 text-blue-500" />
                  Registro Cronológico de Eventos y Recorrido
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Marcaciones registradas automáticamente al cambiar de hito en la ruta.
                </p>
              </div>

              {odometroStats.totalRecorrido != null && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 text-xs font-semibold">
                  <Gauge className="size-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Recorrido Total: {odometroStats.totalRecorrido.toLocaleString()} km</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="font-semibold w-[170px]">Fecha y Hora</TableHead>
                    <TableHead className="font-semibold">Hito / Tipo de Evento</TableHead>
                    <TableHead className="font-semibold">Odómetro (km)</TableHead>
                    <TableHead className="font-semibold">Ubicación GPS</TableHead>
                    <TableHead className="font-semibold">Observación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                        <div className="flex flex-col items-center justify-center space-y-1.5">
                          <Activity className="size-6 text-muted-foreground/60" />
                          <p className="font-medium text-foreground">Sin eventos registrados aún</p>
                          <p className="text-[11px] text-muted-foreground">
                            Los eventos se generarán automáticamente al ejecutar las acciones del flujo.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    eventos.map((ev: SalidaVehicularEvento, idx: number) => {
                      const prevKm = idx > 0 ? eventos[idx - 1]?.kilometraje : null
                      const diffKm =
                        ev.kilometraje != null && prevKm != null && ev.kilometraje >= prevKm
                          ? ev.kilometraje - prevKm
                          : null

                      return (
                        <TableRow key={ev.id} className="text-xs hover:bg-muted/30">
                          <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                            {formatDate(ev.fechaHora || ev.createdAt)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-md text-[11px] font-semibold border inline-flex items-center gap-1",
                                getEventBadgeClass(ev.tipoEvento)
                              )}
                            >
                              {ev.tipoEvento}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono">
                            {ev.kilometraje != null ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-foreground">
                                  {ev.kilometraje.toLocaleString()} km
                                </span>
                                {diffKm != null && diffKm > 0 && (
                                  <span className="text-[10px] text-muted-foreground">
                                    (+{diffKm} km)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {ev.latitud != null && ev.longitud != null ? (
                              <a
                                href={`https://maps.google.com/?q=${ev.latitud},${ev.longitud}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-mono text-[11px] inline-flex items-center gap-1 font-semibold"
                                title="Ver en Google Maps"
                              >
                                <Compass className="size-3" />
                                <span>
                                  {ev.latitud.toFixed(4)}, {ev.longitud.toFixed(4)}
                                </span>
                                <ExternalLink className="size-2.5 opacity-70" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-[280px] truncate">
                            {ev.observacion || "-"}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: BITÁCORA EN TIEMPO REAL */}
        <TabsContent value="bitacoras" className="space-y-4 pt-1">
          <Card className="border-border/70 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="size-4 text-emerald-500" />
                    Bitácora de Salida Vehicular
                  </CardTitle>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Tiempo Real &bull; GPS
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Registros operativos automáticos y novedades manuales reportadas durante el viaje.
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={() => setIsBitacoraDialogOpen(true)}
                className="text-xs gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs"
              >
                <Plus className="size-3.5" />
                <span>Agregar Entrada</span>
              </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {bitacoras.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-border/80 bg-muted/10 space-y-3">
                  <div className="size-12 rounded-2xl bg-muted/60 mx-auto flex items-center justify-center text-muted-foreground">
                    <Compass className="size-6 text-muted-foreground/60" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      Sin registros en bitácora todavía
                    </h4>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto leading-relaxed mt-0.5">
                      Las entradas se registran automáticamente con coordenadas GPS en cada cambio de
                      fase, o puedes agregar una novedad manual ahora mismo.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBitacoraDialogOpen(true)}
                    className="text-xs gap-1 cursor-pointer"
                  >
                    <Plus className="size-3" />
                    Registrar Primera Entrada
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bitacoras.map((b) => {
                    const isIncidente = b.tipo === "INCIDENTE"
                    const isNovedad = b.tipo === "NOVEDAD"
                    const hasGps = b.latitud != null && b.longitud != null
                    const mapsUrl = hasGps
                      ? `https://maps.google.com/?q=${b.latitud},${b.longitud}`
                      : null

                    return (
                      <div
                        key={b.id}
                        className={cn(
                          "rounded-xl border p-4 space-y-2.5 shadow-2xs transition-all",
                          isIncidente &&
                            "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/40",
                          isNovedad &&
                            "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/40",
                          !isIncidente &&
                            !isNovedad &&
                            "border-border/70 bg-card hover:border-border"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 border",
                                isIncidente &&
                                  "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
                                isNovedad &&
                                  "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
                                !isIncidente &&
                                  !isNovedad &&
                                  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              )}
                            >
                              {b.tipo}
                            </Badge>
                            <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                              <Clock className="size-3" />
                              {formatDate(b.fechaHora || b.createdAt)}
                            </span>
                          </div>

                          {hasGps && mapsUrl && (
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline font-mono bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 transition-colors"
                              title="Abrir ubicación en Google Maps"
                            >
                              <Compass className="size-3 shrink-0" />
                              <span>
                                {Number(b.latitud).toFixed(5)}, {Number(b.longitud).toFixed(5)}
                              </span>
                              <ExternalLink className="size-2.5 opacity-70" />
                            </a>
                          )}
                        </div>

                        {/* Descripción */}
                        <p className="text-xs text-foreground leading-relaxed font-medium">
                          {b.descripcion}
                        </p>

                        {/* Pie con autor / registrador */}
                        {b.empleadoNombre && (
                          <div className="pt-2 border-t border-border/50 text-[10.5px] text-muted-foreground flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <User className="size-2.5 text-muted-foreground/70" />
                              <span>
                                Registrado por:{" "}
                                <strong className="text-foreground/80 font-medium">
                                  {b.empleadoNombre}
                                </strong>
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 5. MODALES Y DIÁLOGOS OPERATIVOS */}
      <EjecutarAccionFlowableDialog
        open={isActionDialogOpen}
        onOpenChange={setIsActionDialogOpen}
        salida={salida}
      />

      <CancelarSalidaDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        salida={salida}
      />

      <RegistrarBitacoraModal
        open={isBitacoraDialogOpen}
        onOpenChange={setIsBitacoraDialogOpen}
        salida={salida}
      />
    </PageShell>
  )
}

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Briefcase,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Layers,
  MapPin,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  Truck,
  UserCheck,
  Users,
} from "lucide-react"

import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs"
import { cn } from "@/shared/lib/utils"

import {
  useDeleteResponsable,
  useDeleteVehiculo,
  useSetResponsablePrincipal,
  useToggleActivoResponsable,
  useToggleActivoVehiculo,
} from "../api/flota.mutations"
import { flotaQueries } from "../api/flota.queries"
import type {
  FlotaVehicular,
  FlotaVehiculo,
  ResponsableFlota,
} from "../api/flota.service"
import { FlotaAsignarVehiculosDialog } from "./FlotaAsignarVehiculosDialog"
import { FlotaResponsableDialog } from "./FlotaResponsableDialog"

interface FlotaDetailPanelProps {
  flota?: FlotaVehicular | null
  onEditFlota: (flota: FlotaVehicular) => void
  onPrev?: () => void
  onNext?: () => void
}

function extractPlaca(descripcion?: string | null): string | null {
  try {
    if (!descripcion) return null
    const match = descripcion.match(/PLACA[:\s#-]+([0-9A-Za-z]+(?:[\s-][0-9A-Za-z]+)*)/i)
    if (match && match[1]) {
      const clean = match[1].replace(/[,.;-]+$/, "").trim()
      if (clean.length >= 2 && clean.length <= 20) {
        return clean
      }
    }
    return null
  } catch {
    return null
  }
}

export function FlotaDetailPanel({
  flota,
  onEditFlota,
  onPrev,
  onNext,
}: FlotaDetailPanelProps) {
  const [activeTab, setActiveTab] = React.useState<string>("vehiculos")

  // Modales
  const [asignarVehiculosOpen, setAsignarVehiculosOpen] = React.useState(false)
  const [responsableDialogOpen, setResponsableDialogOpen] = React.useState(false)
  const [editingResponsable, setEditingResponsable] = React.useState<ResponsableFlota | null>(null)

  // Confirm delete dialogs
  const [vehiculoToDelete, setVehiculoToDelete] = React.useState<FlotaVehiculo | null>(null)
  const [responsableToDelete, setResponsableToDelete] = React.useState<ResponsableFlota | null>(null)

  // Queries
  const vehiculosQuery = useQuery({
    ...flotaQueries.vehiculos(flota?.id ?? ""),
    enabled: Boolean(flota?.id),
  })

  const responsablesQuery = useQuery({
    ...flotaQueries.responsables(flota?.id ?? ""),
    enabled: Boolean(flota?.id),
  })

  // Mutations
  const deleteVehiculoMutation = useDeleteVehiculo()
  const toggleVehiculoMutation = useToggleActivoVehiculo()
  const deleteResponsableMutation = useDeleteResponsable()
  const toggleResponsableMutation = useToggleActivoResponsable()
  const setPrincipalMutation = useSetResponsablePrincipal()

  if (!flota) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/10 select-none">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/60 mb-3">
          <Layers className="size-7" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Ninguna flota seleccionada
        </h3>
        <p className="text-xs text-muted-foreground max-w-xs mt-1">
          Selecciona una flota de la lista de la izquierda para ver sus vehículos y responsables asignados.
        </p>
      </div>
    )
  }

  const vehiculos = vehiculosQuery.data ?? []
  const responsables = responsablesQuery.data ?? []

  const totalVehiculosActivos = vehiculos.filter((v) => v.activo).length
  const responsablePrincipal = responsables.find((r) => r.principal && r.activo)

  const handleDeleteVehiculo = async () => {
    if (!vehiculoToDelete || !flota.id) return
    await deleteVehiculoMutation.mutateAsync({
      id: vehiculoToDelete.id,
      flotaId: flota.id,
    })
    setVehiculoToDelete(null)
  }

  const handleDeleteResponsable = async () => {
    if (!responsableToDelete || !flota.id) return
    await deleteResponsableMutation.mutateAsync({
      id: responsableToDelete.id,
      flotaId: flota.id,
    })
    setResponsableToDelete(null)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Header del Detalle */}
      <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/40 bg-card/40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Layers className="size-6" />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded-md">
                {flota.codigo}
              </code>
              <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
                {flota.nombre}
              </h1>
              <Badge
                variant={flota.activo ? "outline" : "secondary"}
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5 border",
                  flota.activo
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-muted text-muted-foreground border-border/60"
                )}
              >
                {flota.activo ? "Activa" : "Inactiva"}
              </Badge>
            </div>

            {flota.descripcion && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {flota.descripcion}
              </p>
            )}
          </div>
        </div>

        {/* Acciones y Navegación */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditFlota(flota)}
            className="h-8.5 text-xs gap-1.5"
          >
            <Edit2 className="size-3.5" />
            <span>Editar</span>
          </Button>

          {(onPrev || onNext) && (
            <div className="flex items-center gap-0.5 border-l border-border/60 pl-1.5 ml-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onPrev}
                disabled={!onPrev}
                className="size-8"
                title="Flota anterior"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onNext}
                disabled={!onNext}
                className="size-8"
                title="Siguiente flota"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* KPIs / Resumen Rápido */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-muted/10 border-b border-border/40">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/60 bg-background/60">
          <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600">
            <Truck className="size-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">
              {vehiculos.length}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Vehículos Asignados
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/60 bg-background/60">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <Car className="size-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {totalVehiculosActivos}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Vehículos Activos
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/60 bg-background/60">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
            <Users className="size-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">
              {responsables.length}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Responsables
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/60 bg-background/60">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-foreground truncate">
              {responsablePrincipal?.empleado?.nombreCompleto || "Sin definir"}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Resp. Principal
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Principales: Vehículos / Responsables / Auditoría */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <div className="px-4 pt-2 border-b border-border/40 bg-card/20">
          <TabsList className="bg-muted/40 p-0.5 rounded-lg">
            <TabsTrigger
              value="vehiculos"
              className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground cursor-pointer"
            >
              <Truck className="size-3.5" />
              <span>Vehículos ({vehiculos.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="responsables"
              className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground cursor-pointer"
            >
              <UserCheck className="size-3.5" />
              <span>Responsables ({responsables.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="auditoria"
              className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground cursor-pointer"
            >
              <Clock className="size-3.5" />
              <span>Auditoría</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: VEHICULOS ASIGNADOS */}
        <TabsContent
          value="vehiculos"
          className="flex-1 flex flex-col min-h-0 p-4 m-0 overflow-hidden gap-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-foreground">
                Vehículos de la Flota
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Parque automotor asignado para servicios y viajes de esta flota.
              </p>
            </div>

            <Button
              onClick={() => setAsignarVehiculosOpen(true)}
              size="sm"
              className="h-8 text-xs bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Gestionar Vehículos</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {vehiculosQuery.isLoading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : vehiculos.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border/80 text-center text-muted-foreground bg-muted/5">
                <Truck className="size-8 opacity-30 mb-2" />
                <p className="text-xs font-semibold text-foreground">
                  No hay vehículos asignados a esta flota
                </p>
                <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                  Haz clic en "Gestionar Vehículos" para seleccionar uno o varios vehículos del inventario.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAsignarVehiculosOpen(true)}
                  className="mt-3 text-xs gap-1.5"
                >
                  <Plus className="size-3.5" />
                  <span>Asignar Vehículos</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {vehiculos.map((item) => {
                  const placa = extractPlaca(item.vehiculo?.descripcion)

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between gap-3 p-3 rounded-xl border bg-background transition-all",
                        item.activo
                          ? "border-border/70 hover:border-cyan-500/40"
                          : "border-border/40 opacity-60 bg-muted/10"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-muted/30 flex items-center justify-center">
                          {item.vehiculo?.urlImagen ? (
                            <AuthenticatedImage
                              src={item.vehiculo.urlImagen}
                              alt={item.vehiculo.nombre}
                              className="size-full object-cover"
                              fallback={<Box className="size-4.5 text-muted-foreground/60" />}
                            />
                          ) : (
                            <Car className="size-5 text-cyan-600/70" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <code className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 px-1.5 py-0.2 rounded">
                              {item.vehiculo?.codigo || "V-ID"}
                            </code>
                            <span className="font-semibold text-xs text-foreground truncate">
                              {item.vehiculo?.nombre || "Vehículo sin nombre"}
                            </span>
                            {placa && (
                              <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                                {placa}
                              </span>
                            )}
                          </div>

                          {item.vehiculo?.descripcion && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              {item.vehiculo.descripcion}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleVehiculoMutation.mutate({
                              id: item.id,
                              flotaId: flota.id,
                            })
                          }
                          className={cn(
                            "h-7 text-[10px] font-medium px-2 rounded-lg border",
                            item.activo
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border/60 hover:bg-muted/80"
                          )}
                        >
                          {item.activo ? "Activo" : "Inactivo"}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setVehiculoToDelete(item)}
                          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                          title="Desvincular vehículo de la flota"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: RESPONSABLES */}
        <TabsContent
          value="responsables"
          className="flex-1 flex flex-col min-h-0 p-4 m-0 overflow-hidden gap-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-foreground">
                Responsables y Administradores
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Colaboradores autorizados para gestionar y coordinar la flota.
              </p>
            </div>

            <Button
              onClick={() => {
                setEditingResponsable(null)
                setResponsableDialogOpen(true)
              }}
              size="sm"
              className="h-8 text-xs bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Asignar Responsable</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {responsablesQuery.isLoading ? (
              <div className="flex flex-col gap-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : responsables.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border/80 text-center text-muted-foreground bg-muted/5">
                <UserCheck className="size-8 opacity-30 mb-2" />
                <p className="text-xs font-semibold text-foreground">
                  No hay responsables registrados
                </p>
                <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                  Asigna al menos un responsable para coordinar las salidas y autorizaciones de esta flota.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingResponsable(null)
                    setResponsableDialogOpen(true)
                  }}
                  className="mt-3 text-xs gap-1.5"
                >
                  <Plus className="size-3.5" />
                  <span>Asignar Responsable</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {responsables.map((item) => {
                  const emp = item.empleado
                  const initials = emp?.nombreCompleto
                    ? emp.nombreCompleto
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "EM"

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between gap-3 p-3.5 rounded-xl border bg-background transition-all",
                        item.principal
                          ? "border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/10 shadow-xs"
                          : "border-border/70 hover:border-border"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold border",
                            item.principal
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                              : "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
                          )}
                        >
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs text-foreground truncate">
                              {emp?.nombreCompleto || "Empleado"}
                            </span>
                            {emp?.codigo && (
                              <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded font-mono">
                                {emp.codigo}
                              </code>
                            )}
                            {item.principal && (
                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-semibold gap-1 py-0.2">
                                <Shield className="size-3" />
                                Principal
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
                            {emp?.cargo && (
                              <div className="flex items-center gap-1 truncate">
                                <Briefcase className="size-3 opacity-70 shrink-0" />
                                <span className="truncate">{emp.cargo}</span>
                              </div>
                            )}
                            {emp?.area && (
                              <>
                                <span className="opacity-40">•</span>
                                <div className="flex items-center gap-1 truncate">
                                  <MapPin className="size-3 opacity-70 shrink-0" />
                                  <span className="truncate">{emp.area}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!item.principal && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setPrincipalMutation.mutate({
                                id: item.id,
                                flotaId: flota.id,
                              })
                            }
                            className="h-7 text-[11px] text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                            title="Establecer como responsable principal"
                          >
                            Hacer Principal
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleResponsableMutation.mutate({
                              id: item.id,
                              flotaId: flota.id,
                            })
                          }
                          className={cn(
                            "h-7 text-[10px] font-medium px-2 rounded-lg border",
                            item.activo
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border/60 hover:bg-muted/80"
                          )}
                        >
                          {item.activo ? "Activo" : "Inactivo"}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setResponsableToDelete(item)}
                          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                          title="Desvincular responsable"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 3: AUDITORÍA */}
        <TabsContent value="auditoria" className="flex-1 p-4 m-0 overflow-y-auto">
          <div className="max-w-xl space-y-3">
            <div className="rounded-xl border border-border/70 p-4 bg-muted/10 space-y-3">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-cyan-600" />
                Metadatos de Registro y Auditoría
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-muted-foreground">Fecha de Creación</span>
                  <div className="font-medium">
                    {flota.auditoria?.createdAt
                      ? new Date(flota.auditoria.createdAt).toLocaleString("es-ES")
                      : "No registrada"}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] text-muted-foreground">Creado por</span>
                  <div className="font-medium">
                    {flota.auditoria?.createdBy || "Sistema"}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] text-muted-foreground">Última Modificación</span>
                  <div className="font-medium">
                    {flota.auditoria?.updatedAt
                      ? new Date(flota.auditoria.updatedAt).toLocaleString("es-ES")
                      : "Sin modificaciones"}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] text-muted-foreground">Modificado por</span>
                  <div className="font-medium">
                    {flota.auditoria?.updatedBy || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL GESTIONAR / ASIGNAR VEHÍCULOS (MÚLTIPLES) */}
      {asignarVehiculosOpen && (
        <FlotaAsignarVehiculosDialog
          key={`asignar-vehiculos-${flota.id}`}
          open={asignarVehiculosOpen}
          onOpenChange={setAsignarVehiculosOpen}
          flota={flota}
          assignedVehiculos={vehiculos}
          onSuccess={() => {
            vehiculosQuery.refetch()
          }}
        />
      )}

      {/* MODAL RESPONSABLE */}
      {responsableDialogOpen && (
        <FlotaResponsableDialog
          key={editingResponsable?.id ?? `new-resp-${flota.id}`}
          open={responsableDialogOpen}
          onOpenChange={setResponsableDialogOpen}
          flota={flota}
          responsable={editingResponsable}
          onSuccess={() => {
            responsablesQuery.refetch()
          }}
        />
      )}

      {/* DIÁLOGO CONFIRMAR ELIMINACIÓN VEHÍCULO */}
      {vehiculoToDelete && (
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setVehiculoToDelete(null)}
          title="Desvincular Vehículo"
          description={`¿Estás seguro de desvincular el vehículo ${vehiculoToDelete.vehiculo?.codigo ?? ""} de la flota ${flota.nombre}?`}
          isPending={deleteVehiculoMutation.isPending}
          onConfirm={handleDeleteVehiculo}
        />
      )}

      {/* DIÁLOGO CONFIRMAR ELIMINACIÓN RESPONSABLE */}
      {responsableToDelete && (
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setResponsableToDelete(null)}
          title="Desvincular Responsable"
          description={`¿Estás seguro de desvincular a ${responsableToDelete.empleado?.nombreCompleto ?? "este empleado"} como responsable de la flota?`}
          isPending={deleteResponsableMutation.isPending}
          onConfirm={handleDeleteResponsable}
        />
      )}
    </div>
  )
}

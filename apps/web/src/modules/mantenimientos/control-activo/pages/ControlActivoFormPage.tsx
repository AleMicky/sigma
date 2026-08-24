import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  ArrowLeft,
  Box,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  History,
  Info,
  Loader2,
  MapPin,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Save,
  Send,
  Trash2,
  UserCheck,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

import { routes } from "@/app/config/routes"
import type { Accesorio } from "@/modules/activos/accesorio/api/accesorio.service"
import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import { activoAccesorioQueries } from "@/modules/activos/activo-accesorio/api/activo-accesorio.queries"
import { solicitudQueries } from "@/modules/mantenimientos/solicitud/api/solicitud.queries"
import { getPrioridadBadgeStyles } from "@/modules/mantenimientos/solicitud/lib/solicitud.utils"
import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import { useCreateControlActivoWithDetalles } from "../api/control-activo.mutations"
import type { TipoControlActivo } from "../api/control-activo.service"
import { AccesorioSelectDialog } from "../components/AccesorioSelectDialog"
import { ControlActivoHistorialModal } from "../components/ControlActivoHistorialModal"

type AccesorioItemState = {
  accesorioId: string
  codigo: string
  nombre: string
  cantidadEsperada: number
  cantidadEncontrada: number
  conforme: boolean
  observacion: string
}

type ControlActivoFormPageProps = {
  solicitudId?: string
  initialTipo?: TipoControlActivo
}

export function ControlActivoFormPage({
  solicitudId: propSolicitudId,
  initialTipo = "ENTREGA",
}: ControlActivoFormPageProps) {
  const navigate = useNavigate()

  // Leer search params si no vienen por props
  let searchParams: { solicitudId?: string; tipo?: TipoControlActivo } = {}
  try {
    searchParams = useSearch({ strict: false }) as {
      solicitudId?: string
      tipo?: TipoControlActivo
    }
  } catch {
    // En caso de que se renderice sin router context directo
  }

  const solicitudId = propSolicitudId || searchParams.solicitudId || ""
  const [tipo, setTipo] = useState<TipoControlActivo>(
    searchParams.tipo || initialTipo,
  )

  // Consulta de la solicitud
  const solicitudQuery = useQuery({
    ...solicitudQueries.detail(solicitudId),
    enabled: Boolean(solicitudId),
  })

  const solicitud = solicitudQuery.data
  const activoId = solicitud?.activo?.id

  // Consulta de detalle completo del activo (para ubicación, tipo, etc.)
  const activoDetailQuery = useQuery({
    ...activoQueries.detail(activoId ?? ""),
    enabled: Boolean(activoId),
  })
  const activoDetail = activoDetailQuery.data

  // Consulta de accesorios pre-asignados al activo
  const activoAccesoriosQuery = useQuery({
    ...activoAccesorioQueries.byActivo(activoId ?? ""),
    enabled: Boolean(activoId),
  })

  // Estado del formulario
  const [fecha, setFecha] = useState<string>(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })
  const [entregadoPorId, setEntregadoPorId] = useState<string>("")
  const [recibidoPorId, setRecibidoPorId] = useState<string>("")
  const [conformeGeneral, setConformeGeneral] = useState<boolean>(true)
  const [observacionGeneral, setObservacionGeneral] = useState<string>("")

  // Lista de accesorios a controlar
  const [items, setItems] = useState<AccesorioItemState[]>([])
  const [hasLoadedDefaultAccesorios, setHasLoadedDefaultAccesorios] =
    useState(false)

  // Modales
  const [selectAccesorioOpen, setSelectAccesorioOpen] = useState(false)
  const [historialOpen, setHistorialOpen] = useState(false)

  // Auto-cargar datos iniciales de la solicitud y empleados por defecto
  useEffect(() => {
    if (solicitud) {
      if (tipo === "ENTREGA") {
        // En entrega: entrega el solicitante/custodio, recibe el responsable/técnico
        if (!entregadoPorId && solicitud.solicitante?.id) {
          setEntregadoPorId(solicitud.solicitante.id)
        }
        if (!recibidoPorId && solicitud.responsable?.id) {
          setRecibidoPorId(solicitud.responsable.id)
        }
      } else {
        // En devolución: entrega el responsable/técnico, recibe el solicitante/custodio
        if (!entregadoPorId && solicitud.responsable?.id) {
          setEntregadoPorId(solicitud.responsable.id)
        }
        if (!recibidoPorId && solicitud.solicitante?.id) {
          setRecibidoPorId(solicitud.solicitante.id)
        }
      }
    }
  }, [solicitud, tipo])

  // Cargar accesorios asociados al activo
  useEffect(() => {
    if (
      activoAccesoriosQuery.data &&
      !hasLoadedDefaultAccesorios &&
      items.length === 0
    ) {
      const defaultItems: AccesorioItemState[] = (
        activoAccesoriosQuery.data.content ?? []
      ).map((rel) => ({
        accesorioId: rel.accesorio?.id ?? "",
        codigo: rel.accesorio?.codigo ?? "ACC",
        nombre: rel.accesorio?.nombre ?? "Accesorio",
        cantidadEsperada: rel.cantidad ?? 1,
        cantidadEncontrada: rel.cantidad ?? 1,
        conforme: true,
        observacion: rel.observacion ?? "",
      }))

      if (defaultItems.length > 0) {
        setItems(defaultItems)
        setHasLoadedDefaultAccesorios(true)
      }
    }
  }, [activoAccesoriosQuery.data, hasLoadedDefaultAccesorios, items.length])

  // Manejo de accesorios
  function handleAddAccesorio(accesorio: Accesorio) {
    if (items.some((i) => i.accesorioId === accesorio.id)) return
    setItems((prev) => [
      ...prev,
      {
        accesorioId: accesorio.id,
        codigo: accesorio.codigo,
        nombre: accesorio.nombre,
        cantidadEsperada: 1,
        cantidadEncontrada: 1,
        conforme: true,
        observacion: "",
      },
    ])
  }

  function handleRemoveAccesorio(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function handleUpdateItem(
    index: number,
    partial: Partial<AccesorioItemState>,
  ) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...partial } : item)),
    )
  }

  // Mutación de creación
  const createMutation = useCreateControlActivoWithDetalles()

  // Métricas del checklist
  const totalItems = items.length
  const itemsConformes = useMemo(
    () => items.filter((i) => i.conforme).length,
    [items],
  )
  const itemsInconformes = totalItems - itemsConformes

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!solicitudId) {
      toast.error("Debe especificar una solicitud de mantenimiento válida")
      return
    }

    if (!activoId) {
      toast.error("La solicitud no tiene un activo asociado")
      return
    }

    if (!fecha) {
      toast.error("La fecha y hora del control es obligatoria")
      return
    }

    // Validar items
    for (const item of items) {
      if (item.cantidadEsperada < 0 || item.cantidadEncontrada < 0) {
        toast.error("Las cantidades de los accesorios deben ser mayores o iguales a 0")
        return
      }
    }

    try {
      await createMutation.mutateAsync({
        control: {
          solicitudMantenimientoId: solicitudId,
          activoId: activoId,
          tipo: tipo,
          entregadoPorId: entregadoPorId || null,
          recibidoPorId: recibidoPorId || null,
          fecha: new Date(fecha).toISOString().slice(0, 19),
          conforme: conformeGeneral,
          observacion: observacionGeneral.trim() || null,
        },
        detalles: items.map((i) => ({
          accesorioId: i.accesorioId,
          cantidadEsperada: i.cantidadEsperada,
          cantidadEncontrada: i.cantidadEncontrada,
          conforme: i.conforme,
          observacion: i.observacion.trim() || null,
        })),
      })

      // Redirigir a encargado
      navigate({ to: routes.mantenimientos.encargado })
    } catch {
      // Manejado por onError de la mutación
    }
  }

  if (solicitudQuery.isLoading) {
    return (
      <PageShell className="p-6">
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Cargando datos de la solicitud y activo...</p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-y-auto px-3 py-3 sm:px-6 md:px-8 pb-20">
      {/* Top Header & Breadcrumb */}
      <header className="flex shrink-0 flex-col gap-3 border-b pb-4 pt-1 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-xl hover:bg-muted"
            onClick={() => navigate({ to: routes.mantenimientos.encargado })}
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <ClipboardCheck className="size-4" />
              </div>
              <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight">
                Control de Activo
              </h1>
              {solicitud?.numero && (
                <span className="font-mono text-xs font-bold bg-muted px-2.5 py-0.5 rounded-full border border-border">
                  Folio: {solicitud.numero}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registro formal de acta de entrega o recepción de activos y verificación de accesorios.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {solicitudId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setHistorialOpen(true)}
              className="h-8 gap-1.5 text-xs font-semibold"
            >
              <History className="size-3.5 text-muted-foreground" />
              <span>Ver Historial de Actas</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-5 max-w-6xl mx-auto">
        {/* Selector de Tipo de Control (Segmented Hero Card) */}
        <Card className="p-4 sm:p-5 border bg-gradient-to-r from-card to-muted/30 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tipo de Control / Operación
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Defina si está entregando el activo para intervención o devolviéndolo tras concluir los trabajos.
              </p>
            </div>

            <div className="inline-flex rounded-xl bg-muted p-1 border shadow-inner shrink-0">
              <button
                type="button"
                onClick={() => setTipo("ENTREGA")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  tipo === "ENTREGA"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Send className="size-3.5" />
                <span>Acta de Entrega</span>
              </button>

              <button
                type="button"
                onClick={() => setTipo("DEVOLUCION")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  tipo === "DEVOLUCION"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <RotateCcw className="size-3.5" />
                <span>Acta de Devolución</span>
              </button>
            </div>
          </div>
        </Card>

        {/* Resumen del Activo y Solicitud Vinculada */}
        {solicitud && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Activo Card */}
            <Card className="p-4 border-l-4 border-l-primary shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="size-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Activo a Intervenir
                  </span>
                </div>
                {solicitud.activo?.codigo && (
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {solicitud.activo.codigo}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-heading font-bold text-sm text-foreground">
                  {solicitud.activo?.nombre || activoDetail?.nombre || "Activo no especificado"}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                  {activoDetail?.ubicacion && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground/70" />
                      {activoDetail.ubicacion.nombre}
                    </span>
                  )}
                  {activoDetail?.tipoActivo && (
                    <span className="flex items-center gap-1">
                      <Building2 className="size-3 text-muted-foreground/70" />
                      {activoDetail.tipoActivo.nombre}
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* Solicitud Card */}
            <Card className="p-4 border-l-4 border-l-sky-500 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="size-4 text-sky-600 dark:text-sky-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Solicitud de Mantenimiento
                  </span>
                </div>
                {solicitud.prioridad && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-xs font-semibold rounded border",
                      getPrioridadBadgeStyles(solicitud.prioridad.nivel ?? 1),
                    )}
                  >
                    {solicitud.prioridad.nombre}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-heading font-semibold text-sm text-foreground line-clamp-1">
                  {solicitud.titulo}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                  {solicitud.solicitante && (
                    <span>
                      Solicitante: <strong className="text-foreground">{solicitud.solicitante.nombre}</strong>
                    </span>
                  )}
                  {solicitud.tipoMantenimiento && (
                    <span>
                      Tipo: <strong className="text-foreground">{solicitud.tipoMantenimiento.nombre}</strong>
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Sección: Datos Generales y Responsables */}
        <Card className="p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-2.5">
            <UserCheck className="size-4 text-primary" />
            <h2 className="font-heading text-sm sm:text-base font-bold text-foreground">
              Responsables y Fecha de Control
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Fecha y Hora */}
            <div className="space-y-1.5">
              <Label htmlFor="fechaControl" className="text-xs font-semibold">
                Fecha y Hora <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="fechaControl"
                  type="datetime-local"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            {/* Entregado Por */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {tipo === "ENTREGA" ? "Entregado por (Solicitante/Custodio)" : "Entregado por (Técnico/Encargado)"}
              </Label>
              <EmpleadoCombobox
                value={entregadoPorId}
                onValueChange={(val) => setEntregadoPorId(val)}
                placeholder="Seleccione persona que entrega..."
                className="h-9 text-xs"
              />
            </div>

            {/* Recibido Por */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {tipo === "ENTREGA" ? "Recibido por (Técnico/Encargado)" : "Recibido por (Solicitante/Custodio)"}
              </Label>
              <EmpleadoCombobox
                value={recibidoPorId}
                onValueChange={(val) => setRecibidoPorId(val)}
                placeholder="Seleccione persona que recibe..."
                className="h-9 text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Sección: Verificación de Accesorios y Elementos (Checklist) */}
        <Card className="p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-primary" />
              <div>
                <h2 className="font-heading text-sm sm:text-base font-bold text-foreground">
                  Verificación de Accesorios y Componentes
                </h2>
                <p className="text-xs text-muted-foreground">
                  Compruebe la cantidad esperada vs encontrada y el estado de cada accesorio
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectAccesorioOpen(true)}
                className="h-8 gap-1.5 text-xs font-semibold rounded-lg"
              >
                <Plus className="size-3.5" />
                <span>Agregar Accesorio</span>
              </Button>
            </div>
          </div>

          {/* Banner de Estado de Accesorios */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/40 border text-xs">
            <div className="flex items-center gap-3">
              <span>
                Total registrados: <strong className="text-foreground">{totalItems}</strong>
              </span>
              <span className="text-emerald-700 dark:text-emerald-300">
                Conformes: <strong>{itemsConformes}</strong>
              </span>
              {itemsInconformes > 0 && (
                <span className="text-amber-700 dark:text-amber-300 font-bold">
                  Con observaciones: {itemsInconformes}
                </span>
              )}
            </div>

            {totalItems > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setItems((prev) => prev.map((i) => ({ ...i, conforme: true })))
                }}
              >
                <Check className="size-3 mr-1 text-emerald-500" />
                Marcar todos conformes
              </Button>
            )}
          </div>

          {/* Lista / Grid de Accesorios */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-xl bg-muted/10 p-4">
              <Package className="size-8 text-muted-foreground/60 mb-2" />
              <p className="font-semibold text-xs text-foreground">
                No hay accesorios en la lista
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
                El activo no cuenta con accesorios pre-registrados. Puede añadir accesorios manualmente usando el botón "Agregar Accesorio".
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectAccesorioOpen(true)}
                className="mt-3 h-7 text-xs font-semibold gap-1"
              >
                <Plus className="size-3" />
                Agregar primer accesorio
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={`${item.accesorioId}-${idx}`}
                  className={cn(
                    "p-3.5 rounded-xl border transition-all text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs",
                    item.conforme
                      ? "bg-card border-border/70"
                      : "bg-amber-500/[0.03] border-amber-500/30 ring-1 ring-amber-500/20",
                  )}
                >
                  {/* Nombre y Código */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                        {item.codigo}
                      </span>
                      <span className="font-semibold text-foreground truncate">
                        {item.nombre}
                      </span>
                    </div>

                    {/* Observación inline */}
                    <div className="mt-2">
                      <Input
                        placeholder="Observación o nota del accesorio (opcional)..."
                        value={item.observacion}
                        onChange={(e) =>
                          handleUpdateItem(idx, { observacion: e.target.value })
                        }
                        className="h-7 text-[11px] bg-background/80"
                      />
                    </div>
                  </div>

                  {/* Controles de Cantidad y Conformidad */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0 self-end md:self-center">
                    {/* Cantidad Esperada */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                        Esperada
                      </span>
                      <Input
                        type="number"
                        min="0"
                        value={item.cantidadEsperada}
                        onChange={(e) =>
                          handleUpdateItem(idx, {
                            cantidadEsperada: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-8 w-16 text-center text-xs font-bold"
                      />
                    </div>

                    {/* Cantidad Encontrada con Stepper */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                        Encontrada
                      </span>
                      <div className="flex items-center border rounded-md bg-background">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            handleUpdateItem(idx, {
                              cantidadEncontrada: Math.max(
                                0,
                                item.cantidadEncontrada - 1,
                              ),
                            })
                          }
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center text-xs font-bold">
                          {item.cantidadEncontrada}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            handleUpdateItem(idx, {
                              cantidadEncontrada: item.cantidadEncontrada + 1,
                            })
                          }
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Toggle Conforme */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                        Conformidad
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateItem(idx, { conforme: !item.conforme })
                        }
                        className={cn(
                          "flex items-center gap-1.5 h-8 px-2.5 rounded-lg font-bold text-xs border transition-all cursor-pointer",
                          item.conforme
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20",
                        )}
                      >
                        {item.conforme ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : (
                          <AlertTriangle className="size-3.5" />
                        )}
                        <span>{item.conforme ? "Conforme" : "Observado"}</span>
                      </button>
                    </div>

                    {/* Eliminar accesorio */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive mt-3 md:mt-0"
                      onClick={() => handleRemoveAccesorio(idx)}
                      title="Quitar accesorio de la lista"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Sección: Dictamen Global y Observaciones */}
        <Card className="p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-2.5">
            <FileCheck2 className="size-4 text-primary" />
            <h2 className="font-heading text-sm sm:text-base font-bold text-foreground">
              Dictamen Final y Observaciones Generales
            </h2>
          </div>

          <div className="space-y-4">
            {/* Dictamen General (Cards) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Resultado General del Control <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setConformeGeneral(true)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
                    conformeGeneral
                      ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20"
                      : "bg-card hover:bg-muted/40 border-border/70",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg shadow-xs",
                      conformeGeneral
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Conforme (Aceptado sin objeción)
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      El activo y sus accesorios se encuentran completos y en el estado esperado.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setConformeGeneral(false)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
                    !conformeGeneral
                      ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20"
                      : "bg-card hover:bg-muted/40 border-border/70",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg shadow-xs",
                      !conformeGeneral
                        ? "bg-amber-600 text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <AlertTriangle className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Con Observaciones / Faltantes
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Se detectaron discrepancias en cantidades, faltantes o daños en accesorios.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Observación General */}
            <div className="space-y-1.5">
              <Label htmlFor="obsGeneral" className="text-xs font-semibold">
                Observaciones Generales del Acta
              </Label>
              <Textarea
                id="obsGeneral"
                rows={3}
                maxLength={500}
                placeholder="Detalle cualquier condición especial, golpes, rayones o compromisos de entrega acordados..."
                value={observacionGeneral}
                onChange={(e) => setObservacionGeneral(e.target.value)}
                className="text-xs"
              />
              <div className="flex justify-end text-[10px] text-muted-foreground">
                {observacionGeneral.length}/500 caracteres
              </div>
            </div>
          </div>
        </Card>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border bg-background/95 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="size-4 text-primary shrink-0 hidden sm:block" />
            <span>
              Acta de <strong>{tipo === "ENTREGA" ? "Entrega" : "Devolución"}</strong> • {itemsConformes}/{totalItems} accesorios conformes
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: routes.mantenimientos.encargado })}
              disabled={createMutation.isPending}
              className="h-9 px-4 text-xs font-semibold"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="h-9 gap-2 px-5 text-xs font-bold shadow-sm"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Guardando Acta...</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>Guardar Acta de Control</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Selector de Accesorio Dialog */}
      <AccesorioSelectDialog
        open={selectAccesorioOpen}
        onOpenChange={setSelectAccesorioOpen}
        existingAccesorioIds={items.map((i) => i.accesorioId)}
        onSelect={handleAddAccesorio}
      />

      {/* Modal Historial de Actas */}
      <ControlActivoHistorialModal
        open={historialOpen}
        onOpenChange={setHistorialOpen}
        solicitudId={solicitudId}
        solicitudNumero={solicitud?.numero}
      />
    </PageShell>
  )
}

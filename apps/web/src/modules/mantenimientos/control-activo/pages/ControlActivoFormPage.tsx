import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  ArrowLeft,
  Box,
  Calendar,
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

  let searchParams: { solicitudId?: string; tipo?: TipoControlActivo } = {}
  try {
    searchParams = useSearch({ strict: false }) as {
      solicitudId?: string
      tipo?: TipoControlActivo
    }
  } catch {
    // Sin context directo
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

  // Consulta de detalle completo del activo
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
        if (!entregadoPorId && solicitud.solicitante?.id) {
          setEntregadoPorId(solicitud.solicitante.id)
        }
        if (!recibidoPorId && solicitud.responsable?.id) {
          setRecibidoPorId(solicitud.responsable.id)
        }
      } else {
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

      navigate({ to: routes.mantenimientos.encargado })
    } catch {
      // Manejado por mutation
    }
  }

  if (solicitudQuery.isLoading) {
    return (
      <PageShell className="p-4">
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-xs font-medium">Cargando datos...</p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-y-auto px-3 py-2 sm:px-5 md:px-6 pb-20">
      {/* Top Header Compacto */}
      <header className="flex shrink-0 items-center justify-between gap-2 border-b pb-2 pt-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 rounded-lg hover:bg-muted"
            onClick={() => navigate({ to: routes.mantenimientos.encargado })}
          >
            <ArrowLeft className="size-3.5" />
          </Button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ClipboardCheck className="size-3.5" />
            </div>
            <h1 className="font-heading text-sm sm:text-base font-bold tracking-tight truncate">
              Control de Activo
            </h1>
            {solicitud?.numero && (
              <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded border border-border shrink-0">
                Folio: {solicitud.numero}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {solicitudId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setHistorialOpen(true)}
              className="h-7 gap-1 px-2.5 text-xs font-semibold"
            >
              <History className="size-3 text-muted-foreground" />
              <span className="hidden sm:inline">Historial</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="mt-3 space-y-3 max-w-5xl mx-auto">
        {/* Banner Superior: Tipo + Activo + Solicitud */}
        <Card className="p-3 border bg-card shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Activo & Solicitud Resumen */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Box className="size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {solicitud?.activo?.codigo && (
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {solicitud.activo.codigo}
                    </span>
                  )}
                  <span className="font-heading text-sm font-bold text-foreground truncate">
                    {solicitud?.activo?.nombre || activoDetail?.nombre || "Activo no especificado"}
                  </span>
                  {solicitud?.prioridad && (
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

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                  {activoDetail?.ubicacion && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 opacity-70" />
                      {activoDetail.ubicacion.nombre}
                    </span>
                  )}
                  {solicitud?.solicitante && (
                    <span className="truncate">
                      Solicitante: <strong className="text-foreground font-medium">{solicitud.solicitante.nombre}</strong>
                    </span>
                  )}
                  {solicitud?.tipoMantenimiento && (
                    <span className="hidden md:inline truncate">
                      Tipo: <strong className="text-foreground font-medium">{solicitud.tipoMantenimiento.nombre}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Selector de Tipo (Pills) */}
            <div className="inline-flex rounded-xl bg-muted p-1 border shadow-inner shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setTipo("ENTREGA")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  tipo === "ENTREGA"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Send className="size-3.5" />
                <span>Acta Entrega</span>
              </button>

              <button
                type="button"
                onClick={() => setTipo("DEVOLUCION")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  tipo === "DEVOLUCION"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <RotateCcw className="size-3.5" />
                <span>Acta Devolución</span>
              </button>
            </div>
          </div>
        </Card>

        {/* Responsables y Fecha (3 Columnas con espaciado limpio) */}
        <Card className="p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b pb-2">
            <UserCheck className="size-4 text-primary" />
            <h2 className="font-heading text-xs sm:text-sm font-bold text-foreground">
              Responsables y Fecha de Control
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-start">
            {/* Fecha y Hora */}
            <div className="space-y-1.5">
              <Label htmlFor="fechaControl" className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span>Fecha / Hora</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fechaControl"
                type="datetime-local"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-10 text-xs font-medium"
                required
              />
            </div>

            {/* Entregado Por */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {tipo === "ENTREGA" ? "Entrega (Solicitante)" : "Entrega (Técnico)"}
              </Label>
              <EmpleadoCombobox
                value={entregadoPorId}
                onValueChange={(val) => setEntregadoPorId(val)}
                placeholder="Seleccione persona..."
              />
            </div>

            {/* Recibido Por */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {tipo === "ENTREGA" ? "Recibe (Técnico)" : "Recibe (Solicitante)"}
              </Label>
              <EmpleadoCombobox
                value={recibidoPorId}
                onValueChange={(val) => setRecibidoPorId(val)}
                placeholder="Seleccione persona..."
              />
            </div>
          </div>
        </Card>

        {/* Verificación de Accesorios (Tabla Estructurada Limpia) */}
        <Card className="p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b pb-2">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-primary" />
              <h2 className="font-heading text-xs sm:text-sm font-bold text-foreground">
                Verificación de Accesorios
              </h2>
              <span className="text-xs text-muted-foreground font-medium">
                ({itemsConformes}/{totalItems} conformes)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {totalItems > 0 && (
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.map((i) => ({ ...i, conforme: true })))}
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                >
                  Marcar todos conformes
                </button>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectAccesorioOpen(true)}
                className="h-7 gap-1 px-2.5 text-xs font-semibold rounded-lg"
              >
                <Plus className="size-3.5" />
                <span>Agregar</span>
              </Button>
            </div>
          </div>

          {/* Lista de Accesorios */}
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-muted/10 p-4">
              <p className="font-semibold text-foreground">No hay accesorios en la lista</p>
              <p className="text-muted-foreground mt-0.5">
                Puede añadir accesorios del catálogo usando el botón "+ Agregar".
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Encabezado de Columnas en Pantallas Medianas / Grandes */}
              <div className="hidden md:flex items-center justify-between gap-3 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b bg-muted/20 rounded-md">
                <div className="w-52 shrink-0">Accesorio</div>
                <div className="flex-1 min-w-0">Observación / Estado</div>
                <div className="w-16 text-center shrink-0">Esperada</div>
                <div className="w-24 text-center shrink-0">Encontrada</div>
                <div className="w-28 text-center shrink-0">Conformidad</div>
                <div className="w-8 shrink-0"></div>
              </div>

              {/* Filas */}
              {items.map((item, idx) => (
                <div
                  key={`${item.accesorioId}-${idx}`}
                  className={cn(
                    "p-2.5 sm:px-3 rounded-xl border transition-all text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs",
                    item.conforme
                      ? "bg-card border-border/80 hover:border-primary/30"
                      : "bg-amber-500/[0.04] border-amber-500/40 ring-1 ring-amber-500/20",
                  )}
                >
                  {/* Nombre y Código */}
                  <div className="w-full md:w-52 shrink-0 flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                      {item.codigo}
                    </span>
                    <span className="font-bold text-foreground text-xs truncate">
                      {item.nombre}
                    </span>
                  </div>

                  {/* Input de Observación inline */}
                  <div className="w-full md:flex-1 min-w-0">
                    <Input
                      placeholder="Nota o detalle del estado (opcional)..."
                      value={item.observacion}
                      onChange={(e) =>
                        handleUpdateItem(idx, { observacion: e.target.value })
                      }
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  {/* Controles de Cantidad y Conformidad */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-1 md:pt-0 border-t md:border-t-0">
                    {/* Cantidad Esperada */}
                    <div className="flex md:flex-col items-center gap-1">
                      <span className="md:hidden text-[11px] font-semibold text-muted-foreground">
                        Esp:
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
                    <div className="flex md:flex-col items-center gap-1">
                      <span className="md:hidden text-[11px] font-semibold text-muted-foreground">
                        Enc:
                      </span>
                      <div className="flex items-center border rounded-lg bg-background h-8">
                        <button
                          type="button"
                          className="size-7 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
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
                        </button>
                        <span className="w-7 text-center text-xs font-bold">
                          {item.cantidadEncontrada}
                        </span>
                        <button
                          type="button"
                          className="size-7 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                          onClick={() =>
                            handleUpdateItem(idx, {
                              cantidadEncontrada: item.cantidadEncontrada + 1,
                            })
                          }
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>

                    {/* Toggle Conforme */}
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateItem(idx, { conforme: !item.conforme })
                      }
                      className={cn(
                        "flex items-center justify-center gap-1.5 h-8 w-26 rounded-lg font-bold text-xs border transition-all cursor-pointer",
                        item.conforme
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/25",
                      )}
                    >
                      {item.conforme ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <AlertTriangle className="size-3.5" />
                      )}
                      <span>{item.conforme ? "Conforme" : "Observado"}</span>
                    </button>

                    {/* Eliminar accesorio */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                      onClick={() => handleRemoveAccesorio(idx)}
                      title="Quitar accesorio"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Dictamen y Observaciones Generales */}
        <Card className="p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b pb-2">
            <FileCheck2 className="size-4 text-primary" />
            <h2 className="font-heading text-xs sm:text-sm font-bold text-foreground">
              Dictamen Final y Observaciones Generales
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Dictamen (1 Columna) */}
            <div className="space-y-1.5 md:col-span-1">
              <Label className="text-xs font-semibold text-foreground">
                Resultado Dictamen <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-2">
                <div
                  onClick={() => setConformeGeneral(true)}
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all text-xs font-bold",
                    conformeGeneral
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/30 shadow-xs"
                      : "bg-card hover:bg-muted/40 border-border/80 text-muted-foreground",
                  )}
                >
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Conforme (Aceptado)</span>
                </div>

                <div
                  onClick={() => setConformeGeneral(false)}
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all text-xs font-bold",
                    !conformeGeneral
                      ? "bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-200 ring-2 ring-amber-500/30 shadow-xs"
                      : "bg-card hover:bg-muted/40 border-border/80 text-muted-foreground",
                  )}
                >
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Con Observaciones / Faltantes</span>
                </div>
              </div>
            </div>

            {/* Observaciones (2 Columnas) */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="obsGeneral" className="text-xs font-semibold text-foreground">
                Observaciones Generales del Acta
              </Label>
              <Textarea
                id="obsGeneral"
                rows={3}
                maxLength={500}
                placeholder="Detalle cualquier condición especial, rayones o compromisos de entrega acordados..."
                value={observacionGeneral}
                onChange={(e) => setObservacionGeneral(e.target.value)}
                className="text-xs resize-none"
              />
              <div className="flex justify-end text-[10px] text-muted-foreground">
                {observacionGeneral.length}/500 caracteres
              </div>
            </div>
          </div>
        </Card>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 p-3 rounded-xl border bg-background/95 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="size-4 text-primary shrink-0 hidden sm:block" />
            <span>
              Acta de <strong>{tipo === "ENTREGA" ? "Entrega" : "Devolución"}</strong> • {itemsConformes}/{totalItems} accesorios OK
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: routes.mantenimientos.encargado })}
              disabled={createMutation.isPending}
              className="h-8 px-4 text-xs font-semibold"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="h-8 gap-2 px-5 text-xs font-bold shadow-xs cursor-pointer"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>Guardar Acta</span>
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

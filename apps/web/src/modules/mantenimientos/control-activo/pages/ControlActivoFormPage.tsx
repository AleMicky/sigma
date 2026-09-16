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
import { accesorioQueries } from "@/modules/activos/accesorio/api/accesorio.queries"
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
import { formatDate } from "@/shared/utils/date.utils"

import {
  useCreateControlActivoWithDetalles,
  useUpdateControlActivoWithDetalles,
} from "../api/control-activo.mutations"
import { controlActivoQueries } from "../api/control-activo.queries"
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
  id?: string
  solicitudId?: string
  initialTipo?: TipoControlActivo
}

export function ControlActivoFormPage({
  id: propId,
  solicitudId: propSolicitudId,
  initialTipo = "ENTREGA",
}: ControlActivoFormPageProps) {
  const navigate = useNavigate()

  let searchParams: {
    id?: string
    solicitudId?: string
    tipo?: TipoControlActivo
  } = {}
  try {
    searchParams = useSearch({ strict: false }) as {
      id?: string
      solicitudId?: string
      tipo?: TipoControlActivo
    }
  } catch {
    // Sin context directo
  }

  const controlActivoId = propId || searchParams.id || ""
  const isEditing = Boolean(controlActivoId)

  // Consulta de la cabecera si está en edición
  // Consulta de la cabecera si está en edición
  const controlActivoQuery = useQuery({
    ...controlActivoQueries.detail(controlActivoId),
    enabled: isEditing,
  })

  // Consulta de catálogo completo de accesorios para resolver nombres y códigos
  const allAccesoriosQuery = useQuery({
    ...accesorioQueries.list({ size: 1000 }),
    enabled: isEditing,
  })

  const accesorioMap = useMemo(() => {
    const map = new Map<string, Accesorio>()
    for (const acc of allAccesoriosQuery.data?.content ?? []) {
      map.set(acc.id, acc)
    }
    return map
  }, [allAccesoriosQuery.data])

  // Consulta de detalles/accesorios existentes si está en edición (como fallback secundario)
  const controlActivoDetallesQuery = useQuery({
    ...controlActivoQueries.detallesList({
      controlActivoId,
      size: 100,
    }),
    enabled: isEditing,
  })

  const solicitudId =
    propSolicitudId ||
    searchParams.solicitudId ||
    controlActivoQuery.data?.solicitudMantenimientoId ||
    ""

  const [tipo, setTipo] = useState<TipoControlActivo>(
    searchParams.tipo || initialTipo,
  )

  // Consulta de la solicitud
  const solicitudQuery = useQuery({
    ...solicitudQueries.detail(solicitudId),
    enabled: Boolean(solicitudId),
  })

  const solicitud = solicitudQuery.data
  const activoId =
    solicitud?.activo?.id ||
    controlActivoQuery.data?.activoId ||
    controlActivoQuery.data?.activo?.id ||
    ""

  // Consulta de detalle completo del activo
  const activoDetailQuery = useQuery({
    ...activoQueries.detail(activoId ?? ""),
    enabled: Boolean(activoId),
  })
  const activoDetail = activoDetailQuery.data

  // Consulta de accesorios pre-asignados al activo
  const activoAccesoriosQuery = useQuery({
    ...activoAccesorioQueries.byActivo(activoId ?? ""),
    enabled: Boolean(activoId && !isEditing),
  })

  // Consulta de Actas de Control previas para esta solicitud (para recuperar datos en Devolución)
  const actasPreviasQuery = useQuery({
    ...controlActivoQueries.list({
      solicitudMantenimientoId: solicitudId ?? undefined,
      size: 50,
      sortBy: "createdAt",
      direction: "DESC",
    }),
    enabled: Boolean(solicitudId && !isEditing),
  })

  const actaEntregaPrevia = useMemo(() => {
    return (actasPreviasQuery.data?.content ?? []).find(
      (c) => c.tipo === "ENTREGA",
    )
  }, [actasPreviasQuery.data])

  const actaEntregaDetallesQuery = useQuery({
    ...controlActivoQueries.detallesList({
      controlActivoId: actaEntregaPrevia?.id ?? "",
    }),
    enabled: Boolean(actaEntregaPrevia?.id && !isEditing),
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

  const isAsignado = (solicitud?.estado ?? "").toUpperCase() === "ASIGNADO"
  const targetRoute =
    tipo === "DEVOLUCION"
      ? routes.mantenimientos.solicitudes
      : routes.mantenimientos.encargado

  // Cargar datos del control existente cuando está en modo edición
  useEffect(() => {
    if (isEditing && controlActivoQuery.data) {
      const data = controlActivoQuery.data
      setTipo(data.tipo)
      if (data.fecha) {
        setFecha(data.fecha.slice(0, 16))
      }
      setEntregadoPorId(data.entregadoPorId || data.entregadoPor?.id || "")
      setRecibidoPorId(data.recibidoPorId || data.recibidoPor?.id || "")
      setConformeGeneral(data.conforme ?? true)
      setObservacionGeneral(data.observacion || "")
    }
  }, [isEditing, controlActivoQuery.data])

  // Cargar items existentes cuando está en modo edición
  useEffect(() => {
    if (!isEditing || hasLoadedDefaultAccesorios) return

    const rawDetalles =
      controlActivoQuery.data?.detalles && controlActivoQuery.data.detalles.length > 0
        ? controlActivoQuery.data.detalles
        : (controlActivoDetallesQuery.data?.content ?? [])

    if (rawDetalles.length > 0) {
      const loaded: AccesorioItemState[] = rawDetalles.map((det) => {
        const accId = det.accesorioId || det.accesorio?.id || ""
        const accCatalog = accesorioMap.get(accId)
        return {
          accesorioId: accId,
          codigo: det.accesorio?.codigo || accCatalog?.codigo || "ACC",
          nombre: det.accesorio?.nombre || accCatalog?.nombre || "Accesorio",
          cantidadEsperada: det.cantidadEsperada ?? 1,
          cantidadEncontrada: det.cantidadEncontrada ?? 1,
          conforme: det.conforme ?? true,
          observacion: det.observacion ?? "",
        }
      })
      setItems(loaded)
      setHasLoadedDefaultAccesorios(true)
    }
  }, [
    isEditing,
    controlActivoQuery.data?.detalles,
    controlActivoDetallesQuery.data,
    accesorioMap,
    hasLoadedDefaultAccesorios,
  ])

  // Auto-cargar datos iniciales de responsables de la solicitud (solo si es nuevo)
  useEffect(() => {
    if (solicitud && !isEditing) {
      const effectiveTipo = isAsignado ? "ENTREGA" : tipo
      if (isAsignado && tipo !== "ENTREGA") {
        setTipo("ENTREGA")
      }

      if (effectiveTipo === "ENTREGA") {
        if (!entregadoPorId && solicitud.solicitante?.id) {
          setEntregadoPorId(solicitud.solicitante.id)
        }
        if (!recibidoPorId && solicitud.responsable?.id) {
          setRecibidoPorId(solicitud.responsable.id)
        }
      } else {
        if (!entregadoPorId && (actaEntregaPrevia?.recibidoPor?.id || solicitud.responsable?.id)) {
          setEntregadoPorId(actaEntregaPrevia?.recibidoPor?.id || solicitud.responsable?.id || "")
        }
        if (!recibidoPorId && (actaEntregaPrevia?.entregadoPor?.id || solicitud.solicitante?.id)) {
          setRecibidoPorId(actaEntregaPrevia?.entregadoPor?.id || solicitud.solicitante?.id || "")
        }
      }
    }
  }, [solicitud, tipo, isAsignado, isEditing, actaEntregaPrevia, entregadoPorId, recibidoPorId])

  // Cargar accesorios: Si es Devolución, recupera del Acta de Entrega; si es Entrega, del activo
  useEffect(() => {
    if (isEditing) return

    if (tipo === "DEVOLUCION") {
      if (
        actaEntregaPrevia &&
        actaEntregaPrevia.conforme !== undefined &&
        actaEntregaPrevia.conforme !== null &&
        !hasLoadedDefaultAccesorios
      ) {
        setConformeGeneral(actaEntregaPrevia.conforme)
      }

      const detallesEntrega = actaEntregaDetallesQuery.data?.content ?? []
      if (detallesEntrega.length > 0 && !hasLoadedDefaultAccesorios) {
        const recovered: AccesorioItemState[] = detallesEntrega.map((det) => ({
          accesorioId: det.accesorio?.id ?? "",
          codigo: det.accesorio?.codigo ?? "ACC",
          nombre: det.accesorio?.nombre ?? "Accesorio",
          cantidadEsperada: det.cantidadEncontrada ?? det.cantidadEsperada ?? 1,
          cantidadEncontrada: det.cantidadEncontrada ?? det.cantidadEsperada ?? 1,
          conforme: det.conforme ?? true,
          observacion: det.observacion ? `Nota entrega: ${det.observacion}` : "",
        }))
        setItems(recovered)
        setHasLoadedDefaultAccesorios(true)
      } else if (
        !actaEntregaPrevia &&
        activoAccesoriosQuery.data &&
        !hasLoadedDefaultAccesorios &&
        items.length === 0
      ) {
        // Fallback si no hubo acta de entrega registrada
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
    } else {
      // Tipo ENTREGA
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
    }
  }, [
    isEditing,
    tipo,
    actaEntregaPrevia,
    actaEntregaDetallesQuery.data,
    activoAccesoriosQuery.data,
    hasLoadedDefaultAccesorios,
    items.length,
  ])

  function handleRecuperarDatosEntrega() {
    if (!actaEntregaPrevia) {
      toast.info("No se encontró un Acta de Entrega previa registrada para esta solicitud")
      return
    }

    if (actaEntregaPrevia.recibidoPor?.id) {
      setEntregadoPorId(actaEntregaPrevia.recibidoPor.id)
    }
    if (actaEntregaPrevia.entregadoPor?.id) {
      setRecibidoPorId(actaEntregaPrevia.entregadoPor.id)
    }
    if (actaEntregaPrevia.conforme !== undefined && actaEntregaPrevia.conforme !== null) {
      setConformeGeneral(actaEntregaPrevia.conforme)
    }

    const detallesEntrega = actaEntregaDetallesQuery.data?.content ?? []
    if (detallesEntrega.length > 0) {
      const recovered: AccesorioItemState[] = detallesEntrega.map((det) => ({
        accesorioId: det.accesorio?.id ?? "",
        codigo: det.accesorio?.codigo ?? "ACC",
        nombre: det.accesorio?.nombre ?? "Accesorio",
        cantidadEsperada: det.cantidadEncontrada ?? det.cantidadEsperada ?? 1,
        cantidadEncontrada: det.cantidadEncontrada ?? det.cantidadEsperada ?? 1,
        conforme: det.conforme ?? true,
        observacion: det.observacion ? `Nota entrega: ${det.observacion}` : "",
      }))
      setItems(recovered)
      setHasLoadedDefaultAccesorios(true)
      toast.success("Accesorios, conformidad y responsables recuperados del Acta de Entrega")
    }
  }

  // Mutations
  const createMutation = useCreateControlActivoWithDetalles()
  const updateMutation = useUpdateControlActivoWithDetalles()

  // Handlers para la lista de accesorios
  function handleUpdateItem(
    index: number,
    partial: Partial<AccesorioItemState>,
  ) {
    setItems((prev) => {
      const next = prev.map((item, i) => {
        if (i !== index) return item
        const updated = { ...item, ...partial }

        // Si se modifica la cantidad encontrada y no se especificó 'conforme' manualmente:
        if (partial.cantidadEncontrada !== undefined && partial.conforme === undefined) {
          // Si la cantidad encontrada es diferente a la esperada o es 0, pasa automáticamente a Observado (false)
          updated.conforme =
            partial.cantidadEncontrada === item.cantidadEsperada &&
            partial.cantidadEncontrada > 0
        }

        return updated
      })

      // Sincronizar automáticamente el dictamen general: si algún accesorio no está conforme o difiere en cantidad
      const allItemsConformes =
        next.length === 0 ||
        next.every(
          (i) => i.conforme && i.cantidadEncontrada === i.cantidadEsperada,
        )
      setConformeGeneral(allItemsConformes)

      return next
    })
  }

  function handleRemoveItem(index: number) {
    setItems((prev) => {
      const next = prev.filter((_, idx) => idx !== index)
      const allItemsConformes =
        next.length === 0 ||
        next.every(
          (i) => i.conforme && i.cantidadEncontrada === i.cantidadEsperada,
        )
      setConformeGeneral(allItemsConformes)
      return next
    })
  }

  function handleAddAccesorio(accesorio: Accesorio) {
    if (items.some((i) => i.accesorioId === accesorio.id)) {
      toast.info("El accesorio ya está agregado a la lista")
      return
    }

    setItems((prev) => {
      const next = [
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
      ]
      const allItemsConformes = next.every(
        (i) => i.conforme && i.cantidadEncontrada === i.cantidadEsperada,
      )
      setConformeGeneral(allItemsConformes)
      return next
    })
  }

  // Cálculos reactivos de métricas
  const totalItems = items.length
  const itemsConformes = useMemo(
    () => items.filter((i) => i.conforme).length,
    [items],
  )

  // Submit
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
        toast.error(
          "Las cantidades de los accesorios deben ser mayores o iguales a 0",
        )
        return
      }
    }

    try {
      if (isEditing && controlActivoId) {
        await updateMutation.mutateAsync({
          id: controlActivoId,
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
      } else {
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
      }

      navigate({ to: targetRoute })
    } catch {
      // Manejado por mutation
    }
  }

  if (solicitudQuery.isLoading || (isEditing && controlActivoQuery.isLoading)) {
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
    <PageShell size="full" padding="none" layout="auto" className="w-full max-w-5xl mx-auto space-y-3 pb-10">
      {/* Top Header Compacto */}
      <header className="flex shrink-0 items-center justify-between gap-2 border-b pb-2 pt-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 rounded-lg hover:bg-muted"
            onClick={() => navigate({ to: targetRoute })}
          >
            <ArrowLeft className="size-3.5" />
          </Button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ClipboardCheck className="size-3.5" />
            </div>
            <h1 className="font-heading text-sm sm:text-base font-bold tracking-tight truncate">
              {isEditing
                ? `Editar Acta de ${tipo === "ENTREGA" ? "Entrega" : "Devolución"}`
                : "Control de Activo"}
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
      <form onSubmit={handleSubmit} className="space-y-3">
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

            {/* Selector de Tipo (Pills / Badge bloqueado) */}
            {isAsignado ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 font-bold text-xs shadow-2xs shrink-0 self-start sm:self-center">
                <Send className="size-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>Acta de Entrega de Activo</span>
                <span className="text-[10px] font-normal text-sky-700/80 dark:text-sky-300/80 border-l border-sky-500/30 pl-2">
                  (Estado: Asignado)
                </span>
              </div>
            ) : (
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
            )}
          </div>
        </Card>

        {/* Banner de Recuperación de Acta de Entrega */}
        {tipo === "DEVOLUCION" && !isEditing && (
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-start gap-2.5 min-w-0">
              <CheckCircle2 className="size-4 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-sky-950 dark:text-sky-100">
                  {actaEntregaPrevia
                    ? `Datos recuperados del Acta de Entrega previa (${formatDate(actaEntregaPrevia.fecha)})`
                    : "Modo Devolución de Activo"}
                </p>
                <p className="text-[11px] text-sky-800/90 dark:text-sky-300/90">
                  {actaEntregaPrevia
                    ? "Se han precargado los accesorios y cantidades verificadas durante la entrega para verificar su retorno."
                    : "No se encontró un acta de entrega previa; se cargó la lista de accesorios base del activo."}
                </p>
              </div>
            </div>

            {actaEntregaPrevia && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRecuperarDatosEntrega}
                className="h-7 text-xs font-semibold gap-1 shrink-0 bg-background/80 hover:bg-background border-sky-500/30 text-sky-800 dark:text-sky-200 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="size-3" />
                <span>Re-sincronizar Entrega</span>
              </Button>
            )}
          </div>
        )}

        {/* Responsables y Fecha (3 Columnas Compactas) */}
        <Card className="p-3 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-1.5 border-b pb-1.5">
            <UserCheck className="size-3.5 text-primary" />
            <h2 className="font-heading text-xs sm:text-[13px] font-bold text-foreground">
              Responsables y Fecha de Control
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-start">
            {/* Fecha y Hora */}
            <div className="space-y-1">
              <Label htmlFor="fechaControl" className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <Calendar className="size-3 text-muted-foreground" />
                <span>Fecha / Hora</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fechaControl"
                type="datetime-local"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-8.5 text-xs font-medium bg-background"
                required
              />
            </div>

            {/* Entregado Por */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-foreground">
                {tipo === "ENTREGA" ? "Entrega (Solicitante)" : "Entrega (Técnico)"}
              </Label>
              <EmpleadoCombobox
                value={entregadoPorId}
                onValueChange={(val) => setEntregadoPorId(val)}
                placeholder="Seleccione persona..."
                className="h-8.5 text-xs"
              />
            </div>

            {/* Recibido Por */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-foreground">
                {tipo === "ENTREGA" ? "Recibe (Técnico)" : "Recibe (Solicitante)"}
              </Label>
              <EmpleadoCombobox
                value={recibidoPorId}
                onValueChange={(val) => setRecibidoPorId(val)}
                placeholder="Seleccione persona..."
                className="h-8.5 text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Verificación de Accesorios (Tabla Compacta y Limpia) */}
        <Card className="p-3 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2 border-b pb-2">
            <div className="flex items-center gap-2">
              <Package className="size-3.5 text-primary" />
              <h2 className="font-heading text-xs sm:text-sm font-bold text-foreground">
                Verificación de Accesorios
              </h2>
              <span className="text-[11px] text-muted-foreground font-semibold">
                ({itemsConformes}/{totalItems} conformes)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {totalItems > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => {
                      const next = prev.map((i) => ({
                        ...i,
                        conforme: i.cantidadEncontrada > 0,
                      }))
                      const allOk = next.every(
                        (i) =>
                          i.conforme &&
                          i.cantidadEncontrada === i.cantidadEsperada,
                      )
                      setConformeGeneral(allOk)
                      return next
                    })
                  }
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                >
                  Marcar conformes
                </button>
              )}
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => setSelectAccesorioOpen(true)}
                className="h-6.5 gap-1 px-2 text-xs font-semibold rounded-lg cursor-pointer"
              >
                <Plus className="size-3" />
                <span>Agregar</span>
              </Button>
            </div>
          </div>

          {/* Lista de Accesorios */}
          {items.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/10 p-3">
              <p className="font-semibold text-foreground">No hay accesorios en la lista</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Puede añadir accesorios del catálogo usando el botón "+ Agregar".
              </p>
            </div>
          ) : (
            <div className="rounded-lg border bg-card overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground border-b select-none">
                  <tr>
                    <th className="px-2.5 py-1.5 min-w-[140px]">Accesorio</th>
                    <th className="px-2 py-1.5 text-center w-14">Esp.</th>
                    <th className="px-2 py-1.5 text-center w-24">Enc.</th>
                    <th className="px-2 py-1.5 text-center w-26">Estado</th>
                    <th className="px-2.5 py-1.5">Nota / Observación</th>
                    <th className="px-1.5 py-1.5 text-center w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {items.map((item, idx) => {
                    const hasMismatch = item.cantidadEsperada !== item.cantidadEncontrada
                    const isOk = item.conforme && !hasMismatch

                    return (
                      <tr
                        key={`${item.accesorioId}-${idx}`}
                        className={cn(
                          "transition-colors",
                          !isOk && "bg-amber-500/[0.04] dark:bg-amber-950/10",
                        )}
                      >
                        {/* Código y Nombre */}
                        <td className="px-2.5 py-1.5 font-medium">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1 py-0.2 rounded shrink-0">
                              {item.codigo}
                            </span>
                            <span
                              className="font-semibold text-foreground text-xs truncate max-w-[160px] sm:max-w-[220px]"
                              title={item.nombre}
                            >
                              {item.nombre}
                            </span>
                          </div>
                        </td>

                        {/* Cantidad Esperada */}
                        <td className="px-2 py-1.5 text-center font-mono text-xs font-semibold text-muted-foreground">
                          {item.cantidadEsperada}
                        </td>

                        {/* Cantidad Encontrada Stepper */}
                        <td className="px-2 py-1.5 text-center">
                          <div className="inline-flex items-center border rounded-md bg-background h-6.5">
                            <button
                              type="button"
                              className="size-5 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                              onClick={() =>
                                handleUpdateItem(idx, {
                                  cantidadEncontrada: Math.max(0, item.cantidadEncontrada - 1),
                                })
                              }
                            >
                              <Minus className="size-2.5" />
                            </button>
                            <span
                              className={cn(
                                "w-6 text-center text-xs font-mono font-bold",
                                hasMismatch ? "text-amber-600 dark:text-amber-400" : "text-foreground",
                              )}
                            >
                              {item.cantidadEncontrada}
                            </span>
                            <button
                              type="button"
                              className="size-5 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                              onClick={() =>
                                handleUpdateItem(idx, {
                                  cantidadEncontrada: item.cantidadEncontrada + 1,
                                })
                              }
                            >
                              <Plus className="size-2.5" />
                            </button>
                          </div>
                        </td>

                        {/* Toggle Conforme */}
                        <td className="px-2 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateItem(idx, { conforme: !item.conforme })
                            }
                            className={cn(
                              "inline-flex items-center gap-1 h-6.5 px-2 rounded-md font-bold text-[10.5px] border transition-all cursor-pointer",
                              item.conforme
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 hover:bg-amber-500/20",
                            )}
                          >
                            {item.conforme ? (
                              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
                            )}
                            <span>{item.conforme ? "Conforme" : "Observado"}</span>
                          </button>
                        </td>

                        {/* Input Observación */}
                        <td className="px-2.5 py-1.5">
                          <Input
                            placeholder="Nota opcional..."
                            value={item.observacion}
                            onChange={(e) =>
                              handleUpdateItem(idx, { observacion: e.target.value })
                            }
                            className="h-6.5 text-xs px-2 bg-background/80"
                          />
                        </td>

                        {/* Eliminar */}
                        <td className="px-1.5 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="size-6 inline-flex items-center justify-center rounded text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Eliminar accesorio"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Dictamen y Observaciones Generales */}
        <Card className="p-3 shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5 border-b pb-1.5">
            <FileCheck2 className="size-3.5 text-primary" />
            <h2 className="font-heading text-xs sm:text-[13px] font-bold text-foreground">
              Dictamen Final y Observaciones Generales
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* Dictamen (1 Columna) */}
            <div className="space-y-1 md:col-span-1">
              <Label className="text-[11px] font-semibold text-foreground">
                Resultado Dictamen <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-1.5">
                <div
                  onClick={() => setConformeGeneral(true)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-xs font-bold",
                    conformeGeneral
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500/30 shadow-2xs"
                      : "bg-card hover:bg-muted/40 border-border/80 text-muted-foreground",
                  )}
                >
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Conforme (Aceptado)</span>
                </div>

                <div
                  onClick={() => setConformeGeneral(false)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-xs font-bold",
                    !conformeGeneral
                      ? "bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-200 ring-1 ring-amber-500/30 shadow-2xs"
                      : "bg-card hover:bg-muted/40 border-border/80 text-muted-foreground",
                  )}
                >
                  <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Con Observaciones / Faltantes</span>
                </div>
              </div>
            </div>

            {/* Observaciones (2 Columnas) */}
            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="obsGeneral" className="text-[11px] font-semibold text-foreground">
                  Observaciones Generales del Acta
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  {observacionGeneral.length}/500
                </span>
              </div>
              <Textarea
                id="obsGeneral"
                rows={2}
                maxLength={500}
                placeholder="Detalle cualquier condición especial, rayones o compromisos acordados..."
                value={observacionGeneral}
                onChange={(e) => setObservacionGeneral(e.target.value)}
                className="text-xs resize-none min-h-[56px] py-1.5 px-2.5"
              />
            </div>
          </div>
        </Card>

        {/* Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border bg-card shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="size-4 text-primary shrink-0" />
            <span>
              Acta de <strong>{tipo === "ENTREGA" ? "Entrega" : "Devolución"}</strong> • {itemsConformes}/{totalItems} accesorios OK
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: targetRoute })}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="h-8 px-4 text-xs font-semibold"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="h-8 gap-2 px-5 text-xs font-bold shadow-xs cursor-pointer"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{isEditing ? "Actualizando..." : "Guardando..."}</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>{isEditing ? "Actualizar Acta" : "Guardar Acta"}</span>
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

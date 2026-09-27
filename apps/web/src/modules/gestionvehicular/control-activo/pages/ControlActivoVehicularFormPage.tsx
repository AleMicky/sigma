import { useMemo, useState } from "react"
import { useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle2,
  FileCheck2,
  FileText,
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
  User,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"
import { accesorioQueries } from "@/modules/activos/accesorio/api/accesorio.queries"
import type { Accesorio } from "@/modules/activos/accesorio/api/accesorio.service"
import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
import { activoAccesorioQueries } from "@/modules/activos/activo-accesorio/api/activo-accesorio.queries"
import type { ActivoAccesorio } from "@/modules/activos/activo-accesorio/api/activo-accesorio.service"
import { asignacionVehicularQueries } from "@/modules/gestionvehicular/asignacion-vehicular/api/asignacion-vehicular.queries"
import type { AsignacionVehicular } from "@/modules/gestionvehicular/asignacion-vehicular/api/asignacion-vehicular.service"
import { solicitudVehicularQueries } from "@/modules/gestionvehicular/solicitud/api/solicitud-vehicular.queries"
import type { SolicitudVehicular } from "@/modules/gestionvehicular/solicitud/api/solicitud-vehicular.service"
import { AccesorioSelectDialog } from "@/modules/mantenimientos/control-activo/components/AccesorioSelectDialog"
import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { PageShell } from "@/shared/components/page-shell"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { formatDate } from "@/shared/lib/format-date"
import { cn } from "@/shared/lib/utils"

import {
  useCreateControlActivoVehicularWithDetalles,
  useUpdateControlActivoVehicularWithDetalles,
} from "../api/control-activo.mutations"
import { controlActivoVehicularQueries } from "../api/control-activo.queries"
import type {
  ControlActivoVehicular,
  ControlActivoVehicularDetalle,
  TipoControlActivo,
} from "../api/control-activo.service"
import { ControlActivoVehicularHistorialModal } from "../components/ControlActivoVehicularHistorialModal"

export type AccesorioItemState = {
  accesorioId: string
  codigo: string
  nombre: string
  cantidadEsperada: number
  cantidadEncontrada: number
  conforme: boolean
  observacion: string
}

export type ControlActivoVehicularFormPageProps = {
  id?: string
  solicitudId?: string
  initialTipo?: TipoControlActivo
}

function getDefaultFecha(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

export function ControlActivoVehicularFormPage({
  id: propId,
  solicitudId: propSolicitudId,
  initialTipo = "ENTREGA",
}: ControlActivoVehicularFormPageProps) {
  const searchParams = (useSearch({ strict: false }) ?? {}) as {
    id?: string
    solicitudId?: string
    activoId?: string
    tipo?: TipoControlActivo
  }

  const controlActivoId = propId || searchParams.id || ""
  const isEditing = Boolean(controlActivoId)

  // Consulta de la cabecera si está en edición
  const controlActivoQuery = useQuery({
    ...controlActivoVehicularQueries.detail(controlActivoId),
    enabled: isEditing,
  })

  // Consulta de catálogo completo de accesorios para resolver nombres y códigos
  const allAccesoriosQuery = useQuery({
    ...accesorioQueries.list({ size: 1000 }),
  })

  const accesorioMap = useMemo(() => {
    const map = new Map<string, Accesorio>()
    for (const acc of allAccesoriosQuery.data?.content ?? []) {
      map.set(acc.id, acc)
    }
    return map
  }, [allAccesoriosQuery.data])

  // Consulta de detalles/accesorios existentes si está en edición
  const controlActivoDetallesQuery = useQuery({
    ...controlActivoVehicularQueries.detallesList({
      controlActivoId,
      size: 100,
    }),
    enabled: isEditing,
  })

  const solicitudId =
    propSolicitudId ||
    searchParams.solicitudId ||
    controlActivoQuery.data?.solicitudVehicularId ||
    ""

  // Consulta de la solicitud vehicular
  const solicitudQuery = useQuery({
    ...solicitudVehicularQueries.detail(solicitudId),
    enabled: Boolean(solicitudId),
  })

  const solicitud = solicitudQuery.data

  // Consulta asignación de vehículo
  const asignacionQuery = useQuery({
    ...asignacionVehicularQueries.bySolicitud(solicitudId),
    enabled: Boolean(solicitudId && !isEditing),
  })

  const asignacion = asignacionQuery.data?.[0]
  const activoId =
    searchParams.activoId ||
    asignacion?.activoId ||
    controlActivoQuery.data?.activoId ||
    ""

  // Consulta de detalle completo del activo vehículo
  const activoDetailQuery = useQuery({
    ...activoQueries.detail(activoId ?? ""),
    enabled: Boolean(activoId),
  })

  // Consulta de accesorios configurados del vehículo
  const activoAccesoriosQuery = useQuery({
    ...activoAccesorioQueries.byActivo(activoId ?? "", { size: 100 }),
    enabled: Boolean(activoId && !isEditing),
  })

  // Consulta de controles previos de esta solicitud
  const controlesPreviosQuery = useQuery({
    ...controlActivoVehicularQueries.bySolicitud(solicitudId ?? ""),
    enabled: Boolean(solicitudId && !isEditing),
  })

  const actaEntregaPrevia = useMemo(() => {
    return (controlesPreviosQuery.data ?? []).find(
      (c) => c.tipo === "ENTREGA"
    )
  }, [controlesPreviosQuery.data])

  const actaEntregaDetallesQuery = useQuery({
    ...controlActivoVehicularQueries.detallesList({
      controlActivoId: actaEntregaPrevia?.id ?? "",
      size: 100,
    }),
    enabled: Boolean(actaEntregaPrevia?.id && !isEditing),
  })

  const isGlobalLoading =
    (Boolean(solicitudId) && solicitudQuery.isLoading) ||
    (Boolean(solicitudId && !isEditing) && asignacionQuery.isLoading) ||
    (Boolean(activoId) && activoDetailQuery.isLoading) ||
    (Boolean(activoId && !isEditing) && activoAccesoriosQuery.isLoading) ||
    (Boolean(solicitudId && !isEditing) && controlesPreviosQuery.isLoading) ||
    (Boolean(actaEntregaPrevia?.id && !isEditing) && actaEntregaDetallesQuery.isLoading) ||
    (isEditing && controlActivoQuery.isLoading) ||
    (isEditing && controlActivoDetallesQuery.isLoading)

  if (isGlobalLoading) {
    return (
      <PageShell className="p-6">
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-xs font-semibold">Cargando inspección vehicular...</p>
        </div>
      </PageShell>
    )
  }

  const resolvedInitialTipo: TipoControlActivo =
    controlActivoQuery.data?.tipo ||
    searchParams.tipo ||
    ((solicitud?.estado ?? "").toUpperCase() === "EN_VIAJE" ||
    (solicitud?.estado ?? "").toUpperCase() === "EN_CURSO" ||
    (solicitud?.estado ?? "").toUpperCase() === "RETORNO"
      ? "DEVOLUCION"
      : initialTipo)

  return (
    <ControlActivoVehicularFormContent
      key={`${controlActivoId || "new"}-${solicitudId || "none"}-${activoId || "noactivo"}-${resolvedInitialTipo}`}
      isEditing={isEditing}
      controlActivoId={controlActivoId}
      solicitudId={solicitudId}
      activoId={activoId}
      initialTipo={resolvedInitialTipo}
      initialControlActivo={controlActivoQuery.data}
      initialDetalles={
        controlActivoQuery.data?.detalles &&
        controlActivoQuery.data.detalles.length > 0
          ? controlActivoQuery.data.detalles
          : (controlActivoDetallesQuery.data?.content ?? [])
      }
      solicitud={solicitud}
      asignacion={asignacion}
      activoDetail={activoDetailQuery.data}
      actaEntregaPrevia={actaEntregaPrevia}
      actaEntregaDetalles={actaEntregaDetallesQuery.data?.content ?? []}
      activoAccesorios={activoAccesoriosQuery.data?.content ?? []}
      accesorioMap={accesorioMap}
    />
  )
}

type ControlActivoVehicularFormContentProps = {
  isEditing: boolean
  controlActivoId: string
  solicitudId: string
  activoId: string
  initialTipo: TipoControlActivo
  initialControlActivo?: ControlActivoVehicular | null
  initialDetalles?: ControlActivoVehicularDetalle[]
  solicitud?: SolicitudVehicular | null
  asignacion?: AsignacionVehicular | null
  activoDetail?: Activo | null
  actaEntregaPrevia?: ControlActivoVehicular | null
  actaEntregaDetalles?: ControlActivoVehicularDetalle[]
  activoAccesorios?: ActivoAccesorio[]
  accesorioMap: Map<string, Accesorio>
}

function ControlActivoVehicularFormContent({
  isEditing,
  controlActivoId,
  solicitudId,
  activoId,
  initialTipo,
  initialControlActivo,
  initialDetalles = [],
  solicitud,
  asignacion,
  activoDetail,
  actaEntregaPrevia,
  actaEntregaDetalles = [],
  activoAccesorios = [],
  accesorioMap,
}: ControlActivoVehicularFormContentProps) {
  const [tipo, setTipo] = useState<TipoControlActivo>(() => initialTipo)

  const [fecha, setFecha] = useState<string>(() => {
    if (initialControlActivo?.fecha) {
      return initialControlActivo.fecha.slice(0, 16)
    }
    return getDefaultFecha()
  })

  const [recibidoPorId, setRecibidoPorId] = useState<string>(() => {
    if (initialControlActivo?.recibidoPorId) {
      return initialControlActivo.recibidoPorId
    }
    if (asignacion?.conductor?.empleadoId) {
      return asignacion.conductor.empleadoId
    }
    if (solicitud?.conductorAsignado?.empleadoId) {
      return solicitud.conductorAsignado.empleadoId
    }
    return solicitud?.solicitanteId || ""
  })

  const [conformeGeneral, setConformeGeneral] = useState<boolean>(() => {
    if (initialControlActivo) {
      return initialControlActivo.conforme ?? true
    }
    if (
      initialTipo === "DEVOLUCION" &&
      actaEntregaPrevia?.conforme !== undefined &&
      actaEntregaPrevia?.conforme !== null
    ) {
      return actaEntregaPrevia.conforme
    }
    return true
  })

  const [observacionGeneral, setObservacionGeneral] = useState<string>(() => {
    return initialControlActivo?.observacion || ""
  })

  // Lista de accesorios a verificar (precargados por defecto del activo)
  const [items, setItems] = useState<AccesorioItemState[]>(() => {
    if (isEditing) {
      if (initialDetalles.length > 0) {
        return initialDetalles.map((det) => {
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
      }
      return []
    }

    if (initialTipo === "DEVOLUCION") {
      if (actaEntregaDetalles.length > 0) {
        return actaEntregaDetalles.map((det) => {
          const accId = det.accesorio?.id || det.accesorioId || ""
          const accCatalog = accesorioMap.get(accId)
          return {
            accesorioId: accId,
            codigo: det.accesorio?.codigo || accCatalog?.codigo || "ACC",
            nombre: det.accesorio?.nombre || accCatalog?.nombre || "Accesorio",
            cantidadEsperada:
              det.cantidadEncontrada ?? det.cantidadEsperada ?? 1,
            cantidadEncontrada:
              det.cantidadEncontrada ?? det.cantidadEsperada ?? 1,
            conforme: det.conforme ?? true,
            observacion: det.observacion
              ? `Nota salida: ${det.observacion}`
              : "",
          }
        })
      }
      if (activoAccesorios.length > 0) {
        return activoAccesorios.map((rel) => {
          const accId = rel.accesorio?.id ?? ""
          const accCatalog = accesorioMap.get(accId)
          return {
            accesorioId: accId,
            codigo: rel.accesorio?.codigo || accCatalog?.codigo || "ACC",
            nombre: rel.accesorio?.nombre || accCatalog?.nombre || "Accesorio",
            cantidadEsperada: rel.cantidad ?? 1,
            cantidadEncontrada: rel.cantidad ?? 1,
            conforme: true,
            observacion: rel.observacion ?? "",
          }
        })
      }
      return []
    }

    // Tipo ENTREGA (Salida): lista los accesorios configurados del activo vehículo
    if (activoAccesorios.length > 0) {
      return activoAccesorios.map((rel) => {
        const accId = rel.accesorio?.id ?? ""
        const accCatalog = accesorioMap.get(accId)
        return {
          accesorioId: accId,
          codigo: rel.accesorio?.codigo || accCatalog?.codigo || "ACC",
          nombre: rel.accesorio?.nombre || accCatalog?.nombre || "Accesorio",
          cantidadEsperada: rel.cantidad ?? 1,
          cantidadEncontrada: rel.cantidad ?? 1,
          conforme: true,
          observacion: rel.observacion ?? "",
        }
      })
    }

    return []
  })

  // Modales
  const [selectAccesorioOpen, setSelectAccesorioOpen] = useState(false)
  const [historialOpen, setHistorialOpen] = useState(false)

  function handleSelectTipo(newTipo: TipoControlActivo) {
    if (tipo === newTipo) return
    setTipo(newTipo)
    if (newTipo === "ENTREGA" && activoAccesorios.length > 0) {
      setItems(
        activoAccesorios.map((rel) => {
          const accId = rel.accesorio?.id ?? ""
          const accCatalog = accesorioMap.get(accId)
          return {
            accesorioId: accId,
            codigo: rel.accesorio?.codigo || accCatalog?.codigo || "ACC",
            nombre: rel.accesorio?.nombre || accCatalog?.nombre || "Accesorio",
            cantidadEsperada: rel.cantidad ?? 1,
            cantidadEncontrada: rel.cantidad ?? 1,
            conforme: true,
            observacion: rel.observacion ?? "",
          }
        })
      )
    } else if (newTipo === "DEVOLUCION") {
      if (actaEntregaDetalles.length > 0) {
        setItems(
          actaEntregaDetalles.map((det) => {
            const accId = det.accesorio?.id || det.accesorioId || ""
            const accCatalog = accesorioMap.get(accId)
            return {
              accesorioId: accId,
              codigo: det.accesorio?.codigo || accCatalog?.codigo || "ACC",
              nombre: det.accesorio?.nombre || accCatalog?.nombre || "Accesorio",
              cantidadEsperada:
                det.cantidadEncontrada ?? det.cantidadEsperada ?? 1,
              cantidadEncontrada:
                det.cantidadEncontrada ?? det.cantidadEsperada ?? 1,
              conforme: det.conforme ?? true,
              observacion: det.observacion
                ? `Nota salida: ${det.observacion}`
                : "",
            }
          })
        )
      } else if (activoAccesorios.length > 0) {
        setItems(
          activoAccesorios.map((rel) => {
            const accId = rel.accesorio?.id ?? ""
            const accCatalog = accesorioMap.get(accId)
            return {
              accesorioId: accId,
              codigo: rel.accesorio?.codigo || accCatalog?.codigo || "ACC",
              nombre: rel.accesorio?.nombre || accCatalog?.nombre || "Accesorio",
              cantidadEsperada: rel.cantidad ?? 1,
              cantidadEncontrada: rel.cantidad ?? 1,
              conforme: true,
              observacion: rel.observacion ?? "",
            }
          })
        )
      }
    }
  }

  function handleBack() {
    window.history.back()
  }

  function handleRecuperarDatosEntrega() {
    if (!actaEntregaPrevia) {
      toast.info(
        "No se encontró un Acta de Salida/Entrega previa registrada para este viaje"
      )
      return
    }

    if (actaEntregaPrevia.recibidoPorId) {
      setRecibidoPorId(actaEntregaPrevia.recibidoPorId)
    }
    if (
      actaEntregaPrevia.conforme !== undefined &&
      actaEntregaPrevia.conforme !== null
    ) {
      setConformeGeneral(actaEntregaPrevia.conforme)
    }

    if (actaEntregaDetalles.length > 0) {
      const recovered: AccesorioItemState[] = actaEntregaDetalles.map(
        (det) => ({
          accesorioId: det.accesorio?.id || det.accesorioId || "",
          codigo: det.accesorio?.codigo || "ACC",
          nombre: det.accesorio?.nombre || "Accesorio",
          cantidadEsperada:
            det.cantidadEncontrada ?? det.cantidadEsperada ?? 1,
          cantidadEncontrada:
            det.cantidadEncontrada ?? det.cantidadEsperada ?? 1,
          conforme: det.conforme ?? true,
          observacion: det.observacion
            ? `Nota salida: ${det.observacion}`
            : "",
        })
      )
      setItems(recovered)
      toast.success(
        "Accesorios, cantidades y conformidad re-sincronizados desde el Acta de Salida"
      )
    }
  }

  // Mutations
  const createMutation = useCreateControlActivoVehicularWithDetalles()
  const updateMutation = useUpdateControlActivoVehicularWithDetalles()
  const isPending = createMutation.isPending || updateMutation.isPending

  // Handlers para la tabla de accesorios
  function handleUpdateItem(
    index: number,
    partial: Partial<AccesorioItemState>
  ) {
    setItems((prev) => {
      const next = prev.map((item, i) => {
        if (i !== index) return item
        const updated = { ...item, ...partial }

        if (
          partial.cantidadEncontrada !== undefined &&
          partial.conforme === undefined
        ) {
          updated.conforme =
            partial.cantidadEncontrada === item.cantidadEsperada &&
            partial.cantidadEncontrada > 0
        }

        return updated
      })

      const allItemsConformes =
        next.length === 0 ||
        next.every(
          (i) => i.conforme && i.cantidadEncontrada === i.cantidadEsperada
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
          (i) => i.conforme && i.cantidadEncontrada === i.cantidadEsperada
        )
      setConformeGeneral(allItemsConformes)
      return next
    })
  }

  function handleAddAccesorio(accesorio: Accesorio) {
    if (items.some((i) => i.accesorioId === accesorio.id)) {
      toast.info("El accesorio ya está agregado al checklist")
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
        (i) => i.conforme && i.cantidadEncontrada === i.cantidadEsperada
      )
      setConformeGeneral(allItemsConformes)
      return next
    })
  }

  // Métricas
  const totalItems = items.length
  const itemsConformes = useMemo(
    () => items.filter((i) => i.conforme).length,
    [items]
  )

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!solicitudId) {
      toast.error("Debe especificar una solicitud vehicular válida")
      return
    }

    if (!activoId) {
      toast.error(
        "Esta solicitud aún no tiene un vehículo asignado. Realice la asignación primero."
      )
      return
    }

    if (!fecha) {
      toast.error("La fecha y hora de inspección es obligatoria")
      return
    }

    for (const item of items) {
      if (item.cantidadEsperada < 0 || item.cantidadEncontrada < 0) {
        toast.error("Las cantidades de accesorios deben ser mayores o iguales a 0")
        return
      }
    }

    const payload = {
      solicitudVehicularId: solicitudId,
      asignacionVehicularId: asignacion?.id || null,
      activoId: activoId,
      tipo: tipo,
      recibidoPorId: recibidoPorId || null,
      fecha: new Date(fecha).toISOString().slice(0, 19),
      conforme: conformeGeneral,
      observacion: observacionGeneral.trim() || null,
    }

    const detalles = items.map((i) => ({
      accesorioId: i.accesorioId,
      cantidadEsperada: i.cantidadEsperada,
      cantidadEncontrada: i.cantidadEncontrada,
      conforme: i.conforme,
      observacion: i.observacion.trim() || null,
    }))

    try {
      if (isEditing && controlActivoId) {
        await updateMutation.mutateAsync({
          id: controlActivoId,
          control: payload,
          detalles,
        })
      } else {
        await createMutation.mutateAsync({
          control: payload,
          detalles,
        })
      }

      handleBack()
    } catch {
      // Manejado por mutation
    }
  }

  const isSalida = tipo === "ENTREGA"

  return (
    <PageShell
      size="full"
      padding="none"
      layout="auto"
      className="w-full max-w-5xl mx-auto space-y-3 pb-12 px-2.5 sm:px-4 pt-1"
    >
      {/* Top Header Compacto */}
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border/70 pb-2.5 pt-1">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-lg hover:bg-muted cursor-pointer"
            onClick={handleBack}
            title="Volver"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                "flex size-7.5 sm:size-8 shrink-0 items-center justify-center rounded-lg border shadow-2xs",
                isSalida
                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              )}
            >
              {isSalida ? (
                <Send className="size-4 stroke-[2.5]" />
              ) : (
                <RotateCcw className="size-4 stroke-[2.5]" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
                  {isEditing
                    ? `Editar Acta de ${isSalida ? "Salida (Entrega)" : "Retorno (Devolución)"}`
                    : `Control de Activo Vehicular - ${isSalida ? "Acta de Salida" : "Acta de Retorno"}`}
                </h1>
                {solicitud?.numero && (
                  <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-md border border-primary/20 shrink-0 shadow-2xs">
                    Viaje: {solicitud.numero}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate hidden sm:block">
                Inspección física y verificación de accesorios del vehículo para registro de salida y retorno.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {solicitudId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setHistorialOpen(true)}
              className="h-8 gap-1.5 px-3 text-xs font-semibold bg-background hover:bg-muted cursor-pointer shadow-2xs"
            >
              <History className="size-3.5 text-blue-500" />
              <span className="hidden sm:inline">Historial de Actas</span>
              <span className="sm:hidden">Actas</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Banner Superior: Vehículo, Viaje & Selector de Tipo */}
        <Card className="p-3.5 sm:p-4 border border-border/80 bg-card/70 backdrop-blur-xs shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
            {/* Activo & Solicitud Resumen */}
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary border border-primary/25 shadow-2xs">
                <Car className="size-5 sm:size-5.5" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {activoDetail?.codigo && (
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                      {activoDetail.codigo}
                    </span>
                  )}
                  <span className="font-heading text-sm sm:text-base font-bold text-foreground truncate">
                    {activoDetail?.nombre || "Vehículo Asignado"}
                  </span>
                  {solicitud?.estado && (
                    <Badge
                      variant="outline"
                      className="text-[10.5px] font-semibold bg-muted/80 text-foreground"
                    >
                      {solicitud.estado.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {solicitud?.destino && (
                    <span className="flex items-center gap-1 font-medium text-foreground/90 max-w-xs truncate">
                      <MapPin className="size-3 text-primary shrink-0" />
                      <span className="truncate">{solicitud.destino}</span>
                    </span>
                  )}
                  {solicitud?.solicitante?.nombreCompleto && (
                    <span className="flex items-center gap-1 truncate">
                      <User className="size-3 opacity-70 shrink-0" />
                      <span className="truncate">
                        Solicita:{" "}
                        <strong className="text-foreground font-medium">
                          {solicitud.solicitante.nombreCompleto}
                        </strong>
                      </span>
                    </span>
                  )}
                  {asignacion?.conductor?.nombreCompleto && (
                    <span className="flex items-center gap-1 truncate text-emerald-700 dark:text-emerald-400 font-medium">
                      <UserCheck className="size-3 shrink-0" />
                      <span>
                        Chofer: {asignacion.conductor.nombreCompleto}
                        {asignacion.conductor.numeroLicencia && (
                          <span className="text-muted-foreground font-normal">
                            {" "}
                            (Lic: {asignacion.conductor.numeroLicencia})
                          </span>
                        )}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Selector de Tipo (Pills Salida vs Retorno) */}
            <div className="inline-flex rounded-xl bg-muted/80 p-1 border border-border shadow-inner shrink-0 self-start lg:self-center">
              <button
                type="button"
                onClick={() => handleSelectTipo("ENTREGA")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  tipo === "ENTREGA"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Send className="size-3.5 stroke-[2.5]" />
                <span>Acta Salida / Entrega</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTipo("DEVOLUCION")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  tipo === "DEVOLUCION"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <RotateCcw className="size-3.5 stroke-[2.5]" />
                <span>Acta Retorno / Devolución</span>
              </button>
            </div>
          </div>
        </Card>

        {/* Banner de Sincronización Inteligente para Retorno */}
        {tipo === "DEVOLUCION" && !isEditing && (
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs animate-in fade-in-50">
            <div className="flex items-start gap-2.5 min-w-0">
              <CheckCircle2 className="size-4 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-sky-950 dark:text-sky-100">
                  {actaEntregaPrevia
                    ? `Checklist recuperado del Acta de Salida (${formatDate(actaEntregaPrevia.fecha)})`
                    : "Modo Acta de Retorno / Devolución"}
                </p>
                <p className="text-[11px] text-sky-800/90 dark:text-sky-300/90 leading-relaxed">
                  {actaEntregaPrevia
                    ? "Se han precargado los accesorios y cantidades verificadas durante la salida para cotejar el retorno del vehículo."
                    : "No se encontró un acta de salida previa; se cargó la lista base de accesorios asignados al vehículo."}
                </p>
              </div>
            </div>

            {actaEntregaPrevia && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRecuperarDatosEntrega}
                className="h-7 text-xs font-semibold gap-1 shrink-0 bg-background/90 hover:bg-background border-sky-500/30 text-sky-800 dark:text-sky-200 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="size-3" />
                <span>Re-sincronizar con Salida</span>
              </Button>
            )}
          </div>
        )}

        {/* Responsables y Fecha (2 Columnas Compactas) */}
        <Card className="p-3.5 shadow-2xs space-y-2.5 border-border/80">
          <div className="flex items-center gap-1.5 border-b border-border/60 pb-1.5">
            <UserCheck className="size-3.5 text-primary" />
            <h2 className="font-heading text-xs sm:text-[13px] font-bold text-foreground">
              Datos de Inspección y Conductor Responsable
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            {/* Fecha y Hora */}
            <div className="space-y-1">
              <Label
                htmlFor="fechaControlVehicular"
                className="text-[11px] font-semibold text-foreground flex items-center gap-1"
              >
                <Calendar className="size-3 text-muted-foreground" />
                <span>Fecha y Hora de Inspección</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fechaControlVehicular"
                type="datetime-local"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-8.5 text-xs font-medium bg-background"
                required
              />
            </div>

            {/* Conductor / Receptor */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <UserCheck className="size-3 text-muted-foreground" />
                <span>Conductor / Responsable Receptor</span>
              </Label>
              <EmpleadoCombobox
                value={recibidoPorId}
                onValueChange={(val) => setRecibidoPorId(val)}
                placeholder="Seleccione conductor o empleado..."
                className="h-8.5 text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Verificación de Accesorios (Tabla Interactiva) */}
        <Card className="p-3.5 shadow-2xs space-y-2.5 border-border/80">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Package className="size-3.5 text-primary" />
              <h2 className="font-heading text-xs sm:text-sm font-bold text-foreground">
                Checklist de Accesorios e Implementos
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
                          i.cantidadEncontrada === i.cantidadEsperada
                      )
                      setConformeGeneral(allOk)
                      return next
                    })
                  }
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                >
                  Marcar todos conformes
                </button>
              )}
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => setSelectAccesorioOpen(true)}
                className="h-7 gap-1 px-2.5 text-xs font-semibold rounded-lg border-primary/30 text-primary hover:bg-primary/10 cursor-pointer shadow-2xs"
              >
                <Plus className="size-3" />
                <span>Agregar Accesorio</span>
              </Button>
            </div>
          </div>

          {/* Lista de Accesorios */}
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-muted/10 p-4 space-y-2">
              <div className="size-10 mx-auto rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground/60">
                <Package className="size-5" />
              </div>
              <p className="font-semibold text-foreground">
                No hay accesorios en la lista de inspección
              </p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                Puedes añadir accesorios del catálogo general usando el botón &quot;+ Agregar Accesorio&quot;.
              </p>
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => setSelectAccesorioOpen(true)}
                className="gap-1 text-xs cursor-pointer mt-1"
              >
                <Plus className="size-3" />
                <span>Seleccionar del catálogo</span>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-[10.5px] uppercase font-bold text-muted-foreground border-b border-border/60 select-none">
                  <tr>
                    <th className="px-3 py-2 min-w-[150px]">Accesorio</th>
                    <th className="px-2 py-2 text-center w-16">Esp.</th>
                    <th className="px-2 py-2 text-center w-28">Enc.</th>
                    <th className="px-2 py-2 text-center w-28">Estado</th>
                    <th className="px-3 py-2">Nota / Observación</th>
                    <th className="px-2 py-2 text-center w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {items.map((item, idx) => {
                    const hasMismatch =
                      item.cantidadEsperada !== item.cantidadEncontrada
                    const isOk = item.conforme && !hasMismatch

                    return (
                      <tr
                        key={`${item.accesorioId}-${idx}`}
                        className={cn(
                          "hover:bg-muted/25 transition-colors",
                          !isOk && "bg-amber-500/[0.04] dark:bg-amber-950/10"
                        )}
                      >
                        {/* Código y Nombre */}
                        <td className="px-3 py-2 font-medium">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                              {item.codigo}
                            </span>
                            <span
                              className="font-semibold text-foreground text-xs truncate max-w-[180px] sm:max-w-[240px]"
                              title={item.nombre}
                            >
                              {item.nombre}
                            </span>
                          </div>
                        </td>

                        {/* Cantidad Esperada */}
                        <td className="px-2 py-2 text-center font-mono text-xs font-semibold text-muted-foreground">
                          {item.cantidadEsperada}
                        </td>

                        {/* Cantidad Encontrada Stepper */}
                        <td className="px-2 py-2 text-center">
                          <div className="inline-flex items-center border border-border/80 rounded-lg bg-background h-7 shadow-2xs">
                            <button
                              type="button"
                              className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-l-md transition-colors cursor-pointer"
                              onClick={() =>
                                handleUpdateItem(idx, {
                                  cantidadEncontrada: Math.max(
                                    0,
                                    item.cantidadEncontrada - 1
                                  ),
                                })
                              }
                              title="Disminuir"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span
                              className={cn(
                                "w-7 text-center text-xs font-mono font-bold",
                                hasMismatch
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-foreground"
                              )}
                            >
                              {item.cantidadEncontrada}
                            </span>
                            <button
                              type="button"
                              className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-r-md transition-colors cursor-pointer"
                              onClick={() =>
                                handleUpdateItem(idx, {
                                  cantidadEncontrada:
                                    item.cantidadEncontrada + 1,
                                })
                              }
                              title="Aumentar"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                        </td>

                        {/* Toggle Conforme */}
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateItem(idx, {
                                conforme: !item.conforme,
                              })
                            }
                            className={cn(
                              "inline-flex items-center gap-1 h-7 px-2.5 rounded-lg font-bold text-[10.5px] border transition-all cursor-pointer shadow-2xs",
                              item.conforme
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                            )}
                          >
                            {item.conforme ? (
                              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
                            )}
                            <span>
                              {item.conforme ? "Conforme" : "Observado"}
                            </span>
                          </button>
                        </td>

                        {/* Input Observación */}
                        <td className="px-3 py-2">
                          <Input
                            placeholder="Nota opcional del accesorio..."
                            value={item.observacion}
                            onChange={(e) =>
                              handleUpdateItem(idx, {
                                observacion: e.target.value,
                              })
                            }
                            className="h-7 text-xs px-2.5 bg-background/80"
                          />
                        </td>

                        {/* Eliminar */}
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="size-6 inline-flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Eliminar accesorio"
                          >
                            <Trash2 className="size-3.5" />
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
        <Card className="p-3.5 shadow-2xs space-y-2.5 border-border/80">
          <div className="flex items-center gap-1.5 border-b border-border/60 pb-1.5">
            <FileCheck2 className="size-3.5 text-primary" />
            <h2 className="font-heading text-xs sm:text-[13px] font-bold text-foreground">
              Dictamen Final y Observaciones del Vehículo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Dictamen (1 Columna) */}
            <div className="space-y-1.5 md:col-span-1">
              <Label className="text-[11px] font-semibold text-foreground">
                Resultado Dictamen <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-2">
                <div
                  onClick={() => setConformeGeneral(true)}
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all text-xs font-bold",
                    conformeGeneral
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500/30 shadow-2xs"
                      : "bg-card hover:bg-muted/40 border-border/80 text-muted-foreground"
                  )}
                >
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-xs">ACTA CONFORME</p>
                    <p className="text-[10px] font-normal text-muted-foreground">
                      Vehículo y accesorios sin observaciones
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setConformeGeneral(false)}
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all text-xs font-bold",
                    !conformeGeneral
                      ? "bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-200 ring-1 ring-amber-500/30 shadow-2xs"
                      : "bg-card hover:bg-muted/40 border-border/80 text-muted-foreground"
                  )}
                >
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <p className="font-bold text-xs">ACTA OBSERVADA</p>
                    <p className="text-[10px] font-normal text-muted-foreground">
                      Con faltantes, daños o discrepancias
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones (2 Columnas) */}
            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="obsGeneralVehicular"
                  className="text-[11px] font-semibold text-foreground flex items-center gap-1.5"
                >
                  <FileText className="size-3 text-muted-foreground" />
                  <span>Observaciones Generales (Kilometraje, Combustible, Estado)</span>
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {observacionGeneral.length}/500
                </span>
              </div>
              <Textarea
                id="obsGeneralVehicular"
                rows={3}
                maxLength={500}
                placeholder="Indique kilometraje (odómetro), nivel de combustible (1/4, 1/2, lleno), estado de carrocería, limpieza o detalles importantes del viaje..."
                value={observacionGeneral}
                onChange={(e) => setObservacionGeneral(e.target.value)}
                className="text-xs resize-none min-h-[72px] py-2 px-3 bg-background"
              />
            </div>
          </div>
        </Card>

        {/* Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/80 bg-card shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="size-4 text-primary shrink-0" />
            <span>
              Acta de{" "}
              <strong className="text-foreground">
                {isSalida ? "Salida (Entrega)" : "Retorno (Devolución)"}
              </strong>{" "}
              •{" "}
              <strong className="text-foreground">
                {itemsConformes}/{totalItems}
              </strong>{" "}
              accesorios conformes •{" "}
              <span
                className={cn(
                  "font-bold",
                  conformeGeneral
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                )}
              >
                {conformeGeneral ? "Conforme" : "Observada"}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={isPending}
              className="h-8 px-4 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className={cn(
                "h-8 gap-2 px-5 text-xs font-bold shadow-xs cursor-pointer transition-all",
                isSalida
                  ? "bg-sky-600 hover:bg-sky-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{isEditing ? "Actualizando..." : "Guardando..."}</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>
                    {isEditing ? "Actualizar Acta" : isSalida ? "Guardar Acta Salida" : "Guardar Acta Retorno"}
                  </span>
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
      <ControlActivoVehicularHistorialModal
        open={historialOpen}
        onOpenChange={setHistorialOpen}
        solicitud={solicitud ?? null}
      />
    </PageShell>
  )
}

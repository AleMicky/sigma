import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ClipboardCheck,
  FileText,
  History,
  Layers,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  UserCheck,
} from "lucide-react"

import type { Activo } from "@/modules/activos/activo/api/activo.service"
import type { ActivoAccesorio } from "@/modules/activos/activo-accesorio/api/activo-accesorio.service"
import { activoAsignacionQueries } from "@/modules/activos/activo-asignacion/api/activo-asignacion.queries"
import type { ActivoDocumento } from "@/modules/activos/activo-documento/api/activo-documento.service"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { controlActivoQueries } from "@/modules/mantenimientos/control-activo/api/control-activo.queries"
import { areaQueries } from "@/modules/organizacion/area/api/area.queries"
import { empleadoQueries } from "@/modules/organizacion/empleado/api/empleado.queries"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"
import { formatDateTime } from "@/shared/utils/date.utils"

type HistorialCategory =
  | "todos"
  | "asignacion"
  | "control"
  | "documento"
  | "accesorio"
  | "registro"

type TimelineEvent = {
  id: string
  category: Exclude<HistorialCategory, "todos">
  title: string
  badgeLabel: string
  badgeClassName: string
  dotClassName: string
  timestamp: string | null
  sortTime: number
  description: string
  meta?: string | null
}

type ActivoHistorialTabProps = {
  activo: Activo
  tipoActivo?: TipoActivo | null
  documentos?: ActivoDocumento[]
  accesorios?: ActivoAccesorio[]
}

const FILTER_OPTIONS: Array<{ value: HistorialCategory; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "asignacion", label: "Asignaciones" },
  { value: "control", label: "Controles" },
  { value: "documento", label: "Documentos" },
  { value: "accesorio", label: "Accesorios" },
  { value: "registro", label: "Registro" },
]

function parseTimestamp(value?: string | null): number {
  if (!value) return 0
  const ms = new Date(value).getTime()
  return Number.isNaN(ms) ? 0 : ms
}

function getCategoryIcon(category: TimelineEvent["category"], isReturn?: boolean) {
  switch (category) {
    case "asignacion":
      return isReturn ? RotateCcw : UserCheck
    case "control":
      return ClipboardCheck
    case "documento":
      return FileText
    case "accesorio":
      return Layers
    case "registro":
      return PlusCircle
  }
}

export function ActivoHistorialTab({
  activo,
  tipoActivo,
  documentos = [],
  accesorios = [],
}: Readonly<ActivoHistorialTabProps>) {
  const [activeCategory, setActiveCategory] = useState<HistorialCategory>("todos")

  const asignacionesQuery = useQuery(
    activoAsignacionQueries.byActivo(activo.id, {
      size: 100,
      sortBy: "fechaAsignacion",
      direction: "DESC",
    }),
  )

  const controlesQuery = useQuery(controlActivoQueries.byActivo(activo.id))

  const areasQuery = useQuery(
    areaQueries.list({ size: 100, sortBy: "nombre", direction: "ASC" }),
  )
  const empleadosQuery = useQuery(
    empleadoQueries.list({ size: 100, sortBy: "createdAt", direction: "DESC" }),
  )

  const areasMap = useMemo(() => {
    const list = Array.isArray(areasQuery.data)
      ? areasQuery.data
      : (areasQuery.data?.content ?? [])
    return new Map(list.map((a) => [a.id, a]))
  }, [areasQuery.data])

  const empleadosMap = useMemo(() => {
    const list = Array.isArray(empleadosQuery.data)
      ? empleadosQuery.data
      : (empleadosQuery.data?.content ?? [])
    return new Map(list.map((e) => [e.id, e]))
  }, [empleadosQuery.data])

  const events = useMemo<TimelineEvent[]>(() => {
    const list: TimelineEvent[] = []

    // 1. Asignaciones y devoluciones de custodia
    for (const asig of asignacionesQuery.data?.content ?? []) {
      const emp = asig.empleadoId ? empleadosMap.get(asig.empleadoId) : undefined
      const area = asig.areaId ? areasMap.get(asig.areaId) : undefined
      const responsable = emp
        ? emp.personaNombreCompleto || `Empleado (${emp.codigo})`
        : area?.nombre || "Custodio registrado"

      list.push({
        id: `asig-entrega-${asig.id}`,
        category: "asignacion",
        title: `Asignación de custodia a ${responsable}`,
        badgeLabel: asig.fechaDevolucion ? "Asignación" : "Vigente",
        badgeClassName: asig.fechaDevolucion
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        dotClassName: asig.fechaDevolucion ? "bg-blue-500" : "bg-emerald-500",
        timestamp: asig.fechaAsignacion,
        sortTime: parseTimestamp(asig.fechaAsignacion),
        description:
          asig.observacionAsignacion?.trim() ||
          (area?.nombre
            ? `Custodia registrada en el área ${area.nombre}.`
            : "Custodia asignada formalmente."),
        meta: area?.nombre && emp ? `Área: ${area.nombre}` : null,
      })

      if (asig.fechaDevolucion) {
        list.push({
          id: `asig-dev-${asig.id}`,
          category: "asignacion",
          title: `Devolución de custodia de ${responsable}`,
          badgeLabel: "Devolución",
          badgeClassName:
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          dotClassName: "bg-amber-500",
          timestamp: asig.fechaDevolucion,
          sortTime: parseTimestamp(asig.fechaDevolucion),
          description:
            asig.observacionDevolucion?.trim() ||
            "Se registró el cierre y devolución de la custodia.",
          meta: null,
        })
      }
    }

    // 2. Controles de activo (actas de entrega / devolución)
    for (const control of controlesQuery.data ?? []) {
      const isEntrega = control.tipo === "ENTREGA"
      const actorText = [
        control.entregadoPor?.nombre
          ? `Entregó: ${control.entregadoPor.nombre}`
          : null,
        control.recibidoPor?.nombre
          ? `Recibió: ${control.recibidoPor.nombre}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ")

      list.push({
        id: `control-${control.id}`,
        category: "control",
        title: isEntrega
          ? "Acta de Entrega / Control de Activo"
          : "Acta de Devolución / Control de Activo",
        badgeLabel: control.conforme ? "Conforme" : "Con observaciones",
        badgeClassName: control.conforme
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          : "bg-destructive/10 text-destructive border-destructive/20",
        dotClassName: control.conforme ? "bg-indigo-500" : "bg-destructive",
        timestamp: control.fecha || control.createdAt || null,
        sortTime: parseTimestamp(control.fecha || control.createdAt),
        description:
          control.observacion?.trim() ||
          `Control físico de tipo ${control.tipo.toLowerCase()} registrado.`,
        meta: actorText || null,
      })
    }

    // 3. Documentos asociados
    for (const doc of documentos) {
      list.push({
        id: `doc-${doc.id}`,
        category: "documento",
        title: `Documento adjuntado: ${doc.nombre}`,
        badgeLabel: "Documento",
        badgeClassName:
          "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        dotClassName: "bg-sky-500",
        timestamp: doc.createdAt ?? doc.fechaEmision ?? null,
        sortTime: parseTimestamp(doc.createdAt ?? doc.fechaEmision),
        description:
          doc.descripcion?.trim() ||
          (doc.numeroDocumento
            ? `Referencia registrada: ${doc.numeroDocumento}.`
            : "Documento incorporado al expediente del activo."),
        meta: doc.fechaVencimiento ? `Vence: ${doc.fechaVencimiento}` : null,
      })
    }

    // 4. Accesorios vinculados
    for (const acc of accesorios) {
      const nombreAcc = acc.accesorio?.nombre ?? "Accesorio"
      list.push({
        id: `acc-${acc.id}`,
        category: "accesorio",
        title: `Accesorio vinculado: ${nombreAcc} (${acc.cantidad} un.)`,
        badgeLabel: "Accesorio",
        badgeClassName:
          "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
        dotClassName: "bg-violet-500",
        timestamp: acc.createdAt ?? null,
        sortTime: parseTimestamp(acc.createdAt),
        description:
          acc.observacion?.trim() ||
          "Componente o accesorio asociado al activo.",
        meta: acc.numeroSerie ? `Serie: ${acc.numeroSerie}` : null,
      })
    }

    // 5. Eventos del registro maestro del activo
    if (activo.updatedAt && activo.updatedAt !== activo.createdAt) {
      list.push({
        id: `activo-updated-${activo.id}`,
        category: "registro",
        title: "Actualización de ficha del activo",
        badgeLabel: "Actualizado",
        badgeClassName:
          "bg-muted text-muted-foreground border-border/70",
        dotClassName: "bg-muted-foreground",
        timestamp: activo.updatedAt,
        sortTime: parseTimestamp(activo.updatedAt),
        description: `Se actualizaron los datos del activo "${activo.nombre}" (${activo.codigo}).`,
        meta: activo.updatedBy ? `Por: ${activo.updatedBy}` : null,
      })
    }

    list.push({
      id: `activo-created-${activo.id}`,
      category: "registro",
      title: "Alta y Registro en el Catálogo",
      badgeLabel: "Registrado",
      badgeClassName:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      dotClassName: "bg-emerald-500",
      timestamp: activo.createdAt ?? null,
      sortTime: parseTimestamp(activo.createdAt),
      description: `Se dio de alta formalmente el activo "${activo.nombre}" (${activo.codigo}) bajo el tipo "${tipoActivo?.nombre || "No especificado"}".`,
      meta: activo.createdBy ? `Por: ${activo.createdBy}` : null,
    })

    return list.sort((a, b) => b.sortTime - a.sortTime)
  }, [
    activo,
    tipoActivo?.nombre,
    asignacionesQuery.data?.content,
    controlesQuery.data,
    documentos,
    accesorios,
    areasMap,
    empleadosMap,
  ])

  const countsByCategory = useMemo(() => {
    const counts: Record<HistorialCategory, number> = {
      todos: events.length,
      asignacion: 0,
      control: 0,
      documento: 0,
      accesorio: 0,
      registro: 0,
    }
    for (const ev of events) {
      counts[ev.category] += 1
    }
    return counts
  }, [events])

  const filteredEvents = useMemo(() => {
    if (activeCategory === "todos") return events
    return events.filter((ev) => ev.category === activeCategory)
  }, [events, activeCategory])

  const isLoading = asignacionesQuery.isLoading || controlesQuery.isLoading

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-4">
      {/* Header + Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <History className="size-5 text-primary" />
          <div>
            <h3 className="font-heading text-sm sm:text-base font-bold text-foreground">
              Bitácora y Trazabilidad del Activo
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Eventos reales de custodia, controles físicos, documentación, accesorios y registro
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-muted-foreground">
          {filteredEvents.length}{" "}
          {filteredEvents.length === 1 ? "evento" : "eventos"}
        </span>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTER_OPTIONS.map((option) => {
          const count = countsByCategory[option.value]
          const isActive = activeCategory === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setActiveCategory(option.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                isActive
                  ? "border-primary/40 bg-primary/10 text-primary font-semibold"
                  : "border-border/70 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40",
              )}
            >
              <span>{option.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Timeline Content */}
      {isLoading ? (
        <ListSkeleton rows={3} rowClassName="h-20 rounded-xl" />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={<RefreshCw className="size-7 text-muted-foreground/50" />}
          title="Sin eventos en esta categoría"
          description="No se registran movimientos para el filtro seleccionado."
          className="py-8"
        />
      ) : (
        <div className="relative pl-6 border-l border-border/80 space-y-4 my-1 ml-1">
          {filteredEvents.map((ev) => {
            const EventIcon = getCategoryIcon(
              ev.category,
              ev.badgeLabel === "Devolución",
            )
            return (
              <div key={ev.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[31px] top-1.5 size-3.5 rounded-full ring-4 ring-background",
                    ev.dotClassName,
                  )}
                />
                <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-border/70 bg-muted/15 hover:bg-muted/25 transition-colors">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <EventIcon className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-bold text-foreground truncate">
                        {ev.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] py-0 px-1.5", ev.badgeClassName)}
                      >
                        {ev.badgeLabel}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded shrink-0">
                      {ev.timestamp ? formatDateTime(ev.timestamp) : "Sin fecha"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {ev.description}
                  </p>
                  {ev.meta ? (
                    <span className="text-[11px] font-medium text-muted-foreground/90">
                      {ev.meta}
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

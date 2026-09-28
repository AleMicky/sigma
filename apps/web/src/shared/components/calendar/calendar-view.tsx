import React, { useCallback, useMemo, useRef, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import listPlugin from "@fullcalendar/list"
import esLocale from "@fullcalendar/core/locales/es"
import type { EventClickArg, EventContentArg } from "@fullcalendar/core"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  User,
  Users,
  Car,
  FileText,
  Info,
  Layers,
  X,
} from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import {
  StatusBadge,
  resolveStatusVariant,
  type StatusBadgeVariant,
} from "@/shared/components/status-badge"

export interface CalendarEvent {
  id: string
  title: string
  start: string | Date
  end?: string | Date
  allDay?: boolean
  estado?: string
  variant?: StatusBadgeVariant
  description?: string
  location?: string
  solicitante?: string
  cargoSolicitante?: string
  areaSolicitante?: string
  conductor?: string
  licenciaConductor?: string
  vehiculo?: string
  placa?: string
  pasajeros?: number
  numero?: string
  tipoSolicitud?: string
  observacion?: string
  url?: string
  extendedProps?: Record<string, unknown>
}

export interface CalendarViewProps {
  title?: string
  description?: string
  events?: CalendarEvent[]
  isLoading?: boolean
  onRefresh?: () => void
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  headerActions?: React.ReactNode
  showFilterToolbar?: boolean
  className?: string
  defaultView?: "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listMonth"
}

const variantStyleMap: Record<
  StatusBadgeVariant,
  { bg: string; text: string; border: string; dot: string }
> = {
  success: {
    bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    text: "text-emerald-800 dark:text-emerald-300",
    border: "border-emerald-500/30 dark:border-emerald-500/40",
    dot: "bg-emerald-500",
  },
  warning: {
    bg: "bg-amber-500/15 dark:bg-amber-500/20",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-500/30 dark:border-amber-500/40",
    dot: "bg-amber-500",
  },
  danger: {
    bg: "bg-rose-500/15 dark:bg-rose-500/20",
    text: "text-rose-800 dark:text-rose-300",
    border: "border-rose-500/30 dark:border-rose-500/40",
    dot: "bg-rose-500",
  },
  info: {
    bg: "bg-sky-500/15 dark:bg-sky-500/20",
    text: "text-sky-800 dark:text-sky-300",
    border: "border-sky-500/30 dark:border-sky-500/40",
    dot: "bg-sky-500",
  },
  indigo: {
    bg: "bg-indigo-500/15 dark:bg-indigo-500/20",
    text: "text-indigo-800 dark:text-indigo-300",
    border: "border-indigo-500/30 dark:border-indigo-500/40",
    dot: "bg-indigo-500",
  },
  neutral: {
    bg: "bg-muted/80",
    text: "text-foreground/90",
    border: "border-border",
    dot: "bg-muted-foreground",
  },
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  title = "Calendario de Flota y Reservas",
  description = "Visualización integral de itinerarios, asignaciones y solicitudes de transporte",
  events = [],
  isLoading = false,
  onRefresh,
  onEventClick,
  headerActions,
  showFilterToolbar = true,
  className,
  defaultView = "dayGridMonth",
}) => {
  const calendarRef = useRef<FullCalendar | null>(null)
  const [currentTitle, setCurrentTitle] = useState<string>("")
  const [currentView, setCurrentView] = useState<string>(defaultView)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedEstadoFilter, setSelectedEstadoFilter] = useState<string>("TODOS")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const handleDatesSet = useCallback(() => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi()
      setCurrentTitle(api.view.title)
      setCurrentView(api.view.type)
    }
  }, [])

  const handlePrev = () => {
    calendarRef.current?.getApi().prev()
    handleDatesSet()
  }

  const handleNext = () => {
    calendarRef.current?.getApi().next()
    handleDatesSet()
  }

  const handleToday = () => {
    calendarRef.current?.getApi().today()
    handleDatesSet()
  }

  const handleViewChange = (viewType: string) => {
    calendarRef.current?.getApi().changeView(viewType)
    setCurrentView(viewType)
    handleDatesSet()
  }

  // Quick summary counts for consultation report
  const metrics = useMemo(() => {
    let total = events.length
    let aprobados = 0
    let pendientes = 0
    let enRuta = 0
    let finalizadas = 0

    events.forEach((e) => {
      const est = (e.estado || "").toUpperCase()
      if (est.includes("APROB")) aprobados++
      else if (est.includes("PEND") || est.includes("SOLIC") || est.includes("OBSERV")) pendientes++
      else if (est.includes("RUTA") || est.includes("CURSO") || est.includes("RETORNO")) enRuta++
      else if (est.includes("FINAL") || est.includes("COMPLET")) finalizadas++
    })

    return { total, aprobados, pendientes, enRuta, finalizadas }
  }, [events])

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        evt.title.toLowerCase().includes(q) ||
        evt.location?.toLowerCase().includes(q) ||
        evt.solicitante?.toLowerCase().includes(q) ||
        evt.conductor?.toLowerCase().includes(q) ||
        evt.vehiculo?.toLowerCase().includes(q) ||
        evt.numero?.toLowerCase().includes(q) ||
        evt.tipoSolicitud?.toLowerCase().includes(q)

      if (!matchesSearch) return false

      if (selectedEstadoFilter === "TODOS") return true

      const est = (evt.estado || "").toUpperCase()
      const filter = selectedEstadoFilter.toUpperCase()

      if (filter === "APROBADO") return est.includes("APROB")
      if (filter === "PENDIENTE") return est.includes("PEND") || est.includes("SOLIC") || est.includes("OBSERV")
      if (filter === "EN_RUTA") return est.includes("RUTA") || est.includes("CURSO") || est.includes("RETORNO")
      if (filter === "FINALIZADA") return est.includes("FINAL") || est.includes("COMPLET")

      return est === filter
    })
  }, [events, searchQuery, selectedEstadoFilter])

  const fullCalendarEvents = useMemo(() => {
    return filteredEvents.map((evt) => {
      const variant = evt.variant || resolveStatusVariant(evt.estado)
      return {
        id: evt.id,
        title: evt.title,
        start: evt.start,
        end: evt.end,
        allDay: evt.allDay,
        extendedProps: {
          ...evt,
          variant,
        },
      }
    })
  }, [filteredEvents])

  const handleCalendarEventClick = (arg: EventClickArg) => {
    const rawData = (arg.event.extendedProps || {}) as CalendarEvent
    const clickedEvent: CalendarEvent = {
      ...rawData,
      id: arg.event.id || rawData.id,
      title: arg.event.title || rawData.title,
      start: arg.event.startStr || arg.event.start || rawData.start || "",
      end: arg.event.endStr || arg.event.end || rawData.end,
      allDay: arg.event.allDay ?? rawData.allDay,
    }
    setSelectedEvent(clickedEvent)
    onEventClick?.(clickedEvent)
  }

  const renderEventContent = (arg: EventContentArg) => {
    const props = arg.event.extendedProps as CalendarEvent & {
      variant: StatusBadgeVariant
    }
    const variant = props.variant || resolveStatusVariant(props.estado)
    const style = variantStyleMap[variant] || variantStyleMap.neutral

    return (
      <div
        className={cn(
          "flex w-full items-center gap-1.5 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium leading-tight transition-all duration-150 shadow-2xs hover:scale-[1.01] hover:brightness-95",
          style.bg,
          style.text,
          style.border,
        )}
        title={`${arg.event.title} - ${props.estado || "Programado"}`}
      >
        <span className={cn("size-1.5 shrink-0 rounded-full", style.dot)} />
        {arg.timeText && (
          <span className="shrink-0 text-[11px] font-semibold opacity-80">{arg.timeText}</span>
        )}
        <span className="truncate">{arg.event.title}</span>
      </div>
    )
  }

  const formatEventDate = (dateStr?: string | Date) => {
    if (!dateStr) return "N/D"
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat("es-BO", {
      dateStyle: "medium",
      timeStyle: d.getHours() || d.getMinutes() ? "short" : undefined,
    }).format(d)
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 w-full rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs text-card-foreground",
        className,
      )}
    >
      {/* Top Header & Consultation Title */}
      <div className="flex flex-col gap-3 pb-3.5 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <CalendarIcon className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
                <Badge variant="outline" className="text-xs font-medium px-2 py-0.5">
                  {filteredEvents.length} {filteredEvents.length === 1 ? "registro" : "registros"}
                </Badge>
              </div>
              {description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-1.5 h-8.5 rounded-lg text-xs"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
              <span>Actualizar</span>
            </Button>
          )}
          {headerActions}
        </div>
      </div>

      {/* KPI Stats Quick Bar for Consultation View */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 py-3 border-b border-border/50 shrink-0">
        <button
          type="button"
          onClick={() => setSelectedEstadoFilter("TODOS")}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border p-2 text-left transition-all cursor-pointer",
            selectedEstadoFilter === "TODOS"
              ? "bg-primary/10 border-primary/50 text-foreground ring-1 ring-primary/30"
              : "bg-muted/30 border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground",
          )}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background border border-border/60 text-foreground">
            <Layers className="size-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
              Total
            </p>
            <span className="font-heading text-sm font-bold text-foreground leading-none">
              {metrics.total}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEstadoFilter("APROBADO")}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border p-2 text-left transition-all cursor-pointer",
            selectedEstadoFilter === "APROBADO"
              ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500/30"
              : "bg-muted/30 border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground",
          )}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="size-2 rounded-full bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
              Aprobados
            </p>
            <span className="font-heading text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-none">
              {metrics.aprobados}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEstadoFilter("EN_RUTA")}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border p-2 text-left transition-all cursor-pointer",
            selectedEstadoFilter === "EN_RUTA"
              ? "bg-sky-500/15 border-sky-500/50 text-sky-950 dark:text-sky-100 ring-1 ring-sky-500/30"
              : "bg-muted/30 border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground",
          )}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <span className="size-2 rounded-full bg-sky-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
              En Ruta
            </p>
            <span className="font-heading text-sm font-bold text-sky-600 dark:text-sky-400 leading-none">
              {metrics.enRuta}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEstadoFilter("PENDIENTE")}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border p-2 text-left transition-all cursor-pointer",
            selectedEstadoFilter === "PENDIENTE"
              ? "bg-amber-500/15 border-amber-500/50 text-amber-950 dark:text-amber-100 ring-1 ring-amber-500/30"
              : "bg-muted/30 border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground",
          )}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="size-2 rounded-full bg-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
              Pendientes
            </p>
            <span className="font-heading text-sm font-bold text-amber-600 dark:text-amber-400 leading-none">
              {metrics.pendientes}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEstadoFilter("FINALIZADA")}
          className={cn(
            "col-span-2 sm:col-span-1 flex items-center gap-2.5 rounded-xl border p-2 text-left transition-all cursor-pointer",
            selectedEstadoFilter === "FINALIZADA"
              ? "bg-zinc-500/15 border-zinc-500/50 text-foreground ring-1 ring-zinc-500/30"
              : "bg-muted/30 border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground",
          )}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
            <span className="size-2 rounded-full bg-zinc-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
              Finalizadas
            </p>
            <span className="font-heading text-sm font-bold text-muted-foreground leading-none">
              {metrics.finalizadas}
            </span>
          </div>
        </button>
      </div>

      {/* Filter and View Control Toolbar */}
      {showFilterToolbar && (
        <div className="flex flex-col gap-2.5 py-3 md:flex-row md:items-center md:justify-between shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] max-w-sm flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por N°, destino, conductor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 pl-8 pr-8 text-xs rounded-lg bg-card"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Filter className="size-3.5 text-muted-foreground mr-1 hidden sm:inline" />
              {[
                { label: "Todos", value: "TODOS" },
                { label: "Aprobados", value: "APROBADO" },
                { label: "En Ruta", value: "EN_RUTA" },
                { label: "Pendientes", value: "PENDIENTE" },
                { label: "Finalizados", value: "FINALIZADA" },
              ].map((item) => {
                const isActive = selectedEstadoFilter === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedEstadoFilter(item.value)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-all border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                        : "bg-card text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/60",
                    )}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Navigation Arrows */}
            <div className="flex items-center rounded-lg border border-border/70 bg-card p-0.5 shadow-2xs">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handlePrev}
                title="Anterior"
                className="rounded-md size-7"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleToday}
                className="px-2.5 font-medium text-xs rounded-md h-7"
              >
                Hoy
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleNext}
                title="Siguiente"
                className="rounded-md size-7"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* View Switchers */}
            <div className="flex items-center rounded-lg border border-border/70 bg-card p-0.5 shadow-2xs">
              {[
                { label: "Mes", value: "dayGridMonth" },
                { label: "Semana", value: "timeGridWeek" },
                { label: "Día", value: "timeGridDay" },
                { label: "Agenda", value: "listMonth" },
              ].map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => handleViewChange(v.value)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                    currentView === v.value
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Title Subheader & Current Date Indicator */}
      <div className="flex items-center justify-between pb-2.5 px-0.5 shrink-0">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-primary" />
          <h2 className="font-heading text-sm sm:text-base font-bold capitalize text-foreground">
            {currentTitle || "Calendario"}
          </h2>
        </div>

        {/* Legend pills */}
        <div className="hidden sm:flex items-center gap-3.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Aprobado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-sky-500" />
            <span>En Ruta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>Pendiente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-zinc-400" />
            <span>Finalizado</span>
          </div>
        </div>
      </div>

      {/* Main FullCalendar container - Expands 100% height */}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden rounded-xl border border-border/80 bg-card calendar-system-root">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={defaultView}
          locales={[esLocale]}
          locale="es"
          headerToolbar={false}
          editable={false}
          selectable={false}
          dayMaxEvents={3}
          expandRows={true}
          height="100%"
          datesSet={handleDatesSet}
          events={fullCalendarEvents}
          eventClick={handleCalendarEventClick}
          eventContent={renderEventContent}
        />
      </div>

      {/* Event Details Consultation Dialog Modal */}
      <Dialog
        open={Boolean(selectedEvent)}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <DialogContent className="max-w-lg p-5 sm:p-6 rounded-2xl shadow-xl">
          <DialogHeader className="gap-1.5 border-b border-border/60 pb-3.5 text-left">
            <div className="flex items-center justify-between gap-2">
              <StatusBadge>{selectedEvent?.estado || "Programado"}</StatusBadge>
              {selectedEvent?.numero && (
                <Badge variant="outline" className="text-xs font-mono font-bold bg-muted/40">
                  {selectedEvent.numero}
                </Badge>
              )}
            </div>
            <DialogTitle className="font-heading text-lg sm:text-xl font-bold text-foreground mt-1 leading-snug">
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5">
              {selectedEvent?.tipoSolicitud ? (
                <>
                  <Car className="size-3.5 text-primary shrink-0" />
                  <span>Tipo: {selectedEvent.tipoSolicitud}</span>
                </>
              ) : (
                <span>Consulta detallada de la solicitud vehicular seleccionada</span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2.5 py-3 text-xs">
            {/* Fechas y Horario */}
            <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3 border border-border/50">
              <Clock className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-foreground block">Cronograma Programado</span>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Salida:</strong>{" "}
                  {formatEventDate(selectedEvent?.start)}
                </p>
                {selectedEvent?.end && (
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Retorno Estimado:</strong>{" "}
                    {formatEventDate(selectedEvent?.end)}
                  </p>
                )}
              </div>
            </div>

            {/* Destino y Ruta */}
            {selectedEvent?.location && (
              <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3 border border-border/50">
                <MapPin className="size-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground block">Destino / Itinerario</span>
                  <p className="text-muted-foreground mt-0.5">{selectedEvent.location}</p>
                </div>
              </div>
            )}

            {/* Solicitante y Conductor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedEvent?.solicitante && (
                <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-3 border border-border/50">
                  <User className="size-4 text-sky-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 space-y-0.5">
                    <span className="font-semibold text-foreground block">Solicitante</span>
                    <p className="text-foreground font-medium truncate">{selectedEvent.solicitante}</p>
                    {selectedEvent.cargoSolicitante && (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {selectedEvent.cargoSolicitante}
                      </p>
                    )}
                    {selectedEvent.areaSolicitante && (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {selectedEvent.areaSolicitante}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedEvent?.conductor && (
                <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-3 border border-border/50">
                  <Car className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 space-y-0.5">
                    <span className="font-semibold text-foreground block">Conductor Asignado</span>
                    <p className="text-foreground font-medium truncate">{selectedEvent.conductor}</p>
                    {selectedEvent.licenciaConductor && (
                      <p className="text-[11px] text-muted-foreground truncate">
                        Lic: {selectedEvent.licenciaConductor}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pasajeros y Motivo */}
            {selectedEvent?.pasajeros !== undefined && selectedEvent.pasajeros > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2 border border-border/40 text-muted-foreground">
                <Users className="size-3.5 text-primary" />
                <span>
                  Cantidad de Pasajeros:{" "}
                  <strong className="text-foreground font-semibold">{selectedEvent.pasajeros}</strong>
                </span>
              </div>
            )}

            {selectedEvent?.description && (
              <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-3 border border-border/50">
                <FileText className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground block">Motivo / Justificación</span>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed">{selectedEvent.description}</p>
                </div>
              </div>
            )}

            {selectedEvent?.observacion && (
              <div className="flex items-start gap-2.5 rounded-xl bg-muted/30 p-2.5 border border-border/40">
                <Info className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                  {selectedEvent.observacion}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between border-t border-border/60 pt-3.5 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedEvent(null)}
              className="text-xs"
            >
              Cerrar
            </Button>
            {selectedEvent?.url && (
              <Button
                size="sm"
                onClick={() => {
                  if (selectedEvent.url) window.location.href = selectedEvent.url
                }}
                className="gap-1.5 text-xs shadow-xs"
              >
                <span>Ver Ficha Completa</span>
                <ExternalLink className="size-3.5" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom FullCalendar CSS token styling */}
      <style>{`
        .calendar-system-root {
          --fc-border-color: var(--border);
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: var(--muted);
          --fc-list-event-hover-bg-color: var(--accent);
          --fc-today-bg-color: color-mix(in srgb, var(--primary) 7%, transparent);
          font-family: var(--font-sans);
          display: flex;
          flex-direction: column;
        }

        .calendar-system-root .fc {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .calendar-system-root .fc-view-harness {
          flex: 1 1 0%;
          min-height: 0;
          height: 100% !important;
        }

        .calendar-system-root .fc-theme-standard td,
        .calendar-system-root .fc-theme-standard th,
        .calendar-system-root .fc-theme-standard .fc-scrollgrid {
          border-color: var(--border);
        }

        .calendar-system-root .fc-col-header {
          width: 100% !important;
          background-color: color-mix(in srgb, var(--muted) 70%, transparent);
        }

        .calendar-system-root .fc-col-header-cell-cushion {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted-foreground);
        }

        .calendar-system-root .fc-daygrid-day-number {
          padding: 0.25rem 0.5rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--foreground);
        }

        .calendar-system-root .fc-daygrid-day.fc-day-today {
          background-color: var(--fc-today-bg-color) !important;
        }

        .calendar-system-root .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          color: var(--primary);
          font-weight: 700;
        }

        .calendar-system-root .fc-daygrid-day:hover {
          background-color: color-mix(in srgb, var(--muted) 35%, transparent);
        }

        .calendar-system-root .fc-daygrid-more-link {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--primary);
          padding: 0 4px;
        }

        .calendar-system-root .fc-daygrid-more-link:hover {
          text-decoration: underline;
        }

        .calendar-system-root .fc-event {
          background: transparent !important;
          border: none !important;
          margin: 1.5px 3px !important;
          cursor: pointer;
        }

        .calendar-system-root .fc-list-day-cushion {
          background-color: var(--muted) !important;
          color: var(--foreground);
          font-weight: 600;
          font-size: 0.8125rem;
        }

        .calendar-system-root .fc-list-event {
          cursor: pointer;
          font-size: 0.8125rem;
        }

        .calendar-system-root .fc-timegrid-slot-label-cushion {
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }

        .calendar-system-root .fc-scrollgrid-sync-table {
          width: 100% !important;
        }

        .calendar-system-root .fc-daygrid-body {
          width: 100% !important;
        }
      `}</style>
    </div>
  )
}


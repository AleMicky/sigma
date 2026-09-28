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
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  RefreshCw,
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
import {
  StatusBadge,
  resolveStatusVariant,
  type StatusBadgeVariant,
} from "@/shared/components/status-badge"

export interface CalendarEventDetail {
  label: string
  value: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}

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
  subtitle?: string
  url?: string
  details?: CalendarEventDetail[]
  extendedProps?: Record<string, unknown>
}

export interface CalendarFilterOption {
  label: string
  value: string
  count?: number
  filterFn?: (event: CalendarEvent) => boolean
}

export interface CalendarLegendItem {
  label: string
  color: string
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
  filterOptions?: CalendarFilterOption[]
  selectedFilter?: string
  onFilterChange?: (filterValue: string) => void
  legendItems?: CalendarLegendItem[]
  showLegend?: boolean
  showFilterToolbar?: boolean
  showViews?: boolean
  className?: string
  defaultView?: "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listMonth"
  renderEventDialog?: (event: CalendarEvent, onClose: () => void) => React.ReactNode
}

const variantDotMap: Record<
  StatusBadgeVariant,
  {
    dot: string
    text: string
    badgeBg: string
  }
> = {
  success: {
    dot: "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.7)]",
    text: "text-emerald-700 dark:text-emerald-300",
    badgeBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    dot: "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.7)]",
    text: "text-amber-700 dark:text-amber-300",
    badgeBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  danger: {
    dot: "bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.7)]",
    text: "text-rose-700 dark:text-rose-300",
    badgeBg: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  },
  info: {
    dot: "bg-sky-500 shadow-[0_0_5px_rgba(14,165,233,0.7)]",
    text: "text-sky-700 dark:text-sky-300",
    badgeBg: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  indigo: {
    dot: "bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.7)]",
    text: "text-indigo-700 dark:text-indigo-300",
    badgeBg: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  },
  neutral: {
    dot: "bg-zinc-400 dark:bg-zinc-500",
    text: "text-muted-foreground",
    badgeBg: "bg-muted text-muted-foreground",
  },
}

const VIEW_OPTIONS = [
  { label: "Mes", shortLabel: "Mes", value: "dayGridMonth", icon: LayoutGrid },
  { label: "Semana", shortLabel: "Sem", value: "timeGridWeek", icon: CalendarDays },
  { label: "Día", shortLabel: "Día", value: "timeGridDay", icon: CalendarRange },
  { label: "Agenda", shortLabel: "Lista", value: "listMonth", icon: List },
]

export const CalendarView: React.FC<CalendarViewProps> = ({
  title = "Calendario",
  description,
  events = [],
  isLoading = false,
  onRefresh,
  onEventClick,
  headerActions,
  filterOptions,
  selectedFilter: controlledFilter,
  onFilterChange,
  legendItems,
  showLegend = true,
  showFilterToolbar = true,
  showViews = true,
  className,
  defaultView = "dayGridMonth",
  renderEventDialog,
}) => {
  const calendarRef = useRef<FullCalendar | null>(null)
  const [currentTitle, setCurrentTitle] = useState<string>("")
  const [currentView, setCurrentView] = useState<string>(defaultView)
  const [internalFilter, setInternalFilter] = useState<string>(
    filterOptions?.[0]?.value || "ALL",
  )
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const activeFilter = controlledFilter ?? internalFilter

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

  const handleSelectFilter = (val: string) => {
    setInternalFilter(val)
    onFilterChange?.(val)
  }

  const filteredEvents = useMemo(() => {
    if (!filterOptions || filterOptions.length === 0) return events

    const currentOption = filterOptions.find((opt) => opt.value === activeFilter)
    if (!currentOption || !currentOption.filterFn) {
      return events
    }

    return events.filter(currentOption.filterFn)
  }, [events, filterOptions, activeFilter])

  // Compute counts for filter pills dynamically
  const filterCounts = useMemo(() => {
    if (!filterOptions) return {}
    const counts: Record<string, number> = {}
    filterOptions.forEach((opt) => {
      if (!opt.filterFn) {
        counts[opt.value] = events.length
      } else {
        counts[opt.value] = events.filter(opt.filterFn).length
      }
    })
    return counts
  }, [events, filterOptions])

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

  // Google Calendar style: Sleek text row with colored status dot
  const renderEventContent = (arg: EventContentArg) => {
    const props = arg.event.extendedProps as CalendarEvent & {
      variant: StatusBadgeVariant
    }
    const variant = props.variant || resolveStatusVariant(props.estado)
    const style = variantDotMap[variant] || variantDotMap.neutral

    const fullTooltip = [
      props.subtitle ? `[${props.subtitle}]` : null,
      arg.event.title,
      props.estado ? `Estado: ${props.estado}` : null,
      props.location ? `Ubicación: ${props.location}` : null,
    ]
      .filter(Boolean)
      .join(" • ")

    return (
      <div
        className="group relative flex w-full items-center gap-1.5 overflow-hidden rounded-md px-1.5 py-0.5 text-xs transition-colors duration-100 hover:bg-muted/80 cursor-pointer select-none"
        title={fullTooltip}
      >
        {/* Status Colored Dot */}
        <span className={cn("size-2 shrink-0 rounded-full", style.dot)} />

        {/* Time */}
        {arg.timeText && (
          <span className="shrink-0 font-mono text-[10.5px] font-bold text-muted-foreground group-hover:text-foreground">
            {arg.timeText}
          </span>
        )}

        {/* Code / Subtitle if available */}
        {props.subtitle && (
          <span className="shrink-0 font-mono text-[10px] font-semibold opacity-70">
            {props.subtitle}
          </span>
        )}

        {/* Title Text */}
        <span className="truncate text-xs font-medium text-foreground">
          {arg.event.title}
        </span>
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
        "relative flex flex-col h-full min-h-0 w-full rounded-xl sm:rounded-2xl border border-border/70 bg-gradient-to-b from-card to-card/95 p-3 sm:p-5 shadow-sm text-card-foreground backdrop-blur-md overflow-hidden",
        className,
      )}
    >
      {/* Row 1: Main Header & Actions */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs ring-2 ring-primary/5 shrink-0">
            <CalendarIcon className="size-4 sm:size-5" />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                {title}
              </h1>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-primary border border-primary/20 shrink-0">
                {filteredEvents.length} {filteredEvents.length === 1 ? "registro" : "registros"}
              </span>
            </div>
            {description && (
              <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-1.5 h-8 rounded-lg text-xs hover:bg-muted/80 transition-all cursor-pointer"
            >
              <RefreshCw className={cn("size-3.5 text-muted-foreground", isLoading && "animate-spin text-primary")} />
              <span className="hidden xs:inline">Actualizar</span>
            </Button>
          )}
          {headerActions}
        </div>
      </div>

      {/* Row 2: Date Navigation + Current Month Title + View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 py-2.5 border-b border-border/50 shrink-0">
        {/* Left: Navigator (< Hoy >) + Current Date Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-0.5 rounded-xl border border-border/70 bg-muted/30 p-0.5 shadow-2xs shrink-0">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handlePrev}
              title="Anterior"
              className="rounded-lg size-7 text-muted-foreground hover:text-foreground hover:bg-card transition-all cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleToday}
              className="px-2 font-medium text-xs rounded-lg h-7 text-foreground hover:bg-card transition-all cursor-pointer"
            >
              Hoy
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleNext}
              title="Siguiente"
              className="rounded-lg size-7 text-muted-foreground hover:text-foreground hover:bg-card transition-all cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <div className="size-2 rounded-full bg-primary animate-pulse shrink-0" />
            <h2 className="font-heading text-sm sm:text-base font-bold capitalize tracking-tight text-foreground truncate">
              {currentTitle || "Calendario"}
            </h2>
          </div>
        </div>

        {/* Right: View Switchers */}
        {showViews && (
          <div className="flex items-center rounded-xl border border-border/70 bg-muted/40 p-0.5 shadow-2xs self-start sm:self-auto shrink-0">
            {VIEW_OPTIONS.map((v) => {
              const Icon = v.icon
              const isActive = currentView === v.value
              return (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => handleViewChange(v.value)}
                  title={v.label}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer select-none",
                    isActive
                      ? "bg-card text-foreground font-semibold shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                  )}
                >
                  <Icon className="size-3.5 opacity-75" />
                  <span className="hidden sm:inline">{v.label}</span>
                  <span className="sm:hidden">{v.shortLabel}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Row 3: Status Filters & Legend Bar */}
      {showFilterToolbar && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 py-2.5 shrink-0">
          {/* Status Filter Pills with Horizontal Scrolling */}
          <div className="w-full md:w-auto overflow-x-auto pb-0.5 scrollbar-none">
            {filterOptions && filterOptions.length > 0 && (
              <div className="flex items-center gap-1.5 min-w-max rounded-xl bg-muted/40 p-1 border border-border/60">
                <Filter className="size-3 text-muted-foreground ml-1 mr-0.5 hidden sm:inline" />
                {filterOptions.map((item) => {
                  const isActive = activeFilter === item.value
                  const count = filterCounts[item.value]
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleSelectFilter(item.value)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs scale-[1.02]"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/80",
                      )}
                    >
                      <span>{item.label}</span>
                      {count !== undefined && (
                        <span
                          className={cn(
                            "text-[10px] rounded-full px-1.5 py-0.2 font-mono font-bold leading-none",
                            isActive
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-muted-foreground/15 text-muted-foreground",
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Legend Indicators */}
          {showLegend && legendItems && legendItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 text-[11px] sm:text-xs text-muted-foreground shrink-0">
              {legendItems.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className={cn("size-2 rounded-full ring-2 ring-background", item.color)} />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main FullCalendar container - Expands 100% height */}
      <div className="relative flex-1 min-h-[350px] sm:min-h-0 w-full overflow-hidden rounded-xl border border-border/80 bg-card/60 calendar-system-root shadow-xs">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={defaultView}
          locales={[esLocale]}
          locale="es"
          headerToolbar={false}
          editable={false}
          selectable={false}
          dayMaxEvents={5}
          expandRows={true}
          height="100%"
          datesSet={handleDatesSet}
          events={fullCalendarEvents}
          eventClick={handleCalendarEventClick}
          eventContent={renderEventContent}
        />
      </div>

      {/* Modern Event Details Modal */}
      <Dialog
        open={Boolean(selectedEvent)}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        {selectedEvent && (
          renderEventDialog ? (
            renderEventDialog(selectedEvent, () => setSelectedEvent(null))
          ) : (
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[88vh] overflow-y-auto p-4 sm:p-6 rounded-2xl shadow-2xl border-border/80 backdrop-blur-xl">
              <DialogHeader className="gap-2 border-b border-border/60 pb-3 text-left">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge>{selectedEvent.estado || "Programado"}</StatusBadge>
                  {selectedEvent.subtitle && (
                    <Badge variant="outline" className="text-xs font-mono font-bold bg-muted/40">
                      {selectedEvent.subtitle}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="font-heading text-base sm:text-xl font-bold text-foreground mt-1 leading-snug">
                  {selectedEvent.title}
                </DialogTitle>
                {selectedEvent.description && (
                  <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                    {selectedEvent.description}
                  </DialogDescription>
                )}
              </DialogHeader>

              <div className="grid gap-2.5 py-3 text-xs">
                {/* Schedule & Dates Box */}
                <div className="flex items-start gap-3 rounded-xl bg-muted/35 p-3 sm:p-3.5 border border-border/60 shadow-2xs">
                  <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 border border-primary/15">
                    <Clock className="size-3.5 sm:size-4" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="font-semibold text-foreground block">Cronograma Programado</span>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Inicio:</strong>{" "}
                      {formatEventDate(selectedEvent.start)}
                    </p>
                    {selectedEvent.end && (
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Retorno / Fin:</strong>{" "}
                        {formatEventDate(selectedEvent.end)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location Box */}
                {selectedEvent.location && (
                  <div className="flex items-start gap-3 rounded-xl bg-muted/35 p-3 sm:p-3.5 border border-border/60 shadow-2xs">
                    <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 shrink-0 border border-rose-500/15">
                      <MapPin className="size-3.5 sm:size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-foreground block">Ubicación / Itinerario</span>
                      <p className="text-muted-foreground mt-0.5">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}

                {/* Structured Event Details */}
                {selectedEvent.details && selectedEvent.details.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedEvent.details.map((detail, idx) => {
                      const IconComponent = detail.icon
                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 sm:gap-3 rounded-xl bg-muted/35 p-3 border border-border/60 shadow-2xs"
                        >
                          {IconComponent && (
                            <div className="flex size-6 sm:size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 border border-primary/15 mt-0.5">
                              <IconComponent className="size-3 sm:size-3.5" />
                            </div>
                          )}
                          <div className="min-w-0 space-y-0.5 flex-1">
                            <span className="font-semibold text-[11px] sm:text-xs text-foreground block">
                              {detail.label}
                            </span>
                            <div className="text-muted-foreground text-[11px] sm:text-xs font-medium truncate">
                              {detail.value}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <DialogFooter className="flex items-center justify-between border-t border-border/60 pt-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  className="text-xs rounded-lg cursor-pointer"
                >
                  Cerrar
                </Button>
                {selectedEvent.url && (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (selectedEvent.url) window.location.href = selectedEvent.url
                    }}
                    className="gap-1.5 text-xs shadow-xs rounded-lg cursor-pointer"
                  >
                    <span>Ver Detalle</span>
                    <ExternalLink className="size-3.5" />
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          )
        )}
      </Dialog>

      {/* FullCalendar Custom Theme Styles */}
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
          border-color: color-mix(in srgb, var(--border) 75%, transparent);
        }

        .calendar-system-root .fc-col-header {
          width: 100% !important;
          background-color: color-mix(in srgb, var(--muted) 45%, transparent);
        }

        .calendar-system-root .fc-col-header-cell-cushion {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--muted-foreground);
        }

        @media (min-width: 640px) {
          .calendar-system-root .fc-col-header-cell-cushion {
            padding-top: 0.625rem;
            padding-bottom: 0.625rem;
            font-size: 0.75rem;
          }
        }

        .calendar-system-root .fc-daygrid-day-number {
          padding: 0.25rem 0.4rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--foreground);
        }

        @media (min-width: 640px) {
          .calendar-system-root .fc-daygrid-day-number {
            padding: 0.35rem 0.6rem;
            font-size: 0.8125rem;
          }
        }

        .calendar-system-root .fc-daygrid-day.fc-day-today {
          background-color: var(--fc-today-bg-color) !important;
        }

        .calendar-system-root .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          color: var(--primary);
          font-weight: 800;
        }

        .calendar-system-root .fc-daygrid-day:hover {
          background-color: color-mix(in srgb, var(--muted) 30%, transparent);
          transition: background-color 150ms ease;
        }

        .calendar-system-root .fc-daygrid-more-link {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--primary);
          padding: 1px 5px;
          border-radius: 6px;
          background-color: color-mix(in srgb, var(--primary) 12%, transparent);
          display: inline-block;
          margin-top: 1px;
          transition: all 150ms ease;
        }

        .calendar-system-root .fc-daygrid-more-link:hover {
          background-color: color-mix(in srgb, var(--primary) 22%, transparent);
          text-decoration: none;
        }

        .calendar-system-root .fc-event {
          background: transparent !important;
          border: none !important;
          margin: 0.5px 1px !important;
          cursor: pointer;
        }

        .calendar-system-root .fc-daygrid-event-harness {
          margin-bottom: 1px !important;
        }

        .calendar-system-root .fc-list-day-cushion {
          background-color: var(--muted) !important;
          color: var(--foreground);
          font-weight: 600;
          font-size: 0.8125rem;
          padding: 0.5rem 0.75rem !important;
        }

        .calendar-system-root .fc-list-event {
          cursor: pointer;
          font-size: 0.8125rem;
          transition: background-color 150ms ease;
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

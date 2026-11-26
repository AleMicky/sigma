import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  MessageSquareText,
  Package,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Timer,
  UserRound,
  X,
  XCircle,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { routes } from "@/app/config/routes"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { PageShell } from "@/shared/components/page-shell"
import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/shared/components/status-badge"
import { Pagination } from "@/shared/components/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Textarea } from "@/shared/components/ui/textarea"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { toLocalDateKey } from "@/shared/lib/date"
import { cn } from "@/shared/lib/utils"

import { useAnularRegistroPorteriaMutation } from "../api/porteria.mutations"
import { porteriaQueries } from "../api/porteria.queries"
import type {
  EstadoRegistroPorteria,
  RegistroPorteria,
  TipoMovimientoPorteria,
} from "../api/porteria.types"
import { RegistrarLlegadaPorteriaDialog } from "../components/RegistrarLlegadaPorteriaDialog"
import { RegistrarSalidaPorteriaDialog } from "../components/RegistrarSalidaPorteriaDialog"

const DEFAULT_PAGE_SIZE = appConfig.pagination?.defaultPageSize ?? 20

/** Minutos a partir de los cuales una salida se considera prolongada. */
const UMBRAL_ALERTA_MIN = 120
const UMBRAL_CRITICO_MIN = 240

// ───────────────────────── helpers ─────────────────────────

function formatTime(value?: string | null): string {
  if (!value) return "—"
  return new Date(value).toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—"
  return new Date(value).toLocaleString("es-BO", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

function minutesBetween(from: string, to: number | string): number {
  const end = typeof to === "number" ? to : new Date(to).getTime()
  return Math.max(0, Math.floor((end - new Date(from).getTime()) / 60000))
}

function formatDuration(totalMin: number): string {
  if (totalMin < 1) return "menos de 1 min"
  const d = Math.floor(totalMin / 1440)
  const h = Math.floor((totalMin % 1440) / 60)
  const m = totalMin % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`
  return `${m} min`
}

function getInitials(name?: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?"
}

function dayKey(value: string): string {
  return toLocalDateKey(new Date(value))
}

function dayLabel(value: string): string {
  const d = new Date(value)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const valueKey = toLocalDateKey(d)
  if (valueKey === toLocalDateKey(today)) return "Hoy"
  if (valueKey === toLocalDateKey(yesterday)) return "Ayer"
  const label = d.toLocaleDateString("es-BO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Re-renderiza cada minuto para mantener actualizados los tiempos transcurridos. */
function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

// ───────────────────────── sub-componentes ─────────────────────────

const ESTADO_CONFIG: Record<
  EstadoRegistroPorteria,
  { label: string; icon: typeof Clock; variant: StatusBadgeVariant; avatar: string }
> = {
  AFUERA: {
    label: "Afuera",
    icon: Clock,
    variant: "warning",
    avatar: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  COMPLETADO: {
    label: "Completado",
    icon: CheckCircle2,
    variant: "success",
    avatar: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  ANULADO: {
    label: "Anulado",
    icon: XCircle,
    variant: "danger",
    avatar: "bg-muted text-muted-foreground",
  },
}

function EstadoBadge({
  estado,
  tipoMovimiento,
}: {
  estado: EstadoRegistroPorteria
  tipoMovimiento?: TipoMovimientoPorteria
}) {
  const cfg = ESTADO_CONFIG[estado]
  const Icon = cfg.icon
  const label =
    estado === "AFUERA"
      ? tipoMovimiento === "ENTRADA"
        ? "Adentro"
        : "Afuera"
      : cfg.label
  return (
    <StatusBadge variant={cfg.variant} dot={false} icon={<Icon className="size-3" />}>
      {label}
    </StatusBadge>
  )
}

function TipoMovimientoBadge({
  tipoMovimiento,
}: {
  tipoMovimiento?: TipoMovimientoPorteria
}) {
  const esEntrada = tipoMovimiento === "ENTRADA"
  return (
    <StatusBadge
      variant={esEntrada ? "success" : "warning"}
      dot={false}
      icon={
        esEntrada ? (
          <LogIn className="size-3" />
        ) : (
          <LogOut className="size-3" />
        )
      }
    >
      {esEntrada ? "Entrada" : "Salida"}
    </StatusBadge>
  )
}

function InitialsAvatar({
  name,
  className,
}: {
  name?: string | null
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        className
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  )
}

function ActivosChips({ registro }: { registro: RegistroPorteria }) {
  const activos = registro.activos ?? []
  if (activos.length === 0) {
    return (
      <span className="text-xs italic text-muted-foreground">
        Sin activos registrados
      </span>
    )
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {activos.map((item) => {
        const label = item.activoNombre
          ? `${item.activoCodigo ?? ""} ${item.activoNombre}`.trim()
          : item.descripcionItem || "Ítem"
        const noRetorno = item.retornado === false
        return (
          <span
            key={item.id}
            title={item.observacionSalida ?? undefined}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs",
              noRetorno
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-border bg-muted/50 text-foreground/80"
            )}
          >
            <Package className="size-3 shrink-0" />
            <span className="max-w-[220px] truncate">{label}</span>
            {item.cantidad > 1 && (
              <span className="font-semibold">×{item.cantidad}</span>
            )}
            {noRetorno && <span className="font-medium">· No retornó</span>}
          </span>
        )
      })}
    </div>
  )
}

function RutaBadge({ registro }: { registro: RegistroPorteria }) {
  const origen = registro.origenUbicacionNombre
  const destino = registro.destinoUbicacionNombre || registro.destinoOtro
  if (!origen && !destino) return null

  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/5 px-2 py-0.5 text-xs text-sky-700 dark:text-sky-300">
      <MapPin className="size-3 shrink-0" />
      <span className="font-medium">{origen ?? "Origen sin especificar"}</span>
      <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
      <span className="font-medium">{destino ?? "Destino sin especificar"}</span>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string
  value: number | string
  hint?: string
  icon: typeof Clock
  tone: "amber" | "red" | "sky"
}) {
  const tones = {
    amber: "bg-amber-500/10 text-amber-600",
    red: "bg-red-500/10 text-red-600",
    sky: "bg-sky-500/10 text-sky-600",
  }
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            tones[tone]
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-tight tabular-nums">
            {value}
          </p>
          {hint && (
            <p className="truncate text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border p-4">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      ))}
    </div>
  )
}

function AfueraItem({
  registro,
  now,
  onLlegada,
  onAnular,
  anulando,
}: {
  registro: RegistroPorteria
  now: number
  onLlegada: () => void
  onAnular: () => void
  anulando: boolean
}) {
  const esEntrada = registro.tipoMovimiento === "ENTRADA"
  const mins = minutesBetween(registro.fechaHoraSalida, now)
  const nivel =
    mins >= UMBRAL_CRITICO_MIN
      ? "critico"
      : mins >= UMBRAL_ALERTA_MIN
        ? "alerta"
        : "normal"

  return (
    <li
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-md sm:flex-row sm:items-center",
        "before:absolute before:inset-y-0 before:left-0 before:w-1",
        nivel === "critico" && "before:bg-red-500",
        nivel === "alerta" && "before:bg-amber-500",
        nivel === "normal" &&
          (esEntrada ? "before:bg-emerald-500/70" : "before:bg-sky-500/60")
      )}
    >
      <div className="flex min-w-0 flex-1 gap-4">
        <InitialsAvatar
          name={
            registro.esExterno
              ? registro.personaExterna ?? registro.empleadoNombre
              : registro.empleadoNombre
          }
          className={
            esEntrada
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : ESTADO_CONFIG.AFUERA.avatar
          }
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="truncate font-semibold">
              {registro.esExterno
                ? registro.personaExterna ?? registro.empleadoNombre ?? "Externo"
                : registro.empleadoNombre ?? registro.empleadoId}
            </h3>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              {registro.numero}
            </span>
            <TipoMovimientoBadge tipoMovimiento={registro.tipoMovimiento} />
            {registro.esExterno && (
              <Badge
                variant="outline"
                className="border-purple-500/40 bg-purple-500/10 text-[10px] font-semibold text-purple-700 dark:text-purple-300"
              >
                Externo
              </Badge>
            )}
            {registro.placaExterna && (
              <span className="rounded border border-purple-500/30 bg-purple-500/5 px-1.5 py-0.5 font-mono text-[11px] font-bold text-purple-700 dark:text-purple-300">
                Placa: {registro.placaExterna}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              {esEntrada ? (
                <LogIn className="size-3.5 text-emerald-600" />
              ) : (
                <LogOut className="size-3.5 text-amber-600" />
              )}
              {esEntrada ? "Ingresó a las " : "Salió a las "}
              <span className="font-medium text-foreground">
                {formatTime(registro.fechaHoraSalida)}
              </span>
            </span>
            {registro.guardiaSalidaNombre && (
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="size-3.5" />
                {registro.guardiaSalidaNombre}
              </span>
            )}
          </div>

          <RutaBadge registro={registro} />

          <ActivosChips registro={registro} />

          {registro.observacionSalida && (
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <MessageSquareText className="mt-0.5 size-3.5 shrink-0" />
              <span className="line-clamp-2">{registro.observacionSalida}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 sm:flex-col sm:flex-nowrap sm:items-end sm:border-t-0 sm:pt-0">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
            nivel === "critico" && "bg-red-500/10 text-red-600",
            nivel === "alerta" && "bg-amber-500/10 text-amber-600",
            nivel === "normal" &&
              (esEntrada
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-sky-500/10 text-sky-600")
          )}
          title={`${esEntrada ? "Entrada" : "Salida"}: ${formatDateTime(registro.fechaHoraSalida)}`}
        >
          {nivel === "normal" ? (
            <Timer className="size-3.5" />
          ) : (
            <AlertTriangle className="size-3.5" />
          )}
          {formatDuration(mins)} {esEntrada ? "adentro" : "afuera"}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={onAnular}
            disabled={anulando}
          >
            <XCircle className="mr-1.5 size-3.5" />
            Anular
          </Button>
          <Button size="sm" onClick={onLlegada}>
            {esEntrada ? (
              <>
                <LogOut className="mr-1.5 size-3.5" />
                Registrar salida
              </>
            ) : (
              <>
                <LogIn className="mr-1.5 size-3.5" />
                Registrar entrada
              </>
            )}
          </Button>
        </div>
      </div>
    </li>
  )
}

function HistorialItem({ registro }: { registro: RegistroPorteria }) {
  const esEntrada = registro.tipoMovimiento === "ENTRADA"
  const cfg = ESTADO_CONFIG[registro.estado]
  const duracion = registro.fechaHoraLlegada
    ? formatDuration(
        minutesBetween(registro.fechaHoraSalida, registro.fechaHoraLlegada)
      )
    : null

  return (
    <li
      className={cn(
        "flex flex-col gap-3 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-start",
        registro.estado === "ANULADO" && "opacity-70"
      )}
    >
      <InitialsAvatar
        name={
          registro.esExterno
            ? registro.personaExterna ?? registro.empleadoNombre
            : registro.empleadoNombre
        }
        className={cn("size-10", cfg.avatar)}
      />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3
            className={cn(
              "truncate font-semibold",
              registro.estado === "ANULADO" && "line-through"
            )}
          >
            {registro.esExterno
              ? registro.personaExterna ?? registro.empleadoNombre ?? "Externo"
              : registro.empleadoNombre ?? registro.empleadoId}
          </h3>
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            {registro.numero}
          </span>
          <TipoMovimientoBadge tipoMovimiento={registro.tipoMovimiento} />
          {registro.esExterno && (
            <Badge
              variant="outline"
              className="border-purple-500/40 bg-purple-500/10 text-[10px] font-semibold text-purple-700 dark:text-purple-300"
            >
              Externo
            </Badge>
          )}
          {registro.placaExterna && (
            <span className="rounded border border-purple-500/30 bg-purple-500/5 px-1.5 py-0.5 font-mono text-[11px] font-bold text-purple-700 dark:text-purple-300">
              Placa: {registro.placaExterna}
            </span>
          )}
          <EstadoBadge
            estado={registro.estado}
            tipoMovimiento={registro.tipoMovimiento}
          />
        </div>

        {/* Línea de tiempo movimiento inicial → cierre */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1">
            {esEntrada ? (
              <LogIn className="size-3.5 text-emerald-600" />
            ) : (
              <LogOut className="size-3.5 text-amber-600" />
            )}
            <span className="text-muted-foreground">
              {esEntrada ? "Ent." : "Sal."}
            </span>
            <span className="font-medium">
              {formatTime(registro.fechaHoraSalida)}
            </span>
            {registro.guardiaSalidaNombre && (
              <span className="text-muted-foreground">
                · {registro.guardiaSalidaNombre}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <ArrowRight className="size-3.5" />
            {duracion && (
              <span className="tabular-nums">{duracion}</span>
            )}
          </div>

          {registro.fechaHoraLlegada ? (
            <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1">
              {esEntrada ? (
                <LogOut className="size-3.5 text-amber-600" />
              ) : (
                <LogIn className="size-3.5 text-emerald-600" />
              )}
              <span className="text-muted-foreground">
                {esEntrada ? "Sal." : "Ent."}
              </span>
              <span className="font-medium">
                {formatDateTime(registro.fechaHoraLlegada)}
              </span>
              {registro.guardiaLlegadaNombre && (
                <span className="text-muted-foreground">
                  · {registro.guardiaLlegadaNombre}
                </span>
              )}
            </div>
          ) : (
            <span className="italic text-muted-foreground">
              {registro.estado === "ANULADO"
                ? "Anulado"
                : esEntrada
                  ? "Pendiente de salida"
                  : "Pendiente de entrada"}
            </span>
          )}
        </div>

        <RutaBadge registro={registro} />

        <ActivosChips registro={registro} />

        {(registro.observacionSalida || registro.observacionLlegada) && (
          <div className="space-y-0.5 text-xs text-muted-foreground">
            {registro.observacionSalida && (
              <p className="flex items-start gap-1.5">
                <MessageSquareText className="mt-0.5 size-3.5 shrink-0" />
                <span className="line-clamp-2">
                  <span className="font-medium">
                    {esEntrada ? "Entrada:" : "Salida:"}
                  </span>{" "}
                  {registro.observacionSalida}
                </span>
              </p>
            )}
            {registro.observacionLlegada && (
              <p className="flex items-start gap-1.5">
                <MessageSquareText className="mt-0.5 size-3.5 shrink-0" />
                <span className="line-clamp-2">
                  <span className="font-medium">
                    {esEntrada ? "Salida:" : "Entrada:"}
                  </span>{" "}
                  {registro.observacionLlegada}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

// ───────────────────────── página ─────────────────────────

export function PorteriaPage() {
  const navigate = useNavigate()
  const now = useNow()
  const [tab, setTab] = useState<"afuera" | "historial">("afuera")
  const [afueraSearch, setAfueraSearch] = useState("")
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [estadoFiltro, setEstadoFiltro] = useState<string>("ALL")
  const [tipoMovimientoFiltro, setTipoMovimientoFiltro] =
    useState<string>("ALL")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [page, setPage] = useState(0)

  const [salidaOpen, setSalidaOpen] = useState(false)
  const [initialTipoMovimiento, setInitialTipoMovimiento] =
    useState<TipoMovimientoPorteria>("SALIDA")
  const [llegadaTarget, setLlegadaTarget] = useState<RegistroPorteria | null>(
    null
  )
  const [anularTarget, setAnularTarget] = useState<RegistroPorteria | null>(
    null
  )
  const [motivoAnulacion, setMotivoAnulacion] = useState("")

  const openRegistroDialog = (tipo: TipoMovimientoPorteria) => {
    setInitialTipoMovimiento(tipo)
    setSalidaOpen(true)
  }

  const afueraQuery = useQuery(porteriaQueries.afuera())
  const historialQuery = useQuery(
    porteriaQueries.list({
      page,
      size: DEFAULT_PAGE_SIZE,
      search: debouncedSearch || undefined,
      tipoMovimiento:
        tipoMovimientoFiltro !== "ALL"
          ? (tipoMovimientoFiltro as TipoMovimientoPorteria)
          : undefined,
      estado:
        estadoFiltro !== "ALL"
          ? (estadoFiltro as EstadoRegistroPorteria)
          : undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
    })
  )

  const hasActiveHistorialFilters = Boolean(
    search.trim() ||
      (tipoMovimientoFiltro && tipoMovimientoFiltro !== "ALL") ||
      (estadoFiltro && estadoFiltro !== "ALL") ||
      fechaDesde ||
      fechaHasta
  )

  const handleClearHistorialFilters = () => {
    setSearch("")
    setTipoMovimientoFiltro("ALL")
    setEstadoFiltro("ALL")
    setFechaDesde("")
    setFechaHasta("")
    setPage(0)
  }

  const handleFiltrarHoy = () => {
    const today = toLocalDateKey()
    setFechaDesde(today)
    setFechaHasta(today)
    setPage(0)
  }

  const anularMutation = useAnularRegistroPorteriaMutation()

  const afueraList = useMemo(() => {
    const list = Array.isArray(afueraQuery.data) ? afueraQuery.data : []
    // Los que llevan más tiempo afuera primero
    return [...list].sort(
      (a, b) =>
        new Date(a.fechaHoraSalida).getTime() -
        new Date(b.fechaHoraSalida).getTime()
    )
  }, [afueraQuery.data])

  const afueraFiltrada = useMemo(() => {
    const q = afueraSearch.trim().toLowerCase()
    if (!q) return afueraList
    return afueraList.filter((r) =>
      [
        r.numero,
        r.empleadoNombre,
        r.personaExterna,
        r.placaExterna,
        r.origenUbicacionNombre,
        r.destinoUbicacionNombre,
        r.destinoOtro,
        r.guardiaSalidaNombre,
        r.observacionSalida,
        ...(r.activos ?? []).flatMap((a) => [
          a.activoCodigo,
          a.activoNombre,
          a.descripcionItem,
        ]),
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [afueraList, afueraSearch])

  const salidasPendientes = afueraList.filter(
    (r) => r.tipoMovimiento !== "ENTRADA"
  ).length
  const entradasPendientes = afueraList.filter(
    (r) => r.tipoMovimiento === "ENTRADA"
  ).length
  const prolongados = afueraList.filter(
    (r) => minutesBetween(r.fechaHoraSalida, now) >= UMBRAL_ALERTA_MIN
  ).length

  const historialPage = historialQuery.data
  const historialList = useMemo(
    () => (Array.isArray(historialPage?.content) ? historialPage.content : []),
    [historialPage]
  )

  const historialAgrupado = useMemo(() => {
    const groups: { key: string; label: string; items: RegistroPorteria[] }[] =
      []
    for (const reg of historialList) {
      const key = dayKey(reg.fechaHoraSalida)
      let group = groups.find((g) => g.key === key)
      if (!group) {
        group = { key, label: dayLabel(reg.fechaHoraSalida), items: [] }
        groups.push(group)
      }
      group.items.push(reg)
    }
    return groups
  }, [historialList])

  const handleAnular = (registro: RegistroPorteria) => {
    setAnularTarget(registro)
    setMotivoAnulacion("")
  }

  const handleConfirmAnular = async () => {
    if (!anularTarget) return
    const motivo = motivoAnulacion.trim()
    try {
      await anularMutation.mutateAsync({
        id: anularTarget.id,
        data: motivo ? { motivo } : undefined,
      })
      setAnularTarget(null)
      setMotivoAnulacion("")
    } catch {
      // El toast de error ya se muestra en useAnularRegistroPorteriaMutation
    }
  }

  const isRefreshing = afueraQuery.isFetching || historialQuery.isFetching

  return (
    <PageShell layout="scroll" className="space-y-6 pb-8">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Control de Portería
            </h1>
            <p className="text-sm text-muted-foreground">
              Registro rápido de entradas y salidas de vehículos y conductores.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void navigate({ to: routes.gestionVehicular.reportes.porteria })
            }
          >
            <BookOpen className="mr-1.5 size-4 text-sky-600 dark:text-sky-400" />
            Reporte Bitácora
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            onClick={() => {
              void afueraQuery.refetch()
              void historialQuery.refetch()
            }}
          >
            <RefreshCw
              className={cn("mr-1.5 size-4", isRefreshing && "animate-spin")}
            />
            Actualizar
          </Button>
          <Button
            variant="outline"
            className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
            onClick={() => openRegistroDialog("ENTRADA")}
          >
            <LogIn className="mr-1.5 size-4" />
            Registrar entrada
          </Button>
          <Button onClick={() => openRegistroDialog("SALIDA")}>
            <LogOut className="mr-1.5 size-4" />
            Registrar salida
          </Button>
        </div>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="En curso (pendientes)"
          value={afueraList.length}
          hint={`${salidasPendientes} salida(s) · ${entradasPendientes} entrada(s)`}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Registros prolongados"
          value={prolongados}
          hint={`Más de ${UMBRAL_ALERTA_MIN / 60} horas en curso`}
          icon={AlertTriangle}
          tone="red"
        />
        <StatCard
          label="Total en historial"
          value={historialPage?.totalElements ?? 0}
          hint="Registros con los filtros actuales"
          icon={History}
          tone="sky"
        />
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "afuera" | "historial")}
      >
        <TabsList>
          <TabsTrigger value="afuera">
            <UserRound className="mr-1.5 size-4" />
            En curso
            <span className="ml-1.5 rounded-full bg-amber-500/15 px-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              {afueraList.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="historial">
            <History className="mr-1.5 size-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        {/* ── Afuera ahora ── */}
        <TabsContent value="afuera" className="mt-4 space-y-4">
          {afueraList.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 pr-8"
                placeholder="Filtrar por funcionario, externo, placa, destino, número, guardia o activo..."
                value={afueraSearch}
                onChange={(e) => setAfueraSearch(e.target.value)}
              />
              {afueraSearch && (
                <button
                  type="button"
                  onClick={() => setAfueraSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  title="Limpiar filtro"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          )}

          {afueraQuery.isLoading ? (
            <ListSkeleton />
          ) : afueraQuery.isError ? (
            <EmptyState
              bordered
              className="border-destructive/30 bg-destructive/5"
              icon={<AlertTriangle className="size-5.5 text-destructive" />}
              title="No se pudieron cargar los movimientos en curso"
              description={getErrorMessage(afueraQuery.error)}
              action={
                <Button
                  size="sm"
                  variant="outline"
                  disabled={afueraQuery.isFetching}
                  onClick={() => void afueraQuery.refetch()}
                >
                  <RefreshCw
                    className={cn(
                      "mr-1.5 size-4",
                      afueraQuery.isFetching && "animate-spin"
                    )}
                  />
                  Reintentar
                </Button>
              }
            />
          ) : afueraList.length === 0 ? (
            <EmptyState
              bordered
              icon={<CheckCircle2 className="size-5.5 text-emerald-500" />}
              title="No hay movimientos pendientes"
              description="Todos los vehículos y conductores completaron su ciclo o aún no hay registros en curso."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openRegistroDialog("ENTRADA")}
                  >
                    <LogIn className="mr-1.5 size-4" />
                    Registrar entrada
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openRegistroDialog("SALIDA")}
                  >
                    <LogOut className="mr-1.5 size-4" />
                    Registrar salida
                  </Button>
                </div>
              }
            />
          ) : afueraFiltrada.length === 0 ? (
            <EmptyState
              bordered
              icon={<Search className="size-5.5 text-muted-foreground/80" />}
              title="Sin coincidencias"
              description={`Ningún registro coincide con "${afueraSearch}".`}
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAfueraSearch("")}
                >
                  <RotateCcw className="mr-1.5 size-3.5" />
                  Limpiar búsqueda
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {afueraFiltrada.map((reg) => (
                <AfueraItem
                  key={reg.id}
                  registro={reg}
                  now={now}
                  onLlegada={() => setLlegadaTarget(reg)}
                  onAnular={() => handleAnular(reg)}
                  anulando={anularMutation.isPending}
                />
              ))}
            </ul>
          )}
        </TabsContent>

        {/* ── Historial ── */}
        <TabsContent value="historial" className="mt-4 space-y-4">
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9 pr-8"
                  placeholder="Buscar por funcionario, número, guardia, activo u observación..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(0)
                  }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("")
                      setPage(0)
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title="Limpiar búsqueda"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <Select
                value={tipoMovimientoFiltro}
                onValueChange={(val) => {
                  setTipoMovimientoFiltro(val ?? "ALL")
                  setPage(0)
                }}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Movimiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los tipos</SelectItem>
                  <SelectItem value="SALIDA">Salida</SelectItem>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={estadoFiltro}
                onValueChange={(val) => {
                  setEstadoFiltro(val ?? "ALL")
                  setPage(0)
                }}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="AFUERA">En curso</SelectItem>
                  <SelectItem value="COMPLETADO">Completado</SelectItem>
                  <SelectItem value="ANULADO">Anulado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Desde:</span>
                <Input
                  type="date"
                  className="h-8 w-36 text-xs"
                  value={fechaDesde}
                  onChange={(e) => {
                    setFechaDesde(e.target.value)
                    setPage(0)
                  }}
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Hasta:</span>
                <Input
                  type="date"
                  className="h-8 w-36 text-xs"
                  value={fechaHasta}
                  onChange={(e) => {
                    setFechaHasta(e.target.value)
                    setPage(0)
                  }}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={handleFiltrarHoy}
              >
                Hoy
              </Button>

              {hasActiveHistorialFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleClearHistorialFilters}
                >
                  <RotateCcw className="mr-1.5 size-3.5" />
                  Restablecer filtros
                </Button>
              )}
            </div>
          </div>

          {historialQuery.isLoading ? (
            <ListSkeleton rows={5} />
          ) : historialQuery.isError ? (
            <EmptyState
              bordered
              className="border-destructive/30 bg-destructive/5"
              icon={<AlertTriangle className="size-5.5 text-destructive" />}
              title="No se pudo cargar el historial de portería"
              description={getErrorMessage(historialQuery.error)}
              action={
                <Button
                  size="sm"
                  variant="outline"
                  disabled={historialQuery.isFetching}
                  onClick={() => void historialQuery.refetch()}
                >
                  <RefreshCw
                    className={cn(
                      "mr-1.5 size-4",
                      historialQuery.isFetching && "animate-spin"
                    )}
                  />
                  Reintentar
                </Button>
              }
            />
          ) : historialList.length === 0 ? (
            <EmptyState
              bordered
              icon={
                hasActiveHistorialFilters ? (
                  <Search className="size-5.5 text-muted-foreground/80" />
                ) : (
                  <ShieldCheck className="size-5.5 text-muted-foreground/80" />
                )
              }
              title={
                hasActiveHistorialFilters
                  ? "Sin coincidencias en el historial"
                  : "Sin registros en el historial"
              }
              description={
                hasActiveHistorialFilters
                  ? "No se encontraron registros que coincidan con los filtros aplicados."
                  : "No se encontraron registros con los filtros actuales."
              }
              action={
                hasActiveHistorialFilters ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearHistorialFilters}
                  >
                    <RotateCcw className="mr-1.5 size-3.5" />
                    Restablecer filtros
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="space-y-5">
                {historialAgrupado.map((group) => (
                  <section key={group.key} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-semibold text-foreground/80">
                        {group.label}
                      </h2>
                      <span className="text-xs text-muted-foreground">
                        {group.items.length} registro(s)
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                      {group.items.map((reg) => (
                        <HistorialItem key={reg.id} registro={reg} />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>

              {historialPage && historialPage.totalPages > 1 && (
                <Pagination page={historialPage} onPageChange={setPage} />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <RegistrarSalidaPorteriaDialog
        open={salidaOpen}
        onOpenChange={setSalidaOpen}
        initialTipoMovimiento={initialTipoMovimiento}
      />

      <RegistrarLlegadaPorteriaDialog
        open={Boolean(llegadaTarget)}
        onOpenChange={(open) => {
          if (!open) setLlegadaTarget(null)
        }}
        registro={llegadaTarget}
      />

      <AlertDialog
        open={Boolean(anularTarget)}
        onOpenChange={(open) => {
          if (!open && !anularMutation.isPending) {
            setAnularTarget(null)
            setMotivoAnulacion("")
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <AlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>
              Anular registro {anularTarget?.numero ?? ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              El registro pasará a estado anulado y dejará de figurar como movimiento en curso. Puedes indicar un motivo de anulación.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="porteria-motivo-anulacion" className="text-xs font-medium">
              Motivo de anulación{" "}
              <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="porteria-motivo-anulacion"
              rows={3}
              maxLength={500}
              placeholder="Ej. Registro duplicado o datos ingresados por error..."
              value={motivoAnulacion}
              onChange={(e) => setMotivoAnulacion(e.target.value)}
              disabled={anularMutation.isPending}
              className="resize-none text-xs"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={anularMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={anularMutation.isPending}
              onClick={() => void handleConfirmAnular()}
            >
              {anularMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Anulando…
                </>
              ) : (
                "Anular registro"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}

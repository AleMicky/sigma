import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  User,
  X,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { formatDate } from "@/shared/lib/format-date"
import { cn } from "@/shared/lib/utils"

import { conductorKeys } from "../api/conductor.keys"
import { conductorQueries } from "../api/conductor.queries"
import {
  listConductores,
  type Conductor,
  type ConductorLicencia,
} from "../api/conductor.service"

export type ConductorComboboxProps = {
  value?: string | null
  onValueChange?: (value: string, conductor?: Conductor | null) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  "aria-invalid"?: boolean
  pageSize?: number
  soloActivos?: boolean
  fechaSalida?: string | null
  fechaRetorno?: string | null
}

function getPrimaryLicencia(cond: Conductor): ConductorLicencia | null {
  const list = cond.licencias || []
  if (list.length === 0) return null
  return list.find((l) => l.estado === "VIGENTE") || list[0]
}

function getConductorNombre(cond: Conductor): string {
  const primary = getPrimaryLicencia(cond)
  if (cond.empleado?.nombreCompleto) {
    return cond.empleado.nombreCompleto
  }
  return primary
    ? `Conductor (Lic. ${primary.numeroLicencia})`
    : "Conductor registrado"
}

function getInitials(name: string): string {
  if (!name) return "CO"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function ConductorCombobox({
  value = "",
  onValueChange,
  onBlur,
  placeholder = "Buscar conductor por nombre o licencia…",
  disabled = false,
  className,
  id,
  name,
  "aria-invalid": ariaInvalid,
  pageSize = 7,
  soloActivos = true,
  fechaSalida,
  fechaRetorno,
}: ConductorComboboxProps) {
  const [page, setPage] = React.useState(0)
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search, 300)

  const hasDateRange = Boolean(fechaSalida && fechaRetorno)

  React.useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  // Consulta paginada estándar cuando no hay rango de fechas
  const queryParams = {
    page,
    size: pageSize,
    sortBy: "createdAt",
    direction: "DESC" as const,
    ...(soloActivos ? { activo: true, estado: "ACTIVO" } : {}),
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  }

  const standardQuery = useQuery({
    queryKey: conductorKeys.list(queryParams),
    queryFn: () => listConductores(queryParams),
    enabled: !hasDateRange,
  })

  // Consulta de disponibles cuando hay rango de fechas de solicitud
  const disponiblesQuery = useQuery({
    ...conductorQueries.disponibles(fechaSalida, fechaRetorno),
    enabled: hasDateRange,
  })

  // Consulta individual si hay un valor seleccionado que quizás no esté en la página actual
  const singleQuery = useQuery({
    ...conductorQueries.detail(value ?? ""),
    enabled: Boolean(value),
  })

  const query = hasDateRange ? disponiblesQuery : standardQuery

  const allConductores = React.useMemo(() => {
    if (hasDateRange) {
      const list = disponiblesQuery.data ?? []
      if (!debouncedSearch.trim()) return list
      const q = debouncedSearch.trim().toLowerCase()
      return list.filter((c) => {
        const nombre = (c.empleado?.nombreCompleto || "").toLowerCase()
        const matchName = nombre.includes(q)
        const matchLic = (c.licencias || []).some(
          (l) =>
            l.numeroLicencia.toLowerCase().includes(q) ||
            l.categoriaLicencia.toLowerCase().includes(q)
        )
        return matchName || matchLic
      })
    }
    return standardQuery.data?.content ?? []
  }, [hasDateRange, disponiblesQuery.data, standardQuery.data?.content, debouncedSearch])

  const totalElements = hasDateRange
    ? allConductores.length
    : standardQuery.data?.totalElements ?? allConductores.length

  const totalPages = hasDateRange
    ? Math.max(1, Math.ceil(allConductores.length / pageSize))
    : standardQuery.data?.totalPages ?? 1

  const pagedConductores = React.useMemo(() => {
    if (hasDateRange) {
      const start = page * pageSize
      return allConductores.slice(start, start + pageSize)
    }
    return allConductores
  }, [hasDateRange, allConductores, page, pageSize])

  const selectedConductor = React.useMemo(() => {
    if (!value) return null
    return (
      allConductores.find((c: Conductor) => c.id === value) ??
      (singleQuery.data?.id === value ? singleQuery.data : null)
    )
  }, [value, allConductores, singleQuery.data])

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    query.refetch()
  }

  // Si hay un conductor seleccionado, mostramos la tarjeta compacta
  if (selectedConductor) {
    const nombre = getConductorNombre(selectedConductor)
    const cargo = selectedConductor.empleado?.cargo || selectedConductor.empleado?.area
    const primaryLic = getPrimaryLicencia(selectedConductor)

    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-background/95 p-2 sm:p-2.5 min-h-11 shadow-2xs hover:border-primary/40 transition-all",
          ariaInvalid && "border-destructive ring-1 ring-destructive/20",
          className?.replace(/\bh-\S+/g, "")
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs border border-primary/20">
            <User className="size-4" />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span
                className="font-semibold text-xs text-foreground truncate"
                title={nombre}
              >
                {nombre}
              </span>
              {primaryLic && (
                <span className="text-[10.5px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded shrink-0">
                  Lic. {primaryLic.numeroLicencia} ({primaryLic.categoriaLicencia})
                </span>
              )}
            </div>
            {cargo ? (
              <div
                className="text-[11px] text-muted-foreground truncate"
                title={cargo}
              >
                {cargo}
              </div>
            ) : null}
          </div>
        </div>

        {/* Botón X para deseleccionar */}
        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              onValueChange?.("", null)
              setSearch("")
            }}
            className="size-6 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md shrink-0 cursor-pointer"
            title="Cambiar conductor seleccionado"
          >
            <X className="size-3.5" />
            <span className="sr-only">Remover selección</span>
          </Button>
        )}
      </div>
    )
  }

  // Si no hay seleccionado, mostramos el Combobox
  return (
    <Combobox
      items={pagedConductores}
      filter={() => true}
      itemToStringLabel={(item: Conductor) => {
        if (!item) return ""
        const primary = getPrimaryLicencia(item)
        return primary
          ? `${getConductorNombre(item)} Lic: ${primary.numeroLicencia} Cat: ${primary.categoriaLicencia}`
          : getConductorNombre(item)
      }}
      itemToStringValue={(item: Conductor) => item?.id ?? ""}
      value={null}
      onValueChange={(val: Conductor | null) => {
        onValueChange?.(val?.id ?? "", val)
        setSearch("")
      }}
      disabled={disabled || query.isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            query.isLoading && !query.data
              ? hasDateRange
                ? "Verificando disponibilidad de conductores..."
                : "Cargando conductores..."
              : placeholder
          }
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          className={cn("w-full shadow-2xs", className)}
        />
        {query.isFetching && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <ComboboxContent className="z-50 w-(--anchor-width) min-w-[min(100vw-2rem,var(--anchor-width))] max-w-[var(--anchor-width)] p-1 rounded-xl shadow-lg border border-border/80 bg-popover overflow-hidden flex flex-col">
        {/* Header con indicador y botón de recarga */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 text-[11px] text-muted-foreground bg-muted/30 select-none">
          <span className="font-medium truncate">
            {query.isFetching
              ? hasDateRange
                ? "Consultando conductores disponibles..."
                : "Buscando en servidor..."
              : debouncedSearch.trim()
                ? `Resultados (${totalElements} encontrados)`
                : hasDateRange
                  ? `Conductores disponibles (${totalElements})`
                  : `Conductores (${totalElements} registros)`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleRefresh}
            disabled={query.isFetching}
            title="Recargar lista de conductores"
            className="size-6 text-muted-foreground hover:text-foreground hover:bg-background/80"
          >
            <RefreshCw
              className={cn("size-3", query.isFetching && "animate-spin")}
            />
          </Button>
        </div>

        <ComboboxEmpty className="py-5 text-xs text-muted-foreground text-center">
          {query.isLoading
            ? "Buscando en el servidor..."
            : "No se encontraron conductores coincidentes."}
        </ComboboxEmpty>

        <ComboboxList className="max-h-52 overflow-y-auto overscroll-contain pr-1 py-1">
          {(item: Conductor) => {
            const nombre = getConductorNombre(item)
            const initials = getInitials(nombre)
            const cargo = item.empleado?.cargo || item.empleado?.area
            const primaryLic = getPrimaryLicencia(item)

            return (
              <ComboboxItem
                key={item.id}
                value={item}
                className="cursor-pointer py-2 px-2.5 rounded-lg hover:bg-accent/60 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-[10.5px] font-bold mt-0.5">
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="truncate text-xs font-semibold text-foreground">
                        {nombre}
                      </span>
                      {primaryLic && (
                        <span className="text-[10px] font-mono font-semibold bg-muted px-1.5 py-0.2 rounded border border-border/60">
                          Lic: {primaryLic.numeroLicencia} ({primaryLic.categoriaLicencia})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
                      {cargo && <span className="truncate">{cargo}</span>}
                      {primaryLic?.fechaVencimiento && (
                        <span className="inline-flex items-center gap-1 text-[10px] opacity-75">
                          <Calendar className="size-2.5" />
                          Vence: {formatDate(primaryLic.fechaVencimiento)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </ComboboxItem>
            )
          }}
        </ComboboxList>

        {/* Footer con controles de paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-1.5 border-t border-border/50 bg-muted/20 text-[11px] text-muted-foreground select-none">
            <span className="font-medium tabular-nums">
              Página {page + 1} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setPage((p) => Math.max(0, p - 1))
                }}
                disabled={page === 0 || query.isFetching}
                className="size-6 text-muted-foreground hover:text-foreground"
                title="Página anterior"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }}
                disabled={page >= totalPages - 1 || query.isFetching}
                className="size-6 text-muted-foreground hover:text-foreground"
                title="Página siguiente"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </ComboboxContent>
    </Combobox>
  )
}

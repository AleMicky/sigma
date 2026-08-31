import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Briefcase, ChevronLeft, ChevronRight, Loader2, RefreshCw, User, X } from "lucide-react"

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
import { cn } from "@/shared/lib/utils"

import { empleadoKeys } from "../api/empleado.keys"
import { empleadoQueries } from "../api/empleado.queries"
import {
  type Empleado,
  listEmpleados,
  listMisEmpleados,
} from "../api/empleado.service"

export type EmpleadoComboboxProps = {
  value?: string | null
  onValueChange?: (value: string, empleado?: Empleado | null) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  "aria-invalid"?: boolean
  pageSize?: number
  onlyMisEmpleados?: boolean
}

function getEmpleadoNombre(emp: Empleado): string {
  return (
    emp.personaInfo?.nombreCompleto ||
    emp.personaNombreCompleto ||
    `Empleado (${emp.codigo})`
  )
}

function getInitials(name: string): string {
  if (!name) return "EM"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function EmpleadoCombobox({
  value = "",
  onValueChange,
  onBlur,
  placeholder = "Buscar empleado por nombre o código…",
  disabled = false,
  className,
  id,
  name,
  "aria-invalid": ariaInvalid,
  pageSize = 7,
  onlyMisEmpleados = false,
}: EmpleadoComboboxProps) {
  const [page, setPage] = React.useState(0)
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search, 300)

  React.useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const queryParams = {
    page,
    size: pageSize,
    sortBy: "codigo",
    direction: "ASC" as const,
    ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
  }

  const query = useQuery({
    queryKey: onlyMisEmpleados
      ? empleadoKeys.misEmpleados(queryParams)
      : empleadoKeys.list(queryParams),
    queryFn: () =>
      onlyMisEmpleados
        ? listMisEmpleados(queryParams)
        : listEmpleados(queryParams),
  })

  // Consulta individual si hay un valor seleccionado que quizás no esté en la página actual
  const singleQuery = useQuery({
    ...empleadoQueries.detail(value ?? ""),
    enabled: Boolean(value),
  })

  const empleados = React.useMemo(
    () => query.data?.content ?? [],
    [query.data?.content],
  )
  const totalPages = query.data?.totalPages ?? 1
  const totalElements = query.data?.totalElements ?? empleados.length

  const selectedEmpleado = React.useMemo(() => {
    if (!value) return null
    return (
      empleados.find((e: Empleado) => e.id === value) ??
      (singleQuery.data?.id === value ? singleQuery.data : null)
    )
  }, [value, empleados, singleQuery.data])

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    query.refetch()
  }

  // Si hay un empleado seleccionado, mostramos solo nombre y cargo de forma limpia y compacta
  if (selectedEmpleado) {
    const nombre = getEmpleadoNombre(selectedEmpleado)
    const cargo = selectedEmpleado.cargoInfo?.nombre || selectedEmpleado.cargoNombre

    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-xl border border-border/80 bg-background/95 px-2.5 py-1.5 min-h-8.5 shadow-2xs hover:border-primary/40 transition-all",
          ariaInvalid && "border-destructive ring-1 ring-destructive/20",
          className,
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-[10px] border border-primary/20">
            <User className="size-3.5" />
          </div>

          <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
            <div className="font-semibold text-xs text-foreground truncate leading-snug" title={nombre}>
              {nombre}
            </div>
            {cargo ? (
              <div className="text-[11px] text-muted-foreground truncate leading-snug" title={cargo}>
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
            title="Cambiar empleado seleccionado"
          >
            <X className="size-3.5" />
            <span className="sr-only">Remover selección</span>
          </Button>
        )}
      </div>
    )
  }

  // Si no hay seleccionado, mostramos el Autocomplete Combobox
  return (
    <Combobox
      items={empleados}
      filter={() => true}
      itemToStringLabel={(item: Empleado) =>
        item ? `${getEmpleadoNombre(item)} [${item.codigo}]` : ""
      }
      itemToStringValue={(item: Empleado) => item?.id ?? ""}
      value={null}
      onValueChange={(val: Empleado | null) => {
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
          placeholder={query.isLoading && !query.data ? "Cargando personal..." : placeholder}
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
              ? "Buscando en servidor..."
              : debouncedSearch.trim()
                ? `Resultados (${totalElements} encontrados)`
                : `Personal (${totalElements} registros)`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleRefresh}
            disabled={query.isFetching}
            title="Recargar lista de personal"
            className="size-6 text-muted-foreground hover:text-foreground hover:bg-background/80"
          >
            <RefreshCw className={cn("size-3", query.isFetching && "animate-spin")} />
          </Button>
        </div>

        <ComboboxEmpty className="py-5 text-xs text-muted-foreground text-center">
          {query.isLoading
            ? "Buscando en el servidor..."
            : "No se encontraron empleados coincidentes."}
        </ComboboxEmpty>

        <ComboboxList className="max-h-52 overflow-y-auto overscroll-contain pr-1 py-1">
          {(item: Empleado) => {
            const nombre = getEmpleadoNombre(item)
            const cargo = item.cargoInfo?.nombre || item.cargoNombre
            const area = item.areaInfo?.nombre || item.areaNombre
            const initials = getInitials(nombre)

            return (
              <ComboboxItem
                key={item.id}
                value={item}
                className="cursor-pointer py-2 px-2.5 rounded-lg hover:bg-accent/60 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-[10px] font-bold mt-0.5">
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="truncate text-xs font-semibold text-foreground">
                        {nombre}
                      </span>
                      <code className="text-[10px] text-muted-foreground bg-muted px-1 rounded font-mono">
                        {item.codigo}
                      </code>
                    </div>
                    {cargo || area ? (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5 truncate">
                        <Briefcase className="size-3 shrink-0 opacity-70" />
                        <span className="truncate">
                          {[cargo, area].filter(Boolean).join(" • ")}
                        </span>
                      </div>
                    ) : null}
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

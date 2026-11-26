import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, Loader2, RefreshCw, X } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { http } from "@/shared/api/http"
import { cn } from "@/shared/lib/utils"

interface WorkflowRestLicencia {
  estado?: string | null
  numeroLicencia?: string | null
  categoriaLicencia?: string | null
}

export interface WorkflowRestRecord {
  id?: string | number | null
  value?: string | number | null
  codigo?: string | null
  placa?: string | null
  empleadoId?: string | number | null
  empleado?: {
    id?: string | number | null
    codigo?: string | null
    nombreCompleto?: string | null
    cargo?: string | null
    area?: string | null
    urlImagen?: string | null
    foto?: string | null
  } | null
  personaInfo?: {
    nombreCompleto?: string | null
    foto?: string | null
    fotoUrl?: string | null
  } | null
  personaNombreCompleto?: string | null
  nombreCompleto?: string | null
  denominacion?: string | null
  nombre?: string | null
  name?: string | null
  username?: string | null
  titulo?: string | null
  descripcion?: string | null
  label?: string | null
  cargoInfo?: { nombre?: string | null } | null
  cargoNombre?: string | null
  cargo?: string | null
  areaInfo?: { nombre?: string | null } | null
  areaNombre?: string | null
  area?: string | null
  email?: string | null
  urlImagen?: string | null
  foto?: string | null
  fotoUrl?: string | null
  imagen?: string | null
  avatar?: string | null
  avatarUrl?: string | null
  licencias?: WorkflowRestLicencia[] | null
  [key: string]: unknown
}

export type WorkflowRestOption = WorkflowRestRecord | string

function isWorkflowRestRecord(item: unknown): item is WorkflowRestRecord {
  return typeof item === "object" && item !== null
}

function extractRestItems(payload: unknown): WorkflowRestOption[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload as WorkflowRestOption[]

  if (isWorkflowRestRecord(payload)) {
    if (Array.isArray(payload.data)) {
      return payload.data as WorkflowRestOption[]
    }
    if (
      isWorkflowRestRecord(payload.data) &&
      Array.isArray(payload.data.content)
    ) {
      return payload.data.content as WorkflowRestOption[]
    }
    if (Array.isArray(payload.content)) {
      return payload.content as WorkflowRestOption[]
    }
  }

  return []
}

export type WorkflowRestSelectProps = {
  url: string
  params?: Record<string, string>
  value?: string | null
  fieldId?: string
  valueField?: string
  onValueChange?: (value: string, item?: WorkflowRestOption | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  "aria-invalid"?: boolean
}

export function getItemLabel(item: WorkflowRestOption | null | undefined): string {
  if (!item) return ""
  if (typeof item === "string") return item

  const codigo =
    item.codigo ||
    item.empleado?.codigo ||
    item.placa ||
    ""
  const prefix = codigo ? `[${codigo}] ` : ""

  const nombre =
    item.empleado?.nombreCompleto ||
    item.personaInfo?.nombreCompleto ||
    item.personaNombreCompleto ||
    item.nombreCompleto ||
    item.denominacion ||
    item.nombre ||
    item.name ||
    item.username ||
    item.titulo ||
    item.descripcion ||
    item.label ||
    ""

  const extra =
    item.cargoInfo?.nombre ||
    item.cargoNombre ||
    item.cargo ||
    item.empleado?.cargo ||
    item.areaInfo?.nombre ||
    item.areaNombre ||
    item.empleado?.area ||
    item.email ||
    ""

  if (!nombre && item.id) {
    return String(item.id)
  }

  if (extra && extra !== nombre) {
    return `${prefix}${nombre} (${extra})`
  }
  return `${prefix}${nombre}`
}

export function getItemImage(item: WorkflowRestOption | null | undefined): string | null {
  if (!isWorkflowRestRecord(item)) return null
  return (
    item.urlImagen ||
    item.foto ||
    item.fotoUrl ||
    item.imagen ||
    item.avatar ||
    item.avatarUrl ||
    item.empleado?.urlImagen ||
    item.empleado?.foto ||
    item.personaInfo?.foto ||
    item.personaInfo?.fotoUrl ||
    null
  )
}

export function getItemInitials(name: string): string {
  if (!name) return "??"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.trim().slice(0, 2).toUpperCase() || "??"
}

export function getItemSecondaryText(item: WorkflowRestOption | null | undefined): string | null {
  if (!isWorkflowRestRecord(item)) return null

  const parts: string[] = []

  const cargo =
    item.cargoInfo?.nombre ||
    item.cargoNombre ||
    item.cargo ||
    item.empleado?.cargo

  const area =
    item.areaInfo?.nombre ||
    item.areaNombre ||
    item.area ||
    item.empleado?.area

  if (cargo) parts.push(cargo)
  if (area && area !== cargo) parts.push(area)

  if (Array.isArray(item.licencias) && item.licencias.length > 0) {
    const lic =
      item.licencias.find((l) => l.estado === "VIGENTE") || item.licencias[0]
    if (lic?.numeroLicencia) {
      parts.push(
        `Lic: ${lic.numeroLicencia}${lic.categoriaLicencia ? ` (${lic.categoriaLicencia})` : ""}`,
      )
    }
  }

  return parts.length > 0 ? parts.join(" • ") : null
}

export function getItemId(
  item: WorkflowRestOption | null | undefined,
  fieldId?: string,
  valueField?: string,
): string {
  if (!item) return ""
  if (typeof item === "string") return item

  if (valueField && item[valueField] !== undefined) {
    return String(item[valueField])
  }

  // Si el campo objetivo es para un empleado/responsable (e.g. responsableId, empleadoId)
  // y el objeto viene de /conductores, el ID que requiere la entidad Empleado es empleadoId
  const isEmpleadoTarget =
    Boolean(fieldId) &&
    (fieldId!.toLowerCase().includes("responsable") ||
      fieldId!.toLowerCase().includes("empleado"))

  if (isEmpleadoTarget && (item.empleadoId || item.empleado?.id)) {
    return String(item.empleadoId || item.empleado?.id)
  }

  return String(item.id ?? item.value ?? item.codigo ?? "")
}

function getItemDisplayName(item: WorkflowRestOption): string {
  if (typeof item === "string") return item
  return (
    item.empleado?.nombreCompleto ||
    item.personaInfo?.nombreCompleto ||
    item.personaNombreCompleto ||
    item.nombreCompleto ||
    item.denominacion ||
    item.nombre ||
    item.name ||
    item.label ||
    getItemLabel(item)
  )
}

function matchesItemValue(
  item: WorkflowRestOption,
  value: string,
  fieldId?: string,
  valueField?: string,
): boolean {
  const idVal = getItemId(item, fieldId, valueField)
  if (idVal === value) return true
  if (!isWorkflowRestRecord(item)) return false

  return (
    String(item.id) === value ||
    Boolean(item.empleadoId && String(item.empleadoId) === value) ||
    Boolean(item.empleado?.id && String(item.empleado.id) === value)
  )
}

export function WorkflowRestSelect({
  url,
  params = {},
  value = "",
  fieldId,
  valueField,
  onValueChange,
  placeholder = "Seleccionar opción...",
  disabled = false,
  className,
  id,
  name,
  "aria-invalid": ariaInvalid,
}: WorkflowRestSelectProps) {
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search, 300)

  const queryParams = React.useMemo(() => {
    const p: Record<string, string | number> = {
      page: 0,
      size: 50,
      ...params,
    }
    if (debouncedSearch.trim()) {
      p.q = debouncedSearch.trim()
      p.search = debouncedSearch.trim()
    }
    return p
  }, [params, debouncedSearch])

  const normalizedUrl = React.useMemo(() => {
    if (!url) return ""
    let formatted = url.trim()
    if (formatted.startsWith("/api/v1/")) {
      formatted = formatted.substring(7)
    } else if (formatted.startsWith("api/v1/")) {
      formatted = "/" + formatted.substring(7)
    }
    return formatted
  }, [url])

  const query = useQuery({
    queryKey: ["workflow-rest-select", normalizedUrl, queryParams],
    queryFn: async () => {
      const data = await http.get<unknown>(normalizedUrl, { params: queryParams })
      return extractRestItems(data)
    },
    enabled: Boolean(normalizedUrl),
    staleTime: 1000 * 60 * 2,
  })

  const items: WorkflowRestOption[] = React.useMemo(
    () => query.data ?? [],
    [query.data],
  )

  const selectedItem = React.useMemo(() => {
    if (!value) return null
    return (
      items.find((i) => matchesItemValue(i, value, fieldId, valueField)) ?? null
    )
  }, [value, items, fieldId, valueField])

  // Si hay un valor seleccionado, mostramos card detallada con avatar/foto y opción de cambiar selección
  if (selectedItem) {
    const rawNombre = getItemDisplayName(selectedItem)
    const imgUrl = getItemImage(selectedItem)
    const initials = getItemInitials(rawNombre)
    const secondary = getItemSecondaryText(selectedItem)

    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-background/95 p-2 sm:p-2.5 min-h-11 shadow-2xs hover:border-primary/40 transition-all",
          ariaInvalid && "border-destructive ring-1 ring-destructive/20",
          className,
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative size-8 shrink-0 rounded-lg overflow-hidden border border-border/70 shadow-2xs bg-muted flex items-center justify-center">
            {imgUrl ? (
              <AuthenticatedImage
                src={imgUrl}
                alt={rawNombre}
                className="size-full object-cover"
                fallbackClassName="size-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs"
                fallback={<span>{initials}</span>}
              />
            ) : (
              <div className="size-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                <span>{initials}</span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="font-semibold text-xs text-foreground truncate block" title={rawNombre}>
              {rawNombre}
            </span>
            {secondary && (
              <p className="text-[11px] text-muted-foreground truncate" title={secondary}>
                {secondary}
              </p>
            )}
          </div>
        </div>

        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onValueChange?.("", null)}
            className="size-6 text-muted-foreground hover:text-foreground rounded-md shrink-0 cursor-pointer"
            title="Cambiar selección"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <Combobox
      items={items}
      filter={() => true}
      itemToStringLabel={(item: WorkflowRestOption | null) => getItemLabel(item)}
      itemToStringValue={(item: WorkflowRestOption | null) =>
        getItemId(item, fieldId, valueField)
      }
      value={null}
      onValueChange={(val: WorkflowRestOption | null) => {
        onValueChange?.(getItemId(val, fieldId, valueField), val)
        setSearch("")
      }}
      disabled={disabled || query.isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={query.isLoading && !query.data ? "Cargando opciones..." : placeholder}
          aria-invalid={ariaInvalid}
          className={cn("w-full shadow-2xs text-xs h-9 bg-background", className)}
        />
        {query.isFetching && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <ComboboxContent className="z-50 w-(--anchor-width) min-w-[min(100vw-2rem,var(--anchor-width))] max-w-(--anchor-width) p-1 rounded-xl shadow-lg border border-border/80 bg-popover overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-2.5 py-1 border-b border-border/50 text-[11px] text-muted-foreground bg-muted/30 select-none">
          <span className="font-medium truncate">
            {query.isFetching
              ? "Buscando en servidor..."
              : `Opciones (${items.length} encontradas)`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.preventDefault()
              query.refetch()
            }}
            disabled={query.isFetching}
            className="size-5 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("size-2.5", query.isFetching && "animate-spin")} />
          </Button>
        </div>

        <ComboboxEmpty className="py-4 text-xs text-muted-foreground text-center">
          {query.isLoading ? "Cargando datos..." : "No se encontraron resultados."}
        </ComboboxEmpty>

        <ComboboxList className="max-h-56 overflow-y-auto overscroll-contain pr-1 py-1 space-y-1">
          {(item: WorkflowRestOption) => {
            const rawNombre = getItemDisplayName(item)
            const itemId = getItemId(item, fieldId, valueField)
            const imgUrl = getItemImage(item)
            const initials = getItemInitials(rawNombre)
            const secondary = getItemSecondaryText(item)
            const isSelected = Boolean(
              value && matchesItemValue(item, value, fieldId, valueField),
            )
            const fallbackKey = isWorkflowRestRecord(item)
              ? String(item.id ?? rawNombre)
              : item

            return (
              <ComboboxItem
                key={itemId || fallbackKey}
                value={item}
                className="cursor-pointer py-1.5 px-2 rounded-lg hover:bg-accent/60 transition-colors flex items-center justify-between text-xs gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative size-7.5 shrink-0 rounded-lg overflow-hidden border border-border/70 shadow-2xs bg-muted flex items-center justify-center">
                    {imgUrl ? (
                      <AuthenticatedImage
                        src={imgUrl}
                        alt={rawNombre}
                        className="size-full object-cover"
                        fallbackClassName="size-full flex items-center justify-center bg-primary/10 text-primary text-[10.5px] font-bold"
                        fallback={<span>{initials}</span>}
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center bg-primary/10 text-primary text-[10.5px] font-bold">
                        <span>{initials}</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col">
                    <span className="font-semibold text-foreground truncate">
                      {rawNombre}
                    </span>
                    {secondary && (
                      <span className="text-[10.5px] text-muted-foreground truncate">
                        {secondary}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && <Check className="size-3.5 text-primary shrink-0 ml-2" />}
              </ComboboxItem>
            )
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Briefcase, Building, Loader2, X } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import { cn } from "@/shared/lib/utils"

import { empleadoQueries } from "../api/empleado.queries"
import type { Empleado } from "../api/empleado.service"

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
}: EmpleadoComboboxProps) {
  const query = useQuery({
    ...empleadoQueries.list({ size: 100, sortBy: "codigo", direction: "ASC" }),
  })

  const empleados = React.useMemo(
    () => query.data?.content ?? [],
    [query.data?.content],
  )

  const selectedEmpleado = React.useMemo(() => {
    if (!value) return null
    return empleados.find((e) => e.id === value) ?? null
  }, [value, empleados])

  // Si hay un empleado seleccionado, mostramos la tarjeta idéntica a la imagen de referencia
  if (selectedEmpleado) {
    const nombre = getEmpleadoNombre(selectedEmpleado)
    const cargo = selectedEmpleado.cargoInfo?.nombre || selectedEmpleado.cargoNombre
    const area = selectedEmpleado.areaInfo?.nombre || selectedEmpleado.areaNombre
    const initials = getInitials(nombre)

    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-muted/20 p-2.5 sm:p-3 shadow-2xs hover:border-primary/40 transition-all",
          ariaInvalid && "border-destructive ring-1 ring-destructive/20",
          className,
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar con iniciales */}
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary font-bold text-sm border border-primary/20 shadow-2xs">
            {initials}
          </div>

          {/* Información del Empleado */}
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <code className="text-[11px] font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                {selectedEmpleado.codigo}
              </code>
              <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                {nombre}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground truncate">
              {cargo ? (
                <div className="flex items-center gap-1 text-muted-foreground truncate">
                  <Briefcase className="size-3 text-primary shrink-0" />
                  <span className="truncate">{cargo}</span>
                </div>
              ) : null}

              {cargo && area ? (
                <span className="text-muted-foreground/40 font-bold">•</span>
              ) : null}

              {area ? (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground bg-background/80 shrink-0"
                >
                  <Building className="size-2.5 mr-1 text-muted-foreground/70" />
                  <span className="truncate">{area}</span>
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        {/* Botón X para deseleccionar */}
        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onValueChange?.("", null)}
            className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded-lg shrink-0 cursor-pointer"
            title="Cambiar empleado seleccionado"
          >
            <X className="size-4" />
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
      itemToStringLabel={(item: Empleado) =>
        item ? `${getEmpleadoNombre(item)} [${item.codigo}]` : ""
      }
      itemToStringValue={(item: Empleado) => item?.id ?? ""}
      value={null}
      onValueChange={(val: Empleado | null) => {
        onValueChange?.(val?.id ?? "", val)
      }}
      disabled={disabled || query.isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          placeholder={query.isLoading ? "Cargando empleados..." : placeholder}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          className={cn("w-full shadow-2xs", className)}
        />
        {query.isLoading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <ComboboxContent className="z-50 max-h-64 min-w-[320px] p-1 rounded-xl shadow-lg border border-border/80">
        <ComboboxEmpty className="py-4 text-xs text-muted-foreground text-center">
          {query.isLoading
            ? "Cargando empleados..."
            : "No se encontraron empleados coincidentes."}
        </ComboboxEmpty>
        <ComboboxList>
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
      </ComboboxContent>
    </Combobox>
  )
}

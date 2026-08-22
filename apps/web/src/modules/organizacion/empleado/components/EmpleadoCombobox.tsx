import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Briefcase, Loader2, User } from "lucide-react"

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

function getEmpleadoDisplayName(emp: Empleado): string {
  const nombre =
    emp.personaInfo?.nombreCompleto ||
    emp.personaNombreCompleto ||
    `Empleado (${emp.codigo})`
  return `${nombre} [${emp.codigo}]`
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

  const empleados = React.useMemo(() => query.data?.content ?? [], [query.data?.content])

  const selectedEmpleado = React.useMemo(() => {
    if (!value) return null
    return empleados.find((e) => e.id === value) ?? null
  }, [value, empleados])

  return (
    <Combobox
      items={empleados}
      itemToStringLabel={(item: Empleado) =>
        item ? getEmpleadoDisplayName(item) : ""
      }
      itemToStringValue={(item: Empleado) => item?.id ?? ""}
      value={selectedEmpleado}
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
          showClear={Boolean(value)}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          className={cn("w-full", className)}
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
            const nombre =
              item.personaInfo?.nombreCompleto ||
              item.personaNombreCompleto ||
              `Empleado (${item.codigo})`
            const cargo = item.cargoInfo?.nombre || item.cargoNombre
            const area = item.areaInfo?.nombre || item.areaNombre

            return (
              <ComboboxItem
                key={item.id}
                value={item}
                className="cursor-pointer py-2 px-2.5 rounded-lg hover:bg-accent/60 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs mt-0.5">
                    <User className="size-3.5" />
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

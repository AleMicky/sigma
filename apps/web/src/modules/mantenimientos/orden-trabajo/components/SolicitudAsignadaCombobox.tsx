import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, Loader2, X } from "lucide-react"

import { solicitudQueries } from "@/modules/mantenimientos/solicitud/api/solicitud.queries"
import type { SolicitudMantenimiento } from "@/modules/mantenimientos/solicitud/api/solicitud.service"
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

export type SolicitudAsignadaComboboxProps = {
  value?: string | null
  onValueChange?: (
    value: string,
    solicitud?: SolicitudMantenimiento | null,
  ) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  "aria-invalid"?: boolean
}

export function SolicitudAsignadaCombobox({
  value = "",
  onValueChange,
  onBlur,
  placeholder = "Buscar solicitud por código o título…",
  disabled = false,
  className,
  id,
  name,
  "aria-invalid": ariaInvalid,
}: SolicitudAsignadaComboboxProps) {
  const query = useQuery(
    solicitudQueries.list({ size: 100, sortBy: "createdAt", direction: "DESC" }),
  )

  const solicitudes = React.useMemo(
    () => query.data?.content ?? [],
    [query.data?.content],
  )

  const selectedSolicitud = React.useMemo(() => {
    if (!value) return null
    return solicitudes.find((s) => s.id === value) ?? null
  }, [value, solicitudes])

  if (selectedSolicitud) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-muted/20 p-2.5 shadow-2xs hover:border-primary/40 transition-all",
          ariaInvalid && "border-destructive ring-1 ring-destructive/20",
          className,
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-500/30">
            <FileText className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <code className="text-[11px] font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                {selectedSolicitud.numero || "SM"}
              </code>
              <span className="font-semibold text-xs text-foreground truncate">
                {selectedSolicitud.titulo}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {selectedSolicitud.activo?.codigo} - {selectedSolicitud.activo?.nombre} ({selectedSolicitud.estado})
            </p>
          </div>
        </div>

        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onValueChange?.("", null)}
            className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded-lg shrink-0 cursor-pointer"
            title="Cambiar solicitud seleccionada"
          >
            <X className="size-3.5" />
            <span className="sr-only">Remover selección</span>
          </Button>
        )}
      </div>
    )
  }

  return (
    <Combobox
      items={solicitudes}
      itemToStringLabel={(item: SolicitudMantenimiento) =>
        item ? `${item.numero || ""} - ${item.titulo}` : ""
      }
      itemToStringValue={(item: SolicitudMantenimiento) => item?.id ?? ""}
      value={null}
      onValueChange={(val: SolicitudMantenimiento | null) => {
        onValueChange?.(val?.id ?? "", val)
      }}
      disabled={disabled || query.isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          placeholder={
            query.isLoading ? "Cargando solicitudes..." : placeholder
          }
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          className={cn("w-full text-xs shadow-2xs", className)}
        />
        {query.isLoading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <ComboboxContent className="z-50 max-h-60 min-w-[320px] p-1 rounded-xl shadow-lg border border-border/80">
        <ComboboxEmpty className="py-3 text-xs text-muted-foreground text-center">
          {query.isLoading
            ? "Cargando solicitudes..."
            : "No se encontraron solicitudes coincidentes."}
        </ComboboxEmpty>
        <ComboboxList>
          {(item: SolicitudMantenimiento) => (
            <ComboboxItem
              key={item.id}
              value={item}
              className="cursor-pointer py-1.5 px-2 rounded-lg hover:bg-accent/60 transition-colors"
            >
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <code className="text-[10px] font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                    {item.numero || "SM"}
                  </code>
                  <span className="truncate text-xs font-semibold text-foreground">
                    {item.titulo}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <span>{item.activo?.codigo} - {item.activo?.nombre}</span>
                  <span>•</span>
                  <span className="font-medium text-sky-600 dark:text-sky-400">{item.estado}</span>
                </div>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

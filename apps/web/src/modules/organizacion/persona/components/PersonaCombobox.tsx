import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, Loader2, Mail, Phone, X } from "lucide-react"

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

import { personaQueries } from "../api/persona.queries"
import type { Persona } from "../api/persona.service"

export type PersonaComboboxProps = {
  value?: string | null
  onValueChange?: (value: string, persona?: Persona | null) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  "aria-invalid"?: boolean
}

function getPersonaNombre(p: Persona): string {
  return [p.nombres, p.primerApellido, p.segundoApellido]
    .filter(Boolean)
    .join(" ")
}

function getInitials(name: string): string {
  if (!name) return "PE"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function PersonaCombobox({
  value = "",
  onValueChange,
  onBlur,
  placeholder = "Buscar persona por nombre o documento…",
  disabled = false,
  className,
  id,
  name,
  "aria-invalid": ariaInvalid,
}: PersonaComboboxProps) {
  const query = useQuery({
    ...personaQueries.list({ size: 100, sortBy: "nombres", direction: "ASC" }),
  })

  const personas = React.useMemo(
    () => query.data?.content ?? [],
    [query.data?.content],
  )

  const selectedPersona = React.useMemo(() => {
    if (!value) return null
    return personas.find((p) => p.id === value) ?? null
  }, [value, personas])

  // Tarjeta compacta cuando una persona está seleccionada
  if (selectedPersona) {
    const nombre = getPersonaNombre(selectedPersona)
    const initials = getInitials(nombre)
    const documento = `${selectedPersona.tipoDocumento}: ${selectedPersona.numeroDocumento}${selectedPersona.complemento ? `-${selectedPersona.complemento}` : ""}`

    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2.5 rounded-lg border border-border/80 bg-background px-2.5 py-1.5 shadow-2xs hover:border-primary/40 transition-all",
          ariaInvalid && "border-destructive ring-1 ring-destructive/20",
          className,
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Avatar compacto */}
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-xs border border-primary/20">
            {initials}
          </div>

          {/* Información */}
          <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xs text-foreground truncate">
              {nombre}
            </span>
            <Badge
              variant="outline"
              className="font-mono text-[10px] px-1.5 py-0 font-normal bg-muted text-muted-foreground shrink-0 h-4"
            >
              <FileText className="size-2.5 mr-1" />
              {documento}
            </Badge>

            {selectedPersona.correo ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                <Mail className="size-2.5 opacity-70" />
                <span className="truncate max-w-[140px]">{selectedPersona.correo}</span>
              </span>
            ) : null}

            {selectedPersona.telefono ? (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Phone className="size-2.5 opacity-70" />
                <span>{selectedPersona.telefono}</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Botón remover */}
        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onValueChange?.("", null)}
            className="size-6 text-muted-foreground hover:text-foreground hover:bg-muted rounded shrink-0 cursor-pointer"
            title="Cambiar persona"
          >
            <X className="size-3.5" />
            <span className="sr-only">Remover selección</span>
          </Button>
        )}
      </div>
    )
  }

  // Combobox Input
  return (
    <Combobox
      items={personas}
      itemToStringLabel={(item: Persona) =>
        item
          ? `${getPersonaNombre(item)} (${item.tipoDocumento}: ${item.numeroDocumento}${item.complemento ? `-${item.complemento}` : ""})`
          : ""
      }
      itemToStringValue={(item: Persona) => item?.id ?? ""}
      value={null}
      onValueChange={(val: Persona | null) => {
        onValueChange?.(val?.id ?? "", val)
      }}
      disabled={disabled || query.isLoading}
    >
      <div className="relative w-full">
        <ComboboxInput
          id={id}
          name={name}
          placeholder={query.isLoading ? "Cargando personas..." : placeholder}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          className={cn("w-full shadow-2xs text-xs bg-background", className)}
        />
        {query.isLoading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <ComboboxContent className="z-50 max-h-56 min-w-[300px] p-1 rounded-lg shadow-lg border border-border/80">
        <ComboboxEmpty className="py-3 text-xs text-muted-foreground text-center">
          {query.isLoading
            ? "Cargando personas..."
            : "No se encontraron personas."}
        </ComboboxEmpty>
        <ComboboxList>
          {(item: Persona) => {
            const nombre = getPersonaNombre(item)
            const initials = getInitials(nombre)
            const documento = `${item.tipoDocumento}: ${item.numeroDocumento}${item.complemento ? `-${item.complemento}` : ""}`

            return (
              <ComboboxItem
                key={item.id}
                value={item}
                className="cursor-pointer py-1.5 px-2 rounded-md hover:bg-accent/60 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary text-[10px] font-bold">
                    {initials}
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
                    <span className="truncate text-xs font-medium text-foreground">
                      {nombre}
                    </span>
                    <code className="text-[10px] text-muted-foreground bg-muted px-1 rounded font-mono">
                      {documento}
                    </code>
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

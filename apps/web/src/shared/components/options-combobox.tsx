import * as React from "react"

import { cn } from "@/shared/lib/utils"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"

export type OptionsComboboxOption = {
  value: string
  label: string
  disabled?: boolean
  keywords?: string[]
}

export type OptionsComboboxProps = {
  options: OptionsComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
  id?: string
  name?: string
  disabled?: boolean
  className?: string
  showClear?: boolean
  emptyMessage?: string
  size?: "sm" | "default"
  renderOption?: (option: OptionsComboboxOption) => React.ReactNode
  renderValue?: (option: OptionsComboboxOption) => React.ReactNode
  onBlur?: () => void
  "aria-invalid"?: boolean
}

/** Normalización simple para búsqueda case-insensitive y tolerante a acentos. */
function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim()
}

export function OptionsCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar…",
  ariaLabel,
  id,
  name,
  disabled = false,
  className,
  showClear = false,
  emptyMessage = "No se encontraron opciones",
  size = "default",
  renderOption,
  renderValue,
  onBlur,
  "aria-invalid": ariaInvalid,
}: OptionsComboboxProps) {
  const [isFocused, setIsFocused] = React.useState(false)

  // Si el valor no pertenece al catálogo se muestra crudo (o vacío) sin romper.
  const selectedOption = React.useMemo<OptionsComboboxOption | null>(() => {
    if (!value) return null
    return options.find((option) => option.value === value) ?? { value, label: value }
  }, [options, value])

  const filter = React.useCallback(
    (option: OptionsComboboxOption, query: string) => {
      const normalizedQuery = normalizeSearch(query)
      if (!normalizedQuery) return true
      if (normalizeSearch(option.label).includes(normalizedQuery)) return true
      return (option.keywords ?? []).some((keyword) =>
        normalizeSearch(keyword).includes(normalizedQuery),
      )
    },
    [],
  )

  const handleBlur = React.useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  const compact = size === "sm"
  const showCustomValue = Boolean(renderValue && selectedOption && !isFocused)

  return (
    <Combobox
      name={name}
      items={options}
      value={selectedOption}
      onValueChange={(next) => onValueChange(next?.value ?? "")}
      itemToStringLabel={(option) => option?.label ?? ""}
      itemToStringValue={(option) => option?.value ?? ""}
      filter={filter}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        showClear={showClear && Boolean(value)}
        className={cn(
          "w-full rounded-xl border border-border/80 bg-card shadow-2xs transition-colors",
          "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",
          "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive/20",
          compact
            ? "h-9 text-xs [&>input]:h-full [&>input]:px-2.5 [&>input]:text-xs md:[&>input]:text-xs"
            : "h-10 text-sm [&>input]:h-full [&>input]:px-2.5 [&>input]:text-sm",
          showCustomValue && "[&>input]:text-transparent",
          className,
        )}
      >
        {showCustomValue && selectedOption && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 flex max-w-[calc(100%-2.25rem)] items-center overflow-hidden pl-2.5 text-foreground",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {renderValue?.(selectedOption)}
          </span>
        )}
      </ComboboxInput>

      <ComboboxContent className="z-50 w-(--anchor-width) rounded-xl border border-border/80 bg-popover p-1 text-popover-foreground shadow-xl">
        <ComboboxEmpty className="py-5 text-center text-xs text-muted-foreground">
          {emptyMessage}
        </ComboboxEmpty>
        <ComboboxList className="max-h-52 overflow-y-auto overscroll-contain p-1">
          {(option: OptionsComboboxOption) => (
            <ComboboxItem
              key={option.value}
              value={option}
              disabled={option.disabled}
              className="cursor-pointer rounded-lg px-2.5 py-2 text-xs transition-colors hover:bg-accent/60"
            >
              <span className="min-w-0 flex-1 truncate">
                {renderOption ? renderOption(option) : option.label}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

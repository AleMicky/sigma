import type { ReactNode } from "react"

import { cn } from "@/shared/lib/utils"

export type SegmentedRadioOption<T extends string> = {
  value: T
  label: ReactNode
  icon?: ReactNode
  /** Clases aplicadas cuando la opción está seleccionada. */
  activeClassName?: string
}

type SegmentedRadioGroupProps<T extends string> = {
  /** Debe ser único por grupo; permite la navegación con flechas del navegador. */
  name: string
  value: T
  onValueChange: (value: T) => void
  options: readonly SegmentedRadioOption<T>[]
  ariaLabel: string
  className?: string
  buttonClassName?: string
}

/**
 * Control segmentado accesible.
 *
 * Usa radios nativos visualmente ocultos: Tab entra al grupo, las flechas
 * cambian de opción y Espacio la confirma, sin manejar eventos a mano.
 */
export function SegmentedRadioGroup<T extends string>({
  name,
  value,
  onValueChange,
  options,
  ariaLabel,
  className,
  buttonClassName,
}: SegmentedRadioGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "grid grid-cols-2 rounded-lg border bg-background p-1 shadow-sm",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value

        return (
          <label key={option.value} className="flex min-w-0 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isActive}
              onChange={() => onValueChange(option.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "inline-flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1",
                isActive
                  ? option.activeClassName
                  : "text-muted-foreground hover:text-foreground",
                buttonClassName,
              )}
            >
              {option.icon}
              {option.label}
            </span>
          </label>
        )
      })}
    </div>
  )
}

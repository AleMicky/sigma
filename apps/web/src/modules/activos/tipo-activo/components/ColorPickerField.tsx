import { Pipette } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { cn } from "@/shared/lib/utils"

import {
  DEFAULT_TIPO_ACTIVO_COLOR,
  TIPO_ACTIVO_COLOR_PRESETS,
  isHexColor,
  normalizeHexColor,
} from "../lib/tipo-activo-colors"

type ColorPickerFieldProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  "aria-invalid"?: boolean
}

export function ColorPickerField({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  "aria-invalid": ariaInvalid,
}: ColorPickerFieldProps) {
  const selected = value && isHexColor(value) ? normalizeHexColor(value) : ""
  const preview = selected || DEFAULT_TIPO_ACTIVO_COLOR

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              aria-invalid={ariaInvalid}
              className="gap-2"
              onBlur={onBlur}
            />
          }
        >
          <span
            className="size-4 rounded-full ring-1 ring-border"
            style={{ backgroundColor: preview }}
            aria-hidden
          />
          <span className="font-mono text-xs">
            {selected || "Elegir color"}
          </span>
        </PopoverTrigger>
        <PopoverContent align="start" className="z-[60] w-64">
          <PopoverHeader>
            <PopoverTitle>Color</PopoverTitle>
            <PopoverDescription>
              Elige un color predefinido o personalizado.
            </PopoverDescription>
          </PopoverHeader>

          <div className="grid grid-cols-5 gap-2">
            {TIPO_ACTIVO_COLOR_PRESETS.map((color) => {
              const active = selected === color
              return (
                <button
                  key={color}
                  type="button"
                  aria-label={`Color ${color}`}
                  aria-pressed={active}
                  className={cn(
                    "size-8 rounded-md ring-1 ring-border transition-shadow",
                    active && "ring-2 ring-ring",
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => onChange(color)}
                />
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <label
              className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md ring-1 ring-border"
              style={{ backgroundColor: preview }}
            >
              <Pipette className="size-3.5 text-white mix-blend-difference" />
              <input
                type="color"
                value={preview}
                aria-label="Selector de color personalizado"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(event) =>
                  onChange(normalizeHexColor(event.target.value))
                }
              />
            </label>
            <Input
              value={selected}
              placeholder="#2563EB"
              maxLength={7}
              className="font-mono uppercase"
              aria-label="Color hexadecimal"
              onBlur={onBlur}
              onChange={(event) => {
                const next = event.target.value
                if (next === "" || next.startsWith("#") || /^[0-9A-Fa-f]*$/.test(next)) {
                  onChange(next.startsWith("#") || next === "" ? next : `#${next}`)
                }
              }}
            />
          </div>

          {selected ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => onChange("")}
            >
              Quitar color
            </Button>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  )
}

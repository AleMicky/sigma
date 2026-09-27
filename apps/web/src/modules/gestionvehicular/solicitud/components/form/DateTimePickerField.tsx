import * as React from "react"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock2, X } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Calendar } from "@/shared/components/ui/calendar"
import { CardFooter } from "@/shared/components/ui/card"
import { Field, FieldLabel } from "@/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { cn } from "@/shared/lib/utils"

export interface DateTimePickerFieldProps {
  id?: string
  name?: string
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  "aria-invalid"?: boolean
  minDate?: Date
  maxDate?: Date
}

function parseDateTimeString(val?: string): { date?: Date; time: string } {
  if (!val) return { date: undefined, time: "08:00" }
  try {
    const parts = val.split("T")
    if (parts.length >= 2) {
      const dateParts = parts[0].split("-").map(Number)
      if (dateParts.length === 3) {
        const d = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
        const timePart = parts[1].substring(0, 5)
        return { date: isNaN(d.getTime()) ? undefined : d, time: timePart || "08:00" }
      }
    }
    const d = new Date(val)
    if (!isNaN(d.getTime())) {
      const pad = (n: number) => String(n).padStart(2, "0")
      const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
      return { date: d, time }
    }
  } catch {
    // ignore
  }
  return { date: undefined, time: "08:00" }
}

function formatToInputValue(date?: Date, time = "08:00"): string {
  if (!date || isNaN(date.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const t = time.length === 5 ? time : "08:00"
  return `${y}-${m}-${d}T${t}`
}

function formatDisplayDate(val?: string): string {
  if (!val) return ""
  try {
    const { date, time } = parseDateTimeString(val)
    if (!date) return ""
    const pad = (n: number) => String(n).padStart(2, "0")
    const d = pad(date.getDate())
    const m = pad(date.getMonth() + 1)
    const y = date.getFullYear()
    return `${d}/${m}/${y} ${time}`
  } catch {
    return val
  }
}

export function DateTimePickerField({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder = "dd/mm/aaaa --:--",
  disabled = false,
  className,
  "aria-invalid": isInvalid,
  minDate,
  maxDate,
}: DateTimePickerFieldProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const { date, time } = React.useMemo(() => parseDateTimeString(value), [value])

  const isDateDisabled = React.useCallback(
    (day: Date) => {
      if (minDate) {
        const startOfMin = new Date(minDate)
        startOfMin.setHours(0, 0, 0, 0)
        const checkDay = new Date(day)
        checkDay.setHours(0, 0, 0, 0)
        if (checkDay.getTime() < startOfMin.getTime()) return true
      }
      if (maxDate) {
        const endOfMax = new Date(maxDate)
        endOfMax.setHours(23, 59, 59, 999)
        const checkDay = new Date(day)
        checkDay.setHours(0, 0, 0, 0)
        if (checkDay.getTime() > endOfMax.getTime()) return true
      }
      return false
    },
    [minDate, maxDate]
  )

  const handleDateSelect = (newDate?: Date) => {
    if (newDate) {
      const formatted = formatToInputValue(newDate, time)
      onChange(formatted)
    } else {
      onChange("")
    }
  }

  const handleTimeChange = (newTime: string) => {
    let baseDate = date || new Date()
    if (minDate && baseDate < minDate) {
      baseDate = new Date(minDate)
    }
    const formatted = formatToInputValue(baseDate, newTime)
    onChange(formatted)
  }

  const handleSetCurrent = () => {
    let targetDate = new Date()
    if (minDate && targetDate < minDate) {
      targetDate = new Date(minDate)
    }
    const pad = (n: number) => String(n).padStart(2, "0")
    const nowTime = `${pad(targetDate.getHours())}:${pad(targetDate.getMinutes())}`
    onChange(formatToInputValue(targetDate, nowTime))
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  const displayText = formatDisplayDate(value)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            id={id}
            name={name}
            onBlur={onBlur}
            aria-invalid={isInvalid}
            className={cn(
              "w-full h-8.5 justify-between text-left font-normal text-xs shadow-2xs rounded-lg px-2.5 transition-colors",
              !value && "text-muted-foreground",
              isInvalid && "border-destructive ring-destructive/20 ring-2",
              className
            )}
          />
        }
      >
        <span className="flex items-center gap-2 truncate">
          <CalendarIcon className="size-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{displayText || placeholder}</span>
        </span>

        {value ? (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                e.stopPropagation()
                handleClear(e as unknown as React.MouseEvent)
              }
            }}
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors shrink-0 inline-flex items-center justify-center"
            title="Limpiar fecha"
          >
            <X className="size-3" />
            <span className="sr-only">Limpiar fecha</span>
          </span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto p-0 bg-popover rounded-xl shadow-lg border border-border/80 overflow-hidden"
      >
        <div className="p-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            locale={es}
            className="p-1.5"
          />
        </div>

        <CardFooter className="border-t border-border/50 bg-muted/30 p-2.5 flex items-center justify-between gap-3">
          <Field className="flex-1 space-y-1">
            <FieldLabel htmlFor={`${id || name || "picker"}-time`} className="text-[10.5px] font-semibold text-muted-foreground flex items-center gap-1">
              <Clock2 className="size-3" />
              <span>Hora del viaje</span>
            </FieldLabel>
            <InputGroup className="h-7.5 bg-background shadow-2xs">
              <InputGroupInput
                id={`${id || name || "picker"}-time`}
                type="time"
                step="60"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="text-xs h-7.5 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              <InputGroupAddon>
                <Clock2 className="size-3.5 text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
          </Field>

          <div className="flex items-center gap-1.5 self-end">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleSetCurrent}
              className="h-7.5 px-2.5 text-[11px] font-medium cursor-pointer"
            >
              Ahora
            </Button>
            <Button
              type="button"
              size="xs"
              onClick={() => setIsOpen(false)}
              className="h-7.5 px-2.5 text-[11px] font-semibold cursor-pointer shadow-2xs"
            >
              Listo
            </Button>
          </div>
        </CardFooter>
      </PopoverContent>
    </Popover>
  )
}

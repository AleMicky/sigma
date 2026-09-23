import { Search, X } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  "aria-label"?: string
}

export function SearchField({
  value,
  onChange,
  placeholder = "Buscar…",
  className,
  inputClassName,
  "aria-label": ariaLabel = "Buscar",
}: SearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn("h-10 pr-9 pl-9", inputClassName)}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange("")}
        >
          <X />
        </Button>
      ) : null}
    </div>
  )
}

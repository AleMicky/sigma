import { Search, X } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  "aria-label"?: string
}

export function SearchField({
  value,
  onChange,
  placeholder = "Buscar…",
  className,
  "aria-label": ariaLabel = "Buscar",
}: SearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-8 pr-8 pl-8"
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
